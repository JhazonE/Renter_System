# RenterNotify — Server-Fetched Alerts (Approach A)

**Date:** 2026-06-30
**Status:** Approved design, pending implementation plan

## Problem

The RenterNotify app's "Recent Alerts" list is built only from local push
listeners in `App.js` (`addNotificationReceivedListener` and
`addNotificationResponseReceivedListener`). Those listeners only fire when the
app is in the foreground or when the user taps a notification. Push messages that
arrive while the app is closed or backgrounded — and are never tapped — never
reach `addAlert()`, so they are not stored. The user therefore cannot trust that
the 30-day alert history is complete, even though the 30-day retention logic in
`src/storage.js` is itself correct.

## Goal

Make the app's alert list complete: every meal-ticket event for the logged-in
renter should appear in the list for the last 30 days, regardless of the app's
state (closed, backgrounded, or reinstalled).

## Approach

The backend already exposes `POST /api/push/alerts` (`GetRenterAlerts` use case),
which derives alerts from the authoritative **access logs** — the real
meal-ticket usage events — gated by `registrationNumber` + `phone`. This is the
same endpoint the web alerts page (`RenterNotifyWeb`) uses. Because it is derived
from server data, it never misses an event and survives reinstalls.

**The server becomes the single source of truth for the alert list.** Local
AsyncStorage is demoted to an offline cache. Push notifications no longer append
their own entry; instead they trigger a refetch.

## Components

### 1. Session stores `phone` — `src/screens/LoginScreen.js`
The `/api/push/alerts` endpoint requires `registrationNumber` + `phone`. The
session object built at login (lines 79-85) currently omits `phone`. Add
`phone: phoneNo` to the saved session so the app can authenticate the fetch.

Existing logged-in users whose stored session predates this change will not have
`phone`. They fall back to the cached list until they log in again. No migration.

### 2. `fetchAlerts()` — `src/api.js`
New function mirroring the existing `registerPushToken` style:

```
POST /api/push/alerts  { registrationNumber, phone, limit: 100 }
```

Returns the server payload: `{ recipientType, registration, notification, alerts[] }`.
Throws a friendly `Error` on failure (same pattern as `registerPushToken`).

`limit: 100` comfortably covers 30 days of meal events (~2-3/day). Configurable
constant.

### 3. Alert mapper — `src/alerts.js` (new file)
Mirrors `RenterNotifyWeb/public/app.js` (`fillTemplate`, `prettyTime`) and
ServeQueue's `CreateAccessLog._fillTemplate` so app text reads identically to the
web page and the push notifications.

`mapServerAlert(log, registration, notification)` → `{ id, title, body, at, receivedAt }`:
- `id` = `log.id` (used for keying/dedup)
- `at` = `Date.parse(log.createdAt)` (epoch ms; sorting + 30-day filter)
- `title` = `fillTemplate(notification.titleTemplate, vars)`
- `body` = `fillTemplate(notification.bodyTemplate, vars)` where
  `vars = { name: registration.name, mealType: registration.mealType, time: prettyTime(log.time) }`
- `receivedAt` = PH-time string. Move the existing `phReceivedAt` formatter out
  of `App.js` into `src/alerts.js` and import it back into `App.js`, so both the
  mapper and any remaining `App.js` use share one definition.

A helper maps the full payload → sorted (newest first) array, filtered to
`at >= Date.now() - ALERTS_RETENTION_MS` (reuse the constant from `storage.js`).

### 4. Data flow — `App.js`
- **On launch:** show cached alerts from `loadAlerts()` immediately (instant
  paint), then call `fetchAlerts()` → map → 30-day filter → `setNotifications()`
  + `saveAlerts()` (refresh the cache).
- **On incoming push** (foreground received OR tap response): trigger a
  debounced `fetchAlerts()` refresh instead of `addAlert()`. The OS still shows
  the notification; the list is refreshed from the server.
- **Failure / no phone in session:** keep showing the cached list; do not clear
  it. Surface a non-blocking error state to `HomeScreen`.
- Remove the local `addAlert()` append-to-storage path (kept only as a refresh
  trigger).

### 5. Pull-to-refresh — `src/screens/HomeScreen.js`
Add a `RefreshControl` to the `FlatList` wired to a `onRefresh` prop that calls
`fetchAlerts()`. Show a lightweight loading indicator on initial fetch and a
small inline error message when a refresh fails (cache still visible).

## Data flow diagram

```
Access logs (server, source of truth)
        │  POST /api/push/alerts  (registrationNumber + phone)
        ▼
   fetchAlerts()  →  mapServerAlert()  →  filter last 30 days  →  sort newest-first
        │
        ├─► setNotifications()  (UI)
        └─► saveAlerts()        (offline cache)

Triggers for fetchAlerts(): app launch · pull-to-refresh · incoming push (debounced)
```

## Error handling
- Network/timeout/403/404: caught in `fetchAlerts`, rethrown as friendly `Error`;
  `App.js` keeps the cached list and sets an error flag for `HomeScreen`.
- Missing `session.phone` (legacy session): skip the fetch, rely on cache.
- Empty server result: show the existing empty-state copy.

## Testing
- `fillTemplate` / `prettyTime` / `mapServerAlert` are pure functions → unit test
  with sample server payloads (parent + student, missing fields, old vs. recent
  `createdAt` for the 30-day boundary).
- 30-day filter: an alert with `createdAt` 31 days ago is dropped; 29 days ago is
  kept.
- Manual: log in, confirm list populates from server; trigger a meal-ticket while
  app is fully closed, reopen, confirm the alert appears (the core fix);
  pull-to-refresh updates the list.

## Out of scope
- Background notification task (Approach B) — not needed once the server is the
  source of truth.
- iOS-specific background handling.
- Changing the backend `GetRenterAlerts` contract (limit is already a parameter).
