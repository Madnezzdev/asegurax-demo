import { useSyncExternalStore } from 'react'

export interface ExperienceState {
  selectedId: string | null
  hoveredId: string | null
  /** Bumps on every selection so the same effect can be replayed. */
  playId: number
  /** True once the user dragged or clicked the car (hides the hints). */
  interacted: boolean
}

let state: ExperienceState = { selectedId: null, hoveredId: null, playId: 0, interacted: false }
const listeners = new Set<() => void>()

const set = (patch: Partial<ExperienceState>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export const experience = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  select: (id: string | null) =>
    set({ selectedId: id, playId: state.playId + 1, interacted: true }),
  hover: (id: string | null) => {
    if (state.hoveredId !== id) set({ hoveredId: id })
  },
  markInteracted: () => {
    if (!state.interacted) set({ interacted: true })
  },
}

export function useExperience<T>(selector: (s: ExperienceState) => T): T {
  return useSyncExternalStore(experience.subscribe, () => selector(state))
}
