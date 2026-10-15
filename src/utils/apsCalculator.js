/**
 * APS calculation — South African NSC scale.
 *
 * Non-LO subjects score 1-7 points:
 *
 *   80-100%  → 7
 *   70-79%   → 6
 *   60-69%   → 5
 *   50-59%   → 4
 *   40-49%   → 3
 *   30-39%   → 2
 *   0-29%    → 1
 *
 * Life Orientation contributes a FIXED 1 point to APS, ALWAYS — whether or
 * not an LO mark is entered. It does not scale with the mark.
 *
 * Final APS = (sum of best 6 non-LO subjects) + LO bonus (always 1).
 * MAX_APS = 43 (6 x 7 + 1).
 */

export const MAX_APS = 43;
export const SUBJECT_COUNT_FOR_APS = 6;
export const LO_BONUS = 1;

/**
 * Is this subject Life Orientation?
 *
 * We only accept two forms:
 *   1. Subject starts with "Life Orientation" (case-insensitive)
 *      e.g. "Life Orientation", "Life Orientation (LO)"
 *   2. Subject is exactly "LO" (standalone, whole word)
 *
 * We must NOT match strings that merely contain "lo" mid-word —
 * e.g. "Information Technology", "Biology", "Philosophy".
 */
export function isLifeOrientation(subjectName) {
  if (!subjectName) return false;
  const s = String(subjectName).trim().toLowerCase();

  if (s.startsWith('life orientation')) return true;

  // Standalone "LO" only — must be the entire subject name
  if (s === 'lo') return true;

  return false;
}

/** Percentage → 1-7 points for a normal subject. */
export function percentageToLevel(pct) {
  const n = Number(pct);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n >= 80) return 7;
  if (n >= 70) return 6;
  if (n >= 60) return 5;
  if (n >= 50) return 4;
  if (n >= 40) return 3;
  if (n >= 30) return 2;
  return 1;
}

/** Life Orientation always gives exactly 1 point. */
export function loContribution(_pct) {
  return LO_BONUS;
}

export function calculateAPS(subjectMarks = {}) {
  const entries = Object.entries(subjectMarks).filter(([, v]) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
  });

  const breakdown = entries.map(([subject, pct]) => {
    const isLO = isLifeOrientation(subject);
    return {
      subject,
      percentage: Number(pct),
      points: isLO ? LO_BONUS : percentageToLevel(pct),
      isLO,
    };
  });

  const nonLO = breakdown
    .filter((b) => !b.isLO)
    .sort((a, b) => b.points - a.points)
    .slice(0, SUBJECT_COUNT_FOR_APS);

  const lo = breakdown.filter((b) => b.isLO);

  const nonLOPoints = nonLO.reduce((sum, b) => sum + b.points, 0);
  const loPoints = LO_BONUS; // always 1, whether or not LO was entered
  const total = nonLOPoints + loPoints;

  const countedSet = new Set([...nonLO, ...lo]);
  const excluded = breakdown.filter((b) => !countedSet.has(b));

  return {
    total,
    breakdown,
    counted: [...nonLO, ...lo],
    excluded,
    usedLO: true,
    loPoints,
    nonLOPoints,
    nonLOCount: nonLO.length,
  };
}

export function pointsFor(pct) {
  return percentageToLevel(pct);
}