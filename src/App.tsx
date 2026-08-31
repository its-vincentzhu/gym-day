import { useMemo, useState } from 'react'
import { PROGRAM, DELOAD_RULE, catchUpLifts, dayForDow } from './program'
import { addDays, mondayOfWeek, prettyDate, todayDow, todayKey } from './lib/date'
import { loadState, saveState, type AppState, type SetEntry } from './lib/store'
import { liftLogged } from './lib/progress'
import { WeekStrip } from './components/WeekStrip'
import { LiftCard } from './components/LiftCard'
import { CardioCard } from './components/CardioCard'

export default function App() {
  const tKey = todayKey()
  const tDow = todayDow()
  const [selectedDow, setSelectedDow] = useState(tDow)
  const [state, setState] = useState<AppState>(loadState)

  const mondayKey = mondayOfWeek(tKey, tDow)
  const selectedKey = addDays(mondayKey, selectedDow - 1)
  const day = dayForDow(selectedDow)
  const isDeload = !!state.deloadWeeks[mondayKey]

  const update = (fn: (s: AppState) => AppState) => {
    setState((prev) => {
      const next = fn(prev)
      saveState(next)
      return next
    })
  }

  const updateSet = (exerciseId: string, setIdx: number, patch: Partial<SetEntry>, totalSets: number) => {
    update((s) => {
      const daySessions = { ...(s.sessions[selectedKey] ?? {}) }
      const existing = daySessions[exerciseId] ?? []
      const size = Math.max(totalSets, existing.length, setIdx + 1)
      const sets: SetEntry[] = Array.from(
        { length: size },
        (_, i) => existing[i] ?? { weight: '', reps: '', done: false }
      )
      sets[setIdx] = { ...sets[setIdx], ...patch }
      daySessions[exerciseId] = sets
      return { ...s, sessions: { ...s.sessions, [selectedKey]: daySessions } }
    })
  }

  const toggleDeload = () =>
    update((s) => ({
      ...s,
      deloadWeeks: { ...s.deloadWeeks, [mondayKey]: !s.deloadWeeks[mondayKey] },
    }))

  // Saturday catch-up: at most one missed lift, priority squat -> bench -> row.
  const catchUp = useMemo(() => {
    if (selectedDow !== 6) return null
    for (const { lift, dow } of catchUpLifts()) {
      const scheduledKey = addDays(mondayKey, dow - 1)
      if (scheduledKey >= selectedKey) continue
      if (liftLogged(state, scheduledKey, lift.id)) continue
      if (liftLogged(state, selectedKey, lift.id)) return lift // already doing it today
      return lift
    }
    return null
  }, [selectedDow, mondayKey, selectedKey, state])

  const effectiveSets = (sets: number) => (isDeload ? Math.max(1, sets - 1) : sets)

  const lifts = catchUp ? [catchUp, ...day.lifts] : day.lifts

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <h1>Gym Day</h1>
          <label className={`deload-toggle${isDeload ? ' on' : ''}`}>
            <input type="checkbox" checked={isDeload} onChange={toggleDeload} />
            Deload week
          </label>
        </div>
        <WeekStrip
          mondayKey={mondayKey}
          todayDow={tDow}
          selectedDow={selectedDow}
          onSelect={setSelectedDow}
        />
      </header>

      <main className="day">
        <div className="day-heading">
          <h2>{day.title}</h2>
          <span className="day-date">
            {prettyDate(selectedKey)}
            {selectedKey === tKey ? ' · Today' : ''}
          </span>
        </div>

        {isDeload && <p className="banner deload-banner">{DELOAD_RULE}</p>}

        {day.notes?.map((n) => (
          <p key={n} className="banner note-banner">
            {n}
          </p>
        ))}

        {selectedDow === 6 && !catchUp && (
          <p className="banner ok-banner">No missed lifts this week — straight to cardio.</p>
        )}

        {lifts.map((lift, i) => (
          <LiftCard
            key={`${lift.id}-${i}`}
            lift={lift}
            state={state}
            dateKey={selectedKey}
            sets={effectiveSets(lift.sets)}
            isCatchUp={catchUp === lift}
            onUpdateSet={(setIdx, patch) =>
              updateSet(lift.id, setIdx, patch, effectiveSets(lift.sets))
            }
          />
        ))}

        {day.cardio && <CardioCard cardio={day.cardio} isDeload={isDeload} />}

        {day.rest && (
          <div className="card rest-card">
            <p>Rest day. Walk, stretch, eat, sleep.</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Work sets at RIR 1–2 · double progression · {PROGRAM.length} day cycle</p>
      </footer>
    </div>
  )
}
