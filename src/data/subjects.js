/**
 * Streams, subject groups, and interests.
 * These keys are used across Profile, Course Finder, and eligibility logic.
 * Never rename a key without a migration — user data stores them raw.
 */

export const STREAMS = [
  { id: 'science',    label: 'Science',           blurb: 'Maths + Physical Sciences or Life Sciences' },
  { id: 'commerce',   label: 'Commerce',          blurb: 'Maths or Maths Literacy + Accounting / Business' },
  { id: 'humanities', label: 'Humanities',        blurb: 'Languages, History, Geography, Life Sciences' },
  { id: 'technical',  label: 'Technical',         blurb: 'Maths + Technical subjects (EGD, Mechanical Tech)' },
  { id: 'arts',       label: 'Arts & Culture',    blurb: 'Visual Arts, Drama, Music, Design' },
];

/** Ordered list of Home Language options. */
export const HOME_LANGUAGES = [
  'English Home Language',
  'Afrikaans Home Language',
  'isiZulu Home Language',
  'isiXhosa Home Language',
  'Sesotho Home Language',
  'Setswana Home Language',
  'Sepedi Home Language',
  'Xitsonga Home Language',
  'siSwati Home Language',
  'Tshivenda Home Language',
  'isiNdebele Home Language',
  'South African Sign Language Home Language',
];

/** First Additional Language options. */
export const FAL_LANGUAGES = [
  'English First Additional Language',
  'Afrikaans First Additional Language',
  'isiZulu First Additional Language',
  'isiXhosa First Additional Language',
  'Sesotho First Additional Language',
  'Setswana First Additional Language',
  'Sepedi First Additional Language',
  'Xitsonga First Additional Language',
  'siSwati First Additional Language',
  'Tshivenda First Additional Language',
  'isiNdebele First Additional Language',
  'South African Sign Language First Additional Language',
];

/** Mathematics options. */
export const MATHEMATICS_OPTIONS = [
  'Mathematics',
  'Mathematical Literacy',
  'Technical Mathematics',
];

/**
 * Elective subjects grouped for the Profile electives tab.
 * Elective slots are typically 3 for NSC candidates.
 */
export const SUBJECT_GROUPS = [
  {
    id: 'sciences',
    label: 'Sciences',
    subjects: [
      'Physical Sciences',
      'Life Sciences',
      'Agricultural Sciences',
      'Marine Sciences',
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    subjects: [
      'Accounting',
      'Business Studies',
      'Economics',
      'Consumer Studies',
    ],
  },
  {
    id: 'humanities',
    label: 'Humanities',
    subjects: [
      'History',
      'Geography',
      'Life Orientation',
      'Religion Studies',
    ],
  },
  {
    id: 'technical',
    label: 'Technical',
    subjects: [
      'Engineering Graphics and Design',
      'Mechanical Technology',
      'Electrical Technology',
      'Civil Technology',
    ],
  },
  {
    id: 'arts',
    label: 'Arts & Culture',
    subjects: [
      'Visual Arts',
      'Dramatic Arts',
      'Music',
      'Design',
    ],
  },
];

/**
 * Interests grouped for Profile — used to tag courses and drive matching.
 * ids must match the `interestTags` on courses.
 */
export const INTEREST_GROUPS = [
  {
    id: 'tech-business',
    label: 'Tech & Business',
    interests: [
      { id: 'technology',        label: 'Technology' },
      { id: 'computers',         label: 'Computers & Coding' },
      { id: 'business',          label: 'Business' },
      { id: 'finance',           label: 'Finance & Accounting' },
      { id: 'entrepreneurship',  label: 'Entrepreneurship' },
    ],
  },
  {
    id: 'people-health',
    label: 'People & Health',
    interests: [
      { id: 'healthcare',        label: 'Healthcare' },
      { id: 'teaching',          label: 'Teaching' },
      { id: 'social-work',       label: 'Social Work' },
      { id: 'law',               label: 'Law & Justice' },
      { id: 'psychology',        label: 'Psychology' },
    ],
  },
  {
    id: 'creative-media',
    label: 'Creative & Media',
    interests: [
      { id: 'design',            label: 'Design' },
      { id: 'media',             label: 'Media & Journalism' },
      { id: 'arts',              label: 'Visual & Performing Arts' },
      { id: 'writing',           label: 'Writing & Literature' },
      { id: 'music',             label: 'Music' },
    ],
  },
  {
    id: 'world-society',
    label: 'World & Society',
    interests: [
      { id: 'environment',       label: 'Environment & Nature' },
      { id: 'engineering',       label: 'Engineering' },
      { id: 'government',        label: 'Government & Politics' },
      { id: 'international',     label: 'International Studies' },
      { id: 'research',          label: 'Research & Science' },
    ],
  },
];

/** Flat lookup: interest id → label. */
export const INTEREST_LABELS = INTEREST_GROUPS.reduce((acc, g) => {
  g.interests.forEach((i) => { acc[i.id] = i.label; });
  return acc;
}, {});

/** Flat lookup: stream id → label. */
export const STREAM_LABELS = STREAMS.reduce((acc, s) => {
  acc[s.id] = s.label;
  return acc;
}, {});
