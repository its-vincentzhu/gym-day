import { addDays, dayOfMonth, shortDate, type DateKey } from '../lib/date'

const LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function WeekStrip(props: {
  mondayKey: DateKey
  todayDow: number
  selectedDow: number
  isCurrentWeek: boolean
  onSelect: (dow: number) => void
  onPrevWeek: () => void
  onNextWeek: () => void
  onJumpToToday: () => void
}) {
  return (
    <div className="week-nav-block">
      <div className="week-nav">
        <button className="week-arrow" aria-label="Previous week" onClick={props.onPrevWeek}>
          ‹
        </button>
        <div className="week-nav-center">
          <span className="week-label">
            {props.isCurrentWeek ? 'This week' : `Week of ${shortDate(props.mondayKey)}`}
          </span>
          {!props.isCurrentWeek && (
            <button className="week-today" onClick={props.onJumpToToday}>
              Today
            </button>
          )}
        </div>
        <button className="week-arrow" aria-label="Next week" onClick={props.onNextWeek}>
          ›
        </button>
      </div>
      <div className="week-strip" role="tablist" aria-label="Week">
        {LABELS.map((label, i) => {
          const dow = i + 1
          const key = addDays(props.mondayKey, i)
          const isToday = props.isCurrentWeek && dow === props.todayDow
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
    </div>
  )
}
