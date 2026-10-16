/**
 * Nudge rules + prompt mapping.
 *
 * Two variants:
 *   variant: 'streak'  → fires StreakCheckinModal (one-tap check-in, daily)
 *   variant: 'nbot'    → fires NbotNudgeModal (Chat with NBOT, 3-day cooldown)
 *
 * One nudge per session, always. Streak nudge ignores the 3-day cooldown so it
 * can resurface every day until the user checks in.
 */

import { hasCheckedInToday, computeCurrentStreak } from "./streaks";

export const PROMPT_TEXT = {
  "pick-course":        "What can I study with my marks?",
  "compare-shortlist":  "Compare these institutions",
  "finish-application": "What should I do next?",
  "funding-urgent":     "Which bursaries might suit me?",
  "wellness-nudge":     "What should I do next?",
  'careers-for-course': 'What careers can I get with this course?',
};

export function promptText(key, courseName) {
  if (!key) return null;
  if (key === 'careers-for-course' && courseName) {
    return 'What careers can I get with ' + courseName + '?';
  }
  return PROMPT_TEXT[key] || null;
}

/* ============================================================
   Rules — sorted by priority (lower number = fires first)
   ============================================================ */

const RULES = [
  {
    id: "streak-not-checked",
    variant: "streak",
    priority: 1,
    check(user) {
      if (!user) return null;
      if (!user.onboardingComplete) return null;
      const streaks = user.streaks || {};
      if (hasCheckedInToday(streaks)) return null;

      const { current, atRiskToday } = computeCurrentStreak(streaks.checkins || []);

      let title;
      let body;
      if (current === 0) {
        title = "Start your streak today";
        body = "Check in once a day to build momentum. One tap, that is it.";
      } else if (atRiskToday) {
        title = "Do not lose your " + current + "-day streak";
        body = "You checked in yesterday. Keep it alive with one tap today.";
      } else {
        title = "Keep your " + current + "-day streak alive";
        body = "You have not checked in today. One tap and you are sorted.";
      }

      return {
        key: "streak-not-checked",
        variant: "streak",
        title,
        body,
        cta: "Check in today",
        current,
      };
    },
  },
  {
    id: "no-applications",
    variant: "nbot",
    priority: 2,
    check(user) {
      if (!user) return null;
      if (!user.onboardingComplete) return null;
      const apps = (user.applications || []).length;
      if (apps > 0) return null;
      return {
        key: "no-applications",
        variant: "nbot",
        title: "You have not applied yet",
        body: "NBOT can help you figure out which course to start with, based on your marks, subjects and interests.",
        cta: "Chat with NBOT",
        prompt: "pick-course",
      };
    },
  },
  {
    id: "shortlist-no-apps",
    variant: "nbot",
    priority: 3,
    check(user) {
      if (!user) return null;
      const shortlist = (user.savedItems || []).filter((s) => s.type === "course").length;
      const apps = (user.applications || []).length;
      if (shortlist >= 2 && apps === 0) {
        return {
          key: "shortlist-no-apps",
          variant: "nbot",
          title: "You have shortlisted " + shortlist + " courses",
          body: "Want NBOT to help you decide which one to apply to first?",
          cta: "Ask NBOT",
          prompt: "compare-shortlist",
        };
      }
      return null;
    },
  },
  {
    id: "stalled-app",
    variant: "nbot",
    priority: 4,
    check(user) {
      if (!user) return null;
      const stalled = (user.applications || []).find((a) => {
        if (a.status !== "Preparing") return false;
        const created = a.createdAt ? new Date(a.createdAt) : null;
        if (!created) return false;
        const days = Math.floor((Date.now() - created.getTime()) / 86400000);
        return days >= 5;
      });
      if (!stalled) return null;
      return {
        key: "stalled-app",
        variant: "nbot",
        title: "Your " + stalled.institutionName + " application is still Preparing",
        body: "NBOT can walk you through the remaining documents and submission.",
        cta: "Ask NBOT",
        prompt: "finish-application",
      };
    },
  },
  {
    id: "wellness-overdue",
    variant: "nbot",
    priority: 5,
    check(user) {
      if (!user) return null;
      const checkins = user.wellness?.checkins || [];
      if (checkins.length === 0) return null;
      const last = checkins[checkins.length - 1];
      const days = Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000);
      if (days < 7) return null;
      return {
        key: "wellness-overdue",
        variant: "nbot",
        title: "It has been " + days + " days since your last check-in",
        body: "Want a 2-minute reset? NBOT can walk you through it.",
        cta: "Check in",
        prompt: "wellness-nudge",
      };
    },
  },
];

export function getApplicableNudges(user) {
  const results = [];
  for (const rule of RULES) {
    try {
      const n = rule.check(user);
      if (n) results.push({ ...n, priority: rule.priority });
    } catch { /* ignore */ }
  }
  results.sort((a, b) => a.priority - b.priority);
  return results;
}

/* ============================================================
   Session + dismissal gating
   ============================================================ */

const SESSION_KEY = "nb_nudge_seen";
const DISMISSED_KEY = "nb_nudge_dismissed_at";
const DISMISS_DAYS = 3;

export function markNudgeSeen() {
  try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
}

export function dismissNudge() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch { /* ignore */ }
}

/**
 * Pick the nudge to fire this session.
 * - Streak nudge: fires whenever the user has not checked in today
 *   (ignores the 3-day cooldown, respects only the per-session gate)
 * - Other nudges: respect both the session gate and the 3-day cooldown
 */
export function selectNudge(user) {
  if (!user) return null;

  // One nudge per session, always
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return null;
  } catch {
    return null;
  }

  const candidates = getApplicableNudges(user);
  if (candidates.length === 0) return null;
  const top = candidates[0];

  // Streak nudge bypasses the 3-day cooldown
  if (top.variant === "streak") return top;

  // Everything else respects the cooldown
  try {
    const at = localStorage.getItem(DISMISSED_KEY);
    if (at) {
      const days = (Date.now() - Number(at)) / 86400000;
      if (days < DISMISS_DAYS) return null;
    }
  } catch { /* ignore */ }

  return top;
}

/* Backwards-compat exports */
export function shouldShowNudge() {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}
