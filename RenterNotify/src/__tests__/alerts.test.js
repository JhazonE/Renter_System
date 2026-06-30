import { fillTemplate, prettyTime, ALERTS_RETENTION_MS, mapServerAlert, mapAndPruneAlerts } from '../alerts';

describe('fillTemplate', () => {
  test('substitutes all tokens', () => {
    const out = fillTemplate('Hi! {name} used their {mealType} meal ticket at {time}.', {
      name: 'Ana',
      mealType: 'Veggie',
      time: '8:15 AM',
    });
    expect(out).toBe('Hi! Ana used their Veggie meal ticket at 8:15 AM.');
  });

  test('missing vars become empty strings', () => {
    expect(fillTemplate('{name}-{mealType}-{time}', {})).toBe('--');
  });

  test('null template yields empty string', () => {
    expect(fillTemplate(null, { name: 'x' })).toBe('');
  });
});

describe('prettyTime', () => {
  test('trims seconds and pads', () => {
    expect(prettyTime('08:15:30 AM')).toBe('8:15 AM');
  });
  test('passes through unparseable', () => {
    expect(prettyTime('noon')).toBe('noon');
  });
  test('empty in, empty out', () => {
    expect(prettyTime('')).toBe('');
  });
});

test('retention window is 30 days in ms', () => {
  expect(ALERTS_RETENTION_MS).toBe(30 * 24 * 60 * 60 * 1000);
});

const REGISTRATION = { name: 'Ana', mealType: 'Veggie' };
const NOTIFICATION = {
  titleTemplate: 'Meal Ticket Used',
  bodyTemplate: 'Hi! {name} used their {mealType} meal ticket at {time}.',
};

describe('mapServerAlert', () => {
  test('builds title/body/at/receivedAt from a log row', () => {
    const log = { id: 7, time: '08:15:30 AM', createdAt: '2026-06-30T00:15:30.000Z' };
    const out = mapServerAlert(log, REGISTRATION, NOTIFICATION);
    expect(out.id).toBe(7);
    expect(out.title).toBe('Meal Ticket Used');
    expect(out.body).toBe('Hi! Ana used their Veggie meal ticket at 8:15 AM.');
    expect(out.at).toBe(Date.parse('2026-06-30T00:15:30.000Z'));
    expect(typeof out.receivedAt).toBe('string');
    expect(out.receivedAt.length).toBeGreaterThan(0);
  });

  test('returns at=0 when createdAt is missing', () => {
    const log = { id: 9, time: '07:00:00 AM' };
    const out = mapServerAlert(log, REGISTRATION, NOTIFICATION);
    expect(out.at).toBe(0);
    expect(out.body).toBe('Hi! Ana used their Veggie meal ticket at 7:00 AM.');
  });
});

describe('mapAndPruneAlerts', () => {
  const now = Date.parse('2026-06-30T00:00:00.000Z');
  const iso = (msAgo) => new Date(now - msAgo).toISOString();
  const DAY = 24 * 60 * 60 * 1000;

  const payload = {
    registration: REGISTRATION,
    notification: NOTIFICATION,
    alerts: [
      { id: 1, time: '08:00:00 AM', createdAt: iso(2 * DAY) },   // recent
      { id: 2, time: '09:00:00 AM', createdAt: iso(29 * DAY) },  // inside window
      { id: 3, time: '10:00:00 AM', createdAt: iso(31 * DAY) },  // pruned
    ],
  };

  test('drops alerts older than 30 days', () => {
    const out = mapAndPruneAlerts(payload, now);
    expect(out.map((a) => a.id)).toEqual([1, 2]);
  });

  test('sorts newest-first', () => {
    const reordered = { ...payload, alerts: [payload.alerts[1], payload.alerts[0]] };
    const out = mapAndPruneAlerts(reordered, now);
    expect(out.map((a) => a.id)).toEqual([1, 2]);
  });

  test('tolerates missing alerts array', () => {
    expect(mapAndPruneAlerts({ registration: REGISTRATION, notification: NOTIFICATION }, now)).toEqual([]);
  });
});
