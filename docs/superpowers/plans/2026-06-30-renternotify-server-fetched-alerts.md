# RenterNotify Server-Fetched Alerts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the RenterNotify app's 30-day alert list complete by deriving it from the backend access logs (`POST /api/push/alerts`) instead of only locally-captured push events.

**Architecture:** The server becomes the single source of truth for the alert list. The app fetches alerts on launch, on pull-to-refresh, and whenever a push arrives. AsyncStorage is demoted to an offline cache. Pure mapping/formatting logic lives in a new, natively-decoupled `src/alerts.js` so it is unit-testable.

**Tech Stack:** React Native 0.83 / Expo SDK 55, axios, `@react-native-async-storage/async-storage`, `expo-notifications`. Tests via Jest (newly added) with `babel-preset-expo` transform.

## Global Constraints

- Work inside `d:\BHAGOH PROJECT\Renter Systems\RenterNotify`.
- Backend endpoint is `POST /api/push/alerts` with body `{ registrationNumber, phone, limit }`; response shape: `{ recipientType, registration: { id, name, registrationNumber, mealType }, notification: { titleTemplate, bodyTemplate }, alerts: [{ id, type, status, date, time, createdAt }] }`.
- Default template fallbacks (verbatim, must match web/server): title `Meal Ticket Used`; body `Hi! {name} used their {mealType} meal ticket at {time}.`
- Template tokens: `{name}`, `{mealType}`, `{time}` only.
- Retention window: `ALERTS_RETENTION_MS = 30 * 24 * 60 * 60 * 1000`.
- Fetch limit constant: `100`.
- `src/alerts.js` MUST NOT import `./storage` or anything that pulls in `@react-native-async-storage/async-storage`, so it stays node-testable. The retention constant moves into `alerts.js` and is re-exported from `storage.js`.
- App brand name in user-facing copy is `ZT Notify`.
- Times are formatted in `Asia/Manila` regardless of device locale.

---

## File Structure

- Create `src/alerts.js` — pure helpers: `fillTemplate`, `prettyTime`, `phReceivedAt`, `mapServerAlert`, `mapAndPruneAlerts`, and the `ALERTS_RETENTION_MS` constant.
- Create `src/__tests__/alerts.test.js` — unit tests for the pure helpers.
- Create `src/__tests__/api.test.js` — unit test for `fetchAlerts` with a mocked axios client.
- Create `jest.config.js` and `babel.config.js` (if absent) — Jest + babel transform setup.
- Modify `package.json` — add Jest devDeps + `test` script.
- Modify `src/storage.js` — re-export `ALERTS_RETENTION_MS` from `./alerts` (remove its own definition).
- Modify `src/api.js` — add `fetchAlerts`.
- Modify `src/screens/LoginScreen.js` — store `phone` in the session.
- Modify `App.js` — fetch-on-launch, push-triggers-refetch, cache fallback; import `phReceivedAt`/`ALERTS_RETENTION_MS` from `./src/alerts`.
- Modify `src/screens/HomeScreen.js` — pull-to-refresh + loading/error UI.

---

### Task 1: Jest test infrastructure

