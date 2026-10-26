/**
 * Funding opportunities with researched deadlines.
 *
 * Deadline data was checked on 2026-10-26 against official funder pages where
 * available. Deadlines are fixed ISO dates (YYYY-MM-DD), not rolling offsets.
 * A null deadline means no reliable current deadline could be confirmed; it
 * must NOT be interpreted as an open opportunity.
 *
 * Note: This module does not scrape provider websites at runtime. It keeps a
 * dated snapshot of researched information. Re-check deadlineSourceUrl before applying.
 */

const DAY_MS = 86_400_000;
const LAST_VERIFIED = '2026-10-26';

const RAW = [
  {
    id: 'nsfas-tvet',
    name: 'NSFAS Bursary (TVET / University)',
    provider: 'National Student Financial Aid Scheme',
    tier: 'NSFAS',
    amount: 'Funding and allowances depend on eligibility and study circumstances',
    deadline: '2026-10-31',
    applicationStatus: 'open',
    eligibility: [
      'South African citizen',
      'Meet NSFAS financial and academic eligibility criteria',
    ],
    url: 'https://www.nsfas.org.za/content/how-to-apply.html',
    deadlineSourceUrl: 'https://www.nsfas.org.za/content/how-to-apply.html',
    logoKey: 'nsfas',
    description:
      'Provides financial support for eligible South African students at public TVET colleges or universities. Applications for the 2027 funding cycle close on 31 October 2026.',
    deadlineNote:
      'Official 2027 application window: 18 September–31 October 2026. Apply through myNSFAS; applying is free.',
    minAPS: null,
  },

  {
    id: 'nsfas-postgrad',
    name: 'NSFAS Loan (Postgraduate) — verify programme',
    provider: 'National Student Financial Aid Scheme',
    tier: 'Student loans',
    amount: 'Not confirmed for this listing',
    deadline: null,
    applicationStatus: 'unverified',
    eligibility: [
      'Eligibility depends on the specific funding programme',
    ],
    url: 'https://www.nsfas.org.za/',
    deadlineSourceUrl: 'https://www.nsfas.org.za/',
    logoKey: 'nsfas',
    description:
      'A general NSFAS postgraduate loan under this exact name could not be verified on the official NSFAS website.',
    deadlineNote:
      'Do not display this as a confirmed funding opportunity until the exact scheme and its official 2027 call are verified.',
    minAPS: null,
  },

  {
    id: 'sasol-bursary',
    name: 'Sasol Bursary Programme (2027 Engineering & Science)',
    provider: 'Sasol',
    tier: 'Bursaries',
    amount: 'Tuition and living allowance; terms depend on the programme',
    deadline: '2026-05-17',
    applicationStatus: 'closed',
    eligibility: [
      'South African applicant',
      'Engineering or Science undergraduate studies',
      'Meet programme-specific academic criteria',
    ],
    url: 'https://www.sasolbursaries.com/',
    deadlineSourceUrl:
      'https://www.sasol.com/media-centre/media-releases/sasol-bursaries-now-open-applications-invited-for-2027-engineering-and-science-studies',
    logoKey: 'sasol',
    description:
      'Sasol’s 2027 Engineering and Science bursary call has closed.',
    deadlineNote:
      'Sasol announced that the main 2027 Engineering & Science bursary call closed on 17 May 2026. Other Sasol Foundation calls can have separate dates.',
    minAPS: 32,
  },

  {
    id: 'mtn-bursary',
    name: 'MTN Bursary Programme',
    provider: 'MTN South Africa',
    tier: 'Bursaries',
    amount: 'Confirm amount in the current advert',
    deadline: null,
    applicationStatus: 'not-announced',
    eligibility: [
      'South African citizen',
      'Check the latest MTN advert for academic and field-of-study criteria',
    ],
    url: 'https://www.mtn.co.za/',
    deadlineSourceUrl: 'https://www.mtn.co.za/',
    logoKey: 'mtn',
    description:
      'A current 2027 closing date for this bursary was not confirmed from an official MTN page during this check.',
    deadlineNote:
      'No verified 2027 deadline found. Check the official MTN website and current recruitment notices before applying.',
    minAPS: null,
  },

  {
    id: 'uct-merit',
    name: 'UCT Postgraduate Financial Aid Bursary (2027)',
    provider: 'University of Cape Town',
    tier: 'Scholarships',
    amount: 'Varies by award; contributions towards study costs',
    deadline: '2026-11-10',
    applicationStatus: 'open',
    eligibility: [
      'South African citizen or permanent resident',
      'Honours, Master’s or Doctoral study',
      'First-year applicants must submit a 2027 UCT admissions application before applying for postgraduate funding',
    ],
    url: 'https://uct.ac.za/students/fees-funding-postgraduate-degree-funding-bursaries-scholarships/uct-merit-and-need-awards',
    deadlineSourceUrl:
      'https://uct.ac.za/students/fees-funding-postgraduate-degree-funding-bursaries-scholarships/uct-merit-and-need-awards',
    logoKey: 'uct',
    description:
      'UCT’s 2027 Postgraduate Financial Aid Bursary supports eligible South African citizens and permanent residents across Honours, Master’s and Doctoral study.',
    deadlineNote:
      'The official postgraduate funding application deadline is 10 November 2026. This replaces the earlier, mismatched generic “UCT Merit Scholarships” listing.',
    minAPS: null,
  },

  {
    id: 'uj-excellence',
    name: 'UJ Academic Excellence Bursary',
    provider: 'University of Johannesburg',
    tier: 'Bursaries',
    amount: 'Not confirmed for this exact award',
    deadline: null,
    applicationStatus: 'needs-verification',
    eligibility: [
      'Academic performance',
      'Check UJ’s official student-funding criteria',
    ],
    url: 'https://www.uj.ac.za/admission-aid/undergraduate/',
    deadlineSourceUrl:
      'https://www.uj.ac.za/admission-aid/undergraduate/',
    logoKey: 'uj',
    description:
      'UJ publishes admissions and student-finance information, but a separate, current 2027 deadline for this exact bursary was not confirmed.',
    deadlineNote:
      'Do not reuse UJ’s general admissions closing date as a bursary deadline unless UJ confirms they are the same.',
    minAPS: null,
  },

  {
    id: 'm2m',
    name: 'Matrics to Masters — unverified listing',
    provider: 'Department of Higher Education and Training',
    tier: 'Student loans',
    amount: 'Not confirmed',
    deadline: null,
    applicationStatus: 'unverified',
    eligibility: ['Not confirmed'],
    url: 'https://www.dhet.gov.za/',
    deadlineSourceUrl: 'https://www.dhet.gov.za/',
    logoKey: 'dhet',
    description:
      'A current official government scheme under the exact title “Matrics to Masters” could not be verified.',
    deadlineNote:
      'Verify the scheme’s exact official name and application call before showing this as a real funding opportunity.',
    minAPS: null,
  },

  {
    id: 'funza-lushaka',
    name: 'Funza Lushaka Bursary (2027)',
    provider: 'Department of Basic Education',
    tier: 'Bursaries',
    amount: 'As specified by the official bursary scheme',
    deadline: '2027-01-31',
    applicationStatus: 'open',
    eligibility: [
      'South African citizen',
      'Committed to teaching',
      'First-time applicants must be 30 years old or younger',
    ],
    url: 'https://www.funzalushaka.doe.gov.za/',
    deadlineSourceUrl: 'https://www.funzalushaka.doe.gov.za/',
    logoKey: 'dbe',
    description:
      'Bursary for eligible students who commit to teaching at a public school after graduation.',
    deadlineNote:
      'Official portal states that new 2027 applications close on 31 January 2027. Re-applications for existing/returning bursars close on 30 November 2026.',
    minAPS: null,
  },

  {
    id: 'nrf-postgrad',
    name: 'DSTI-NRF Master’s and Doctoral Funding (2027)',
    provider: 'National Research Foundation',
    tier: 'Scholarships',
    amount:
      'Varies by funding category and full/partial cost-of-study status',
    deadline: '2026-07-03',
    applicationStatus: 'closed',
    eligibility: [
      'Master’s or Doctoral candidates',
      'Meet NRF academic, citizenship/residency and funding criteria',
    ],
    url: 'https://www.nrf.ac.za/dsti-nrf-postgraduate-student-funding-for-the-2027-academic-year/',
    deadlineSourceUrl:
      'https://www.nrf.ac.za/dsti-nrf-postgraduate-student-funding-for-the-2027-academic-year/',
    logoKey: 'nrf',
    description:
      'The official DSTI-NRF 2027 Master’s and Doctoral funding call uses the NRF Connect system and has closed for first-time student applications.',
    deadlineNote:
      'The student closing date for first-time Master’s and Doctoral applications was 3 July 2026. The separate NRF Honours General call closes on 23 November 2026; see the nrf-honours record.',
    minAPS: null,
  },

  {
    id: 'nrf-honours',
    name: 'DSTI-NRF Honours General Funding (2027)',
    provider: 'National Research Foundation',
    tier: 'Scholarships',
    amount:
      'Depends on the NRF funding framework and award category',
    deadline: '2026-11-23',
    applicationStatus: 'open',
    eligibility: [
      'Honours applicants',
      'At least 65% for major subjects in the final year, subject to the official funding guide',
      'Meet NRF funding criteria',
    ],
    url: 'https://www.nrf.ac.za/announcement-of-call-dsti-nrf-honours-student-funding-for-the-academic-year-2027/',
    deadlineSourceUrl:
      'https://www.nrf.ac.za/announcement-of-call-dsti-nrf-honours-student-funding-for-the-academic-year-2027/',
    logoKey: 'nrf',
    description:
      'Separate 2027 NRF Honours funding call for eligible Honours candidates.',
    deadlineNote:
      'Official applicant closing date is 23 November 2026. Applicants requiring ISFAP assessment had an earlier date; check the call documents.',
    minAPS: null,
  },

  {
    id: 'anglo-bursary',
    name: 'Anglo American Bursary',
    provider: 'Anglo American',
    tier: 'Bursaries',
    amount: 'Confirm amount in the relevant business-unit advert',
    deadline: null,
    applicationStatus: 'not-announced',
    eligibility: [
      'South African citizen',
      'Field of study depends on the advertised business-unit bursary',
    ],
    url: 'https://www.angloamerican.com/careers',
    deadlineSourceUrl: 'https://www.angloamerican.com/careers',
    logoKey: 'anglo',
    description:
      'South African bursary opportunities may be advertised by individual Anglo American business units rather than through one central call.',
    deadlineNote:
      'A 2027 closing date was not confirmed on the official page during this check. Verify the relevant business unit and its current advert.',
    minAPS: null,
  },

  {
    id: 'investec-bursary',
    name: 'Investec Bursary Programme (2027)',
    provider: 'Investec',
    tier: 'Bursaries',
    amount: 'Confirm support and conditions in the programme terms',
    deadline: '2026-09-30',
    applicationStatus: 'closed',
    eligibility: [
      'Check the official high-school or tertiary bursary programme criteria',
    ],
    url: 'https://www.investec.com/en_za/welcome-to-investec/sustainability/our-community/bursaries.html',
    deadlineSourceUrl:
      'https://www.investec.com/en_za/welcome-to-investec/sustainability/our-community/bursaries.html',
    logoKey: 'investec',
    description:
      'Investec’s official page lists the 2027 High School and Tertiary Bursary Programme.',
    deadlineNote:
      'Official page states that applications for the 2027 High School and Tertiary Bursary Programme closed on 30 September 2026.',
    minAPS: null,
  },

  {
    id: 'standard-bank-bursary',
    name: 'Standard Bank Group Bursary (2027)',
    provider: 'Standard Bank',
    tier: 'Bursaries',
    amount:
      'May cover tuition, textbooks, accommodation and other support, subject to award terms',
    deadline: '2026-09-30',
    applicationStatus: 'closed',
    eligibility: [
      'South African citizen',
      'Average of 65% or above in latest examinations',
      'Meet the official study-level and field-of-study criteria',
    ],
    url: 'https://www.standardbank.com/sbg/standard-bank-group/careers/students-and-graduates/bursaries',
    deadlineSourceUrl:
      'https://www.standardbank.com/sbg/standard-bank-group/careers/students-and-graduates/bursaries',
    logoKey: 'standardbank',
    description:
      'Standard Bank Group supports selected undergraduate and postgraduate study in priority fields.',
    deadlineNote:
      'Official page says applications generally open in June and close at the end of September each year. The 2026 window has passed as of this check.',
    minAPS: null,
  },

  {
    id: 'discovery-bursary',
    name: 'Discovery Foundation Awards (2027)',
    provider: 'Discovery Foundation',
    tier: 'Scholarships',
    amount: 'Varies by award category',
    deadline: '2026-10-30',
    applicationStatus: 'open',
    eligibility: [
      'Award-specific; includes academic medicine, subspecialist development and healthcare in rural or underserved areas',
    ],
    url: 'https://www.discovery.co.za/corporate/discovery-foundation-awards',
    deadlineSourceUrl:
      'https://www.discovery.co.za/corporate/discovery-foundation-awards',
    logoKey: 'discovery',
    description:
      'The Discovery Foundation lists several 2027 healthcare awards rather than one general undergraduate bursary.',
    deadlineNote:
      'The Academic Fellowship and Sub-specialist Awards close on 30 October 2026. Several awards for healthcare in rural/underserved areas close on 15 January 2027. Check the specific award before applying.',
    minAPS: null,
  },

  {
    id: 'eskom-bursary',
    name: 'Eskom Bursary Scheme (2027 intake)',
    provider: 'Eskom',
    tier: 'Bursaries',
    amount: 'Depends on the advertised bursary stream',
    deadline: '2026-09-22',
    applicationStatus: 'closed',
    eligibility: [
      'South African citizen',
      'Eligibility depends on the engineering or non-technical bursary stream',
    ],
    url: 'https://www.eskom.co.za/careers/',
    deadlineSourceUrl:
      'https://www.ufs.ac.za/kovsielife/unlisted/bursaries/outside-bursaries',
    logoKey: 'eskom',
    description:
      'Eskom advertised several 2027-intake bursary streams for Grade 12 applicants and current students.',
    deadlineNote:
      'Published university listings of Eskom’s 2027 intake adverts show a closing date of 22 September 2026. Check the official Eskom careers page for the next intake.',
    minAPS: null,
  },

  {
    id: 'transnet-bursary',
    name: 'Transnet Bursary',
    provider: 'Transnet',
    tier: 'Bursaries',
    amount: 'Varies by bursary stream',
    deadline: null,
    applicationStatus: 'needs-verification',
    eligibility: [
      'South African citizen',
      'Check the specific Transnet bursary advert',
    ],
    url: 'https://bursaryconnect.transnet.net/',
    deadlineSourceUrl: 'https://www.transnet.net/getFile.ashx?id=5977',
    logoKey: 'transnet',
    description:
      'Transnet has an official bursary portal. The currently accessible official form found during this check is from an earlier cycle, so a 2027 deadline could not be confirmed.',
    deadlineNote:
      'Some third-party listings claim a 6 October 2026 closing date, but I could not verify that date against a current official 2027 advert. Treat the deadline as unconfirmed until the official portal confirms it.',
    minAPS: null,
  },

  {
    id: 'sasria-bursary',
    name: 'Sasria Bursary',
    provider: 'Sasria',
    tier: 'Bursaries',
    amount: 'Confirm amount in the relevant annual advert',
    deadline: null,
    applicationStatus: 'not-announced',
    eligibility: ['Check the next official bursary advert'],
    url: 'https://sasria.co.za/bursary-form-2026/',
    deadlineSourceUrl: 'https://sasria.co.za/bursary-form-2026/',
    logoKey: 'sasria',
    description:
      'Sasria’s official page says its 2026 bursary applications are closed; a 2027 closing date was not found.',
    deadlineNote:
      'No confirmed 2027 deadline found on the official page as of 26 October 2026.',
    minAPS: null,
  },

  {
    id: 'dhet-tvet-bursary',
    name: 'DHET TVET Bursary — check NSFAS route',
    provider: 'Department of Higher Education and Training',
    tier: 'NSFAS',
    amount: 'Depends on the verified funding route',
    deadline: null,
    applicationStatus: 'needs-verification',
    eligibility: [
      'Public TVET college students should check NSFAS funding criteria',
    ],
    url: 'https://www.nsfas.org.za/content/how-to-apply.html',
    deadlineSourceUrl:
      'https://www.nsfas.org.za/content/how-to-apply.html',
    logoKey: 'dhet',
    description:
      'A separate general DHET TVET bursary with its own 2027 deadline was not verified. NSFAS’s 2027 application covers eligible students at public TVET colleges.',
    deadlineNote:
      'Do not treat this as a separate confirmed award. For general public-TVET funding, use the NSFAS opportunity above, which closes 31 October 2026.',
    minAPS: null,
  },

  {
    id: 'sita-seta',
    name: 'SITA Youth Development / Learnership Opportunities',
    provider: 'State Information Technology Agency',
    tier: 'SETA',
    amount:
      'Programme-specific; confirm stipend and training terms in the advert',
    deadline: null,
    applicationStatus: 'advert-specific',
    eligibility: [
      'South African youth aged 18–35 for applicable learnerships',
      'Matric or other requirements stated in the advert',
    ],
    url: 'https://www.sita.co.za/content/youth-development-programme',
    deadlineSourceUrl:
      'https://www.sita.co.za/content/youth-development-programme',
    logoKey: 'sita',
    description:
      'SITA says programme invitations are advertised and that each advert specifies its own closing date.',
    deadlineNote:
      'There is no single general deadline. Add a date only when a current official programme advert gives one.',
    minAPS: null,
  },

  {
    id: 'merSETA-learner',
    name: 'merSETA Bursary / Discretionary Grant Window',
    provider: 'merSETA',
    tier: 'SETA',
    amount:
      'Depends on the grant category and approved funding terms',
    deadline: '2026-05-29',
    applicationStatus: 'closed',
    eligibility: [
      'Eligibility and submission route depend on the specific grant window; not all funding is a direct individual application',
    ],
    url: 'https://www.merseta.org.za/grant-windows/',
    deadlineSourceUrl:
      'https://www.merseta.org.za/wp-content/uploads/2026/05/merSETA_Notice_DG-Funding-Windows_2026-27.pdf',
    logoKey: 'merseta',
    description:
      'merSETA uses defined funding windows. The official 2026/27 discretionary-grant notice lists 29 May 2026 as a closing date.',
    deadlineNote:
      '29 May 2026 applies to the cited 2026/27 discretionary-grant notice; it is not a universal deadline for every merSETA bursary. Check the grant-windows page for current calls.',
    minAPS: null,
  },

  {
    id: 'foodbev-seta',
    name: 'FoodBev SETA Bursary',
    provider: 'FoodBev Manufacturing SETA',
    tier: 'SETA',
    amount: 'Varies by bursary or scholarship call',
    deadline: null,
    applicationStatus: 'advert-specific',
    eligibility: [
      'South African citizen, permanent resident or naturalised citizen',
      'Meet the specific call requirements',
    ],
    url: 'https://foodbev.co.za/who-we-work-with/students/',
    deadlineSourceUrl:
      'https://foodbev.co.za/who-we-work-with/students/',
    logoKey: 'foodbev',
    description:
      'FoodBev SETA lists several bursaries and scholarships that can be updated annually.',
    deadlineNote:
      'No single current deadline was published on the general students page. Use the exact current opportunity advert.',
    minAPS: null,
  },

  {
    id: 'agriseta-bursary',
    name: 'AgriSETA Bursary / Learning Programmes',
    provider: 'AgriSETA',
    tier: 'SETA',
    amount: 'Depends on the approved programme and provider',
    deadline: '2026-09-15',
    applicationStatus: 'closed',
    eligibility: [
      'Agriculture-related qualification or eligible programme',
      'Applications usually go through an employer, institution or accredited provider',
    ],
    url: 'https://www.agriseta.co.za/discretionary-grant-funding/',
    deadlineSourceUrl:
      'https://www.agriseta.co.za/discretionary-grant-funding/',
    logoKey: 'agriseta',
    description:
      'AgriSETA publishes an annual application window for bursaries, internships, artisan development and related programmes.',
    deadlineNote:
      'The published annual window is 1 August–15 September; the 2026 window has closed. Confirm the relevant funding year and submit through the appropriate institution/provider, not as an individual where the rules require a provider.',
    minAPS: null,
  },

  {
    id: 'ceta-bursary',
    name: 'CETA / Thapelo Madibeng Bursary Scheme',
    provider: 'Construction Education and Training Authority',
    tier: 'SETA',
    amount: 'Confirm award terms in the specific call',
    deadline: null,
    applicationStatus: 'needs-verification',
    eligibility: [
      'Built-environment students; check the current official call',
    ],
    url: 'https://www.ceta.org.za/media/press-news/the-thapelo-madibeng-bursary-scheme',
    deadlineSourceUrl:
      'https://indicium.ceta.org.za/Pages/OnlineRegistration/OnlineBursaryRegistration.aspx',
    logoKey: 'ceta',
    description:
      'CETA has a bursary portal, but it currently reports that online applications are closed and a next-cycle deadline was not confirmed.',
    deadlineNote:
      'No confirmed 2027 closing date found. Check the official CETA bursary portal for a new call before applying.',
    minAPS: null,
  },

  {
    id: 'netcare-bursary',
    name: 'Netcare Bursary / Nursing Education Opportunities',
    provider: 'Netcare',
    tier: 'Bursaries',
    amount:
      'Programme-specific; confirm on the official education advert',
    deadline: null,
    applicationStatus: 'not-announced',
    eligibility: [
      'Nursing or other health-related study, depending on the specific programme',
    ],
    url: 'https://www.netcare.co.za/',
    deadlineSourceUrl: 'https://www.netcare.co.za/',
    logoKey: 'netcare',
    description:
      'A 2027 deadline for a general Netcare bursary was not found on a current official page during this check.',
    deadlineNote:
      'Do not assume that a nursing-college intake and an employer bursary share the same deadline. Verify the relevant programme on Netcare’s official channels.',
    minAPS: null,
  },

  {
    id: 'absa-bursary',
    name: 'Absa Bursary Programme',
    provider: 'Absa',
    tier: 'Bursaries',
    amount: 'Confirm support and conditions in the current advert',
    deadline: null,
    applicationStatus: 'not-announced',
    eligibility: [
      'South African applicant',
      'Commerce, IT, Data Science or other fields listed in the current advert',
    ],
    url: 'https://www.absa.africa/careers/',
    deadlineSourceUrl:
      'https://www.absa.africa/graduate-opportunities/',
    logoKey: 'absa',
    description:
      'Absa lists its bursary programme under graduate opportunities, but a current 2027 closing date was not confirmed.',
    deadlineNote:
      'No verified 2027 deadline found on the official Absa pages checked on 26 October 2026. Check for a new advert before applying.',
    minAPS: null,
  },
];

