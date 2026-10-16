/**
 * Compute navigation badges from user data.
 *
 * Returns { [route]: { value: number, tone: string } | { dot: true, tone: string } }
 */

import { getMatchingCourses } from "./matchCourses";
import { FUNDING, daysUntilDeadline } from "../data/funding";

export function computeBadges(user) {
  const badges = {};
  if (!user) return badges;

  // Course Finder — count of courses the user qualifies for
  try {
    const matches = getMatchingCourses(user);
    if (matches.length > 0) {
      badges["/courses"] = { value: matches.length, tone: "green" };
    }
  } catch { /* ignore */ }

  // Funding — closing soon
  try {
    let urgent30 = 0;
    let urgent3 = 0;
    for (const f of FUNDING) {
      const d = daysUntilDeadline(f.deadline);
      if (d >= 0 && d <= 30) urgent30 += 1;
      if (d >= 0 && d <= 3) urgent3 += 1;
    }
    if (urgent30 > 0) {
      badges["/funding"] = { value: urgent30, tone: urgent3 > 0 ? "red" : "amber" };
    }
  } catch { /* ignore */ }

  // Applications — count of active applications
  try {
    const active = (user.applications || []).filter(
      (a) => a.status !== "Rejected" && a.status !== "Accepted"
    ).length;
    if (active > 0) {
      badges["/applications"] = { value: active, tone: "indigo" };
    }
  } catch { /* ignore */ }

  // Streaks — current streak, only if >= 2
  try {
    const current = user.streaks?.current || 0;
    if (current >= 2) {
      badges["/streaks"] = { value: current, tone: "gold" };
    }
  } catch { /* ignore */ }

  // Wellness — dot if no check-in today
  try {
    const today = new Date().toISOString().slice(0, 10);
    const checkedIn = (user.wellness?.checkins || []).some((c) => c.date === today);
    if (!checkedIn) {
      badges["/wellness"] = { dot: true, tone: "amber" };
    }
  } catch { /* ignore */ }

  return badges;
}
