import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { IDENTITY, type Place, eqjToHorizon, vecToRadec } from '../astro/coords'
import { type View, wrap180 } from '../astro/projection'
import type { Catalog } from '../data/loadCatalog'
import { type Mode, simDate, useAppStore } from '../store/useAppStore'
import { buildMilkyWay } from './milkyWay'
import { SkyRenderer, type Hit } from './renderer'
import { DEFAULT_FOV, FOV_RANGE, type HoverInfo, skyControls } from './skyBus'

interface Props {
  catalog: Catalog
  place: Place
  mode: Mode
}

function defaultView(mode: Mode, place: Place, offsetMs: number): View {
  if (mode === 'space') {
    const m = eqjToHorizon(simDate(offsetMs), place)
    const { ra, dec } = vecToRadec([m[6], m[7], m[8]])
    return { yaw: ra, pitch: dec, fov: DEFAULT_FOV.space }
  }
  const az = place.lat >= 0 ? 180 : 0
  return { yaw: -az, pitch: mode === 'park' ? 34 : 42, fov: DEFAULT_FOV[mode] }
}

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))

export function SkyCanvas({ catalog, place, mode }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mw = useMemo(() => buildMilkyWay(catalog), [catalog])
  const renderer = useMemo(() => new SkyRenderer(catalog, mw), [catalog, mw])
  const viewRef = useRef<View>(defaultView(mode, place, useAppStore.getState().offsetMs))
  const vel = useRef({ yaw: 0, pitch: 0 })
  const modeRef = useRef(mode)
  const placeRef = useRef(place)
  const hoverCon = useRef<string | null>(null)
  const hoverStar = useRef<number | null>(null)
  const sizeRef = useRef({ w: 800, h: 600, dpr: 1 })
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const [grabbing, setGrabbing] = useState(false)
  modeRef.current = mode
  placeRef.current = place

  // reset the camera whenever the mode or the location changes
  useEffect(() => {
    viewRef.current = defaultView(mode, place, useAppStore.getState().offsetMs)
    vel.current = { yaw: 0, pitch: 0 }
  }, [mode, place])

  const resetTick = useAppStore((s) => s.resetTick)
  useEffect(() => {
    if (resetTick === 0) return
    skyControls.current?.resetView()
  }, [resetTick])

  // ---- camera controls (exposed to the rest of the UI) -----------------------
  useEffect(() => {
    const tween = (target: View, duration: number) =>
      new Promise<void>((resolve) => {
        const v = viewRef.current
        vel.current = { yaw: 0, pitch: 0 }
        gsap.killTweensOf(v)
        const yaw = v.yaw + wrap180(target.yaw - v.yaw)
        gsap.to(v, { yaw, pitch: target.pitch, fov: target.fov, duration, ease: 'power3.inOut', onComplete: resolve })
      })
    skyControls.current = {
      panTo: (a, b, fov, duration = 1.4) => {
        const v = viewRef.current
        const yaw = modeRef.current === 'space' ? a : -a
        return tween({ yaw, pitch: b, fov: fov ?? v.fov }, duration)
      },
      resetView: () => {
        void tween(defaultView(modeRef.current, placeRef.current, useAppStore.getState().offsetMs), 1.3)
      },
      zoomBy: (f) => {
        const [lo, hi] = FOV_RANGE[modeRef.current]
        const v = viewRef.current
        gsap.to(v, { fov: clamp(v.fov * f, lo, hi), duration: 0.35, ease: 'power2.out' })
      },
    }
    return () => {
      skyControls.current = null
    }
  }, [])

  // ---- render loop ------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d', { alpha: false })!
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { w, h, dpr } = sizeRef.current
      const v = viewRef.current
      // inertia
      if (Math.abs(vel.current.yaw) > 0.01 || Math.abs(vel.current.pitch) > 0.01) {
        v.yaw += vel.current.yaw * dt
        v.pitch = clamp(v.pitch + vel.current.pitch * dt, modeRef.current === 'space' ? -90 : -12, 90)
        const decay = Math.pow(0.04, dt)
        vel.current.yaw *= decay
        vel.current.pitch *= decay
      }
      const s = useAppStore.getState()
      const sel = s.selection
      renderer.render(ctx, {
        w,
        h,
        dpr,
        timeMs: now,
        date: simDate(s.offsetMs),
        lat: placeRef.current.lat,
        lon: placeRef.current.lon,
        place: placeRef.current,
        mode: modeRef.current,
        view: v,
        flags: { lines: s.showLines, labels: s.showLabels, borders: s.showBorders, dso: s.showDso },
        highlightCon: hoverCon.current ?? (sel?.kind === 'constellation' ? sel.id : null),
        hoverStar: hoverStar.current,
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [renderer])

  // ---- resize -------------------------------------------------------------------
  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const apply = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      sizeRef.current = { w, h, dpr }
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // ---- pointer + wheel ------------------------------------------------------------
  useEffect(() => {
    const el = canvasRef.current!
    const pointers = new Map<number, { x: number; y: number }>()
    let pinch = 0
    let moved = 0
    let downAt = 0
    let lastT = 0

    const hitLabel = (hit: Hit | null): HoverInfo | null => {
      if (!hit) return null
      if (hit.kind === 'body') return { kind: 'body', label: hit.id, sub: hit.id === 'Sun' || hit.id === 'Moon' ? undefined : 'Planet', x: hit.x, y: hit.y }
      if (hit.kind === 'dso') {
        const o = catalog.dsos.find((d) => d.id === hit.id)!
        return { kind: 'dso', label: o.name, sub: `${o.kind} · ${o.desig}`, x: hit.x, y: hit.y }
      }
      if (hit.kind === 'star') {
        const nm = catalog.stars.names.get(hit.hip)!
        const con = catalog.byId.get(nm.c)
        const label = nm.name || `${nm.bayer} ${con?.genitive ?? ''}`.trim() || nm.hd
        return { kind: 'star', label, sub: `Star · mag ${catalog.stars.mag[hit.i].toFixed(2)}${con ? ` · ${con.name}` : ''}`, x: hit.x, y: hit.y }
      }
      const c = catalog.byId.get(hit.id)!
      return { kind: 'constellation', label: c.name, sub: `Constellation · ${c.id}`, x: hit.x, y: hit.y }
    }

    const updateHover = (x: number, y: number) => {
      const hit = renderer.hitTest(x, y)
      let con: string | null = null
      let star: number | null = null
      if (hit?.kind === 'constellation') con = hit.id
      if (hit?.kind === 'star') {
        star = hit.i
        con = catalog.stars.names.get(hit.hip)?.c ?? null
      }
      hoverCon.current = con
      hoverStar.current = star
      const info = hitLabel(hit)
      setHover((prev) => (prev && info && prev.label === info.label && Math.abs(prev.x - info.x) < 2 && Math.abs(prev.y - info.y) < 2 ? prev : info))
      el.style.cursor = hit ? 'pointer' : 'grab'
    }

    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId)
      pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY })
      if (pointers.size === 1) {
        moved = 0
        downAt = performance.now()
        vel.current = { yaw: 0, pitch: 0 }
        gsap.killTweensOf(viewRef.current)
        setGrabbing(true)
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinch = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId)
      if (!prev) {
        updateHover(e.offsetX, e.offsetY)
        return
      }
      const cur = { x: e.offsetX, y: e.offsetY }
      const v = viewRef.current
      if (pointers.size === 1) {
        const dx = cur.x - prev.x
        const dy = cur.y - prev.y
        moved += Math.abs(dx) + Math.abs(dy)
        const cam = renderer.getCamera()
        const perPx = cam ? 1 / cam.scale / (Math.PI / 180) : 0.1
        // scale the drag with the field of view so the sky follows the finger
        const dYaw = dx * perPx
        const dPitch = dy * perPx
        v.yaw += dYaw
        v.pitch = clamp(v.pitch + dPitch, modeRef.current === 'space' ? -90 : -12, 90)
        const now = performance.now()
        const dt = Math.max(1, now - lastT) / 1000
        lastT = now
        vel.current = { yaw: (dYaw / dt) * 0.6 + vel.current.yaw * 0.4, pitch: (dPitch / dt) * 0.6 + vel.current.pitch * 0.4 }
        hoverCon.current = null
        hoverStar.current = null
        setHover(null)
      } else if (pointers.size === 2) {
        pointers.set(e.pointerId, cur)
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinch > 0) {
          const [lo, hi] = FOV_RANGE[modeRef.current]
          v.fov = clamp(v.fov * (pinch / dist), lo, hi)
        }
        pinch = dist
        return
      }
      pointers.set(e.pointerId, cur)
    }
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      if (pointers.size === 0) {
        setGrabbing(false)
        const slow = performance.now() - lastT > 90
        if (slow) vel.current = { yaw: 0, pitch: 0 }
        if (moved < 5 && performance.now() - downAt < 600) {
          const hit = renderer.hitTest(e.offsetX, e.offsetY)
          const st = useAppStore.getState()
          if (hit?.kind === 'body') st.select({ kind: 'body', id: hit.id as never })
          else if (hit?.kind === 'dso') st.select({ kind: 'dso', id: hit.id })
          else if (hit?.kind === 'star') st.select({ kind: 'star', hip: hit.hip })
          else if (hit?.kind === 'constellation') st.select({ kind: 'constellation', id: hit.id })
        }
      }
      if (pointers.size < 2) pinch = 0
    }
    const onLeave = () => {
      hoverCon.current = null
      hoverStar.current = null
      setHover(null)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const [lo, hi] = FOV_RANGE[modeRef.current]
      const v = viewRef.current
      gsap.killTweensOf(v, 'fov')
      v.fov = clamp(v.fov * Math.exp(e.deltaY * 0.0012), lo, hi)
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('wheel', onWheel)
    }
  }, [catalog, renderer])

  return (
    <div ref={wrapRef} className="sky-wrap">
      <canvas ref={canvasRef} className={`sky-canvas ${grabbing ? 'grabbing' : ''}`} />
      {hover && (
        <div className={`hover-tag hover-${hover.kind}`} style={{ left: hover.x, top: hover.y }}>
          <strong>{hover.label}</strong>
          {hover.sub && <span>{hover.sub}</span>}
        </div>
      )}
    </div>
  )
}

export { IDENTITY }
