import { coverageById } from '../data/coverages'
import type { Coverage, CoverageEffect } from '../types/coverage'
import { experience } from './store'

export interface FxState {
  coverage: Coverage | null
  kind: CoverageEffect | null
  /** Effect progress, 0..1 (1 once finished). */
  t: number
  /** Seconds since the current selection started. */
  elapsed: number
  active: boolean
}

let lastPlay = -1
let start = 0

export const fxSettings = { reducedMotion: false }

/**
 * Effect clock shared by every 3D component. Called from useFrame with the
 * clock time; the first caller in a frame after a new selection resets it.
 */
export function getFx(time: number): FxState {
  const s = experience.get()
  if (s.playId !== lastPlay) {
    lastPlay = s.playId
    start = time
  }
  const coverage = coverageById(s.selectedId)
  const elapsed = time - start
  if (!coverage) return { coverage: null, kind: null, t: 1, elapsed, active: false }
  const t = Math.min(elapsed / (coverage.duration / 1000), 1)
  return { coverage, kind: coverage.effect, t, elapsed, active: t < 1 }
}

/** 0 → 1 → 0 envelope with soft edges, for effects that come and go. */
export const envelope = (t: number, fadeIn = 0.15, fadeOut = 0.3) => {
  if (t <= 0 || t >= 1) return 0
  const a = Math.min(t / fadeIn, 1)
  const b = Math.min((1 - t) / fadeOut, 1)
  const s = Math.min(a, b)
  return s * s * (3 - 2 * s)
}
