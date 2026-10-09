import { create } from 'zustand'
import type { Place } from '../astro/coords'
import type { BodyId } from '../astro/bodies'

export type Scene = 'ship' | 'map' | 'landing' | 'sky'
export type Mode = 'park' | 'sky' | 'space'
export type BlockStyle = 'paper' | 'hero'

export type Selection =
  | { kind: 'constellation'; id: string }
  | { kind: 'star'; hip: number }
  | { kind: 'body'; id: BodyId }
  | { kind: 'dso'; id: string }

interface AppState {
  scene: Scene
  mode: Mode
  place: Place | null
  /** simulated time = Date.now() + offsetMs */
  offsetMs: number
  selection: Selection | null
  notebookOpen: boolean
  sunBlocked: boolean
  blockStyle: BlockStyle
  showLines: boolean
  showLabels: boolean
  showBorders: boolean
  showDso: boolean
  /** bumped to ask the sky to animate back to its default view */
  resetTick: number
  /** temporary pose forced on the character (e.g. holding up the paper disc) */
  actionPose: 'paper' | null
  /** the last non-space mode, so "Return to Earth" knows where to go */
  lastGround: 'park' | 'sky'

  setScene: (s: Scene) => void
  setMode: (m: Mode) => void
  setPlace: (p: Place | null) => void
  setOffset: (ms: number) => void
  select: (s: Selection | null) => void
  setNotebook: (open: boolean) => void
  setSunBlocked: (b: boolean) => void
  setBlockStyle: (s: BlockStyle) => void
  toggle: (k: 'showLines' | 'showLabels' | 'showBorders' | 'showDso') => void
  requestReset: () => void
  setActionPose: (p: 'paper' | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  scene: 'ship',
  mode: 'park',
  place: null,
  offsetMs: 0,
  selection: null,
  notebookOpen: false,
  sunBlocked: false,
  blockStyle: 'paper',
  showLines: false,
  showLabels: true,
  showBorders: false,
  showDso: true,
  resetTick: 0,
  actionPose: null,
  lastGround: 'park',

  setActionPose: (actionPose) => set({ actionPose }),
  setScene: (scene) => set({ scene }),
  setMode: (mode) => set((s) => ({ mode, lastGround: mode === 'space' ? s.lastGround : mode })),
  setPlace: (place) => set({ place }),
  setOffset: (offsetMs) => set({ offsetMs }),
  select: (selection) => set({ selection }),
  setNotebook: (notebookOpen) => set({ notebookOpen }),
  setSunBlocked: (sunBlocked) => set({ sunBlocked }),
  setBlockStyle: (blockStyle) => set({ blockStyle }),
  toggle: (k) => set((s) => ({ [k]: !s[k] }) as Partial<AppState>),
  requestReset: () => set((s) => ({ resetTick: s.resetTick + 1 })),
}))

export function simDate(offsetMs: number): Date {
  return new Date(Date.now() + offsetMs)
}
