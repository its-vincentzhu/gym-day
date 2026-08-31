import { useState, type ReactNode } from 'react'
import {
  PROTECTED_LIFT_IDS,
  REPS_MAX,
  REPS_MIN,
  SETS_MAX,
  SETS_MIN,
  type Cardio,
  type Lift,
} from '../program'
import type { CardioOverride, LiftOverride } from '../lib/store'
import {
  cardioOverrideFromForm,
  cardioToForm,
  liftOverrideFromForm,
  liftToForm,
  resolveCardio,
  resolveLift,
} from '../lib/overrides'

function Sheet(props: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="sheet-backdrop" onClick={props.onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-head">
          <h3>{props.title}</h3>
          <button className="sheet-close" aria-label="Close" onClick={props.onClose}>
            ✕
          </button>
        </div>
        {props.children}
      </div>
    </div>
  )
}

function Field(props: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{props.label}</span>
      {props.children}
    </label>
  )
}

export function LiftEditor(props: {
  lift: Lift
  override: LiftOverride | undefined
  onSave: (override: LiftOverride | null) => void
  onClose: () => void
}) {
  const { lift } = props
  const isProtected = PROTECTED_LIFT_IDS.has(lift.id)
  const [form, setForm] = useState(() => liftToForm(resolveLift(lift, props.override)))

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const save = () => {
    props.onSave(liftOverrideFromForm(lift, form))
    props.onClose()
  }
  const reset = () => {
    props.onSave(null)
    props.onClose()
  }

  return (
    <Sheet title="Edit slot" onClose={props.onClose}>
      {isProtected ? (
        <p className="sheet-hint">
          Core slot. Rename it or swap equipment — it stays in the program and never gets cut for
          time.
        </p>
      ) : (
        <p className="sheet-hint">Swaps replace the movement in this slot. The day stays at the same count.</p>
      )}

      <Field label="Exercise">
        <input
          className="field-input"
          type="text"
          value={form.name}
          placeholder={lift.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </Field>

      <div className="field-row">
        <Field label="Sets">
          <div className="stepper">
            <button
              className="stepper-btn"
              aria-label="Fewer sets"
              disabled={form.sets <= SETS_MIN}
              onClick={() => set('sets', Math.max(SETS_MIN, form.sets - 1))}
            >
              −
            </button>
            <span className="stepper-value">{form.sets}</span>
            <button
              className="stepper-btn"
              aria-label="More sets"
              disabled={form.sets >= SETS_MAX}
              onClick={() => set('sets', Math.min(SETS_MAX, form.sets + 1))}
            >
              +
            </button>
          </div>
        </Field>
        <Field label="Reps">
          <div className="range-inputs">
            <input
              className="field-input"
              type="number"
              inputMode="numeric"
              min={REPS_MIN}
              max={REPS_MAX}
              value={form.repsMin}
              onChange={(e) => set('repsMin', Number(e.target.value))}
            />
            <span className="set-x">–</span>
            <input
              className="field-input"
              type="number"
              inputMode="numeric"
              min={REPS_MIN}
              max={REPS_MAX}
              value={form.repsMax}
              onChange={(e) => set('repsMax', Number(e.target.value))}
            />
          </div>
        </Field>
      </div>

      <Field label="Tempo (optional)">
        <input
          className="field-input"
          type="text"
          value={form.tempo}
          placeholder="e.g. 3-1-1"
          onChange={(e) => set('tempo', e.target.value)}
        />
      </Field>

      <Field label="Notes">
        <input
          className="field-input"
          type="text"
          value={form.note}
          onChange={(e) => set('note', e.target.value)}
        />
      </Field>

      {!isProtected && (
        <label className="field-check">
          <input
            type="checkbox"
            checked={form.lateCut}
            onChange={(e) => set('lateCut', e.target.checked)}
          />
          Skip if running late
        </label>
      )}

      <div className="sheet-actions">
        <button className="btn btn-primary" onClick={save}>
          Save
        </button>
        <button className="btn" onClick={reset}>
          Reset to default
        </button>
      </div>
    </Sheet>
  )
}

export function CardioEditor(props: {
  cardio: Cardio
  override: CardioOverride | undefined
  onSave: (override: CardioOverride | null) => void
  onClose: () => void
}) {
  const { cardio } = props
  const [form, setForm] = useState(() => cardioToForm(resolveCardio(cardio, props.override)))

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const save = () => {
    props.onSave(cardioOverrideFromForm(cardio, form))
    props.onClose()
  }
  const reset = () => {
    props.onSave(null)
    props.onClose()
  }

  return (
    <Sheet title="Edit cardio" onClose={props.onClose}>
      <Field label="Cardio">
        <input
          className="field-input"
          type="text"
          value={form.name}
          placeholder={cardio.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </Field>

      <Field label="Duration">
        <input
          className="field-input"
          type="text"
          value={form.minutes}
          placeholder={cardio.minutes}
          onChange={(e) => set('minutes', e.target.value)}
        />
      </Field>

      <Field label="Notes">
        <input
          className="field-input"
          type="text"
          value={form.note}
          onChange={(e) => set('note', e.target.value)}
        />
      </Field>

      <div className="sheet-actions">
        <button className="btn btn-primary" onClick={save}>
          Save
        </button>
        <button className="btn" onClick={reset}>
          Reset to default
        </button>
      </div>
    </Sheet>
  )
}
