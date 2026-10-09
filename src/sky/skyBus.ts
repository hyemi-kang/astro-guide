import type { Mode } from '../store/useAppStore'

/** Mutable, per-frame values shared between the canvas renderer and DOM overlays (no React re-renders). */
export const skyInfo = {
  w: 0,
  h: 0,
  sunX: 0,
  sunY: 0,
  /** sun is above the horizon and inside the viewport */
  sunOnScreen: false,
  sunAlt: -90,
  /** azimuth of the sun (deg, 0 = N, 90 = E) */
  sunAz: 180,
  /** altitude of the sun ignoring any "block the sun" override */
  trueSunAlt: -90,
  /** 0 = natural sky, 1 = sun blocked → night-like sky (tweened by GSAP) */
  dark: 0,
  /** CSS-px radius of the sun glow, used to size the paper disc */
  sunRadiusPx: 14,
}

export interface SkyControls {
  /** animate the camera to look at an alt/az (horizon modes) or ra/dec (space mode) */
  panTo: (a: number, b: number, fov?: number, duration?: number) => Promise<void>
  /** animate back to the default view for the current mode */
  resetView: () => void
  zoomBy: (factor: number) => void
}

export const skyControls: { current: SkyControls | null } = { current: null }

export interface HoverInfo {
  kind: 'constellation' | 'star' | 'body' | 'dso'
  /** primary label */
  label: string
  /** secondary label */
  sub?: string
  x: number
  y: number
}

export const DEFAULT_FOV: Record<Mode, number> = { park: 92, sky: 105, space: 100 }
export const FOV_RANGE: Record<Mode, [number, number]> = {
  park: [8, 125],
  sky: [8, 125],
  space: [2, 140],
}
