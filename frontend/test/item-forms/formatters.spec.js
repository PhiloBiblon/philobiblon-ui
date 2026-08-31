import { describe, expect, it } from 'vitest'
import { isCompleteDate, isoDatePrecision, longDate, todayWikibaseTime } from '~/service/item-forms/formatters.js'

describe('longDate', () => {
  it('formats a full ISO date as a long-form date', () => {
    expect(longDate('2020-01-05T00:00:00Z')).toBe('January 5, 2020')
  })

  it('handles a leading "+" (Wikibase time convention)', () => {
    expect(longDate('+2020-01-05T00:00:00Z')).toBe('January 5, 2020')
  })

  it('returns undefined for an empty, missing, or non-date string', () => {
    expect(longDate('')).toBeUndefined()
    expect(longDate(undefined)).toBeUndefined()
    expect(longDate('not a date')).toBeUndefined()
  })
})

describe('isoDatePrecision', () => {
  it('truncates a day-precision (11) time to the full date', () => {
    expect(isoDatePrecision(timeValue(11))).toBe('2020-01-05')
  })

  it('truncates a month-precision (10) time to year-month', () => {
    expect(isoDatePrecision(timeValue(10))).toBe('2020-01')
  })

  it('truncates a year-precision (9) time to the year', () => {
    expect(isoDatePrecision(timeValue(9))).toBe('2020')
  })

  it('passes a plain string value through, trimmed', () => {
    expect(isoDatePrecision('  1450  ')).toBe('1450')
  })

  it('returns null for a missing or unparseable value', () => {
    expect(isoDatePrecision(null)).toBeNull()
    expect(isoDatePrecision({ time: 'garbage' })).toBeNull()
    expect(isoDatePrecision('')).toBeNull()
  })

  function timeValue (precision) {
    return { time: '+2020-01-05T00:00:00Z', precision, calendar: 'gregorian' }
  }
})

describe('isCompleteDate', () => {
  it('is complete for a day-precision (11) time object', () => {
    expect(isCompleteDate({ time: '+2020-01-05T00:00:00Z', precision: 11 })).toBe(true)
  })

  it('is incomplete for a month- or year-precision time object', () => {
    expect(isCompleteDate({ time: '+2020-01-05T00:00:00Z', precision: 10 })).toBe(false)
    expect(isCompleteDate({ time: '+2020-01-05T00:00:00Z', precision: 9 })).toBe(false)
  })

  it('is complete for a full ISO date string', () => {
    expect(isCompleteDate('2020-01-05')).toBe(true)
  })

  it('is incomplete for a partial date string or other type', () => {
    expect(isCompleteDate('2020-01')).toBe(false)
    expect(isCompleteDate(42)).toBe(false)
    expect(isCompleteDate(null)).toBe(false)
  })
})

describe('todayWikibaseTime', () => {
  it('uses UTC getters, not local time, near local midnight', () => {
    // A moment that is 2020-01-01 in UTC but still 2019-12-31 in a
    // negative-offset local timezone -- the bug this fixes.
    const now = new Date('2020-01-01T02:00:00Z')
    expect(todayWikibaseTime(now)).toEqual({
      time: '+2020-01-01T00:00:00Z',
      precision: 11,
      calendar: 'gregorian'
    })
  })

  it('pads single-digit month and day', () => {
    const now = new Date('2020-03-05T12:00:00Z')
    expect(todayWikibaseTime(now).time).toBe('+2020-03-05T00:00:00Z')
  })
})
