/**
 * Regression tests for meal-period attribution and the 1-meal-per-period limit.
 *
 * These MUST run with TZ=UTC (see package.json "test" script). Railway runs the
 * server in UTC while the meal windows are Philippine wall-clock times, so a
 * UTC+8 dev machine hides the entire class of bug these tests cover.
 */
const test = require('node:test');
const assert = require('node:assert');

const {
  getMealPeriod,
  getPeriodForLimit,
  phDateString,
  DEFAULT_WINDOWS
} = require('../src/shared/mealPeriods');

const W = DEFAULT_WINDOWS;

/** Build the UTC instant corresponding to a Philippine wall clock (PH = UTC+8). */
const ph = (y, m, d, hh, mm = 0) => new Date(Date.UTC(y, m - 1, d, hh - 8, mm, 0));

test('sanity: tests run in UTC so the PH/server offset is exercised', () => {
  assert.strictEqual(new Date().getTimezoneOffset(), 0,
    'run tests with TZ=UTC (npm test sets this)');
});

test('getMealPeriod uses PH wall clock, not server-local UTC', () => {
  // PH 12:00 lunch is UTC 04:00 -- naive server-local reading calls it Breakfast.
  assert.strictEqual(getMealPeriod(ph(2026, 10, 14, 12), W), 'Lunch');
  assert.strictEqual(getMealPeriod(ph(2026, 10, 14, 18), W), 'Dinner');
  assert.strictEqual(getMealPeriod(ph(2026, 10, 14, 6), W), 'Breakfast');
  // Outside every window -> strictly null
  assert.strictEqual(getMealPeriod(ph(2026, 10, 14, 15), W), null);
});

test('phDateString returns the PH calendar date across the UTC day boundary', () => {
  // PH Oct 15 00:30 is still UTC Oct 14 -- the bug that caused false denials.
  assert.strictEqual(phDateString(ph(2026, 10, 15, 0, 30)), '2026-10-15');
  assert.strictEqual(phDateString(ph(2026, 10, 14, 8)), '2026-10-14');
  // PH Oct 15 09:00 is UTC Oct 15 01:00
  assert.strictEqual(phDateString(ph(2026, 10, 15, 9)), '2026-10-15');
});

test('getPeriodForLimit: in-window scans map to their own period', () => {
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 14, 6), W), 'Breakfast');
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 14, 12), W), 'Lunch');
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 14, 18), W), 'Dinner');
});

test('getPeriodForLimit: off-hours scans count toward the PRECEDING window', () => {
  // Just after a window closes -> that meal, so closing-time re-scans can't double-claim.
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 14, 10, 30), W), 'Breakfast');
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 14, 15), W), 'Lunch');
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 14, 22), W), 'Dinner');
  // 16:00 is nearer to Dinner's 17:00 start, but Dinner has not happened yet.
  // The old getNearestMealPeriod wrongly burned Dinner here.
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 14, 16), W), 'Lunch');
});

test('getPeriodForLimit: before the first window of the PH day consumes nothing', () => {
  // 00:00-04:59 precedes Breakfast; the old code charged these to Breakfast
  // and denied the student their actual breakfast hours later.
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 15, 0, 30), W), null);
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 15, 3), W), null);
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 15, 4, 59), W), null);
});

test('window boundaries are inclusive of start, exclusive of end', () => {
  assert.strictEqual(getMealPeriod(ph(2026, 10, 14, 5, 0), W), 'Breakfast');
  assert.strictEqual(getMealPeriod(ph(2026, 10, 14, 9, 59), W), 'Breakfast');
  assert.strictEqual(getMealPeriod(ph(2026, 10, 14, 10, 0), W), null);
  assert.strictEqual(getPeriodForLimit(ph(2026, 10, 14, 10, 0), W), 'Breakfast');
});
