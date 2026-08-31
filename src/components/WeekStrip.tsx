import { addDays, dayOfMonth, type DateKey } from '../lib/date'

const LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function WeekStrip(props: {
  mondayKey: DateKey
  todayDow: number
  selectedDow: number
  onSelect: (dow: number) => void
}) {
  return (
    <div className="week-strip" role="tablist" aria-label="Week">
      {LABELS.map((label, i) => {
        const dow = i + 1
        const key = addDays(props.mondayKey, i)
        const isToday = dow === props.todayDow
        const isSelected = dow === props.selectedDow
        return (
          <button
            key={dow}
            role="tab"
            aria-selected={isSelected}
            className={`strip-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
            onClick={() => props.onSelect(dow)}
          >
            <span className="strip-label">{label}</span>
            <span className="strip-num">{dayOfMonth(key)}</span>
          </button>
        )
      })}
    </div>
  )
}
