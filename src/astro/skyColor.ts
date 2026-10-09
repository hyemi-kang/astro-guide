export type RGB = [number, number, number]

interface Stop {
  alt: number
  top: RGB
  bottom: RGB
  /** faintest star magnitude that is visible against this sky */
  lm: number
}

// Sun altitude (deg) → sky gradient. Day, golden hour, civil / nautical / astronomical twilight, night.
const STOPS: Stop[] = [
  { alt: -18, top: [3, 5, 14], bottom: [8, 12, 28], lm: 6.3 },
  { alt: -12, top: [9, 16, 42], bottom: [34, 44, 82], lm: 4.6 },
  { alt: -6, top: [24, 42, 92], bottom: [138, 108, 146], lm: 2.2 },
  { alt: -1, top: [52, 82, 140], bottom: [244, 160, 112], lm: -0.5 },
  { alt: 6, top: [58, 118, 196], bottom: [170, 206, 238], lm: -2.5 },
  { alt: 25, top: [38, 104, 190], bottom: [152, 200, 240], lm: -4 },
]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerpRGB = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

export interface SkyLook {
  top: RGB
  bottom: RGB
  limitingMag: number
  /** 0 (night) … 1 (full daylight) */
  daylight: number
}

export function skyLook(sunAlt: number): SkyLook {
  if (sunAlt <= STOPS[0].alt) return { top: STOPS[0].top, bottom: STOPS[0].bottom, limitingMag: STOPS[0].lm, daylight: 0 }
  const last = STOPS[STOPS.length - 1]
  if (sunAlt >= last.alt) return { top: last.top, bottom: last.bottom, limitingMag: last.lm, daylight: 1 }
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i]
    const b = STOPS[i + 1]
    if (sunAlt >= a.alt && sunAlt <= b.alt) {
      const t = (sunAlt - a.alt) / (b.alt - a.alt)
      return {
        top: lerpRGB(a.top, b.top, t),
        bottom: lerpRGB(a.bottom, b.bottom, t),
        limitingMag: lerp(a.lm, b.lm, t),
        daylight: Math.max(0, Math.min(1, (sunAlt + 18) / 24)),
      }
    }
  }
  return { top: last.top, bottom: last.bottom, limitingMag: last.lm, daylight: 1 }
}

export const rgb = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`

export function twilightName(sunAlt: number): string {
  if (sunAlt > 0) return 'Daytime'
  if (sunAlt > -6) return 'Civil twilight'
  if (sunAlt > -12) return 'Nautical twilight'
  if (sunAlt > -18) return 'Astronomical twilight'
  return 'Night'
}
