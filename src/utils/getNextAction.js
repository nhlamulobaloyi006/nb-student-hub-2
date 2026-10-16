/**
 * Decide the single most important next action for a user.
 * Also computes the 9-milestone roadmap status.
 *
 * Used by: Dashboard priority card, Roadmap page, AI Companion next-step.
 *
 * Returns for getNextAction():
 *   { key, title, sub, ctaLabel, to, tone }
 *
 * Returns for getRoadmapMilestones():
 *   { percent, completed, total, milestones[] }
 */

import { FUNDING, daysUntilDeadline } from '../data/funding';
import { COURSES } from '../data/courses';
import { INSTITUTION_BY_ID } from '../data/institutions';
import { checkEligibility } from './eligibilityChecker';

/* ══════════════════════════════════════════════════════════
   NEXT ACTION — the single "do this next" card
   ══════════════════════════════════════════════════════════ */

export function getNextAction(user) {
  if (!user) return defaultSignIn();

  // 1. No stream set → profile setup
  if (!user.stream) {
    return {
      key: 'set-stream',
      title: 'Set up your profile',
      sub: 'Add your stream and subjects so we can match you with courses.',
      ctaLabel: 'Start setup',
      to: '/onboarding',
      tone: 'gold',
    };
  }

  // 2. No future goal picked
  if (!user.futureGoal) {
    return {
      key: 'set-goal',
      title: 'Pick your future goal',
      sub: "Tell us what you're aiming for so we can tailor your roadmap.",
      ctaLabel: 'Choose a goal',
      to: '/future',
      tone: 'gold',
    };
  }

  // 3. No marks logged
  const hasMarks = user.subjectMarks && Object.keys(user.subjectMarks).length > 0;
  if (!hasMarks) {
    return {
      key: 'log-marks',
      title: 'Log your marks',
      sub: 'Add your subject percentages so we can check which courses you qualify for.',
      ctaLabel: 'Add marks',
      to: '/onboarding',
      tone: 'gold',
    };
  }

  // 4. Funding deadline within 30 days
  const urgent = FUNDING
    .map((f) => ({ fund: f, days: daysUntilDeadline(f.deadline) }))
    .filter((x) => x.days >= 0 && x.days <= 30)
    .sort((a, b) => a.days - b.days);

  if (urgent.length > 0) {
    const { fund, days } = urgent[0];
    return {
      key: 'funding-deadline',
      title: `${fund.name} closes in ${days} day${days === 1 ? '' : 's'}`,
      sub: `Provider: ${fund.provider}. Amount: ${fund.amount}.`,
      ctaLabel: 'View funding',
      to: `/funding#${fund.id}`,
      tone: 'warning',
    };
  }

  // 5. Pending documents on an in-flight application
  const pendingDocs = (user.applications || []).find((a) => {
    const docs = Array.isArray(a.documents) ? a.documents : [];
    return docs.some((d) => d.status === 'Pending');
  });
  if (pendingDocs && (pendingDocs.status === 'Preparing' || pendingDocs.status === 'Pending')) {
    return {
      key: 'pending-docs',
      title: `Finish your ${pendingDocs.institutionName} application`,
      sub: 'You still have documents to upload before you can submit.',
      ctaLabel: 'Open tracker',
      to: '/applications',
      tone: 'warning',
    };
  }

  // 6. Top match
  const top = pickTopMatch(user);
  if (top) {
    return {
      key: 'top-match',
      title: `Your top match: ${top.course.name}`,
      sub: `${top.course.university} · APS ${top.course.minAPS || '—'}`,
      ctaLabel: 'View course',
      to: `/courses?q=${encodeURIComponent(top.course.name)}`,
      tone: 'success',
    };
  }

  // 7. Fallback
  return {
    key: 'explore',
    title: 'Explore courses that match your profile',
    sub: "Browse courses filtered to what you're most likely to qualify for.",
    ctaLabel: 'Open Course Finder',
    to: '/courses',
    tone: 'info',
  };
}

function pickTopMatch(user) {
  if (!user?.subjectMarks) return null;
  const scored = COURSES
    .map((c) => ({ course: c, elig: checkEligibility(c, user) }))
    .filter((x) => x.elig.status === 'pass')
    .sort((a, b) => (b.course.minAPS || 0) - (a.course.minAPS || 0));
  if (scored.length === 0) return null;
  const top = scored[0];
  const inst = INSTITUTION_BY_ID[top.course.universityId];
  return {
    course: { ...top.course, university: top.course.university || inst?.name || '' },
  };
}

function defaultSignIn() {
  return {
    key: 'sign-in',
    title: 'Sign in to get started',
    sub: 'Create an account to save your profile, applications and progress.',
    ctaLabel: 'Sign in',
    to: '/signin',
    tone: 'gold',
  };
}

