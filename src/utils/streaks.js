/**
 * Streak utilities — check-in based.
 *
 * A day counts if the user checked in on that day. Nothing else matters.
 * No timers. No minutes. No subjects.
 *
 * Data shape:
 *   checkins: ['2026-10-10', '2026-10-11', ...]   // ISO dates, one per day
 *
 * Rules:
 *   - Check in once per day to keep the streak alive
 *   - Grace day: 1 per calendar month, auto-applied on the first miss
 *   - Break: after grace exhausted, current goes to 0, brokenStreak saved
 *   - Restore: check in on a new day restores the broken streak
 *   - Longest streak never decreases
 */

const THIS_MONTH_TARGET = 22; // arbitrary "good month" target for the hero stat

export const RULES = {
  GRACE_PER_MONTH: 1,
  THIS_MONTH_TARGET,
};

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function isoDaysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function monthKey(iso) {
  return String(iso).slice(0, 7);
}

/* ---- Read ---- */

export function hasCheckedInToday(streaks) {
  if (!streaks) return false;
  const list = streaks.checkins || [];
  return list.includes(todayISO());
}

export function computeCurrentStreak(checkins = []) {
  const set = new Set(checkins);
  const today = todayISO();
  const yest = isoDaysAgo(1);

  const activeToday = set.has(today);
  const activeYesterday = set.has(yest);

  let current = 0;
  if (activeToday || activeYesterday) {
    let dayOffset = activeToday ? 0 : 1;
    while (set.has(isoDaysAgo(dayOffset))) {
      current += 1;
      dayOffset += 1;
    }
  }

  return {
    current,
    activeToday,
    atRiskToday: !activeToday && activeYesterday && current > 0,
  };
}

export function countThisMonth(checkins = []) {
  const thisMonth = monthKey(todayISO());
  return (checkins || []).filter((iso) => monthKey(iso) === thisMonth).length;
}

export function countThisWeek(checkins = []) {
  const set = new Set(checkins || []);
  let n = 0;
  for (let i = 0; i < 7; i++) {
    if (set.has(isoDaysAgo(i))) n += 1;
  }
  return n;
}

/* ---- Break rules ---- */

export function applyBreakRules(streaks) {
  if (!streaks) return { changed: false, streaks };
  const s = { ...streaks };
  s.checkins = Array.isArray(s.checkins) ? s.checkins : [];
  s.brokenStreak = s.brokenStreak || null;
  s.graceDayLastUsed = s.graceDayLastUsed || null;

  const { current, activeToday, atRiskToday } = computeCurrentStreak(s.checkins);
  s.current = current;
  s.longest = Math.max(s.longest || 0, current);

  const alive = activeToday || atRiskToday;

  if (alive) {
    if (s.brokenStreak && activeToday) {
      // Restored today
      const restored = Math.max(s.brokenStreak.count, s.longest || 0) + 1;
      s.current = restored;
      s.longest = Math.max(s.longest, restored);
      s.brokenStreak = null;
      s.comebackEarned = true;
    }
    return { changed: true, streaks: s };
  }

  const missedToday = !activeToday && !atRiskToday && (s.current || 0) > 0;

  if (missedToday) {
    const thisMonth = monthKey(todayISO());
    const graceUsedThisMonth =
      s.graceDayLastUsed && monthKey(s.graceDayLastUsed) === thisMonth;

    if (!graceUsedThisMonth) {
      s.graceDayLastUsed = todayISO();
      s.lastGraceDay = todayISO();
      s.current = s.current || 1;
      return { changed: true, streaks: s, reason: 'grace' };
    }

    s.brokenStreak = {
      count: s.current || s.longest || 0,
      brokenOn: todayISO(),
    };
    s.current = 0;
    return { changed: true, streaks: s, reason: 'broken' };
  }

  return { changed: false, streaks: s };
}

/* ---- Write ---- */

/**
 * Check in for today.
 * Returns the next streaks slice (already passed through applyBreakRules).
 * If already checked in, returns the same object unchanged.
 */
export function checkInToday(streaks) {
  const base = streaks || {};
  const list = Array.isArray(base.checkins) ? [...base.checkins] : [];
  const today = todayISO();

  if (list.includes(today)) {
    return { changed: false, streaks: base };
  }

  list.push(today);
  const next = applyBreakRules({ ...base, checkins: list });
  return { changed: true, streaks: next.streaks };
}