export const FUNDING = RAW.map((funding) => ({
  ...funding,
  lastVerified: LAST_VERIFIED,
  deadlineStatus: funding.deadline ? 'confirmed' : 'unconfirmed',
}));

export const FUNDING_BY_ID = FUNDING.reduce((acc, funding) => {
  acc[funding.id] = funding;
  return acc;
}, {});

export const FUNDING_TIERS = [
  'NSFAS',
  'Bursaries',
  'Scholarships',
  'Student loans',
  'SETA',
];

/**
 * Days until a confirmed deadline.
 * Returns Infinity when no date is confirmed.
 */
export function daysUntilDeadline(iso, today = new Date()) {
  if (!iso) return Infinity;

  const now = new Date(today);
  now.setHours(0, 0, 0, 0);

  const deadline = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(deadline.getTime())) return Infinity;

  return Math.round(
    (deadline.getTime() - now.getTime()) / DAY_MS
  );
}

/**
 * Live status based on today's date for confirmed deadlines.
 * If no deadline is confirmed, returns the record's explicit review status
 * rather than incorrectly labelling the opportunity as open.
 */
export function getFundingStatus(funding, today = new Date()) {
  if (!funding.deadline) {
    return funding.applicationStatus || 'deadline-unconfirmed';
  }

  const days = daysUntilDeadline(funding.deadline, today);

  if (days < 0) return 'closed';
  if (days === 0) return 'closing-today';

  return 'open';
}