/* ══════════════════════════════════════════════════════════
   ROADMAP MILESTONES — 9 steps with live status
   ══════════════════════════════════════════════════════════ */

export function getRoadmapMilestones(user) {
  const u = user || {};

  /* ── Signals from user data ───────────────────────────── */
  const hasProfile     = !!u.stream && !!u.subjects?.homeLanguage;
  const hasMarks       = !!(u.subjectMarks && Object.keys(u.subjectMarks).length > 0);
  const hasGoal        = !!u.futureGoal;
  const savedItems     = u.savedItems || [];
  const hasCourse      = savedItems.some((s) => s.type === 'course');
  const hasFunding     = savedItems.some((s) => s.type === 'funding'); // ← the fix
  const hasEstimate    = (u.savedEstimates || []).length > 0;
  const apps           = u.applications || [];
  const hasApps        = apps.length > 0;
  const hasSubmitted   = apps.some((a) =>
    ['Submitted', 'Pending', 'Accepted', 'Rejected'].includes(a.status)
  );
  const hasWellness    = (u.wellness?.checkins || []).length > 0;
  const hasStreak      = (u.streaks?.history || []).length > 0;
  const hasTracked     = hasWellness || hasStreak; // ← the fix
  const docsUploaded   = apps.length > 0 && apps.every((a) =>
    (a.documents || []).every((d) => d.status !== 'Pending')
  );

  /* ── Build milestone list ─────────────────────────────── */
  // Each milestone declares its own "isDone" flag. Order matters —
  // it's what determines which one is "next".
  const raw = [
    {
      id: 'profile',
      label: 'Complete your profile',
      sub: 'Add your subjects and marks',
      done: hasProfile,
    },
    {
      id: 'explore',
      label: 'Explore courses',
      sub: 'Find suitable courses for your profile',
      done: hasCourse,
    },
    {
      id: 'compare',
      label: 'Compare institutions',
      sub: 'Check entry requirements, location and costs',
      done: hasCourse,
    },
    {
      id: 'costs',
      label: 'Estimate your costs',
      sub: 'Use the cost planner for your shortlisted courses',
      done: hasEstimate,
    },
    {
      id: 'funding',
      label: 'Find funding',
      sub: 'Explore bursaries, NSFAS and other options',
      done: hasFunding, // ← completes when at least one funding item is saved
    },
    {
      id: 'eligibility',
      label: 'Check eligibility',
      sub: 'See which courses you qualify for',
      done: hasMarks,
    },
    {
      id: 'documents',
      label: 'Prepare documents',
      sub: 'Certified ID, results, proof of residence',
      done: docsUploaded,
    },
    {
      id: 'apply',
      label: 'Submit applications',
      sub: 'Apply to your shortlisted institutions',
      done: hasSubmitted,
    },
    {
      id: 'track',
      label: 'Track your progress',
      sub: 'Keep your applications and check-ins updated',
      done: hasTracked, // ← completes on any wellness check-in OR study session
    },
  ];

  /* ── Assign status ───────────────────────────────────── */
  // 1. Completed milestones → 'done'
  // 2. The first not-done milestone → 'next'
  // 3. Any not-done milestone that has a prerequisite already done → 'in-progress'
  //    (so it feels alive even if it's not literally the immediate next thing)
  // 4. Everything else → 'todo'

  const firstUndoneIdx = raw.findIndex((m) => !m.done);

  const milestones = raw.map((m, i) => {
    if (m.done) return { id: m.id, label: m.label, sub: m.sub, status: 'done' };

    if (i === firstUndoneIdx) {
      return { id: m.id, label: m.label, sub: m.sub, status: 'next' };
    }

    // Milestones that follow a completed prereq and are part of an
    // already-started chain get 'in-progress'. Simplest heuristic:
    // if the immediately-preceding milestone is done or in-progress,
    // and this one isn't the "next" pointer, call it in-progress.
    const prev = raw[i - 1];
    const prevIsActive = prev && (prev.done || i - 1 >= firstUndoneIdx - 1);

    // Additionally: 'funding' and 'apply' are meaningful to mark in-progress
    // when the user has started the surrounding flow.
    if (m.id === 'funding' && hasCourse && !hasFunding) {
      return { id: m.id, label: m.label, sub: m.sub, status: 'in-progress' };
    }
    if (m.id === 'track' && hasApps && !hasTracked) {
      return { id: m.id, label: m.label, sub: m.sub, status: 'in-progress' };
    }

    return {
      id: m.id,
      label: m.label,
      sub: m.sub,
      status: prevIsActive && !prev?.done ? 'todo' : 'todo',
    };
  });

  const completed = milestones.filter((m) => m.status === 'done').length;
  const total = milestones.length;

  return {
    percent: Math.round((completed / total) * 100),
    completed,
    total,
    milestones,
  };
}
