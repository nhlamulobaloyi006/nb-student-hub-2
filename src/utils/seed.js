/**
 * Demo seed — populates the current user with realistic data so judges
 * and screenshots see a full app instead of empty states.
 *
 * Called from <FirstRunSeed> on the Dashboard when a user has no profile data yet.
 * Safe to call multiple times — it fully overwrites the demo-relevant slices.
 */

import { COURSE_BY_ID } from '../data/courses';
import { FUNDING_BY_ID } from '../data/funding';
import { INSTITUTION_BY_ID } from '../data/institutions';
import { calculateAPS } from './apsCalculator';

/* ── Date helpers ────────────────────────────────────────── */

function iso(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

/* ── Demo payload ────────────────────────────────────────── */

export function buildDemoUser(prev = {}) {
  const current = { ...(prev || {}) };

  /* 1 ── Profile */
  current.stream = 'science';
  current.subjects = {
    homeLanguage: 'English Home Language',
    fal: 'Afrikaans First Additional Language',
    mathematics: 'Mathematics',
    electives: ['Physical Sciences', 'Life Sciences', 'Information Technology'],
  };
  current.subjectMarks = {
    'English Home Language': 78,
    'Afrikaans First Additional Language': 72,
    'Mathematics': 82,
    'Physical Sciences': 76,
    'Life Sciences': 74,
    'Information Technology': 88,
  };
  current.interests = ['technology', 'computers', 'research', 'engineering', 'finance'];
  // Computed from the marks above with the real APS calculator
  // (best 6 subjects + 1 automatic Life Orientation point) → 39.
  current.aps = calculateAPS(current.subjectMarks).total;
  current.futureGoal = 'university-degree';

  /* 2 ── Preferences */
  current.preferences = {
    ...(current.preferences || {}),
    province: 'Gauteng',
    accommodation: 'University residence',
    studyMode: 'Full-time',
    notifications: true,
    dataSaver: false,
  };

  /* 3 ── Shortlist (savedItems) */
  current.savedItems = [
    { id: 'uj-bsc-cs',     type: 'course',  addedAt: new Date().toISOString() },
    { id: 'wits-bsc-eng',  type: 'course',  addedAt: new Date().toISOString() },
    { id: 'up-bsc-cs',     type: 'course',  addedAt: new Date().toISOString() },
    { id: 'nsfas-tvet',    type: 'funding', addedAt: new Date().toISOString() },
    { id: 'sasol-bursary', type: 'funding', addedAt: new Date().toISOString() },
    { id: 'mtn-bursary',   type: 'funding', addedAt: new Date().toISOString() },
  ];

  /* 4 ── Applications
   * Deadlines are relative to today so the demo never shows stale,
   * already-passed dates for applications that are still open. */
  current.applications = [
    {
      id: 'app_seed_uj',
      institutionId: 'uj',
      institutionName: 'University of Johannesburg',
      courseId: 'uj-bsc-cs',
      courseName: 'BSc Computer Science',
      status: 'Submitted',
      submittedDate: iso(-18),
      deadline: iso(-3),
      referenceNumber: 'UJ-2026-4587',
      documents: [
        { label: 'Certified ID copy',           status: 'Uploaded' },
        { label: 'Matric results (certified)',  status: 'Uploaded' },
        { label: 'Proof of residence',          status: 'Uploaded' },
        { label: 'Motivation letter',           status: 'Uploaded' },
        { label: 'Short CV (optional)',         status: 'Not required' },
      ],
      notes: 'Submitted through the UJ online portal. Reference UJ-2026-4587.',
      createdAt: iso(-18),
    },
    {
      id: 'app_seed_wits',
      institutionId: 'wits',
      institutionName: 'University of the Witwatersrand',
      courseId: 'wits-bsc-eng',
      courseName: 'BSc Engineering (Electrical)',
      status: 'Pending',
      submittedDate: iso(-12),
      deadline: iso(14),
      referenceNumber: 'WITS-2026-2196',
      documents: [
        { label: 'Certified ID copy',           status: 'Uploaded' },
        { label: 'Matric results (certified)',  status: 'Uploaded' },
        { label: 'Proof of residence',          status: 'Pending' },
        { label: 'Motivation letter',           status: 'Uploaded' },
        { label: 'Short CV (optional)',         status: 'Not required' },
      ],
      notes: 'NBT scheduled for next week. Uploading proof of residence shortly.',
      createdAt: iso(-12),
    },
    {
      id: 'app_seed_up',
      institutionId: 'up',
      institutionName: 'University of Pretoria',
      courseId: 'up-bsc-cs',
      courseName: 'BSc Computer Science',
      status: 'Preparing',
      submittedDate: null,
      deadline: iso(21),
      referenceNumber: 'UP-2026-8341',
      documents: [
        { label: 'Certified ID copy',           status: 'Uploaded' },
        { label: 'Matric results (certified)',  status: 'Pending' },
        { label: 'Proof of residence',          status: 'Pending' },
        { label: 'Motivation letter',           status: 'Pending' },
        { label: 'Short CV (optional)',         status: 'Not required' },
      ],
      notes: 'Draft started. Need to finish the motivation letter before submitting.',
      createdAt: iso(-3),
    },
  ];

  /* 5 ── Wellness (7-day history) */
  current.wellness = {
    privacyAcknowledged: true,
    checkins: [
      { id: 'chk_1', date: iso(-6), mood: 'low',  stress: 6, sleep: '6 hours', note: 'Feeling overwhelmed with the amount of work.' },
      { id: 'chk_2', date: iso(-5), mood: 'okay', stress: 5, sleep: '7 hours', note: 'Productive day, got through two past papers.' },
      { id: 'chk_3', date: iso(-4), mood: 'okay', stress: 5, sleep: '6 hours', note: 'A bit stressed about exams.' },
      { id: 'chk_4', date: iso(-3), mood: 'good', stress: 3, sleep: '8 hours', note: 'Had a good day, feeling positive.' },
      { id: 'chk_5', date: iso(-2), mood: 'good', stress: 4, sleep: '7 hours', note: 'Feeling okay, just a bit tired.' },
      { id: 'chk_6', date: iso(-1), mood: 'okay', stress: 4, sleep: '7 hours', note: '' },
      { id: 'chk_7', date: iso(0),  mood: 'good', stress: 3, sleep: '8 hours', note: 'Better today. Maths paper went well.' },
    ],
  };

  /* 6 ── Streaks */
  current.streaks = {
    current: 5,
    longest: 12,
    history: [
      { date: iso(-4), subject: 'Mathematics',       minutes: 45 },
      { date: iso(-3), subject: 'English',           minutes: 30 },
      { date: iso(-2), subject: 'Mathematics',       minutes: 50 },
      { date: iso(-1), subject: 'Physical Sciences', minutes: 40 },
      { date: iso(0),  subject: 'Mathematics',       minutes: 45 },
    ],
    weeklyGoalsCompleted: 5,
    weeklyGoalsTotal: 5,
  };

  /* 7 ── Saved estimates */
  current.savedEstimates = [
    {
      id: 'est_seed_uj_cs',
      createdAt: new Date().toISOString(),
      institutionId: 'uj',
      institutionName: 'University of Johannesburg',
      courseId: 'uj-bsc-cs',
      courseName: 'BSc Computer Science',
      accommodationId: 'residence',
      transport: 800,
      food: 2500,
      includeBooks: true,
      extraExpenses: 0,
      duration: '3 years',
      breakdown: [
        { key: 'tuition',       label: 'Tuition fees',      amount: 42400, tone: 'indigo',  pct: 48 },
        { key: 'accommodation', label: 'Accommodation',     amount: 14000, tone: 'success', pct: 16 },
        { key: 'food',          label: 'Food',              amount: 30000, tone: 'warning', pct: 34 },
        { key: 'transport',     label: 'Transport',         amount: 9600,  tone: 'gold',    pct: 11 },
        { key: 'books',         label: 'Books & supplies',  amount: 1500,  tone: 'indigo',  pct: 2 },
        { key: 'other',         label: 'Other expenses',    amount: 5000,  tone: 'gray',    pct: 6 },
      ],
      total: 87400,
      potentialFunding: 62000,
      gap: 25400,
    },
  ];

  /* 8 ── Optional: set the demo profile's province on the account-level prefs */
  current.preferences = {
    ...current.preferences,
    province: current.preferences?.province || 'Gauteng',
  };

  return current;
}

/**
 * Applies the demo payload to the user via updateUser().
 * Returns the seeded user object so callers can navigate or log it.
 */
export function seedDemoUser(updateUser, currentUser) {
  const next = buildDemoUser(currentUser || {});
  updateUser(next);
  return next;
}

/** Does the user look "empty" enough to justify showing the seed banner? */
export function isFreshProfile(user) {
  if (!user) return false;
  const hasStream = !!user.stream;
  const hasMarks = user.subjectMarks && Object.keys(user.subjectMarks).length > 0;
  const hasApps = (user.applications || []).length > 0;
  const hasWellness = (user.wellness?.checkins || []).length > 0;
  const hasShortlist = (user.savedItems || []).length > 0;
  return !hasStream && !hasMarks && !hasApps && !hasWellness && !hasShortlist;
}