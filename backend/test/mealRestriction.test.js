/**
 * Regression tests for the 1-meal-per-period limit in GenerateMealTicket.
 *
 * Reproduces the reported field bug: during biometric scanning a student was
 * told their ticket was "already claimed" for a meal set they had not claimed
 * in that window. Must run with TZ=UTC (Railway's server timezone).
 */
const test = require('node:test');
const assert = require('node:assert');

const GenerateMealTicket = require('../src/application/use-cases/GenerateMealTicket');

const ph = (y, m, d, hh, mm = 0) => new Date(Date.UTC(y, m - 1, d, hh - 8, mm, 0));

/** generated_at is TIMESTAMP WITHOUT TIME ZONE written by CURRENT_TIMESTAMP,
 *  so the stored value is the DB session's wall clock == UTC on Railway. */
const storedUtcNaive = (date) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${p(date.getUTCMonth() + 1)}-${p(date.getUTCDate())} ` +
    `${p(date.getUTCHours())}:${p(date.getUTCMinutes())}:${p(date.getUTCSeconds())}`;
};

const REG = {
  id: 7,
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  canGenerateMealTicket: true,
  hasFingerprint: false,
  biometricTemplate: null,
  mealType: 'Non-Veggie',
  mealTicketExpirationDate: null,
  floorNo: '2',
  roomNo: '204'
};

/** Builds the use case with an in-memory ticket store seeded with PH-time claims. */
function makeUseCase(existingClaimTimes) {
  const tickets = existingClaimTimes.map((when, i) => ({
    id: i + 1,
    registrationId: REG.id,
    generatedAt: storedUtcNaive(when),
    status: 'Active'
  }));

  const mealTicketRepository = {
    // Mimics Postgres comparing naive bounds against naive stored values.
    async getByRegistrationInRange(registrationId, start, end) {
      return tickets.filter(t =>
        t.registrationId === registrationId &&
        t.generatedAt >= start && t.generatedAt < end &&
        t.status !== 'Cancelled');
    },
    async save(ticket) {
      return { ...ticket, id: tickets.length + 1, generatedAt: new Date().toISOString() };
    }
  };

  const registrationRepository = {
    async getById(id) { return Number(id) === REG.id ? { ...REG } : null; },
    async getAll() { return [{ ...REG }]; }
  };

  const systemSettingsRepository = {
    async get(key) { return key === 'meal_restriction_enabled' ? 'true' : null; }
  };

  return new GenerateMealTicket(mealTicketRepository, registrationRepository, systemSettingsRepository);
}

/** Runs execute() with the clock pinned to a PH instant. */
async function generateAt(useCase, nowDate) {
  const RealDate = Date;
  // eslint-disable-next-line no-global-assign
  Date = class extends RealDate {
    constructor(...args) { return args.length ? new RealDate(...args) : new RealDate(nowDate.getTime()); }
    static now() { return nowDate.getTime(); }
  };
  try {
    return await useCase.execute(REG.id, null, null);
  } finally {
    // eslint-disable-next-line no-global-assign
    Date = RealDate;
  }
}

test('BUG: breakfast after midnight is not blocked by the PREVIOUS PH day\'s breakfast', async () => {
  // Claimed breakfast PH Oct 14 08:00 (stored UTC 2026-10-14 00:00).
  const useCase = makeUseCase([ph(2026, 10, 14, 8)]);
  // Scans again PH Oct 15 09:00 -- a different PH day, so it must be allowed.
  const ticket = await generateAt(useCase, ph(2026, 10, 15, 9));
  assert.ok(ticket, 'a new PH day must allow a fresh breakfast claim');
  assert.strictEqual(ticket.mealPeriod, 'Breakfast');
});

test('BUG: a pre-dawn scan must not consume the PH day\'s breakfast slot', async () => {
  // Scan at PH Oct 15 00:30 -- before any window, so it consumes nothing...
  const useCase = makeUseCase([ph(2026, 10, 15, 0, 30)]);
  // ...and the real breakfast at PH Oct 15 07:00 must still be allowed.
  const ticket = await generateAt(useCase, ph(2026, 10, 15, 7));
  assert.ok(ticket, 'pre-dawn scan must not burn the breakfast slot');
  assert.strictEqual(ticket.mealPeriod, 'Breakfast');
});

test('BUG: a 16:00 scan must not consume Dinner before dinner service opens', async () => {
  const useCase = makeUseCase([ph(2026, 10, 14, 16)]);
  const ticket = await generateAt(useCase, ph(2026, 10, 14, 18));
  assert.ok(ticket, 'an afternoon scan must not pre-burn Dinner');
  assert.strictEqual(ticket.mealPeriod, 'Dinner');
});

test('limit still holds: same PH day, same window is blocked', async () => {
  const useCase = makeUseCase([ph(2026, 10, 14, 12)]);
  await assert.rejects(
    () => generateAt(useCase, ph(2026, 10, 14, 13)),
    /already claimed/i,
    'a second Lunch scan in the same window must be refused');
});

test('limit still holds: a late scan cannot re-claim the window that just closed', async () => {
  // Claimed Dinner in-window at PH 20:00; scanning again at 22:00 is still Dinner.
  const useCase = makeUseCase([ph(2026, 10, 14, 20)]);
  await assert.rejects(
    () => generateAt(useCase, ph(2026, 10, 14, 22)),
    /already claimed/i,
    'off-hours scans must not bypass the limit for the preceding meal');
});

test('limit still holds across the UTC day rollover within one PH day', async () => {
  // Dinner PH Oct 14 18:00 (UTC Oct 14 10:00), re-scan PH Oct 14 21:00 (UTC 13:00).
  const useCase = makeUseCase([ph(2026, 10, 14, 18)]);
  await assert.rejects(
    () => generateAt(useCase, ph(2026, 10, 14, 21)),
    /already claimed/i);
});

test('different periods on the same PH day are all allowed', async () => {
  const useCase = makeUseCase([ph(2026, 10, 14, 6), ph(2026, 10, 14, 12)]);
  const ticket = await generateAt(useCase, ph(2026, 10, 14, 18));
  assert.ok(ticket, 'Breakfast+Lunch claimed must not block Dinner');
  assert.strictEqual(ticket.mealPeriod, 'Dinner');
});

test('BUG: a pre-dawn scan is not blocked by the previous PH day\'s breakfast', async () => {
  // Claimed breakfast PH Oct 14 08:00 (stored UTC Oct 14 00:00). Scanning at
  // PH Oct 15 00:30 is a NEW PH day, but both land in the same UTC day -- the
  // server-local day window wrongly treated them as one day and denied this.
  const useCase = makeUseCase([ph(2026, 10, 14, 8)]);
  const ticket = await generateAt(useCase, ph(2026, 10, 15, 0, 30));
  assert.ok(ticket, 'a new PH day must not inherit the previous day\'s claims');
});

test('BUG: a PH-day claim is not lost after the UTC day rolls over', async () => {
  // Breakfast at PH Oct 15 06:00 is stored as UTC Oct 14 22:00. A second scan at
  // PH Oct 15 09:00 (UTC Oct 15 01:00) queried only UTC Oct 15 and missed it,
  // letting the student claim breakfast twice.
  const useCase = makeUseCase([ph(2026, 10, 15, 6)]);
  await assert.rejects(
    () => generateAt(useCase, ph(2026, 10, 15, 9)),
    /already claimed/i,
    'the limit must survive the UTC day boundary mid-PH-day');
});
