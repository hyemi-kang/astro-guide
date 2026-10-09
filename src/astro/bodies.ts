import * as Astronomy from 'astronomy-engine'
import { type Place, type Vec3, observerOf, radecToVec } from './coords'

export type BodyId = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune'

export const BODY_IDS: BodyId[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']

const RADIUS_KM: Record<BodyId, number> = {
  Sun: 695700,
  Moon: 1737.4,
  Mercury: 2439.7,
  Venus: 6051.8,
  Mars: 3389.5,
  Jupiter: 69911,
  Saturn: 58232,
  Uranus: 25362,
  Neptune: 24622,
}
const AU_KM = 149597870.7

export interface BodyState {
  id: BodyId
  /** topocentric unit vector, J2000 equatorial frame */
  vec: Vec3
  /** apparent visual magnitude */
  mag: number
  /** distance from the observer, AU */
  distAu: number
  /** apparent angular diameter, arcseconds */
  diameterArcsec: number
  /** illuminated fraction of the disc (0–1) */
  phaseFraction: number
  /** distance from the Sun, AU (Earth for the Sun/Moon) */
  helioAu: number
  /** angular separation from the Sun, degrees */
  elongation: number
}

export function computeBodies(date: Date, place: Place): BodyState[] {
  const obs = observerOf(place)
  const time = Astronomy.MakeTime(date)
  const out: BodyState[] = []
  for (const id of BODY_IDS) {
    const body = Astronomy.Body[id]
    const eq = Astronomy.Equator(body, time, obs, false, true)
    const vec = radecToVec(eq.ra * 15, eq.dec)
    let mag = id === 'Sun' ? -26.74 : 0
    let phaseFraction = 1
    let helioAu = eq.dist
    try {
      const ill = Astronomy.Illumination(body, time)
      mag = ill.mag
      phaseFraction = ill.phase_fraction
      helioAu = ill.helio_dist
    } catch {
      /* keep defaults */
    }
    const diameterArcsec = 2 * Math.atan(RADIUS_KM[id] / (eq.dist * AU_KM)) * (180 / Math.PI) * 3600
    out.push({ id, vec, mag, distAu: eq.dist, diameterArcsec, phaseFraction, helioAu, elongation: 0 })
  }
  const sun = out[0]
  for (const b of out) {
    const c = b.vec[0] * sun.vec[0] + b.vec[1] * sun.vec[1] + b.vec[2] * sun.vec[2]
    b.elongation = (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI
  }
  return out
}

export function moonPhaseName(phaseDeg: number): string {
  const p = ((phaseDeg % 360) + 360) % 360
  if (p < 22.5 || p >= 337.5) return 'New Moon'
  if (p < 67.5) return 'Waxing Crescent'
  if (p < 112.5) return 'First Quarter'
  if (p < 157.5) return 'Waxing Gibbous'
  if (p < 202.5) return 'Full Moon'
  if (p < 247.5) return 'Waning Gibbous'
  if (p < 292.5) return 'Last Quarter'
  return 'Waning Crescent'
}

export function moonPhaseDeg(date: Date): number {
  return Astronomy.MoonPhase(date)
}
