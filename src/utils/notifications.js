/**
 * Notification rules engine.
 *
 * Pure functions. Each rule is a { id, severity, check(user) -> payload | null }.
 * The engine runs every rule against the current user object and returns the
 * ones that should fire right now.
 *
 * Rules fire only once per day per id — see shouldFireToday().
 *
 * Severity levels:
 *   'urgent'  — a hard deadline or blocker; red accent
 *   'warning' — an action worth taking today; amber accent
 *   'info'    — a nudge; indigo accent
 */

import { FUNDING, daysUntilDeadline } from '../data/funding';

/* ══════════════════════════════════════════════════════════
   Rule definitions
   ══════════════════════════════════════════════════════════ */

const RULES = [
  /* ── 1. Funding deadline within 3 days ──────────────── */
  {
    id: 'funding-deadline-3d',
    severity: 'urgent',
    check(user) {
      if (!user) return null;
      const soon = FUNDING
        .map((f) => ({ f, days: daysUntilDeadline(f.deadline) }))
        .filter(({ days }) => days >= 0 && days <= 3)
        .sort((a, b) => a.days - b.days);
      if (soon.length === 0) return null;
      const top = soon[0];
      return {
        title: 'Funding deadline approaching',
        body: `${top.f.name} closes in ${top.days} day${top.days === 1 ? '' : 's'}.`,
        to: `/funding#${top.f.id}`,
        cta: 'View funding',
      };
    },
  },

  /* ── 2. Application deadline within 7 days ──────────── */
  {
    id: 'application-deadline-7d',
    severity: 'urgent',
    check(user) {
      const apps = user?.applications || [];
      const pending = apps
        .filter((a) => a.deadline)
        .filter((a) => a.status === 'Preparing' || a.status === 'Pending')
        .map((a) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const d = new Date(a.deadline + 'T00:00:00');
          const days = Math.round((d - today) / 86400000);
          return { app: a, days };
        })
        .filter(({ days }) => days >= 0 && days <= 7)
        .sort((a, b) => a.days - b.days);
      if (pending.length === 0) return null;
      const top = pending[0];
      return {
        title: 'Application deadline approaching',
        body: `${top.app.institutionName} — ${top.app.courseName} is due in ${top.days} day${top.days === 1 ? '' : 's'}.`,
        to: '/applications',
        cta: 'Open tracker',
      };
    },
  },

  /* ── 3. Missing documents on a Preparing app ────────── */
  {
    id: 'missing-docs',
    severity: 'warning',
    check(user) {
      const apps = user?.applications || [];
      const withPending = apps.find((a) => {
        if (a.status !== 'Preparing') return false;
        const docs = Array.isArray(a.documents) ? a.documents : [];
        return docs.some((d) => d.status === 'Pending');
      });
      if (!withPending) return null;
      const pending = (withPending.documents || []).filter((d) => d.status === 'Pending');
      return {
        title: 'Documents still needed',
        body: `${withPending.institutionName} — ${pending.length} document${pending.length === 1 ? '' : 's'} to upload before you can submit.`,
        to: '/applications',
        cta: 'Upload docs',
      };
    },
  },

  /* ── 4. Study streak about to break ─────────────────── */
  {
    id: 'streak-at-risk',
    severity: 'warning',
    check(user) {
      const streaks = user?.streaks;
      if (!streaks || !streaks.current || streaks.current < 2) return null;

      const history = Array.isArray(streaks.history) ? streaks.history : [];
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0, 10);
      })();

      const loggedToday = history.some((h) => h.date === today);
      const loggedYesterday = history.some((h) => h.date === yesterday);

      // Fire only if yesterday was logged (streak is real) and today hasn't been yet
      if (!loggedYesterday || loggedToday) return null;

      return {
        title: `Don't lose your ${streaks.current}-day streak`,
        body: 'Log a study session today to keep it going.',
        to: '/streaks',
        cta: 'Start studying',
      };
    },
  },

  /* ── 5. Wellness check-in overdue ───────────────────── */
  {
    id: 'wellness-overdue',
    severity: 'info',
    check(user) {
      const checkins = user?.wellness?.checkins || [];
      if (checkins.length === 0) {
        // First-ever reminder — only if user has been around a while
        const created = user?.createdAt ? new Date(user.createdAt) : null;
        if (!created) return null;
        const daysSinceJoin = Math.floor((Date.now() - created.getTime()) / 86400000);
        if (daysSinceJoin < 2) return null;
        return {
          title: 'How are you doing?',
          body: 'Take a 2-minute wellness check-in to start tracking patterns.',
          to: '/wellness',
          cta: 'Check in',
        };
      }

      const last = checkins[checkins.length - 1];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDate = new Date(last.date + 'T00:00:00');
      const days = Math.round((today - lastDate) / 86400000);
      if (days < 7) return null;

      return {
        title: 'Weekly wellness check-in',
        body: `It's been ${days} days since your last check-in. How are you feeling?`,
        to: '/wellness',
        cta: 'Check in',
      };
    },
  },

  /* ── 6. Profile incomplete ──────────────────────────── */
  {
    id: 'profile-incomplete',
    severity: 'info',
    check(user) {
      if (!user) return null;

      const missing = [];
      if (!user.stream) missing.push('stream');
      const s = user.subjects || {};
      if (!s.homeLanguage) missing.push('Home Language');
      if (!s.mathematics) missing.push('Mathematics');
      const hasMarks = user.subjectMarks && Object.keys(user.subjectMarks).length > 0;
      if (!hasMarks) missing.push('subject marks');

      if (missing.length === 0) return null;

      return {
        title: 'Finish your profile',
        body: `Add your ${missing.slice(0, 2).join(' and ')}${missing.length > 2 ? ` (${missing.length} things)` : ''} to unlock course matching.`,
        to: '/onboarding',
        cta: 'Complete profile',
      };
    },
  },
];

