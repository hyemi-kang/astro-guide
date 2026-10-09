import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SuperHero } from '../characters/SuperHero'
import { useAppStore } from '../store/useAppStore'
import { skyControls, skyInfo } from './skyBus'

/**
 * "Block the Sun" — either the traveller throws a round paper disc over the Sun, or a caped hero flies in and
 * spreads their cape in front of it. Once the Sun is covered, the daylight fades away (skyInfo.dark → 1) and the
 * stars and planets come out. All motion is GSAP; the overlay follows the Sun's live screen position.
 */
export function SunBlocker() {
  const sunBlocked = useAppStore((s) => s.sunBlocked)
  const style = useAppStore((s) => s.blockStyle)
  const discRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const anim = useRef({ p: 0, spin: 0, cover: 0, alpha: 1 })
  const tl = useRef<gsap.core.Timeline | null>(null)
  const first = useRef(true)

  // follow the Sun every frame
  useEffect(() => {
    const update = () => {
      const a = anim.current
      const disc = discRef.current
      const hero = heroRef.current
      const ring = ringRef.current
      if (!disc || !hero || !ring) return
      const sunR = Math.max(skyInfo.sunRadiusPx, 12)
      const cover = sunR * 3.4
      const hand = handPoint()
      const sx = skyInfo.sunX
      const sy = skyInfo.sunY
      const useDisc = useAppStore.getState().blockStyle === 'paper'
      const p = a.p
      if (useDisc) {
        const x = hand.x + (sx - hand.x) * p
        const y = hand.y + (sy - hand.y) * p - Math.sin(Math.PI * p) * Math.min(160, skyInfo.h * 0.22)
        const size = 26 + (cover - 26) * p
        disc.style.opacity = p > 0.001 ? String(a.alpha) : '0'
        disc.style.width = disc.style.height = `${size}px`
        disc.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px) rotate(${a.spin}deg)`
        ring.style.opacity = String(a.cover * a.alpha)
        ring.style.width = ring.style.height = `${size * 1.9}px`
        ring.style.transform = `translate(${x - size * 0.95}px, ${y - size * 0.95}px)`
        hero.style.opacity = '0'
      } else {
        // hero flies in from the left, the cape (centred on the Sun) grows to cover it
        const startX = -320
        const x = startX + (sx - startX) * p
        const y = skyInfo.h * 0.65 + (sy - skyInfo.h * 0.65) * p
        const heroScale = 1.1
        hero.style.opacity = p > 0.001 ? String(a.alpha) : '0'
        // the SVG's cape centre sits at (92, 70) in its own 240×140 viewBox
        hero.style.transform = `translate(${x - 92 * heroScale}px, ${y - 70 * heroScale}px) scale(${heroScale})`
        const cape = hero.querySelector<SVGGElement>('.hero-cape-group')
        if (cape) cape.style.transform = `scale(${1 + (cover / 92) * 1.15 * a.cover})`
        ring.style.opacity = String(a.cover * 0.9 * a.alpha)
        ring.style.width = ring.style.height = `${cover * 2.5}px`
        ring.style.transform = `translate(${sx - cover * 1.25}px, ${sy - cover * 1.25}px)`
        disc.style.opacity = '0'
      }
    }
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      if (!sunBlocked) return
    }
    tl.current?.kill()
    const a = anim.current
    const store = useAppStore.getState()
    const t = gsap.timeline()
    tl.current = t
    const horizonAlt = skyInfo.trueSunAlt

    if (sunBlocked) {
      // 1) turn to face the Sun if it is out of view
      t.add(() => {
        if (!skyInfo.sunOnScreen && horizonAlt > -2) {
          void skyControls.current?.panTo(skyInfo.sunAz, Math.max(8, Math.min(horizonAlt, 55)), 90, 1.1)
        }
      })
      t.to({}, { duration: !skyInfo.sunOnScreen ? 1.2 : 0.05 })
      if (style === 'paper') {
        t.add(() => store.setActionPose('paper'))
        t.to({}, { duration: 0.8 })
        t.fromTo(a, { p: 0 }, { p: 1, duration: 1.3, ease: 'power2.inOut' })
        t.to(a, { spin: 540, duration: 1.3, ease: 'power2.out' }, '<')
      } else {
        t.fromTo(a, { p: 0 }, { p: 1, duration: 1.5, ease: 'power2.inOut' })
      }
      t.to(a, { cover: 1, duration: 0.6, ease: 'power1.out' })
      t.to(skyInfo, { dark: 1, duration: 2.4, ease: 'power2.inOut' }, '>-0.1')
      // the sky is dark now: clear the disc / hero away so the constellations are easy to see
      t.to(a, { alpha: 0, duration: 1.1, ease: 'power1.inOut' }, '>0.15')
      t.add(() => store.setActionPose(null))
    } else {
      t.set(a, { p: 1, cover: 1 })
      t.add(() => {
        if (style === 'paper') store.setActionPose('paper')
      })
      t.to(a, { alpha: 1, duration: 0.6 })
      t.to(skyInfo, { dark: 0, duration: 1.8, ease: 'power2.inOut' })
      t.to(a, { cover: 0, duration: 0.5 }, '<0.8')
      if (style === 'paper') {
        t.to(a, { p: 0, duration: 1.0, ease: 'power2.inOut' })
        t.to(a, { spin: 0, duration: 1.0 }, '<')
        t.add(() => store.setActionPose(null))
      } else {
        t.to(a, { p: 0, duration: 1.2, ease: 'power2.in' })
      }
    }
    return () => {
      t.kill()
    }
    // style changes while blocked are handled by the toggle UI (it unblocks first)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sunBlocked])

  return (
    <div className="sun-overlay" aria-hidden="true">
      <div ref={ringRef} className="sun-corona" />
      <div ref={discRef} className="paper-disc" />
      <div ref={heroRef} className="hero-fly">
        <SuperHero className="hero-svg" />
      </div>
    </div>
  )
}

/** Where the traveller's raised hand is (or the bottom centre when there is no character). */
function handPoint(): { x: number; y: number } {
  const el = document.querySelector<HTMLElement>('.prince-wrap')
  if (el) {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width * 0.76, y: r.top + r.height * 0.04 }
  }
  return { x: skyInfo.w / 2, y: skyInfo.h + 30 }
}
