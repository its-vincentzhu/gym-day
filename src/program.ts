// The entire training program lives in this file. Everything else is UI/logic.
//
// Rules encoded here:
// - Work sets at RIR 1-2 (squat top sets at RIR 2).
// - Double progression: hit the top of the rep range on EVERY set -> add a
//   small plate next time.
// - Deload week (typically week 5): -1 set on every lift, skip Saturday
//   intervals. Toggled per-week in the UI, keyed by that week's Monday.
// - No 7th movement on any day.
// - Running late: cut the last isolation move (lateCut: true). NEVER cut
//   squat / bench / row / pull-up.
// - Saturday catch-up: at most ONE missed lift, priority squat -> bench ->
//   row, then cardio.

export interface Lift {
  id: string
  name: string
  sets: number
  repsMin: number
  repsMax: number
  /** Target reps-in-reserve label, defaults to "RIR 1-2". */
  rir?: string
  /** Tempo prescription, e.g. "3-1-1". */
  tempo?: string
  note?: string
  /** Skip this lift when running late. Never set on squat/bench/row/pull-up. */
  lateCut?: boolean
  /** Saturday catch-up priority: 1 = squat, 2 = bench, 3 = row. */
  catchUpPriority?: number
}

export interface Cardio {
  name: string
  minutes: string
  intervals: 'never' | 'conditional'
  note?: string
  /** Skip intervals entirely on a deload week. */
  skipOnDeload?: boolean
}

export interface Day {
  /** ISO day of week: 1 = Monday ... 7 = Sunday. */
  dow: number
  title: string
  lifts: Lift[]
  cardio?: Cardio
  rest?: boolean
  notes?: string[]
}

export const STORAGE_KEY = 'gymday:v1'
export const TIMEZONE = 'America/Los_Angeles'
export const DEFAULT_RIR = 'RIR 1-2'

export const PROGRESSION_HINT =
  'Hit top of range on every set last time — add a small plate.'

export const DELOAD_RULE = 'Deload: −1 set on every lift, no Saturday intervals.'

export const PROGRAM: Day[] = [
  {
    dow: 1,
    title: 'Chest + Run',
    lifts: [
      { id: 'bench', name: 'Barbell Bench Press', sets: 3, repsMin: 6, repsMax: 8, catchUpPriority: 2 },
      { id: 'incline-db', name: 'Incline DB Press', sets: 3, repsMin: 8, repsMax: 10 },
      { id: 'light-row', name: 'Light Row', sets: 2, repsMin: 10, repsMax: 12 },
      {
        id: 'fly',
        name: 'Chest Fly',
        sets: 2,
        repsMin: 12,
        repsMax: 15,
        lateCut: true,
        note: 'If late: cut the fly, keep the run.',
      },
    ],
    cardio: {
      name: 'Easy Z2 treadmill',
      minutes: '15–20 min',
      intervals: 'never',
      note: 'Easy Zone 2 only — never intervals on Monday.',
    },
  },
  {
    dow: 2,
    title: 'Legs + Abs',
    lifts: [
      { id: 'squat', name: 'Back Squat', sets: 3, repsMin: 5, repsMax: 7, rir: 'RIR 2', catchUpPriority: 1 },
      { id: 'rdl', name: 'Romanian Deadlift', sets: 3, repsMin: 6, repsMax: 8 },
      { id: 'leg-press-lunge', name: 'Leg Press or Lunge', sets: 2, repsMin: 8, repsMax: 10 },
      { id: 'leg-curl', name: 'Leg Curl', sets: 2, repsMin: 10, repsMax: 12 },
      {
        id: 'hanging-raise',
        name: 'Hanging Raise + Side Plank',
        sets: 2,
        repsMin: 8,
        repsMax: 12,
        lateCut: true,
        note: 'Side plank 2×30–45s per side.',
      },
    ],
    notes: ['No plyo.'],
  },
  {
    dow: 3,
    title: 'Back',
    lifts: [
      { id: 'pull-up', name: 'Pull-Up or Pulldown', sets: 3, repsMin: 6, repsMax: 8 },
      { id: 'row', name: 'Barbell Row', sets: 3, repsMin: 6, repsMax: 8, catchUpPriority: 3 },
      { id: 'cable-row', name: 'Cable Row', sets: 2, repsMin: 10, repsMax: 12 },
      { id: 'pullover', name: 'Pullover', sets: 2, repsMin: 12, repsMax: 15 },
      { id: 'face-pull', name: 'Face Pull', sets: 2, repsMin: 12, repsMax: 15, lateCut: true },
    ],
    notes: ['No deadlift.'],
  },
  {
    dow: 4,
    title: 'Arms + Tempo',
    lifts: [
      {
        id: 'tempo-press',
        name: 'Tempo Incline or Close-Grip Bench',
        sets: 3,
        repsMin: 6,
        repsMax: 8,
        tempo: '3-1-1',
        note: '~10% under your 8RM.',
      },
      { id: 'tempo-row', name: 'Tempo Row', sets: 3, repsMin: 6, repsMax: 8, tempo: '3-1-1' },
      { id: 'curl', name: 'Biceps Curl', sets: 3, repsMin: 8, repsMax: 12 },
      { id: 'tri-ext', name: 'Triceps Extension', sets: 3, repsMin: 8, repsMax: 12, lateCut: true },
    ],
    notes: ['Tempo lifting day — NOT a run. No cardio.'],
  },
  {
    dow: 5,
    title: 'Shoulders + Abs',
    lifts: [
      { id: 'machine-press', name: 'Light Machine Shoulder Press', sets: 3, repsMin: 8, repsMax: 10 },
      { id: 'laterals', name: 'Lateral Raise', sets: 3, repsMin: 12, repsMax: 15 },
      { id: 'rear-delts', name: 'Rear Delt Fly', sets: 3, repsMin: 12, repsMax: 15 },
      { id: 'face-pull', name: 'Face Pull', sets: 2, repsMin: 12, repsMax: 15 },
      {
        id: 'abs-carry',
        name: 'Abs + Suitcase Carry',
        sets: 2,
        repsMin: 10,
        repsMax: 15,
        lateCut: true,
        note: 'Suitcase carry 2×30–40m per side.',
      },
    ],
    notes: ['No heavy overhead press.'],
  },
  {
    dow: 6,
    title: 'Cardio + Catch-Up',
    lifts: [],
    cardio: {
      name: 'Easy Z2 cardio',
      minutes: '30–35 min',
      intervals: 'conditional',
      skipOnDeload: true,
      note: 'Intervals only if Tuesday squat felt fine — and never hard Monday + Saturday.',
    },
    notes: ['Catch-up: at most one missed lift (squat → bench → row), then cardio.'],
  },
  {
    dow: 7,
    title: 'Rest',
    lifts: [],
    rest: true,
    notes: ['Full rest day.'],
  },
]

export const dayForDow = (dow: number): Day => {
  const day = PROGRAM.find((d) => d.dow === dow)
  if (!day) throw new Error(`No program day for dow ${dow}`)
  return day
}

/** Saturday catch-up candidates in priority order: squat -> bench -> row. */
export const catchUpLifts = (): { lift: Lift; dow: number }[] =>
  PROGRAM.flatMap((day) =>
    day.lifts
      .filter((l) => l.catchUpPriority !== undefined)
      .map((lift) => ({ lift, dow: day.dow }))
  ).sort((a, b) => a.lift.catchUpPriority! - b.lift.catchUpPriority!)
