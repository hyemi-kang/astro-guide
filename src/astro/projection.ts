import { DEG, type Vec3, cross, dot } from './coords'

/**
 * The camera looks along a direction in a right-handed frame (x,y,z with z up).
 * yaw (α) is measured from +x toward +y, pitch (δ) up from the xy-plane.
 * Horizon frame: x = N, y = W, z = Zenith  → yaw = -azimuth.
 * Equatorial frame: x = RA 0h, y = RA 6h, z = north pole → yaw = RA.
 * "right" always points toward decreasing yaw, so the sky is never mirrored.
 */
export interface View {
  yaw: number // degrees
  pitch: number // degrees, -90..90
  fov: number // vertical field of view, degrees
}

export interface Camera {
  d: Vec3
  right: Vec3
  up: Vec3
  cx: number
  cy: number
  scale: number
}

export function makeCamera(view: View, width: number, height: number): Camera {
  const a = view.yaw * DEG
  const p = view.pitch * DEG
  const d: Vec3 = [Math.cos(p) * Math.cos(a), Math.cos(p) * Math.sin(a), Math.sin(p)]
  const right: Vec3 = [Math.sin(a), -Math.cos(a), 0]
  const up = cross(right, d)
  // stereographic radius r = 2·tan(θ/2); the screen's half-height spans θ = fov/2
  const scale = height / 2 / (2 * Math.tan((view.fov * DEG) / 4))
  return { d, right, up, cx: width / 2, cy: height / 2, scale }
}

export interface Projected {
  x: number
  y: number
  /** cosine of the angular distance from the view centre (−1 = directly behind) */
  c: number
}

/** Stereographic projection of a unit vector (given in the camera's frame). */
export function project(cam: Camera, v: Vec3, out: Projected = { x: 0, y: 0, c: 0 }): Projected {
  const c = dot(v, cam.d)
  const k = 2 / (1 + Math.max(c, -0.995))
  out.x = cam.cx + k * dot(v, cam.right) * cam.scale
  out.y = cam.cy - k * dot(v, cam.up) * cam.scale
  out.c = c
  return out
}

/** Inverse: screen pixel → unit vector in the camera's frame. */
export function unproject(cam: Camera, x: number, y: number): Vec3 {
  const X = (x - cam.cx) / cam.scale
  const Y = -(y - cam.cy) / cam.scale
  const r2 = X * X + Y * Y
  const den = 4 + r2
  const c = (4 - r2) / den // cos of angular distance from centre
  const k = 4 / den // sin(θ)/r  (sinθ = 4r/(4+r²))
  return [
    c * cam.d[0] + k * (X * cam.right[0] + Y * cam.up[0]),
    c * cam.d[1] + k * (X * cam.right[1] + Y * cam.up[1]),
    c * cam.d[2] + k * (X * cam.right[2] + Y * cam.up[2]),
  ]
}

export function viewFromAltAz(az: number, alt: number, fov: number): View {
  return { yaw: -az, pitch: alt, fov }
}

export function viewFromRaDec(ra: number, dec: number, fov: number): View {
  return { yaw: ra, pitch: dec, fov }
}

export function wrap180(d: number): number {
  return ((((d + 180) % 360) + 360) % 360) - 180
}
