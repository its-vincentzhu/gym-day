import {
  PROTECTED_LIFT_IDS,
  REPS_MAX,
  REPS_MIN,
  SETS_MAX,
  SETS_MIN,
  type Cardio,
  type Lift,
} from '../program'
import type { CardioOverride, LiftOverride } from './store'

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)))

/** Merge a stored override onto the program default, bounds-checked. */
export function resolveLift(lift: Lift, override: LiftOverride | undefined): Lift {
  if (!override) return lift
  const merged: Lift = { ...lift }
  if (override.name?.trim()) merged.name = override.name.trim()
  if (typeof override.sets === 'number' && Number.isFinite(override.sets)) {
    merged.sets = clamp(override.sets, SETS_MIN, SETS_MAX)
  }
  if (typeof override.repsMin === 'number' && Number.isFinite(override.repsMin)) {
    merged.repsMin = clamp(override.repsMin, REPS_MIN, REPS_MAX)
  }
  if (typeof override.repsMax === 'number' && Number.isFinite(override.repsMax)) {
    merged.repsMax = clamp(override.repsMax, REPS_MIN, REPS_MAX)
  }
  if (merged.repsMax < merged.repsMin) merged.repsMax = merged.repsMin
  if (override.tempo !== undefined) merged.tempo = override.tempo.trim() || undefined
  if (override.note !== undefined) merged.note = override.note.trim() || undefined
  if (override.lateCut !== undefined && !PROTECTED_LIFT_IDS.has(lift.id)) {
    merged.lateCut = override.lateCut || undefined
  }
  return merged
}

export function resolveCardio(cardio: Cardio, override: CardioOverride | undefined): Cardio {
  if (!override) return cardio
  const merged: Cardio = { ...cardio }
  if (override.name?.trim()) merged.name = override.name.trim()
  if (override.minutes?.trim()) merged.minutes = override.minutes.trim()
  if (override.note !== undefined) merged.note = override.note.trim() || undefined
  return merged
}

export interface LiftForm {
  name: string
  sets: number
  repsMin: number
  repsMax: number
  tempo: string
  note: string
  lateCut: boolean
}

export const liftToForm = (lift: Lift): LiftForm => ({
  name: lift.name,
  sets: lift.sets,
  repsMin: lift.repsMin,
  repsMax: lift.repsMax,
  tempo: lift.tempo ?? '',
  note: lift.note ?? '',
  lateCut: !!lift.lateCut,
})

/** Diff a submitted form against the program default. Null = back to default. */
export function liftOverrideFromForm(defaultLift: Lift, form: LiftForm): LiftOverride | null {
  const o: LiftOverride = {}
  const name = form.name.trim()
  if (name && name !== defaultLift.name) o.name = name
  const sets = clamp(form.sets, SETS_MIN, SETS_MAX)
  if (sets !== defaultLift.sets) o.sets = sets
  const repsMin = clamp(form.repsMin, REPS_MIN, REPS_MAX)
  const repsMax = Math.max(repsMin, clamp(form.repsMax, REPS_MIN, REPS_MAX))
  if (repsMin !== defaultLift.repsMin) o.repsMin = repsMin
  if (repsMax !== defaultLift.repsMax) o.repsMax = repsMax
  const tempo = form.tempo.trim()
  if (tempo !== (defaultLift.tempo ?? '')) o.tempo = tempo
  const note = form.note.trim()
  if (note !== (defaultLift.note ?? '')) o.note = note
  if (!PROTECTED_LIFT_IDS.has(defaultLift.id) && form.lateCut !== !!defaultLift.lateCut) {
    o.lateCut = form.lateCut
  }
  return Object.keys(o).length > 0 ? o : null
}

export interface CardioForm {
  name: string
  minutes: string
  note: string
}

export const cardioToForm = (cardio: Cardio): CardioForm => ({
  name: cardio.name,
  minutes: cardio.minutes,
  note: cardio.note ?? '',
})

export function cardioOverrideFromForm(
  defaultCardio: Cardio,
  form: CardioForm
): CardioOverride | null {
  const o: CardioOverride = {}
  const name = form.name.trim()
  if (name && name !== defaultCardio.name) o.name = name
  const minutes = form.minutes.trim()
  if (minutes && minutes !== defaultCardio.minutes) o.minutes = minutes
  const note = form.note.trim()
  if (note !== (defaultCardio.note ?? '')) o.note = note
  return Object.keys(o).length > 0 ? o : null
}
