/**
 * Funding opportunities.
 *
 * Deadlines are stored as DAY OFFSETS (deadlineDays) so the demo never goes
 * stale. On module load each record's `deadline` resolves to an ISO date
 * relative to today.
 *
 * Offset plan (deterministic):
 *   -2, -5           → 2 items already closed (for the "Closed" state)
 *   3, 7, 14         → 3 urgent (drives notifications + "Closing soon" widget)
 *   rest 21..250     → spread across upcoming months
 */

const DAY_MS = 86400000;

function isoFromDays(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const RAW = [
  {
    id: 'nsfas-tvet',
    name: 'NSFAS Bursary (TVET / University)',
    provider: 'National Student Financial Aid Scheme',
    tier: 'NSFAS',
    amount: 'Up to R177 000 (depending on study level)',
    deadlineDays: -2,
    eligibility: ['South African citizen', 'Household income ≤ R350 000'],
    url: 'https://www.nsfas.org.za',
    logoKey: 'nsfas',
    description:
      'Provides financial support for eligible South African students at public TVET colleges or universities.',
    minAPS: null,
  },
  {
    id: 'nsfas-postgrad',
    name: 'NSFAS Loan (Postgraduate)',
    provider: 'National Student Financial Aid Scheme',
    tier: 'Student loans',
    amount: 'Up to R75 000 per year',
    deadlineDays: -5,
    eligibility: ['South African citizen', 'Enrolled at public institution'],
    url: 'https://www.nsfas.org.za',
    logoKey: 'nsfas',
    description:
      'Provides loan funding for eligible postgraduate students.',
    minAPS: null,
  },
  {
    id: 'sasol-bursary',
    name: 'Sasol Bursary Programme',
    provider: 'Sasol',
    tier: 'Bursaries',
    amount: 'Full tuition + living allowance',
    deadlineDays: 3,
    eligibility: ['Grade 12 with citizen', 'Minimum 60%+ average'],
    url: 'https://www.sasolbursaries.com',
    logoKey: 'sasol',
    description:
      'Supports students in STEM fields (Engineering, Science, Technology, Mathematics).',
    minAPS: 32,
  },
  {
    id: 'mtn-bursary',
    name: 'MTN Bursary Programme',
    provider: 'MTN South Africa',
    tier: 'Bursaries',
    amount: 'Up to R60 000 per year',
    deadlineDays: 7,
    eligibility: ['South African citizen', 'Matric with 60%+ average'],
    url: 'https://www.mtn.co.za',
    logoKey: 'mtn',
    description:
      'Supports academically strong students in various fields including IT, Business and Engineering.',
    minAPS: 30,
  },
  {
    id: 'uct-merit',
    name: 'UCT Merit Scholarships',
    provider: 'University of Cape Town',
    tier: 'Scholarships',
    amount: 'Up to R50 000 per year',
    deadlineDays: 14,
    eligibility: ['Matric with 65%+ average', 'Leadership / extracurricular activities'],
    url: 'https://www.uct.ac.za',
    logoKey: 'uct',
    description:
      'Awarded to high-achievers based on academic performance and leadership potential.',
    minAPS: 36,
  },
  {
    id: 'uj-excellence',
    name: 'UJ Academic Excellence Bursary',
    provider: 'University of Johannesburg',
    tier: 'Bursaries',
    amount: 'R10 000 – R50 000 per year',
    deadlineDays: 21,
    eligibility: ['Academic performance', 'UJ application required'],
    url: 'https://www.uj.ac.za',
    logoKey: 'uj',
    description:
      'Awarded to first-year students with outstanding matric results.',
    minAPS: 34,
  },
  {
    id: 'm2m',
    name: 'Matrics to Masters',
    provider: 'Department of Higher Education',
    tier: 'Student loans',
    amount: 'Up to full cost (means tested)',
    deadlineDays: 28,
    eligibility: ['South African citizen', 'Matriculant (recent)'],
    url: 'https://www.dhet.gov.za',
    logoKey: 'dhet',
    description:
      'Government-backed loan scheme for qualifying matriculants entering university or TVET.',
    minAPS: null,
  },
  {
    id: 'funza-lushaka',
    name: 'Funza Lushaka Bursary',
    provider: 'Department of Basic Education',
    tier: 'Bursaries',
    amount: 'Full cost of study',
    deadlineDays: 35,
    eligibility: ['South African citizen', 'Committed to teaching'],
    url: 'https://www.funzalushaka.doe.gov.za',
    logoKey: 'dbe',
    description:
      'Bursary for students who commit to teaching at a public school after graduation.',
    minAPS: 26,
  },
  {
    id: 'nrf-postgrad',
    name: 'NRF Postgraduate Scholarship',
    provider: 'National Research Foundation',
    tier: 'Scholarships',
    amount: 'Varies by level (R40 000 – R120 000)',
    deadlineDays: 42,
    eligibility: ['South African citizen or permanent resident', 'Honours / Masters / PhD'],
    url: 'https://www.nrf.ac.za',
    logoKey: 'nrf',
    description:
      'Supports postgraduate research in priority fields.',
    minAPS: null,
  },
  {
    id: 'anglo-bursary',
    name: 'Anglo American Bursary',
    provider: 'Anglo American',
    tier: 'Bursaries',
    amount: 'Full tuition + accommodation + allowance',
    deadlineDays: 50,
    eligibility: ['South African citizen', 'Engineering / Geology / related'],
    url: 'https://www.angloamerican.com',
    logoKey: 'anglo',
    description:
      'Bursary for engineering, mining, geology and related disciplines.',
    minAPS: 34,
  },
  {
    id: 'investec-bursary',
    name: 'Investec Bursary Programme',
    provider: 'Investec',
    tier: 'Bursaries',
    amount: 'Full cost of study',
    deadlineDays: 58,
    eligibility: ['South African citizen', 'Financial need', 'Academic merit'],
    url: 'https://www.investec.com',
    logoKey: 'investec',
    description:
      'Comprehensive bursary with mentorship and vacation work opportunities.',
    minAPS: 34,
  },
  {
    id: 'standard-bank-bursary',
    name: 'Standard Bank Bursary',
    provider: 'Standard Bank',
    tier: 'Bursaries',
    amount: 'Full cost of study',
    deadlineDays: 65,
    eligibility: ['South African citizen', 'Commerce / IT / Engineering'],
    url: 'https://www.standardbank.co.za',
    logoKey: 'standardbank',
    description:
      'Full bursary for high-performing students in priority fields.',
    minAPS: 34,
  },
  {
    id: 'discovery-bursary',
    name: 'Discovery Foundation Bursary',
    provider: 'Discovery',
    tier: 'Bursaries',
    amount: 'R40 000 – R80 000 per year',
    deadlineDays: 72,
    eligibility: ['South African citizen', 'Health sciences / actuarial'],
    url: 'https://www.discovery.co.za',
    logoKey: 'discovery',
    description:
      'Supports health sciences and actuarial students with demonstrated need.',
    minAPS: 36,
  },
  {
    id: 'eskom-bursary',
    name: 'Eskom Bursary Scheme',
    provider: 'Eskom',
    tier: 'Bursaries',
    amount: 'Full tuition + allowances',
    deadlineDays: 80,
    eligibility: ['South African citizen', 'Engineering / IT / Sciences'],
    url: 'https://www.eskom.co.za',
    logoKey: 'eskom',
    description:
      'Full-cost bursary for engineering, IT, and science students.',
    minAPS: 34,
  },
  {
    id: 'transnet-bursary',
    name: 'Transnet Bursary',
    provider: 'Transnet',
    tier: 'Bursaries',
    amount: 'Full tuition + allowances',
    deadlineDays: 88,
    eligibility: ['South African citizen', 'Engineering / Logistics'],
    url: 'https://www.transnet.net',
    logoKey: 'transnet',
    description:
      'Bursary for engineering, supply chain and logistics students.',
    minAPS: 32,
  },
  {
    id: 'sasria-bursary',
    name: 'Sasria Bursary',
    provider: 'Sasria',
    tier: 'Bursaries',
    amount: 'R50 000 – R100 000 per year',
    deadlineDays: 96,
    eligibility: ['South African citizen', 'Financial need'],
    url: 'https://www.sasria.co.za',
    logoKey: 'sasria',
    description:
      'Supports students from previously disadvantaged backgrounds in various fields.',
    minAPS: 30,
  },
  {
    id: 'dhet-tvet-bursary',
    name: 'DHET TVET Bursary',
    provider: 'Department of Higher Education',
    tier: 'NSFAS',
    amount: 'Full tuition + transport + accommodation',
    deadlineDays: 105,
    eligibility: ['South African citizen', 'Enrolled at TVET college'],
    url: 'https://www.dhet.gov.za',
    logoKey: 'dhet',
    description:
      'Bursary for students enrolled in NC(V) or Report 191 programmes at public TVET colleges.',
    minAPS: null,
  },
  {
    id: 'sita-seta',
    name: 'SITA SETA Learnership',
    provider: 'SITA',
    tier: 'SETA',
    amount: 'Stipend + training',
    deadlineDays: 115,
    eligibility: ['South African citizen', 'Matric certificate'],
    url: 'https://www.sita.co.za',
    logoKey: 'sita',
    description:
      'ICT learnership programme combining workplace experience with structured training.',
    minAPS: null,
  },
  {
    id: 'merSETA-learner',
    name: 'merSETA Bursary',
    provider: 'merSETA',
    tier: 'SETA',
    amount: 'Full tuition + stipend',
    deadlineDays: 130,
    eligibility: ['South African citizen', 'Engineering / manufacturing programmes'],
    url: 'https://www.merseta.org.za',
    logoKey: 'merseta',
    description:
      'Bursary for engineering, metals and related manufacturing programmes.',
    minAPS: 30,
  },
  {
    id: 'foodbev-seta',
    name: 'FoodBev SETA Bursary',
    provider: 'FoodBev SETA',
    tier: 'SETA',
    amount: 'R30 000 – R60 000 per year',
    deadlineDays: 150,
    eligibility: ['South African citizen', 'Food science / hospitality'],
    url: 'https://www.foodbev.co.za',
    logoKey: 'foodbev',
    description:
      'Bursary for food science, hospitality, and related programmes.',
    minAPS: 28,
  },
  {
    id: 'agriseta-bursary',
    name: 'AgriSETA Bursary',
    provider: 'AgriSETA',
    tier: 'SETA',
    amount: 'R40 000 – R80 000 per year',
    deadlineDays: 180,
    eligibility: ['South African citizen', 'Agriculture / forestry programmes'],
    url: 'https://www.agriseta.co.za',
    logoKey: 'agriseta',
    description:
      'Bursary for agricultural, forestry and related sciences students.',
    minAPS: 28,
  },
  {
    id: 'ceta-bursary',
    name: 'CETA Bursary Programme',
    provider: 'Construction Education & Training Authority',
    tier: 'SETA',
    amount: 'R45 000 – R90 000 per year',
    deadlineDays: 200,
    eligibility: ['South African citizen', 'Built environment programmes'],
    url: 'https://www.ceta.org.za',
    logoKey: 'ceta',
    description:
      'Bursary for construction, engineering, and built environment students.',
    minAPS: 30,
  },
  {
    id: 'netcare-bursary',
    name: 'Netcare Bursary',
    provider: 'Netcare',
    tier: 'Bursaries',
    amount: 'Full cost of study + work-back',
    deadlineDays: 220,
    eligibility: ['South African citizen', 'Nursing / health sciences'],
    url: 'https://www.netcare.co.za',
    logoKey: 'netcare',
    description:
      'Bursary with guaranteed employment on completion. Nursing and health sciences.',
    minAPS: 30,
  },
  {
    id: 'absa-bursary',
    name: 'Absa Bursary Programme',
    provider: 'Absa',
    tier: 'Bursaries',
    amount: 'Full cost of study',
    deadlineDays: 250,
    eligibility: ['South African citizen', 'Commerce / IT / Data Science'],
    url: 'https://www.absa.africa',
    logoKey: 'absa',
    description:
      'Full-cost bursary with vacation work and graduate placement pathway.',
    minAPS: 34,
  },

];

export const FUNDING = RAW.map((f) => ({
  ...f,
  deadline: isoFromDays(f.deadlineDays),
}));

export const FUNDING_BY_ID = FUNDING.reduce((acc, f) => {
  acc[f.id] = f;
  return acc;
}, {});

export const FUNDING_TIERS = ['NSFAS', 'Bursaries', 'Scholarships', 'Student loans', 'SETA'];

/** Days until the deadline. Negative if past. */
export function daysUntilDeadline(iso) {
  if (!iso) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(iso + 'T00:00:00');
  return Math.round((d - now) / 86400000);
}