**Files:**
- Modify: `package.json`
- Create: `jest.config.js`
- Create: `babel.config.js` (only if it does not already exist)
- Create: `src/__tests__/sanity.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: a working `npm test` command that runs Jest over `src/__tests__/*.test.js` using the `babel-preset-expo` transform in a `node` environment.

- [ ] **Step 1: Add the sanity test**

Create `src/__tests__/sanity.test.js`:

```js
test('jest runs', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 2: Add Jest config**

Create `jest.config.js`:

```js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/**/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
};
```

- [ ] **Step 3: Ensure babel config exists**

If `babel.config.js` does NOT already exist in `RenterNotify/`, create it:

```js
module.exports = function (api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
```

If it already exists, leave it unchanged.

- [ ] **Step 4: Add devDeps and test script to `package.json`**

Add to `devDependencies`: `"jest": "^29.7.0"`, `"babel-jest": "^29.7.0"`.
Add to `scripts`: `"test": "jest"`.

Then install:

Run: `npm install`
Expected: installs without errors.

- [ ] **Step 5: Run the sanity test**

Run: `npm test`
Expected: PASS — 1 test passed.

- [ ] **Step 6: Commit**

```bash
git add RenterNotify/package.json RenterNotify/package-lock.json RenterNotify/jest.config.js RenterNotify/babel.config.js RenterNotify/src/__tests__/sanity.test.js
git commit -m "test: add Jest infrastructure to RenterNotify"
```

---

### Task 2: Pure template + time helpers in `src/alerts.js`

**Files:**
- Create: `src/alerts.js`
- Test: `src/__tests__/alerts.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export const ALERTS_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;`
  - `export function fillTemplate(template, { name, mealType, time }) -> string`
  - `export function prettyTime(time) -> string`
  - `export function phReceivedAt(date) -> string` (PH-time, `Date` in)

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/alerts.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- alerts`
Expected: FAIL — cannot find module `../alerts`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/alerts.js`:

```js
// Pure alert helpers. MUST NOT import ./storage or AsyncStorage so this module
// stays unit-testable under plain Node (see jest.config.js).

// Recent alerts are kept for ONE MONTH; older ones are pruned.
export const ALERTS_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

// Same placeholder substitution as ServeQueue's CreateAccessLog._fillTemplate
// and RenterNotifyWeb/public/app.js.
export function fillTemplate(template, { name, mealType, time } = {}) {
  return String(template || '')
    .replace(/\{name\}/g, name ?? '')
    .replace(/\{mealType\}/g, mealType ?? '')
    .replace(/\{time\}/g, time ?? '');
}

// "08:15:30 AM" -> "8:15 AM"
export function prettyTime(time) {
  if (!time) return '';
  const m = String(time).match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?/i);
  if (!m) return time;
  const h = String(parseInt(m[1], 10));
  return `${h}:${m[2]}${m[3] ? ' ' + m[3].toUpperCase() : ''}`;
}

