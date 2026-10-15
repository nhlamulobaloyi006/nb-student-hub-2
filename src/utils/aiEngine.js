/**
 * Rule-based intent matching for the AI Companion.
 * No LLM, no network. Detects intent from keywords, then builds a
 * structured response using the user's profile + the mock dataset.
 *
 * Response shape:
 * {
 *   id,
 *   kind: 'text' | 'courses' | 'cost' | 'funding' | 'steps' | 'next-action',
 *   text: string,           // intro sentence(s)
 *   payload?: any,          // card data for structured kinds
 *   chips?: string[],       // suggested follow-up prompts
 * }
 */

import { COURSES } from '../data/courses';
import { FUNDING, daysUntilDeadline } from '../data/funding';
import { INSTITUTION_BY_ID, INSTITUTIONS } from '../data/institutions';
import { checkEligibility } from './eligibilityChecker';
import { calculateAPS } from './apsCalculator';
import { getNextAction } from './getNextAction';
import { STREAM_LABELS } from '../data/subjects';

/* ── Intent detection ────────────────────────────────────── */

const INTENTS = [
  { id: 'study-match',    patterns: [/what can i study/i, /what.*can i.*with my marks/i, /courses?.*(match|suit|fit)/i, /which course/i, /study with/i] },
  { id: 'compare-inst',   patterns: [/compare/i, /difference between/i, /which (university|institution)/i] },
  { id: 'nsfas-howto',    patterns: [/nsfas/i, /how do i apply/i, /how to apply.*fund/i] },
  { id: 'cost-estimate',  patterns: [/cost/i, /afford/i, /expensive/i, /how much.*(cost|pay)/i, /tuition/i, /fees/i] },
  { id: 'funding',        patterns: [/bursar/i, /scholarship/i, /funding/i, /fund.*study/i, /where.*(get|find).*money/i] },
  { id: 'next-step',      patterns: [/what.*(next|now)/i, /what should i do/i, /where do i start/i, /i'm stuck/i] },
  { id: 'eligibility',    patterns: [/do i qualify/i, /am i eligible/i, /will i get in/i, /requirements/i] },
  { id: 'study-tips',     patterns: [/study tips/i, /how to study/i, /focus/i, /concentrate/i] },
  { id: 'stress',         patterns: [/stressed/i, /overwhelm/i, /anxious/i, /pressure/i] },
];

export function detectIntent(text) {
  const t = String(text || '').trim();
  if (!t) return 'unknown';
  for (const intent of INTENTS) {
    if (intent.patterns.some((re) => re.test(t))) return intent.id;
  }
  return 'unknown';
}

/* ── Response builders ───────────────────────────────────── */

export function buildResponse(intentId, user, rawText = '') {
  switch (intentId) {
    case 'study-match':   return coursesResponse(user);
    case 'compare-inst':  return compareResponse(user);
    case 'nsfas-howto':   return nsfasResponse(user);
    case 'cost-estimate': return costResponse(user);
    case 'funding':       return fundingResponse(user);
    case 'next-step':     return nextStepResponse(user);
    case 'eligibility':   return eligibilityResponse(user);
    case 'study-tips':    return studyTipsResponse();
    case 'stress':        return stressResponse();
    default:              return fallbackResponse();
  }
}

/* ── Courses / "what can I study" ────────────────────────── */

function coursesResponse(user) {
  if (!hasMarks(user)) {
    return {
      id: rid(),
      kind: 'text',
      text:
        "I need your subject marks before I can match you with courses. " +
        "Head to your Profile, add your subjects and percentages, then come back — I'll do the rest.",
      chips: ['What should I do next?', 'How do I apply for NSFAS?'],
    };
  }

  const ranked = COURSES
    .map((c) => ({ course: c, elig: checkEligibility(c, user) }))
    .filter((x) => x.elig.status === 'pass')
    .sort((a, b) => (b.course.minAPS || 0) - (a.course.minAPS || 0))
    .slice(0, 3);

  if (ranked.length === 0) {
    const warn = COURSES
      .map((c) => ({ course: c, elig: checkEligibility(c, user) }))
      .filter((x) => x.elig.status === 'warn')
      .slice(0, 3);
    return {
      id: rid(),
      kind: 'courses',
      text:
        "I couldn't find a definite match with your current marks. Here are some courses " +
        "you might still qualify for — double-check the requirements on the institution's site.",
      payload: { matches: warn.map(toCourseCard) },
      chips: ['Compare these institutions', 'What would it cost?', 'Show me funding options'],
    };
  }

  const aps = calculateAPS(user.subjectMarks || {}).total;
  const stream = user.stream ? STREAM_LABELS[user.stream] : '';

  return {
    id: rid(),
    kind: 'courses',
    text:
      `Based on the subjects and marks in your profile (APS ${aps}${stream ? `, ${stream} stream` : ''}), ` +
      `these courses look like a good fit. Requirements are checked against the latest ` +
      `entry rules in our dataset.`,
    payload: { matches: ranked.map(toCourseCard) },
    chips: ['Compare these institutions', 'What would this cost?', 'Show me funding options'],
  };
}

function toCourseCard({ course, elig }) {
  const inst = INSTITUTION_BY_ID[course.universityId];
  return {
    courseId: course.id,
    courseName: course.name,
    universityName: course.university || inst?.name || '',
    universityId: course.universityId,
    tier: course.tier,
    aps: course.minAPS,
    duration: course.duration,
    province: inst?.province || '',
    requiredSubjects: course.requiredSubjects || [],
    status: elig.status,
    statusLabel: elig.label,
    reason: elig.reason || '',
  };
}

/* ── Compare institutions ────────────────────────────────── */

function compareResponse(user) {
  const shortlistedCourseIds = (user?.savedItems || [])
    .filter((s) => s.type === 'course')
    .map((s) => s.id);

  const shortlistedInstitutions = new Set();
  for (const id of shortlistedCourseIds) {
    const c = COURSES.find((x) => x.id === id);
    if (c) shortlistedInstitutions.add(c.universityId);
  }

  if (shortlistedInstitutions.size === 0 && hasMarks(user)) {
    const top = COURSES
      .map((c) => ({ c, e: checkEligibility(c, user) }))
      .filter((x) => x.e.status === 'pass')
      .sort((a, b) => (b.c.minAPS || 0) - (a.c.minAPS || 0))
      .slice(0, 3);
    for (const { c } of top) shortlistedInstitutions.add(c.universityId);
  }

  if (shortlistedInstitutions.size === 0) {
    INSTITUTIONS.filter((i) => i.tier === 'University').slice(0, 3)
      .forEach((i) => shortlistedInstitutions.add(i.id));
  }

  const ids = Array.from(shortlistedInstitutions).slice(0, 3);
  const userAPS = calculateAPS(user?.subjectMarks || {}).total;
  const cards = ids.map((id) => {
    const inst = INSTITUTION_BY_ID[id];
    if (!inst) return null;
    const hostCourses = COURSES.filter((c) => c.universityId === id);
    const topCourses = hostCourses
      .filter((c) => c.minAPS <= userAPS)
      .slice(0, 3)
      .map((c) => c.name);
    return {
      institutionId: id,
      name: inst.name,
      shortName: inst.shortName,
      tier: inst.tier,
      province: inst.province,
      location: inst.location,
      logoKey: inst.logoKey,
      website: inst.website,
      applicationClose: inst.applicationClose,
      applicationFee: inst.applicationFee,
      nbt: inst.nbt,
      courseCount: hostCourses.length,
      topCourses,
    };
  }).filter(Boolean);

  if (cards.length < 2) {
    return {
      id: rid(),
      kind: 'text',
      text:
        "I need at least two institutions in your shortlist to compare. " +
        "Add a couple of courses to your shortlist on the Course Finder and ask me again.",
      chips: ['What can I study with my marks?', 'What should I do next?'],
    };
  }

  return {
    id: rid(),
    kind: 'compare',
    text:
      "Here's a side-by-side comparison of the institutions you've shown interest in. " +
      "Check the application deadlines — some are much earlier than others.",
    payload: { institutions: cards },
    chips: ['What would this cost?', 'Show me funding options', 'What should I do next?'],
  };
}

/* ── Cost estimate ───────────────────────────────────────── */

function costResponse(user) {
  const top = topMatch(user);
  if (!top) {
    return {
      id: rid(),
      kind: 'text',
      text:
        "I need at least one qualifying course to estimate costs. Log your marks on " +
        "your Profile first, then ask me again — or open the Cost Planner to try any course.",
      chips: ['What can I study with my marks?', 'Show me funding options'],
    };
  }

  const tuition = top.course.feeEstimate || 0;
  const accommodation = 14000;
  const food = 2500 * 12;
  const transport = 800 * 12;
  const books = 1500;
  const other = 5000;
  const total = tuition + accommodation + food + transport + books + other;

  return {
    id: rid(),
    kind: 'cost',
    text:
      `Here's a rough annual cost estimate for ${top.course.name} at ` +
      `${top.course.university}. Open the Cost Planner to fine-tune accommodation, ` +
      `transport and food.`,
    payload: {
      courseId: top.course.id,
      courseName: top.course.name,
      universityName: top.course.university,
      total,
      rows: [
        { label: 'Tuition fees',     amount: tuition,       pct: pct(tuition, total) },
        { label: 'Accommodation',    amount: accommodation, pct: pct(accommodation, total) },
        { label: 'Food',             amount: food,          pct: pct(food, total) },
        { label: 'Transport',        amount: transport,     pct: pct(transport, total) },
        { label: 'Books & supplies', amount: books,         pct: pct(books, total) },
        { label: 'Other expenses',   amount: other,         pct: pct(other, total) },
      ],
    },
    chips: ['Find funding for this', 'Compare these institutions', 'What should I do next?'],
  };
}

/* ── Funding matches ─────────────────────────────────────── */

function fundingResponse(user) {
  const top = topMatch(user);
  const ranked = FUNDING
    .map((f) => ({ f, d: daysUntilDeadline(f.deadline) }))
    .filter(({ d }) => d >= 0)
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);

  const intro = top
    ? `Here are three funding options that could help with ${top.course.name}. ` +
      `Deadlines are shown for each — apply early, some close within weeks.`
    : `Here are three funding options worth a look. Add your marks on Profile ` +
      `and I'll narrow these down for you.`;

  return {
    id: rid(),
    kind: 'funding',
    text: intro,
    payload: {
      funds: ranked.map(({ f, d }) => ({
        id: f.id,
        name: f.name,
        provider: f.provider,
        tier: f.tier,
        amount: f.amount,
        deadline: f.deadline,
        daysLeft: d,
        url: f.url,
      })),
    },
    chips: ['How do I apply for NSFAS?', 'What would this cost?', 'What should I do next?'],
  };
}

/* ── NSFAS how-to ────────────────────────────────────────── */

function nsfasResponse() {
  return {
    id: rid(),
    kind: 'steps',
    text: "Here's how to apply for NSFAS — the process is fully online and free.",
    payload: {
      steps: [
        { title: 'Check eligibility',    body: 'You must be a South African citizen with household income ≤ R350 000 (or ≤ R600 000 for students with disabilities).' },
        { title: 'Create a myNSFAS account', body: 'Go to nsfas.org.za, register with your ID number, email and cellphone number.' },
        { title: 'Complete the application', body: 'Fill in your personal details, academic history, and household income. Upload certified ID and proof of income.' },
        { title: 'Submit and track',     body: 'Submit before the deadline (usually end of January for the following year). Track progress on your myNSFAS dashboard.' },
      ],
    },
    chips: ['Show me other bursaries', 'What would this cost?', 'What should I do next?'],
  };
}

/* ── Next step (uses getNextAction) ─────────────────────── */

function nextStepResponse(user) {
  const action = getNextAction(user);
  return {
    id: rid(),
    kind: 'next-action',
    text: "Here's what I'd focus on next:",
    payload: {
      title: action.title,
      sub: action.sub,
      ctaLabel: action.ctaLabel,
      to: action.to,
      tone: action.tone,
    },
    chips: ['What can I study with my marks?', 'Show me funding options'],
  };
}

/* ── Eligibility deep-dive ───────────────────────────────── */

function eligibilityResponse(user) {
  if (!hasMarks(user)) {
    return {
      id: rid(),
      kind: 'text',
      text:
        "Add your subject marks on Profile and I'll check eligibility against every " +
        "course in our dataset — you'll see exactly what you qualify for.",
      chips: ['What can I study with my marks?', 'What should I do next?'],
    };
  }
  const aps = calculateAPS(user.subjectMarks || {}).total;
  const passing = COURSES
    .map((c) => ({ c, e: checkEligibility(c, user) }))
    .filter((x) => x.e.status === 'pass');

  return {
    id: rid(),
    kind: 'text',
    text:
      `Your current APS is ${aps}/42. You potentially qualify for ${passing.length} ` +
      `course${passing.length === 1 ? '' : 's'} in our dataset. Ask me "What can I study ` +
      `with my marks?" and I'll show the top matches.`,
    chips: ['What can I study with my marks?', 'What should I do next?'],
  };
}

/* ── Study tips ──────────────────────────────────────────── */

function studyTipsResponse() {
  return {
    id: rid(),
    kind: 'steps',
    text: 'A few things that consistently help matric and tertiary students:',
    payload: {
      steps: [
        { title: 'Pomodoro blocks',   body: 'Study in 25-minute focused blocks with 5-minute breaks. Four blocks = one solid session.' },
        { title: 'Active recall',     body: 'Close the book. Write down what you remember. Open the book. Fix the gaps. Repeat.' },
        { title: 'Past papers first', body: 'Past papers beat re-reading notes. Time yourself and mark your own work.' },
        { title: 'Sleep is study',    body: 'Memory consolidates during sleep. Six focused hours + 7 hours sleep beats 10 hours tired.' },
      ],
    },
    chips: ['What should I do next?', "I'm feeling stressed"],
  };
}

/* ── Stress ──────────────────────────────────────────────── */

function stressResponse() {
  return {
    id: rid(),
    kind: 'text',
    text:
      "That feeling is real, and you're not alone in it. Try a 5-minute reset — " +
      "box breathing (4 in, 4 hold, 4 out, 4 hold). If it's bigger than exam nerves, " +
      "the Wellness page has a check-in and can point you to a counsellor.",
    chips: ['What should I do next?', 'Show me study tips'],
  };
}

/* ── Fallback ────────────────────────────────────────────── */

function fallbackResponse() {
  return {
    id: rid(),
    kind: 'text',
    text:
      "I can help with courses, eligibility, costs, funding, NSFAS, and next steps. " +
      "Try one of these:",
    chips: [
      'What can I study with my marks?',
      'What would studying this cost?',
      'Which bursaries might suit me?',
      'How do I apply for NSFAS?',
      'What should I do next?',
    ],
  };
}

/* ── Helpers ─────────────────────────────────────────────── */

function hasMarks(user) {
  return user?.subjectMarks && Object.keys(user.subjectMarks).length > 0;
}

function topMatch(user) {
  if (!hasMarks(user)) return null;
  const top = COURSES
    .map((c) => ({ c, e: checkEligibility(c, user) }))
    .filter((x) => x.e.status === 'pass')
    .sort((a, b) => (b.c.minAPS || 0) - (a.c.minAPS || 0))[0]?.c;
  if (!top) return null;
  const inst = INSTITUTION_BY_ID[top.universityId];
  return {
    course: { ...top, university: top.university || inst?.name || '' },
  };
}

function pct(amount, total) {
  return total > 0 ? Math.round((amount / total) * 100) : 0;
}

function rid() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/* ── Welcome message for a new session ───────────────────── */

export function welcomeMessage(user) {
  const firstName = (user?.name || '').split(' ')[0] || 'there';
  const action = getNextAction(user);

  return {
    id: rid(),
    kind: 'text',
    text:
      `Hi ${firstName} — I'm your Student Companion. Ask me anything about what to study, ` +
      `where, how to apply, or how to fund it. Right now, my suggestion is: **${action.title}**.`,
    chips: [
      'What can I study with my marks?',
      'What would studying this cost?',
      'Which bursaries might suit me?',
      'How do I apply for NSFAS?',
      'What should I do next?',
    ],
  };
}
