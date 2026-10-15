/**
 * Eligibility checker.
 *
 * Rules:
 *   - APS uses the app's calculateAPS: top 6 non-LO subjects + LO's
 *     0-or-1 contribution. See apsCalculator.js.
 *   - Life Orientation requirements are treated as PASS/FAIL — any
 *     mark ≥ 30% satisfies them, regardless of the level in brackets.
 *     (Because LO can only ever produce 1 APS point.)
 *   - All other subject requirements use the 1-7 point scale.
 */

import { calculateAPS, percentageToLevel, isLifeOrientation } from './apsCalculator';

function parseRequirement(req) {
  if (!req) return { name: '', minPoints: 0 };
  const m = String(req).match(/^(.+?)\s*\((\d+)\)\s*$/);
  if (m) return { name: m[1].trim(), minPoints: Number(m[2]) };
  return { name: String(req).trim(), minPoints: 0 };
}

function findUserSubject(userSubjectMarks, requiredName) {
  const keys = Object.keys(userSubjectMarks || {});
  const reqLower = requiredName.toLowerCase();
  const exact = keys.find((k) => k.toLowerCase() === reqLower);
  if (exact) return exact;
  const fuzzy = keys.find((k) => {
    const kLower = k.toLowerCase();
    return kLower.includes(reqLower) || reqLower.includes(kLower);
  });
  return fuzzy || null;
}

export function checkEligibility(course, user) {
  if (!course) {
    return {
      status: 'unknown',
      label: 'Unknown course',
      missingSubjects: [],
      checkedAt: new Date().toISOString(),
    };
  }

  const marks = user?.subjectMarks || {};
  const hasMarks = Object.keys(marks).length > 0;
  const reqs = Array.isArray(course.requiredSubjects) ? course.requiredSubjects : [];

  if (!hasMarks) {
    return {
      status: 'warn',
      label: 'More information needed',
      missingSubjects: [],
      reason: 'Add your subject marks on Profile to see if you qualify.',
      checkedAt: new Date().toISOString(),
    };
  }

  const apsInfo = calculateAPS(marks);
  const aps = apsInfo.total;

  if (reqs.length === 0) {
    return {
      status: 'pass',
      label: 'Potentially eligible',
      missingSubjects: [],
      reason: `No specific subject requirements listed. Your APS is ${aps}.`,
      aps,
      checkedAt: new Date().toISOString(),
    };
  }

  const missing = [];
  for (const rawReq of reqs) {
    const { name, minPoints } = parseRequirement(rawReq);
    const userSubjectKey = findUserSubject(marks, name);
    const isLOReq = isLifeOrientation(name);

    if (!userSubjectKey) {
      missing.push({
        subject: name,
        reason: isLOReq
          ? 'Life Orientation is required'
          : 'Not in your subject list',
        required: isLOReq ? 1 : minPoints,
      });
      continue;
    }

    const pct = Number(marks[userSubjectKey]);

    if (isLOReq) {
      // LO requirement = just "must pass" (≥30%)
      if (pct < 30) {
        missing.push({
          subject: userSubjectKey,
          reason: 'You need to pass Life Orientation (30%+)',
          required: 1,
          actual: 0,
        });
      }
      continue;
    }

    const level = percentageToLevel(pct);
    if (minPoints > 0 && level < minPoints) {
      missing.push({
        subject: userSubjectKey,
        reason: `Needs level ${minPoints}, you have level ${level}`,
        required: minPoints,
        actual: level,
      });
    }
  }

  const apsShort = course.minAPS && aps < course.minAPS;

  if (missing.length === 0 && !apsShort) {
    return {
      status: 'pass',
      label: 'Potentially eligible',
      missingSubjects: [],
      reason: `You meet all subject requirements. Your APS is ${aps}.`,
      aps,
      checkedAt: new Date().toISOString(),
    };
  }

  if (missing.length > 0 && apsShort) {
    return {
      status: 'fail',
      label: 'Requirement not met',
      missingSubjects: missing,
      reason: `Missing subjects and your APS is ${aps} — needs ${course.minAPS}.`,
      aps,
      checkedAt: new Date().toISOString(),
    };
  }

  if (apsShort) {
    return {
      status: 'fail',
      label: 'Requirement not met',
      missingSubjects: [],
      reason: `Your APS is ${aps} — needs ${course.minAPS}.`,
      aps,
      checkedAt: new Date().toISOString(),
    };
  }

  return {
    status: 'fail',
    label: 'Requirement not met',
    missingSubjects: missing,
    reason: missing[0]?.reason || 'One or more requirements not met.',
    aps,
    checkedAt: new Date().toISOString(),
  };
}

export function qualifyingCourses(courses, user) {
  return courses
    .map((c) => ({ course: c, elig: checkEligibility(c, user) }))
    .filter(({ elig }) => elig.status === 'pass' || elig.status === 'warn');
}
