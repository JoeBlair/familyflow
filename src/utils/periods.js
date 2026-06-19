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

export function yearKey(date = new Date()) {
  return `${date.getFullYear()}`;
}

export function currentPeriodKey(frequency, date = new Date()) {
  switch (frequency) {
    case 'daily':
      return dayKey(date);
    case 'weekly':
      return weekKey(date);
    case 'yearly':
      return yearKey(date);
    default:
      return dayKey(date);
  }
}

export function isChoreDone(chore, date = new Date()) {
  if (!chore.lastCompletedPeriod) return false;
  return chore.lastCompletedPeriod === currentPeriodKey(chore.frequency, date);
}
