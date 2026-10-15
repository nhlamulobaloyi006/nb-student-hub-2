/**
 * Stream detection and subject helpers.
 * Pure functions — safe for use in reducers and selectors.
 */

import { STREAMS, HOME_LANGUAGES, FAL_LANGUAGES, MATHEMATICS_OPTIONS, INTEREST_GROUPS } from '../data/subjects';

/**
 * Detect a student's likely stream from their subject picks + interests.
 * Returns the stream id or '' if uncertain.
 */
export function detectStream(user) {
  if (!user) return '';
  const subjects = user.subjects || {};
  const electives = Array.isArray(subjects.electives) ? subjects.electives : [];
  const maths = subjects.mathematics || '';
  const interests = user.interests || [];

  const has = (s) => electives.includes(s);

  if (
    maths === 'Mathematics' &&
    (has('Physical Sciences') || has('Life Sciences') || has('Agricultural Sciences'))
  ) return 'science';

  if (
    (maths === 'Mathematics' || maths === 'Technical Mathematics') &&
    (has('Engineering Graphics and Design') ||
     has('Mechanical Technology') ||
     has('Electrical Technology') ||
     has('Civil Technology'))
  ) return 'technical';

  if (
    (maths === 'Mathematics' || maths === 'Mathematical Literacy') &&
    (has('Accounting') || has('Business Studies') || has('Economics'))
  ) return 'commerce';

  if (
    has('Visual Arts') || has('Dramatic Arts') ||
    has('Music') || has('Design')
  ) return 'arts';

  if (has('History') || has('Geography') || has('Religion Studies')) return 'humanities';

  const interestIds = new Set(interests);
  for (const g of INTEREST_GROUPS) {
    for (const i of g.interests) {
      if (interestIds.has(i.id)) {
        if (i.id === 'engineering' || i.id === 'research') return 'science';
        if (i.id === 'finance' || i.id === 'business') return 'commerce';
        if (i.id === 'design' || i.id === 'arts' || i.id === 'music') return 'arts';
        if (i.id === 'media' || i.id === 'writing' || i.id === 'government') return 'humanities';
      }
    }
  }

  return '';
}

/**
 * Give sensible subject defaults when a stream is chosen on Profile.
 *
 * - Home Language defaults to English HL (the user can change it).
 * - FAL is left blank so the user picks their own second language.
 * - Mathematics is preset based on the stream.
 * - Electives stay untouched.
 */
export function applyStreamDefaults(streamId, currentSubjects = {}) {
  const next = { ...currentSubjects };

  if (!next.homeLanguage) next.homeLanguage = 'English Home Language';
  if (next.fal == null) next.fal = '';
  if (!Array.isArray(next.electives)) next.electives = ['', '', ''];

  // Ensure electives array is always exactly 3 slots
  while (next.electives.length < 3) next.electives.push('');
  next.electives = next.electives.slice(0, 3);

  switch (streamId) {
    case 'science':
      if (!next.mathematics) next.mathematics = 'Mathematics';
      break;
    case 'commerce':
      if (!next.mathematics) next.mathematics = 'Mathematics';
      break;
    case 'technical':
      if (!next.mathematics) next.mathematics = 'Technical Mathematics';
      break;
    case 'humanities':
      if (!next.mathematics) next.mathematics = 'Mathematical Literacy';
      break;
    case 'arts':
      if (!next.mathematics) next.mathematics = 'Mathematical Literacy';
      break;
    default:
      break;
  }

  return next;
}

/**
 * Validate the Subjects tab.
 * Also checks for duplicates across all six slots.
 */
export function validateSubjects(subjects) {
  const errors = [];
  const s = subjects || {};

  if (!s.homeLanguage) errors.push('Select a Home Language.');
  if (!s.fal) errors.push('Select a First Additional Language.');
  if (!s.mathematics) errors.push('Select a Mathematics option.');

  if (s.homeLanguage && s.fal && s.homeLanguage === s.fal) {
    errors.push('Home Language and First Additional Language must differ.');
  }

  const electives = Array.isArray(s.electives) ? s.electives.filter(Boolean) : [];
  const all = [s.homeLanguage, s.fal, s.mathematics, ...electives].filter(Boolean);
  const seen = new Set();
  for (const subj of all) {
    if (seen.has(subj)) {
      errors.push(`"${subj}" is selected more than once. Each subject can only appear in one slot.`);
      break;
    }
    seen.add(subj);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get the list of subjects currently used in OTHER slots.
 * Used to exclude them from the dropdown in the current slot.
 */
export function getTakenSubjects(subjects, ignoreKey) {
  const s = subjects || {};
  const taken = new Set();

  if (ignoreKey !== 'homeLanguage' && s.homeLanguage) taken.add(s.homeLanguage);
  if (ignoreKey !== 'fal' && s.fal) taken.add(s.fal);
  if (ignoreKey !== 'mathematics' && s.mathematics) taken.add(s.mathematics);

  const electives = Array.isArray(s.electives) ? s.electives : [];
  electives.forEach((e, i) => {
    if (ignoreKey !== `elective-${i}` && e) taken.add(e);
  });

  return taken;
}

/** Subject label → shorter label */
export function shortSubjectLabel(label) {
  if (!label) return '';
  return label
    .replace('Home Language', '')
    .replace('First Additional Language', 'FAL')
    .replace('Mathematics', 'Maths')
    .replace('Physical Sciences', 'Phys Sci')
    .replace('Life Sciences', 'Life Sci')
    .replace('Life Orientation', 'LO')
    .trim();
}

export function allStreams() {
  return STREAMS;
}
