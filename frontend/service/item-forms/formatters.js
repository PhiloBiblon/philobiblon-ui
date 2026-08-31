/**
 * Time-value formatting shared by the item-forms engine.
 * Pure functions, no Vue/i18n — mirrors the formatting `Create.vue` used to
 * do inline (`formatTime`/`safeFormatTime`/`getBibidDate`) before the #527
 * refactor.
 */

const DATE_PATTERN = /^[+-]?\d{4}-\d{2}-\d{2}/

/**
 * Long-form display date ("January 5, 2020") for a Wikibase time string,
 * used when a claim's *value* happens to be a time (e.g. an authority date).
 * Returns undefined for anything that isn't a valid ISO-ish date string.
 */
export function longDate (timeString) {
  if (!timeString || typeof timeString !== 'string' || !timeString.trim()) {
    return undefined
  }
  if (!DATE_PATTERN.test(timeString)) {
    return undefined
  }
  try {
    const cleaned = timeString.replace(/^\+/, '')
    const date = new Date(cleaned)
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    }).format(date)
  } catch {
    return undefined
  }
}

/**
 * Truncates a Wikibase time value to its recorded precision — year
 * ("2020"), year-month ("2020-01") or full date ("2020-01-05") — instead of
 * formatting it for display. Used for bibid's P49 (publication date) label
 * part, which shows the raw precision rather than a long-form date. A plain
 * string value (as opposed to a Wikibase time object) is passed through
 * trimmed.
 */
export function isoDatePrecision (raw) {
  if (raw == null) return null
  if (typeof raw === 'string') return raw.trim() || null
  if (typeof raw === 'object' && raw.time) {
    const match = raw.time.replace(/^\+/, '').match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!match) return null
    if (raw.precision >= 11) return `${match[1]}-${match[2]}-${match[3]}`
    if (raw.precision >= 10) return `${match[1]}-${match[2]}`
    return match[1]
  }
  return null
}

/** precision 11 ("day") is the only complete-date precision Wikibase uses here. */
export function isCompleteDate (value) {
  if (typeof value === 'object' && value !== null) {
    return value.precision === 11
  }
  if (typeof value === 'string') {
    return DATE_PATTERN.test(value)
  }
  return false
}

/**
 * Today's date as a Wikibase time value, UTC. Fixes a pre-existing bug
 * (Create.vue used local Y/M/D getters but stored the value with a "Z"
 * (UTC) suffix, misdating the P799 creation-date qualifier near local
 * midnight). Takes `now` as a parameter so tests can pin it.
 */
export function todayWikibaseTime (now = new Date()) {
  const yyyy = String(now.getUTCFullYear()).padStart(4, '0')
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  return {
    time: `+${yyyy}-${mm}-${dd}T00:00:00Z`,
    precision: 11,
    calendar: 'gregorian'
  }
}
