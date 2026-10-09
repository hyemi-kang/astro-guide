import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  z: number
  tw: number
}

/**
 * Stars streaming past a window. `speedRef.current` can be tweened from outside (GSAP) to
 * slow the stars down while landing.
 */
export function WarpField({ speedRef, count = 160 }: { speedRef: { current: number }; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const stars: Star[] = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: Math.random(),
      tw: Math.random() * 6.28,
    }))
    let raf = 0
    let last = performance.now()
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(2, r.width * dpr)
      canvas.height = Math.max(2, r.height * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2
      const sp = speedRef.current
      for (const s of stars) {
        const pz = s.z
        s.z -= dt * 0.22 * sp
        if (s.z <= 0.02) {
          s.x = (Math.random() - 0.5) * 2
          s.y = (Math.random() - 0.5) * 2
          s.z = 1
          continue
        }
        const k = 0.5 / s.z
        const x = cx + s.x * k * cx * 0.9
        const y = cy + s.y * k * cy * 0.9
        const px = cx + s.x * (0.5 / pz) * cx * 0.9
        const py = cy + s.y * (0.5 / pz) * cy * 0.9
        const a = Math.min(1, (1 - s.z) * 1.6) * (0.75 + 0.25 * Math.sin(now / 400 + s.tw))
        ctx.strokeStyle = `rgba(210,225,255,${a})`
        ctx.lineWidth = Math.max(0.6, (1 - s.z) * 2.2 * (canvas.width / 900))
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [speedRef, count])

  return <canvas ref={ref} className="warp-canvas" />
}
