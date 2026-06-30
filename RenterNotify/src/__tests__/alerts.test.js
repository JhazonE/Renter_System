import { fillTemplate, prettyTime, ALERTS_RETENTION_MS } from '../alerts';

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