// Format a moment in Philippine time (Asia/Manila), regardless of device locale.
export function phReceivedAt(date) {
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- alerts`
Expected: PASS — all `fillTemplate`, `prettyTime`, retention tests green.

- [ ] **Step 5: Commit**

```bash
git add RenterNotify/src/alerts.js RenterNotify/src/__tests__/alerts.test.js
git commit -m "feat: add pure alert template/time helpers"
```

---

### Task 3: Map + prune server alerts; share retention constant

**Files:**
- Modify: `src/alerts.js`
- Modify: `src/storage.js:20-23`
- Test: `src/__tests__/alerts.test.js`

**Interfaces:**
- Consumes: `fillTemplate`, `prettyTime`, `phReceivedAt`, `ALERTS_RETENTION_MS` from Task 2.
- Produces:
  - `export function mapServerAlert(log, registration, notification) -> { id, title, body, at, receivedAt }`
  - `export function mapAndPruneAlerts(payload, now = Date.now()) -> Alert[]` (newest-first, only alerts with `at >= now - ALERTS_RETENTION_MS`)
  - `storage.js` re-exports `ALERTS_RETENTION_MS` from `./alerts` (no longer defines its own).

- [ ] **Step 1: Write the failing tests**

Append to `src/__tests__/alerts.test.js`:

```js
import { mapServerAlert, mapAndPruneAlerts } from '../alerts';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- alerts`
Expected: FAIL — `mapServerAlert` / `mapAndPruneAlerts` are not exported.

- [ ] **Step 3: Add the implementations to `src/alerts.js`**

Append to `src/alerts.js`:

```js
// Convert one server access-log row into the app's alert shape.
export function mapServerAlert(log, registration, notification) {
  const vars = {
    name: registration?.name,
    mealType: registration?.mealType,
    time: prettyTime(log?.time),
  };
  const at = Date.parse(log?.createdAt) || 0;
  return {
    id: log?.id,
    title: fillTemplate(notification?.titleTemplate, vars),
    body: fillTemplate(notification?.bodyTemplate, vars),
    at,
    receivedAt: phReceivedAt(new Date(at)),
  };
}

// Map a full /api/push/alerts payload to app alerts, newest-first, pruned to the
// last 30 days.
export function mapAndPruneAlerts(payload, now = Date.now()) {
  const cutoff = now - ALERTS_RETENTION_MS;
  const { registration, notification } = payload || {};
  return (payload?.alerts || [])
    .map((log) => mapServerAlert(log, registration, notification))
    .filter((a) => a.at >= cutoff)
    .sort((a, b) => b.at - a.at);
}
```

- [ ] **Step 4: Re-export the constant from `storage.js`**

In `src/storage.js`, replace the local definition (around lines 20-23):

```js
// Recent alerts persist across app restarts but only for ONE MONTH — anything
// older than 30 days is dropped on load/save so the list self-prunes.
const ALERTS_KEY = 'renter_notify_alerts';
export const ALERTS_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
```

with:

```js
// Recent alerts persist across app restarts but only for ONE MONTH — anything
// older than 30 days is dropped on load/save so the list self-prunes.
// The retention window lives in ./alerts (native-decoupled); re-export for
// existing importers.
import { ALERTS_RETENTION_MS } from './alerts';
const ALERTS_KEY = 'renter_notify_alerts';
export { ALERTS_RETENTION_MS };
```

Move the new `import` line up with the existing `import AsyncStorage ...` at the top of the file (ES module imports must be at the top), and keep `ALERTS_KEY` where it was.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- alerts`
Expected: PASS — all alerts tests green.

- [ ] **Step 6: Commit**

```bash
git add RenterNotify/src/alerts.js RenterNotify/src/__tests__/alerts.test.js RenterNotify/src/storage.js
git commit -m "feat: map and prune server alerts to last 30 days"
```

---

### Task 4: `fetchAlerts` in `src/api.js`

**Files:**
- Modify: `src/api.js`
- Test: `src/__tests__/api.test.js`

**Interfaces:**
- Consumes: the shared axios `client` already created in `api.js`.
- Produces: `export async function fetchAlerts({ registrationNumber, phone, limit = 100 }) -> serverPayload` — throws `Error` with a friendly message on failure.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/api.test.js`:

```js
jest.mock('../config', () => ({ API_BASE_URL: 'http://test', MOBILE_API_KEY: '' }));

const post = jest.fn();
jest.mock('axios', () => ({
  __esModule: true,
  default: { create: () => ({ post }) },
}));

import { fetchAlerts } from '../api';

beforeEach(() => post.mockReset());

test('posts registration, phone and limit and returns data', async () => {
  post.mockResolvedValue({ data: { alerts: [{ id: 1 }] } });
  const result = await fetchAlerts({ registrationNumber: '100245', phone: '09171234567' });
  expect(post).toHaveBeenCalledWith('/api/push/alerts', {
    registrationNumber: '100245',
    phone: '09171234567',
    limit: 100,
  });
  expect(result).toEqual({ alerts: [{ id: 1 }] });
});

test('throws a friendly error from the server body', async () => {
  post.mockRejectedValue({ response: { data: { error: 'Phone number does not match this registration' } } });
  await expect(fetchAlerts({ registrationNumber: 'x', phone: 'y' }))
    .rejects.toThrow('Phone number does not match this registration');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api`
Expected: FAIL — `fetchAlerts` is not exported.

- [ ] **Step 3: Implement `fetchAlerts`**

Append to `src/api.js` (after `unregisterPushToken`):

```js
// Fetches the renter's recent meal-ticket alerts from the backend access logs,
// gated by registration + phone (same endpoint the web alerts page uses). This
// is the source of truth for the in-app list, so nothing is missed while the app
// is closed. Throws with a friendly message on failure.
export async function fetchAlerts({ registrationNumber, phone, limit = 100 }) {
  try {
    const { data } = await client.post('/api/push/alerts', {
      registrationNumber,
      phone,
      limit,
    });
    return data;
  } catch (err) {
    const message = err.response?.data?.error || err.message || 'Network error';
    throw new Error(message);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- api`
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add RenterNotify/src/api.js RenterNotify/src/__tests__/api.test.js
git commit -m "feat: add fetchAlerts API call"
```

---

### Task 5: Store `phone` in the session

**Files:**
- Modify: `src/screens/LoginScreen.js:79-85`

**Interfaces:**
- Consumes: `phoneNo` already computed in `submit`.
- Produces: a session object that now includes `phone`, consumed by `App.js` (Task 6).

- [ ] **Step 1: Add `phone` to the session object**

In `src/screens/LoginScreen.js`, in `submit`, change the session object:

```js
      const session = {
        registrationNumber: result.registration.registrationNumber,
        name: result.registration.name,
        recipientType: result.recipientType,
        expoToken,
      };
```

to:

```js
      const session = {
        registrationNumber: result.registration.registrationNumber,
        name: result.registration.name,
        recipientType: result.recipientType,
        phone: phoneNo,
        expoToken,
      };
```

- [ ] **Step 2: Verify nothing else broke**

Run: `npm test`
Expected: PASS — existing tests still green (no test covers LoginScreen; this guards against accidental breakage).

- [ ] **Step 3: Commit**

```bash
git add RenterNotify/src/screens/LoginScreen.js
git commit -m "feat: store phone in session for alert fetching"
```

---

### Task 6: `App.js` — fetch on launch, refetch on push, cache fallback

**Files:**
- Modify: `App.js`

**Interfaces:**
- Consumes: `fetchAlerts` (Task 4); `mapAndPruneAlerts`, `phReceivedAt`, `ALERTS_RETENTION_MS` (Tasks 2-3); `loadAlerts`, `saveAlerts`, `loadSession` (existing).
- Produces: a `refreshAlerts` function and `alertsLoading` / `alertsError` state passed to `HomeScreen` (Task 7) as props `onRefresh`, `refreshing`, `error`.

This task is UI/integration and is verified manually (no RN test renderer is configured).

- [ ] **Step 1: Update imports**

Replace the storage/format imports at the top of `App.js`:

```js
import * as Notifications from 'expo-notifications';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import { loadSession, loadAlerts, saveAlerts, ALERTS_RETENTION_MS } from './src/storage';
```

with:

```js
import * as Notifications from 'expo-notifications';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import { loadSession, loadAlerts, saveAlerts } from './src/storage';
import { fetchAlerts } from './src/api';
import { mapAndPruneAlerts } from './src/alerts';
```

Then DELETE the local `phReceivedAt` definition (lines 9-18) — it now lives in `src/alerts.js` and is no longer used here (the add-alert path that used it is removed in Step 3).

- [ ] **Step 2: Add refresh state and a `refreshAlerts` callback**

In the `App` component, add state next to the existing `useState` calls:

```js
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState('');
```

Add a `useRef` to avoid overlapping fetches, next to the existing refs:

```js
  const fetchingRef = useRef(false);
```

Add the callback (place it after the boot `useEffect`):

```js
  // Pull the authoritative alert list from the backend (access logs), prune to
  // the last 30 days, show it, and cache it. The server is the source of truth,
  // so alerts that arrived while the app was closed still appear here.
  const refreshAlerts = async (activeSession) => {
    const s = activeSession || session;
    if (!s?.registrationNumber || !s?.phone) return; // legacy session: keep cache
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setAlertsLoading(true);
    setAlertsError('');
    try {
      const payload = await fetchAlerts({
        registrationNumber: s.registrationNumber,
        phone: s.phone,
      });
      const mapped = mapAndPruneAlerts(payload);
      setNotifications(mapped);
      await saveAlerts(mapped);
    } catch (err) {
      setAlertsError(err.message || 'Could not refresh alerts');
    } finally {
      fetchingRef.current = false;
      setAlertsLoading(false);
    }
  };
```

- [ ] **Step 3: Replace `addAlert` with a refetch, and remove local append**

DELETE the existing `addAlert` function (the `const addAlert = (title, body) => { ... }` block).

In the boot `useEffect`, after restoring the cached alerts, kick off a server refresh. Change:

```js
      const stored = await loadSession();
      if (stored) setSession(stored);
      const alerts = await loadAlerts(); // already pruned to the last 30 days
      setNotifications(alerts);
      setBooting(false);
```

to:

```js
      const stored = await loadSession();
      if (stored) setSession(stored);
      const alerts = await loadAlerts(); // cached list, shown instantly
      setNotifications(alerts);
      setBooting(false);
      if (stored) refreshAlerts(stored); // then refresh from the server
```

In the notifications `useEffect`, change both listeners to trigger a refresh instead of `addAlert`:

```js
    receivedListener.current = Notifications.addNotificationReceivedListener(() => {
      refreshAlerts();
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      refreshAlerts();
    });
```

Note: `refreshAlerts` reads `session` from closure; since the notifications `useEffect` runs once, capture the latest session by leaving the dependency array empty and relying on `refreshAlerts` falling back to the `session` state via its default. To ensure freshness, also add `session` is acceptable but would re-subscribe; keeping `[]` is fine because `refreshAlerts(undefined)` reads the current `session` through the component closure only if it is stable. To guarantee correctness, store the session in a ref:

Add near the other refs:

```js
  const sessionRef = useRef(null);
```

Keep it in sync — add this effect:

```js
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);
```

And in `refreshAlerts`, change the first line to read from the ref when no arg is passed:

```js
    const s = activeSession || sessionRef.current;
```

- [ ] **Step 4: Pass refresh props to `HomeScreen`**

Find where `HomeScreen` is rendered and add props:

```jsx
        <HomeScreen
          session={session}
          notifications={notifications}
          onLogout={handleLogout}
          onRefresh={() => refreshAlerts()}
          refreshing={alertsLoading}
          error={alertsError}
        />
```

(Keep whatever existing props/`onLogout` wiring is present; only add `onRefresh`, `refreshing`, `error`.)

- [ ] **Step 5: Manual verification**

Run: `npm run android` (emulator dev build per the project's RenterNotify emulator notes).
Verify:
1. Log in → list populates from the server within a second or two.
2. With the app fully closed, trigger a meal-ticket scan for this renter on ServeQueue, then reopen the app → the new alert appears (the core fix).
3. No duplicate rows appear for a single meal event.

- [ ] **Step 6: Commit**

```bash
git add RenterNotify/App.js
git commit -m "feat: drive alert list from server fetch with cache fallback"
```

---

### Task 7: `HomeScreen` pull-to-refresh + loading/error UI

**Files:**
- Modify: `src/screens/HomeScreen.js`

**Interfaces:**
- Consumes: new props `onRefresh`, `refreshing`, `error` from `App.js` (Task 6).
- Produces: user-facing pull-to-refresh + inline error; no downstream consumers.

This task is UI and is verified manually.

- [ ] **Step 1: Import `RefreshControl`**

In `src/screens/HomeScreen.js`, add `RefreshControl` to the `react-native` import list:

```js
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
```

- [ ] **Step 2: Accept the new props**

Change the component signature:

```js
export default function HomeScreen({ session, notifications, onLogout }) {
```

to:

```js
export default function HomeScreen({ session, notifications, onLogout, onRefresh, refreshing, error }) {
```

- [ ] **Step 3: Wire `RefreshControl` and show the error**

Add an inline error line just above the `FlatList` (after the `sectionTitle` Text):

```jsx
      <Text style={styles.sectionTitle}>Recent Alerts</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id ?? item.at)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            colors={['#0F766E']}
            tintColor="#0F766E"
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No alerts yet. You'll see meal-ticket notifications here.
          </Text>
        }
        contentContainerStyle={notifications.length === 0 && styles.emptyWrap}
      />
```

(Note: `keyExtractor` now keys on the stable `item.id ?? item.at` instead of the array index, so refreshed lists reconcile correctly.)

- [ ] **Step 4: Add the error style**

Add to the `StyleSheet.create({ ... })` object:

```js
  errorText: { color: '#DC2626', fontSize: 12, paddingHorizontal: 20, marginBottom: 8 },
```

- [ ] **Step 5: Manual verification**

Run: `npm run android`
Verify:
1. Pull down on the alert list → spinner shows, list refreshes from the server.
2. Turn off the backend (or airplane mode) and pull to refresh → an inline error appears, but the previously-loaded list stays visible.

- [ ] **Step 6: Commit**

```bash
git add RenterNotify/src/screens/HomeScreen.js
git commit -m "feat: add pull-to-refresh and error state to alerts list"
```

---

## Self-Review Notes

- **Spec coverage:** session phone (Task 5), `fetchAlerts` (Task 4), mapper/`src/alerts.js` (Tasks 2-3), App data flow + push-triggers-refetch + cache fallback (Task 6), pull-to-refresh + loading/error (Task 7), 30-day prune + sort (Task 3 tests), template parity with web (Task 2 tests). All spec sections map to a task.
- **Native decoupling:** `src/alerts.js` imports nothing native; `storage.js` imports the constant from `alerts.js` (one-directional), so tests run under plain Node.
- **Type consistency:** `mapAndPruneAlerts(payload, now?)`, `mapServerAlert(log, registration, notification)`, `fetchAlerts({ registrationNumber, phone, limit })`, alert shape `{ id, title, body, at, receivedAt }`, and `HomeScreen` props `{ onRefresh, refreshing, error }` are used identically across tasks.
```
