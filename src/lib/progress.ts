import type { Lift } from '../program'
import type { AppState, SetEntry } from './store'
import type { DateKey } from './date'

export interface LastSession {
  dateKey: DateKey
  sets: SetEntry[]
}

/** Most recent session before `beforeKey` that logged anything for this lift. */
export function lastSession(
  state: AppState,
  exerciseId: string,
  beforeKey: DateKey
): LastSession | null {
  let best: LastSession | null = null
  for (const [dateKey, exercises] of Object.entries(state.sessions)) {
    if (dateKey >= beforeKey) continue
    const sets = exercises[exerciseId]
    if (!sets || !sets.some((s) => s.done || s.weight !== '' || s.reps !== '')) continue
    if (!best || dateKey > best.dateKey) best = { dateKey, sets }
  }
  return best
}

/** Last weight used for a lift, for prefilling the next session. */
export function prefillWeight(state: AppState, exerciseId: string, beforeKey: DateKey): string {
  const last = lastSession(state, exerciseId, beforeKey)
  if (!last) return ''
  for (let i = last.sets.length - 1; i >= 0; i--) {
    if (last.sets[i].weight !== '') return last.sets[i].weight
  }
  return ''
}

/**
 * Double progression: true when the last session hit the TOP of the rep range
 * on every completed set (and every set was completed).
 */
export function hitTopOfRangeLastTime(
  state: AppState,
  lift: Lift,
  beforeKey: DateKey
): boolean {
  const last = lastSession(state, lift.id, beforeKey)
  if (!last) return false
  const logged = last.sets.filter((s) => s.done)
  if (logged.length === 0 || logged.length < last.sets.length) return false
  return logged.every((s) => Number(s.reps) >= lift.repsMax)
}

/** A lift counts as done for the day if at least one set is checked off. */
export function liftLogged(state: AppState, dateKey: DateKey, exerciseId: string): boolean {
  const sets = state.sessions[dateKey]?.[exerciseId]
  return !!sets && sets.some((s) => s.done)
}
