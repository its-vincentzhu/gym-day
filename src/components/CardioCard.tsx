import type { Cardio } from '../program'

export function CardioCard(props: {
  cardio: Cardio
  isDeload: boolean
  isCustomized: boolean
  onEdit: () => void
}) {
  const { cardio, isDeload } = props
  const intervalsSkipped = isDeload && cardio.skipOnDeload
  return (
    <div className="card cardio-card">
      <div className="lift-head">
        <h3>
          <button className="slot-name" onClick={props.onEdit} aria-label={`Edit ${cardio.name}`}>
            {cardio.name}
            <span className="edit-glyph" aria-hidden="true">
              ✎
            </span>
          </button>
        </h3>
        <div className="chips">
          {props.isCustomized && <span className="chip chip-custom">custom</span>}
          <span className="chip">{cardio.minutes}</span>
          {cardio.intervals === 'never' && <span className="chip chip-late">no intervals</span>}
        </div>
      </div>
      {intervalsSkipped ? (
        <p className="hint hint-late">Deload week: skip intervals — easy Z2 only.</p>
      ) : (
        cardio.note && <p className="lift-note">{cardio.note}</p>
      )}
    </div>
  )
}
