/**
 * Funding matcher.
 *
 * Given a user + a course, returns the funding options most relevant to them.
 *
 * Cascade:
 *   1. Bursaries + Scholarships relevant to the course field
 *   2. NSFAS (if SA citizen — always fallback for undergrads)
 *   3. Student loans (private or government)
 *   4. SETA learnerships (TVET only)
 */

import { FUNDING, daysUntilDeadline } from "../data/funding";

const STOP_WORDS = new Set([
  "bsc", "ba", "bcom", "beng", "bed", "llb", "dip", "diploma",
  "bachelor", "in", "of", "the", "and", "with", "programme",
  "science", "sciences", "studies", "management", "general",
]);

function keywords(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

function relevance(fund, courseWords) {
  if (courseWords.length === 0) return 0;
  const haystack = (fund.name + " " + fund.description + " " + (fund.provider || "")).toLowerCase();
  let score = 0;
  for (const w of courseWords) {
    if (haystack.includes(w)) score += 1;
  }
  return score;
}

/**
 * @param {object} user
 * @param {object} course
 * @param {object} opts { max = 6 }
 * @returns { top: [...], total: number, tierUsed: string }
 */
export function matchFunding(user, course, opts = {}) {
  const max = opts.max || 6;
  if (!course) return { top: [], total: 0, tierUsed: null };

  const courseWords = keywords(course.name + " " + (course.faculty || ""));
  const userAPS = numOrNull(user && user.aps);
  const tier = course.tier || "";

  // -- Filter live options only
  const live = FUNDING.filter((f) => daysUntilDeadline(f.deadline) >= 0);

  // -- APS gate
  const apsOk = (f) => {
    if (f.minAPS == null || userAPS == null) return true;
    return userAPS >= f.minAPS;
  };

  // -- Tier buckets based on course level
  const isTVET = tier === "TVET";
  const primaryTiers = isTVET
    ? ["SETA", "NSFAS", "Bursaries"]
    : ["Bursaries", "Scholarships"];
  const fallbackTiers = ["NSFAS", "Student loans", "SETA"];

  // -- Primary: relevant + APS-ok
  let primary = live
    .filter((f) => primaryTiers.includes(f.tier))
    .filter(apsOk)
    .map((f) => ({ f, rel: relevance(f, courseWords), d: daysUntilDeadline(f.deadline) }));

  // -- Sort: relevance desc, then deadline asc
  primary.sort((a, b) => {
    if (b.rel !== a.rel) return b.rel - a.rel;
    return a.d - b.d;
  });

  let picked = primary.slice(0, max).map((x) => x.f);

  // -- Cascade: NSFAS
  if (picked.length < 3) {
    const nsfas = live.filter((f) => f.tier === "NSFAS").filter(apsOk);
    for (const n of nsfas) {
      if (picked.length >= max) break;
      if (!picked.includes(n)) picked.push(n);
    }
  }

  // -- Cascade: Student loans
  if (picked.length < 3) {
    const loans = live.filter((f) => f.tier === "Student loans").filter(apsOk);
    for (const n of loans) {
      if (picked.length >= max) break;
      if (!picked.includes(n)) picked.push(n);
    }
  }

  // -- Cascade: SETA
  if (picked.length < 3) {
    const seta = live.filter((f) => f.tier === "SETA").filter(apsOk);
    for (const n of seta) {
      if (picked.length >= max) break;
      if (!picked.includes(n)) picked.push(n);
    }
  }

  // -- Last resort: any live funding
  if (picked.length < 3) {
    for (const f of live) {
      if (picked.length >= max) break;
      if (!picked.includes(f) && apsOk(f)) picked.push(f);
    }
  }

  // Determine which tier the modal should highlight
  const tierUsed = isTVET ? "SETA" : (picked.some((p) => p.tier === "Bursaries" || p.tier === "Scholarships") ? "Bursaries" : "NSFAS");

  return { top: picked, total: picked.length, tierUsed };
}

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}
