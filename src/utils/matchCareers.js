/**
 * Careers-by-course matcher.
 *
 * Given a course, returns the careers it plausibly leads to, ranked by the
 * overlap between the course's interestTags and each career's interestTags.
 *
 * Example:
 *   BSc CS tags: ['technology','computers','research']
 *   Software Engineer tags: ['computers','technology','engineering'] → 2 overlaps
 *   Data Scientist tags: ['computers','research','technology'] → 3 overlaps
 */

import { CAREERS } from "../data/careers";

/**
 * @param {object} course         a course object from courses.js
 * @param {object} opts
 *   minOverlap (default 1)       require at least N matching tags
 *   limit      (default null)    cap the number returned
 * @returns {Array<{career: object, score: number}>}
 */
export function matchCareersForCourse(course, opts = {}) {
  if (!course) return [];
  const minOverlap = opts.minOverlap ?? 1;
  const limit = opts.limit ?? null;

  const courseTags = new Set(course.interestTags || []);

  const scored = CAREERS.map((career) => {
    const overlap = (career.interestTags || []).filter((t) => courseTags.has(t)).length;
    return { career, score: overlap };
  })
    .filter(({ score }) => score >= minOverlap)
    .sort((a, b) => b.score - a.score);

  return limit ? scored.slice(0, limit) : scored;
}

/** Convenience: just the careers array, no score */
export function getCareersForCourse(course, opts = {}) {
  return matchCareersForCourse(course, opts).map((x) => x.career);
}

/** Total count of matching careers for a course */
export function countCareersForCourse(course) {
  return matchCareersForCourse(course).length;
}
