// Renter Notify — web alerts page.
// Signs in with registration number + phone (verified server-side by the backend
// via the /api/my-alerts proxy), then polls for recent meal-ticket alerts and
// notifies in-page (sound + browser Notification) when a new one arrives.

const POLL_MS = 15000;
const STORE_KEY = 'rn_web_session';

const $ = (id) => document.getElementById(id);
const signinCard = $('signinCard');
const panel = $('panel');
const signinBtn = $('signinBtn');
const signinError = $('signinError');

let session = null;       // { registrationNumber, phone }
let seenIds = new Set();  // alert ids already shown (so only NEW ones notify)
let firstLoad = true;
let pollTimer = null;

// --- helpers ---------------------------------------------------------------

function prettyTime(time) {
  // "08:15:30 AM" -> "8:15 AM"
  if (!time) return '';
  const m = String(time).match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?/i);
  if (!m) return time;
  const h = String(parseInt(m[1], 10));
  return `${h}:${m[2]}${m[3] ? ' ' + m[3].toUpperCase() : ''}`;
}

function prettyDate(date) {
  // "2026-06-13" -> "Jun 13"
  if (!date) return '';
  const d = new Date(`${date}T00:00:00`);
  if (isNaN(d)) return date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.42);
  } catch {}
}

function notify(alert, renterName) {
  const title = 'Meal Ticket Used';
  const body = `${renterName} used a meal ticket at ${prettyTime(alert.time)}.`;
  beep();
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/assets/icon.png' });
    } catch {}
  }
}

// --- rendering -------------------------------------------------------------

function renderAlerts(data, freshIds) {
  $('whoName').textContent = data.registration?.name || 'Renter';
  const role = data.recipientType === 'parent' ? 'Parent' : 'Student';
  $('whoRole').textContent = role;

  const list = $('alertsList');
  const empty = $('emptyMsg');
  list.innerHTML = '';

  const alerts = data.alerts || [];
  empty.style.display = alerts.length ? 'none' : 'block';

  for (const a of alerts) {
    const li = document.createElement('li');
    li.className = 'alert' + (freshIds.has(a.id) ? ' fresh' : '');
    li.innerHTML = `
      <div class="icon">🍽️</div>
      <div class="body">
        <div class="t">Meal ticket used</div>
        <div class="s">${a.type === 'Manual Ticket' ? 'Manual ticket' : 'Biometric scan'}</div>
      </div>
      <div class="when">${prettyDate(a.date)}<br>${prettyTime(a.time)}</div>
    `;
    list.appendChild(li);
  }
}

// --- data ------------------------------------------------------------------

async function fetchAlerts() {
  if (!session) return;
  let res, data;
  try {
    res = await fetch('/api/my-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    data = await res.json();
  } catch {
    return; // transient network error; keep last view, try again next tick
  }

  if (!res.ok) {
    // Auth/identity failure on a stored session — bounce back to sign-in.
    if (res.status === 403 || res.status === 404) {
      signOut();
      signinError.textContent = data?.error || 'Could not verify your details.';
    }
    return;
  }

  const incoming = data.alerts || [];
  const freshIds = new Set();
  if (!firstLoad) {
    for (const a of incoming) {
      if (!seenIds.has(a.id)) {
        freshIds.add(a.id);
        notify(a, data.registration?.name || 'Your renter');
      }
    }
  }
  for (const a of incoming) seenIds.add(a.id);
  firstLoad = false;

  renderAlerts(data, freshIds);
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(fetchAlerts, POLL_MS);
}
function stopPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
}

// --- sign in / out ---------------------------------------------------------

async function signIn(registrationNumber, phone) {
  signinError.textContent = '';
  signinBtn.disabled = true;
  signinBtn.textContent = 'Checking…';
  try {
    const res = await fetch('/api/my-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationNumber, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      signinError.textContent = data?.error || 'Sign in failed. Check your details.';
      return;
    }
    session = { registrationNumber, phone };
    localStorage.setItem(STORE_KEY, JSON.stringify(session));
    seenIds = new Set();
    firstLoad = true;

    signinCard.style.display = 'none';
    panel.style.display = 'block';
    renderAlerts(data, new Set());
    for (const a of data.alerts || []) seenIds.add(a.id);
    firstLoad = false;
    startPolling();
  } catch {
    signinError.textContent = 'Could not connect. Please try again.';
  } finally {
    signinBtn.disabled = false;
    signinBtn.textContent = 'View my alerts';
  }
}

function signOut() {
  stopPolling();
  session = null;
  localStorage.removeItem(STORE_KEY);
  panel.style.display = 'none';
  signinCard.style.display = 'block';
}

// --- wire up ---------------------------------------------------------------

signinBtn.addEventListener('click', () => {
  const reg = $('reg').value.trim();
  const phone = $('phone').value.trim();
  if (!reg || !phone) {
    signinError.textContent = 'Enter your registration number and phone.';
    return;
  }
  signIn(reg, phone);
});

$('phone').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') signinBtn.click();
});

$('logoutBtn').addEventListener('click', signOut);

$('notifyBtn').addEventListener('click', async () => {
  if (!('Notification' in window)) {
    $('notifyBtn').textContent = 'Not supported on this browser';
    return;
  }
  const perm = await Notification.requestPermission();
  $('notifyBtn').textContent = perm === 'granted' ? '🔔 Browser alerts on' : '🔔 Alerts blocked';
});

// Restore a stored session on load.
(function init() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (stored?.registrationNumber && stored?.phone) {
      session = stored;
      signinCard.style.display = 'none';
      panel.style.display = 'block';
      fetchAlerts();
      startPolling();
    }
  } catch {}
})();
