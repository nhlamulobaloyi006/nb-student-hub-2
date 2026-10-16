/**
 * Course matching helpers.
 *
 * Returns courses the user plausibly qualifies for, ranked by APS descending.
 */

import { COURSES } from "../data/courses";
import { INSTITUTION_BY_ID } from "../data/institutions";
import { checkEligibility } from "./eligibilityChecker";

export function getMatchingCourses(user, options = {}) {
  const { limit = null, includeWarn = false } = options;
  if (!user || !user.subjectMarks || Object.keys(user.subjectMarks).length === 0) {
    return [];
  }

  const enriched = COURSES.map((c) => ({
    course: c,
    elig: checkEligibility(c, user),
  }));

  const eligible = enriched.filter(({ elig }) => {
    if (elig.status === "pass") return true;
    if (includeWarn && elig.status === "warn") return true;
    return false;
  });

  eligible.sort((a, b) => {
    const order = { pass: 0, warn: 1 };
    const d = (order[a.elig.status] ?? 9) - (order[b.elig.status] ?? 9);
    if (d !== 0) return d;
    return (b.course.minAPS || 0) - (a.course.minAPS || 0);
  });

  return limit ? eligible.slice(0, limit) : eligible;
}

export function getMatchSummary(user, topN = 3) {
  const all = getMatchingCourses(user);
  const top = all.slice(0, topN).map(({ course, elig }) => {
    const inst = INSTITUTION_BY_ID[course.universityId];
    return {
      courseId: course.id,
      courseName: course.name,
      universityId: course.universityId,
      universityName: course.university || inst?.name || "",
      institutionShortName: inst?.shortName || "",
      logoKey: inst?.logoKey || "generic",
      tier: course.tier,
      duration: course.duration,
      minAPS: course.minAPS,
      status: elig.status,
    };
  });
  return { total: all.length, top };
}
