import { TIMEZONE } from '../program'

export type DateKey = string // YYYY-MM-DD in America/Los_Angeles

const keyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const DOW_BY_NAME: Record<string, number> = {
  Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
}

const dowFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'short' })

/** Today's date key in Pacific time. */
export const todayKey = (now: Date = new Date()): DateKey => keyFormat.format(now)

/** ISO day of week (1=Mon..7=Sun) for "now" in Pacific time. */
export const todayDow = (now: Date = new Date()): number => DOW_BY_NAME[dowFormat.format(now)]

/** Date keys are wall-clock dates; day arithmetic happens in UTC on the key. */
export const addDays = (key: DateKey, days: number): DateKey => {
  const [y, m, d] = key.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

/** The Monday date key of the week containing (todayKey, todayDow). */
export const mondayOfWeek = (key: DateKey, dow: number): DateKey => addDays(key, 1 - dow)

/** Day-of-month for the strip labels. */
export const dayOfMonth = (key: DateKey): number => Number(key.slice(8))

const prettyFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC', // keys are already PT wall-clock dates
  weekday: 'long',
  month: 'short',
  day: 'numeric',
})

export const prettyDate = (key: DateKey): string => {
  const [y, m, d] = key.split('-').map(Number)
  return prettyFormat.format(new Date(Date.UTC(y, m - 1, d)))
}
