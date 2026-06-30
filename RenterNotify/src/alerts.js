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
