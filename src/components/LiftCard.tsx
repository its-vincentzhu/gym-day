import { DEFAULT_RIR, PROGRESSION_HINT, type Lift } from '../program'
import type { DateKey } from '../lib/date'
import type { AppState, SetEntry } from '../lib/store'
import { hitTopOfRangeLastTime, lastSession, prefillWeight } from '../lib/progress'

export function LiftCard(props: {
  lift: Lift
  state: AppState
  dateKey: DateKey
  sets: number
  isCatchUp: boolean
  isCustomized: boolean
  onUpdateSet: (setIdx: number, patch: Partial<SetEntry>) => void
  onEdit: () => void
}) {
  const { lift, state, dateKey, sets } = props
  const entries = state.sessions[dateKey]?.[lift.id] ?? []
  const lastWeight = prefillWeight(state, lift.id, dateKey)
  const progressUp = hitTopOfRangeLastTime(state, lift, dateKey)
  const last = lastSession(state, lift.id, dateKey)

  // Show `sets` rows, plus any extra sets that actually contain data (so a
  // deload toggle never hides logged work, but trailing empty rows collapse).
  let lastWithData = -1
  entries.forEach((s, i) => {
    if (s.done || s.weight !== '' || s.reps !== '') lastWithData = i
  })
  const rows = Array.from(
    { length: Math.max(sets, lastWithData + 1) },
    (_, i): SetEntry => entries[i] ?? { weight: '', reps: '', done: false }
  )

  const markDone = (i: number, row: SetEntry) => {
    const patch: Partial<SetEntry> = { done: !row.done }
    // Prefill last session's weight when checking off an empty set.
    if (!row.done && row.weight === '' && lastWeight !== '') patch.weight = lastWeight
    props.onUpdateSet(i, patch)
  }

  return (
    <div className={`card lift-card${props.isCatchUp ? ' catch-up' : ''}`}>
      <div className="lift-head">
        <h3>
          <button className="slot-name" onClick={props.onEdit} aria-label={`Edit ${lift.name}`}>
            {lift.name}
            <span className="edit-glyph" aria-hidden="true">
              ✎
            </span>
          </button>
        </h3>
        <div className="chips">
          {props.isCustomized && <span className="chip chip-custom">custom</span>}
          {props.isCatchUp && <span className="chip chip-catchup">catch-up</span>}
          <span className="chip">
            {sets}×{lift.repsMin}–{lift.repsMax}
          </span>
          <span className="chip">{lift.rir ?? DEFAULT_RIR}</span>
          {lift.tempo && <span className="chip">tempo {lift.tempo}</span>}
          {lift.lateCut && <span className="chip chip-late">skip if late</span>}
        </div>
      </div>

      {lift.note && <p className="lift-note">{lift.note}</p>}

      {progressUp && <p className="hint hint-progress">{PROGRESSION_HINT}</p>}
      {!progressUp && last && (
        <p className="hint hint-last">Last: {summarize(last.sets)}</p>
      )}

      <div className="sets">
        {rows.map((row, i) => (
          <div key={i} className={`set-row${row.done ? ' done' : ''}`}>
            <span className="set-num">{i + 1}</span>
            <input
              className="set-input"
              type="text"
              inputMode="decimal"
              placeholder={lastWeight !== '' ? lastWeight : 'lb'}
              aria-label={`${lift.name} set ${i + 1} weight`}
              value={row.weight}
              onChange={(e) => props.onUpdateSet(i, { weight: e.target.value })}
            />
            <span className="set-x">×</span>
            <input
              className="set-input"
              type="text"
              inputMode="numeric"
              placeholder={`${lift.repsMin}–${lift.repsMax}`}
              aria-label={`${lift.name} set ${i + 1} reps`}
              value={row.reps}
              onChange={(e) => props.onUpdateSet(i, { reps: e.target.value })}
            />
            <button
              className={`set-check${row.done ? ' checked' : ''}`}
              aria-label={`${lift.name} set ${i + 1} ${row.done ? 'done' : 'not done'}`}
              onClick={() => markDone(i, row)}
            >
              ✓
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function summarize(sets: SetEntry[]): string {
  const logged = sets.filter((s) => s.done || s.weight !== '' || s.reps !== '')
  if (logged.length === 0) return '—'
  const weight = [...logged].reverse().find((s) => s.weight !== '')?.weight
  const reps = logged.map((s) => s.reps || '?').join('/')
  return `${weight ? `${weight} lb ` : ''}${reps}`
}
