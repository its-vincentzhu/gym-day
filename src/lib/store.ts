import { STORAGE_KEY } from '../program'

export interface SetEntry {
  weight: string
  reps: string
  done: boolean
}

/**
 * Program-level slot customization, keyed by the slot's exercise id. Only
 * fields that differ from the built-in PROGRAM are stored; everything else
 * falls through to the default. Overrides never add or remove slots.
 */
export interface LiftOverride {
  name?: string
  sets?: number
  repsMin?: number
  repsMax?: number
  tempo?: string
  note?: string
  lateCut?: boolean
}

/** Cardio slot customization, keyed by the day's dow (as a string). */
export interface CardioOverride {
  name?: string
  minutes?: string
  note?: string
}

/** sessions[dateKey][exerciseId] = per-set entries for that day. */
export interface AppState {
  version: 2
  sessions: Record<string, Record<string, SetEntry[]>>
  /** Deload weeks keyed by that week's Monday date key. */
  deloadWeeks: Record<string, boolean>
  liftOverrides: Record<string, LiftOverride>
  cardioOverrides: Record<string, CardioOverride>
}

export const emptyState = (): AppState => ({
  version: 2,
  sessions: {},
  deloadWeeks: {},
  liftOverrides: {},
  cardioOverrides: {},
})

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as { version?: number }
    if (parsed && (parsed.version === 1 || parsed.version === 2)) {
      return { ...emptyState(), ...parsed, version: 2 }
    }
  } catch {
    // Corrupt storage falls through to a fresh state.
  }
  return emptyState()
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full/unavailable: keep the app usable in-memory.
  }
}
