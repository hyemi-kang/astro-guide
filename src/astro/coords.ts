import * as Astronomy from 'astronomy-engine'

export const DEG = Math.PI / 180
export type Vec3 = [number, number, number]
/** Row-major 3x3 matrix: out = M · v */
export type Mat3 = number[]

export interface Place {
  lat: number
  lon: number
  tz: string
  name: string
  country?: string
}

export const IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]

/** Catalog RA/Dec (degrees, J2000) → unit vector in the EQJ frame (x→RA 0h, y→RA 6h, z→north pole). */
export function radecToVec(raDeg: number, decDeg: number): Vec3 {
  const ra = raDeg * DEG
  const dec = decDeg * DEG
  const c = Math.cos(dec)
  return [c * Math.cos(ra), c * Math.sin(ra), Math.sin(dec)]
}

export function vecToRadec(v: Vec3): { ra: number; dec: number } {
  const dec = Math.asin(Math.max(-1, Math.min(1, v[2]))) / DEG
  let ra = Math.atan2(v[1], v[0]) / DEG
  if (ra < 0) ra += 360
  return { ra, dec }
}

export function mulMat(m: Mat3, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ]
}

export function transpose(m: Mat3): Mat3 {
  return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

export function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

export function observerOf(place: Place): Astronomy.Observer {
  return new Astronomy.Observer(place.lat, place.lon, 0)
}

/**
 * Rotation EQJ (J2000 equator) → local horizon frame.
 * Horizon frame axes: x = North, y = West, z = Zenith (right-handed).
 * Includes precession and nutation (astronomy-engine).
 */
export function eqjToHorizon(date: Date, place: Place): Mat3 {
  const rot = Astronomy.Rotation_EQJ_HOR(date, observerOf(place))
  // astronomy-engine applies out_j = Σ_i rot[i][j] · v_i
  const r = rot.rot
  return [r[0][0], r[1][0], r[2][0], r[0][1], r[1][1], r[2][1], r[0][2], r[1][2], r[2][2]]
}

/** Horizon-frame vector → altitude / azimuth in degrees (azimuth: 0 = N, 90 = E). */
export function toAltAz(h: Vec3): { alt: number; az: number } {
  const alt = Math.asin(Math.max(-1, Math.min(1, h[2]))) / DEG
  let az = Math.atan2(-h[1], h[0]) / DEG
  if (az < 0) az += 360
  return { alt, az }
}

/** Altitude (deg) of an EQJ unit vector using a precomputed horizon matrix. */
export function altitudeOf(m: Mat3, eqj: Vec3): number {
  return Math.asin(Math.max(-1, Math.min(1, m[6] * eqj[0] + m[7] * eqj[1] + m[8] * eqj[2]))) / DEG
}

/** Apply a simple atmospheric refraction correction (Saemundsson), degrees. */
export function refraction(altDeg: number): number {
  if (altDeg < -1) return 0
  const a = Math.max(altDeg, -0.5)
  return 1.02 / Math.tan((a + 10.3 / (a + 5.11)) * DEG) / 60
}
