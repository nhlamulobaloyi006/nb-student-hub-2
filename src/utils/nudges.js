/**
 * Nudge rules + prompt mapping for NBOT.
 *
 * A nudge is a context-aware modal that appears on the Dashboard when the
 * user is stalled somewhere in the journey. One per session maximum, and
 * once dismissed, muted for 3 days.
 */

export const PROMPT_TEXT = {
  'pick-course':        'What can I study with my marks?',
  'compare-shortlist':  'Compare these institutions',
  'finish-application': 'What should I do next?',
  'funding-urgent':     'Which bursaries might suit me?',
  'wellness-nudge':     'What should I do next?',
};

export function promptText(key) {
  if (!key) return null;
  return PROMPT_TEXT[key] || null;
}

/* ─── Nudge rules ──────────────────────────────────────── */

const RULES = [
  {
    id: 'no-applications',
    priority: 1,
    check(user) {
      if (!user) return null;
      if (!user.onboardingComplete) return null;
      const apps = (user.applications || []).length;
      if (apps > 0) return null;
      return {
        key: 'no-applications',
        title: "You haven't applied yet",
        body: 'NBOT can help you figure out which course to start with — based on your marks, subjects and interests.',
        cta: 'Chat with NBOT',
        prompt: 'pick-course',
      };
    },
  },
  {
    id: 'shortlist-no-apps',
    priority: 2,
    check(user) {
      if (!user) return null;
      const shortlist = (user.savedItems || []).filter((s) => s.type === 'course').length;
      const apps = (user.applications || []).length;
      if (shortlist >= 2 && apps === 0) {
        return {
          key: 'shortlist-no-apps',
          title: "You've shortlisted " + shortlist + ' courses',
          body: 'Want NBOT to help you decide which one to apply to first?',
          cta: 'Ask NBOT',
          prompt: 'compare-shortlist',
        };
      }
      return null;
    },
  },
  {
    id: 'stalled-app',
    priority: 3,
    check(user) {
      if (!user) return null;
      const stalled = (user.applications || []).find((a) => {
        if (a.status !== 'Preparing') return false;
        const created = a.createdAt ? new Date(a.createdAt) : null;
        if (!created) return false;
        const days = Math.floor((Date.now() - created.getTime()) / 86400000);
        return days >= 5;
      });
      if (!stalled) return null;
      return {
        key: 'stalled-app',
        title: 'Your ' + stalled.institutionName + ' application is still Preparing',
        body: 'NBOT can walk you through the remaining documents and submission.',
        cta: 'Ask NBOT',
        prompt: 'finish-application',
      };
    },
  },
  {
    id: 'wellness-overdue',
    priority: 4,
    check(user) {
      if (!user) return null;
      const checkins = user.wellness?.checkins || [];
      if (checkins.length === 0) return null;
      const last = checkins[checkins.length - 1];
      const days = Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000);
      if (days < 7) return null;
      return {
        key: 'wellness-overdue',
        title: "It's been " + days + ' days since your last check-in',
        body: 'Want a 2-minute reset? NBOT can walk you through it.',
        cta: 'Check in',
        prompt: 'wellness-nudge',
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

/* ─── Session + dismissal gating ───────────────────────── */

const SESSION_KEY = 'nb_nudge_seen';
const DISMISSED_KEY = 'nb_nudge_dismissed_at';
const DISMISS_DAYS = 3;

export function shouldShowNudge() {
  try {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return false;
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const days = (Date.now() - Number(dismissedAt)) / 86400000;
      if (days < DISMISS_DAYS) return false;
    }
    return true;
  } catch {
    return true;
  }
}

export function markNudgeSeen() {
  try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
}

export function dismissNudge() {
  try {
    markNudgeSeen();
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch { /* ignore */ }
}
