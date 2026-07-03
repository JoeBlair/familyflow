// Period keys drive automatic chore resets with no timers.
// A chore is "done" iff its lastCompletedPeriod === currentPeriodKey(frequency).

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

// Local YYYY-MM-DD for a date
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ISO week key: YYYY-Www, week starts Monday.
export function weekKey(date = new Date()) {
  // Copy date so we don't mutate the argument; work in UTC for ISO correctness.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // ISO: Monday = 1 ... Sunday = 7
  const dayNum = d.getUTCDay() || 7;
  // Shift to the Thursday of this week (ISO weeks are defined by their Thursday)
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${pad(weekNo)}`;
}

// Calendar month key: YYYY-MM.
export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function yearKey(date = new Date()) {
  return `${date.getFullYear()}`;
}

export function currentPeriodKey(frequency, date = new Date()) {
  switch (frequency) {
    case 'once':
      return 'once'; // constant — a one-off, once done, stays done forever
    case 'daily':
      return dayKey(date);
    case 'weekly':
      return weekKey(date);
    case 'monthly':
      return monthKey(date);
    case 'yearly':
      return yearKey(date);
    // 'custom' (every N days) also stamps the completion day; the interval
    // check lives in isChoreDone, not here.
    default:
      return dayKey(date);
  }
}

// getDay(): 0=Sun … 6=Sat
const WEEKDAY_OF = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function parseDayKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
const atMidnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Next due date given a last-done date and an interval.
function nextDue(from, every, unit) {
  const d = new Date(from);
  if (unit === 'week') d.setDate(d.getDate() + every * 7);
  else if (unit === 'month') d.setMonth(d.getMonth() + every);
  else d.setDate(d.getDate() + every); // 'day'
  return d;
}

// Custom recurrence: either { weekdays: [...] } or { every, unit }.
function customDone(chore, date) {
  const rec = chore.recurrence || {};
  if (rec.weekdays && rec.weekdays.length) {
    // Weekday mode: due only on the chosen weekdays.
    if (!rec.weekdays.includes(WEEKDAY_OF[date.getDay()])) return true; // not due today
    return chore.lastCompletedPeriod === dayKey(date); // due today → done iff done today
  }
  // Interval mode: satisfied until the next due date arrives.
  if (!chore.lastCompletedPeriod) return false;
  const due = nextDue(parseDayKey(chore.lastCompletedPeriod), rec.every || 1, rec.unit || 'day');
  return atMidnight(date) < atMidnight(due);
}

export function isChoreDone(chore, date = new Date()) {
  if (chore.frequency === 'custom') return customDone(chore, date);
  if (!chore.lastCompletedPeriod) return false;
  return chore.lastCompletedPeriod === currentPeriodKey(chore.frequency, date);
}
