import type { Cardio } from '../program'

export function CardioCard(props: { cardio: Cardio; isDeload: boolean }) {
  const { cardio, isDeload } = props
  const intervalsSkipped = isDeload && cardio.skipOnDeload
  return (
    <div className="card cardio-card">
      <div className="lift-head">
        <h3>{cardio.name}</h3>
        <div className="chips">
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
