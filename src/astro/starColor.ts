import type { RGB } from './skyColor'

/** B–V colour index → effective temperature in kelvin (Ballesteros 2012). */
export function bvToTemperature(bv: number): number {
  const b = Math.max(-0.4, Math.min(2.0, bv))
  return 4600 * (1 / (0.92 * b + 1.7) + 1 / (0.92 * b + 0.62))
}

/** Blackbody temperature → approximate sRGB colour (Tanner Helland). */
export function kelvinToRGB(kelvin: number): RGB {
  const t = Math.max(1000, Math.min(40000, kelvin)) / 100
  let r: number
  let g: number
  let b: number
  if (t <= 66) {
    r = 255
    g = 99.4708025861 * Math.log(t) - 161.1195681661
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592)
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492)
  }
  if (t >= 66) b = 255
  else if (t <= 19) b = 0
  else b = 138.5177312231 * Math.log(t - 10) - 305.0447927307
  const c = (x: number) => Math.max(0, Math.min(255, x))
  return [c(r), c(g), c(b)]
}

/** Slightly desaturated so faint stars stay pleasant on screen. */
export function bvToRGB(bv: number): RGB {
  const [r, g, b] = kelvinToRGB(bvToTemperature(bv))
  const mix = 0.35
  return [r + (255 - r) * mix, g + (255 - g) * mix, b + (255 - b) * mix]
}

export function spectralClassFromTemperature(k: number): string {
  if (k >= 30000) return 'O'
  if (k >= 10000) return 'B'
  if (k >= 7500) return 'A'
  if (k >= 6000) return 'F'
  if (k >= 5200) return 'G'
  if (k >= 3700) return 'K'
  return 'M'
}

export const SPECTRAL_COLOR_NAME: Record<string, string> = {
  O: 'blue',
  B: 'blue-white',
  A: 'white',
  F: 'yellow-white',
  G: 'yellow',
  K: 'orange',
  M: 'red',
}