/* ══════════════════════════════════════════════════════════
   Public API
   ══════════════════════════════════════════════════════════ */

/**
 * Run every rule against the user.
 * Returns the firing notifications sorted by severity.
 * Does NOT apply the cooldown — see selectNotificationsToFire().
 */
export function evaluateNotifications(user) {
  if (!user) return [];
  const results = [];
  for (const rule of RULES) {
    try {
      const payload = rule.check(user);
      if (payload) {
        results.push({ id: rule.id, severity: rule.severity, ...payload });
      }
    } catch (err) {
      // A rule blowing up shouldn't take down the whole engine
      // eslint-disable-next-line no-console
      console.warn(`Notification rule ${rule.id} failed:`, err);
    }
  }

  const order = { urgent: 0, warning: 1, info: 2 };
  results.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
  return results;
}

/**
 * Filter out notifications already fired today.
 * Returns { toFire, updatedLastNotified }.
 */
export function selectNotificationsToFire(allNotifications, lastNotified = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const toFire = [];
  const updated = { ...lastNotified };

  for (const n of allNotifications) {
    if (updated[n.id] === today) continue;
    toFire.push(n);
    updated[n.id] = today;
  }

  return { toFire, updatedLastNotified: updated };
}

/** Severity → accent color class suffix. */
export function severityTone(severity) {
  switch (severity) {
    case 'urgent':  return 'red';
    case 'warning': return 'amber';
    case 'info':
    default:        return 'indigo';
  }
}

/* ══════════════════════════════════════════════════════════
   Browser notifications (opt-in)
   ══════════════════════════════════════════════════════════ */

/** Is the Notification API available in this environment? */
export function browserNotificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Current permission state — 'default' | 'granted' | 'denied' | 'unsupported' */
export function browserNotificationPermission() {
  if (!browserNotificationsSupported()) return 'unsupported';
  return Notification.permission;
}

/** Request permission. Returns the new state. */
export async function requestBrowserNotificationPermission() {
  if (!browserNotificationsSupported()) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

/** Fire a single OS notification. Silent no-op if not permitted. */
export function fireBrowserNotification({ title, body }) {
  if (!browserNotificationsSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  try {
    // eslint-disable-next-line no-new
    new Notification(title, {
      body,
      icon: '/logos/nsfas.png', // swap for your app icon if you have one
      badge: '/logos/nsfas.png',
      tag: `nb-${Date.now()}`,
    });
    return true;
  } catch {
    return false;
  }
}
