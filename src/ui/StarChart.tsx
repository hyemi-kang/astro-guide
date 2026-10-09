import { useMemo } from 'react'
import { type Vec3, cross, dot, normalize } from '../astro/coords'
import { bvToRGB } from '../astro/starColor'
import type { Catalog, ConstellationData } from '../data/loadCatalog'

interface Props {
  catalog: Catalog
  constellation?: ConstellationData
  /** centre the chart on a star instead (HIP id) */
  starHip?: number
  size?: number
}

/** Stereographic chart built straight from the catalogue — an accurate fallback for a photograph. */
export function StarChart({ catalog, constellation, starHip, size = 240 }: Props) {
  const chart = useMemo(() => {
    const st = catalog.stars
    let center: Vec3
    let radius: number
    if (constellation) {
      center = normalize(constellation.centerVec)
      // angular radius that contains the whole figure
      let maxAng = 8
      for (const poly of constellation.lines)
        for (const v of poly) maxAng = Math.max(maxAng, Math.acos(Math.min(1, dot(v, center))) / (Math.PI / 180))
      radius = maxAng * 1.12
    } else {
      const i = st.hip.indexOf(starHip ?? -1)
      center = i >= 0 ? [st.vec[i * 3], st.vec[i * 3 + 1], st.vec[i * 3 + 2]] : [1, 0, 0]
      radius = 11
    }
    // local tangent basis; "up" toward the north celestial pole, east to the left (as seen in the sky)
    const north: Vec3 = [0, 0, 1]
    let up = cross(cross(center, north), center)
    if (Math.hypot(...up) < 1e-6) up = [0, 1, 0]
    up = normalize(up)
    const right = normalize(cross(center, up)) // screen-right = west, so east is on the left, as in the sky
    const rad = (radius * Math.PI) / 180
    const R = 2 * Math.tan(rad / 2)
    const half = size / 2
    const proj = (v: Vec3): [number, number, number] => {
      const c = dot(v, center)
      const k = 2 / (1 + c)
      return [half + ((k * dot(v, right)) / R) * (half * 0.92), half - ((k * dot(v, up)) / R) * (half * 0.92), c]
    }
    const limitCos = Math.cos(rad * 1.02)
    const dots: { x: number; y: number; r: number; fill: string; hip: number; label?: string }[] = []
    for (let i = 0; i < st.n; i++) {
      const v: Vec3 = [st.vec[i * 3], st.vec[i * 3 + 1], st.vec[i * 3 + 2]]
      if (dot(v, center) < limitCos) continue
      const mag = st.mag[i]
      if (mag > (constellation ? 5.4 : 5.8)) continue
      const [x, y] = proj(v)
      const c = bvToRGB(st.bv[i])
      const nm = st.names.get(st.hip[i])
      dots.push({
        x,
        y,
        r: Math.max(0.7, 0.9 + (5.6 - mag) * 0.62),
        fill: `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`,
        hip: st.hip[i],
        label: nm?.name && mag < 2.6 ? nm.name : undefined,
      })
    }
    const lines: string[] = []
    if (constellation) {
      for (const poly of constellation.lines) {
        lines.push(poly.map((v, i) => `${i ? 'L' : 'M'}${proj(v)[0].toFixed(1)},${proj(v)[1].toFixed(1)}`).join(''))
      }
    }
    return { dots, lines }
  }, [catalog, constellation, starHip, size])

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" role="img" aria-label="star chart">
      <defs>
        <radialGradient id="chart-bg" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#101a3a" />
          <stop offset="100%" stopColor="#04060f" />
        </radialGradient>
      </defs>
      <rect width={size} height={size} fill="url(#chart-bg)" />
      {chart.lines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(255,220,150,0.75)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {chart.dots.map((s) => (
        <g key={s.hip}>
          {starHip === s.hip && <circle cx={s.x} cy={s.y} r={s.r + 6} fill="none" stroke="rgba(255,220,150,0.9)" strokeWidth="1" />}
          <circle cx={s.x} cy={s.y} r={s.r} fill={s.fill} />
          {s.label && (
            <text x={s.x + s.r + 3} y={s.y + 3} fontSize="8.5" fill="rgba(220,230,255,0.85)" fontFamily="Inter, sans-serif">
              {s.label}
            </text>
          )}
        </g>
      ))}
      <text x={size - 8} y={size - 8} fontSize="7" textAnchor="end" fill="rgba(170,190,240,0.6)" fontFamily="Inter, sans-serif">
        N ↑ · E ← · Hipparcos stars to mag {constellation ? '5.4' : '5.8'}
      </text>
    </svg>
  )
}
