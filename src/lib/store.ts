import { STORAGE_KEY } from '../program'

export interface SetEntry {
  weight: string
  reps: string
  done: boolean
}

/** sessions[dateKey][exerciseId] = per-set entries for that day. */
export interface AppState {
  version: 1
  sessions: Record<string, Record<string, SetEntry[]>>
  /** Deload weeks keyed by that week's Monday date key. */
  deloadWeeks: Record<string, boolean>
}

export const emptyState = (): AppState => ({ version: 1, sessions: {}, deloadWeeks: {} })

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as AppState
    if (parsed && parsed.version === 1) {
      return { ...emptyState(), ...parsed }
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
