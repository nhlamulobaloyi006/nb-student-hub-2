/**
 * Courses across all institutions.
 * `feeEstimate` is annual ZAR for planning (not official).
 * `requiredSubjects` uses subject label fragments matched loosely —
 *   e.g. 'Mathematics' matches 'Mathematics' and 'Technical Mathematics'.
 */

export const COURSES = [
  // ── UJ ─────────────────────────────────────
  { id: 'uj-bsc-cs', name: 'BSc Computer Science', universityId: 'uj', university: 'University of Johannesburg',
    tier: 'University', duration: '3 years', faculty: 'Science', minAPS: 32, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'English (5)', 'Life Orientation (6)'],
    streamRequired: 'science', interestTags: ['technology', 'computers', 'research'],
    feeEstimate: 42400,
    description: 'Foundations in programming, algorithms and systems design. Strong pathway to software engineering and data science careers.' },

  { id: 'uj-bcom-acc', name: 'BCom Accounting', universityId: 'uj', university: 'University of Johannesburg',
    tier: 'University', duration: '3 years', faculty: 'Commerce', minAPS: 32, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'English (5)'],
    streamRequired: 'commerce', interestTags: ['finance', 'business', 'entrepreneurship'],
    feeEstimate: 40900,
    description: 'Pathway to CA(SA) accreditation. Covers financial accounting, auditing, taxation and managerial accounting.' },

  { id: 'uj-beng-civil', name: 'BEng Civil Engineering', universityId: 'uj', university: 'University of Johannesburg',
    tier: 'University', duration: '4 years', faculty: 'Engineering', minAPS: 36, maxAPS: 42,
    requiredSubjects: ['Mathematics (5)', 'Physical Sciences (5)', 'English (5)'],
    streamRequired: 'science', interestTags: ['engineering', 'environment'],
    feeEstimate: 51200,
    description: 'Designing and building infrastructure — roads, bridges, water systems. ECSA-accredited pathway.' },

  { id: 'uj-ba-psych', name: 'BA Psychology', universityId: 'uj', university: 'University of Johannesburg',
    tier: 'University', duration: '3 years', faculty: 'Humanities', minAPS: 28, maxAPS: 42,
    requiredSubjects: ['English (5)', 'Life Orientation (5)'],
    streamRequired: 'humanities', interestTags: ['psychology', 'healthcare', 'social-work'],
    feeEstimate: 37200,
    description: 'Understanding human behaviour, cognition and mental health. Pathway to honours and professional psychology.' },

  { id: 'uj-bcom-is', name: 'BCom Information Systems', universityId: 'uj', university: 'University of Johannesburg',
    tier: 'University', duration: '3 years', faculty: 'Commerce', minAPS: 30, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'English (5)'],
    streamRequired: 'commerce', interestTags: ['technology', 'business', 'computers'],
    feeEstimate: 41700,
    description: 'Bridging business and technology. Covers systems analysis, databases, and enterprise architecture.' },

  // ── Wits ───────────────────────────────────
  { id: 'wits-bsc-eng', name: 'BSc Engineering (Electrical)', universityId: 'wits', university: 'University of the Witwatersrand',
    tier: 'University', duration: '4 years', faculty: 'Engineering', minAPS: 38, maxAPS: 42,
    requiredSubjects: ['Mathematics (6)', 'Physical Sciences (6)', 'English (5)'],
    streamRequired: 'science', interestTags: ['engineering', 'technology', 'computers'],
    feeEstimate: 58900,
    description: 'Power systems, electronics, control and communications. Highly competitive entry.' },

  { id: 'wits-mbbch', name: 'MBBCh Medicine', universityId: 'wits', university: 'University of the Witwatersrand',
    tier: 'University', duration: '6 years', faculty: 'Health Sciences', minAPS: 42, maxAPS: 42,
    requiredSubjects: ['Mathematics (6)', 'Physical Sciences (6)', 'English (6)', 'Life Sciences (6)'],
    streamRequired: 'science', interestTags: ['healthcare', 'research'],
    feeEstimate: 78500,
    description: 'Full medical degree. Requires NBT and exceptional academic record. Very limited seats.' },

  { id: 'wits-bcom-law', name: 'BCom Law', universityId: 'wits', university: 'University of the Witwatersrand',
    tier: 'University', duration: '3 years', faculty: 'Commerce, Law & Management', minAPS: 38, maxAPS: 42,
    requiredSubjects: ['Mathematics (5)', 'English (6)'],
    streamRequired: 'commerce', interestTags: ['law', 'finance', 'business'],
    feeEstimate: 51200,
    description: 'Combines commercial and legal foundations. Pathway to LLB or corporate law practice.' },

  { id: 'wits-ba-media', name: 'BA Media Studies', universityId: 'wits', university: 'University of the Witwatersrand',
    tier: 'University', duration: '3 years', faculty: 'Humanities', minAPS: 34, maxAPS: 42,
    requiredSubjects: ['English (6)'],
    streamRequired: 'humanities', interestTags: ['media', 'writing', 'design'],
    feeEstimate: 44500,
    description: 'Critical study of media, journalism and communication in the digital age.' },

  { id: 'wits-bsc-actuarial', name: 'BSc Actuarial Science', universityId: 'wits', university: 'University of the Witwatersrand',
    tier: 'University', duration: '3 years', faculty: 'Science', minAPS: 40, maxAPS: 42,
    requiredSubjects: ['Mathematics (7)', 'English (5)'],
    streamRequired: 'science', interestTags: ['finance', 'research', 'technology'],
    feeEstimate: 49200,
    description: 'Mathematical modelling of risk. Elite entry bar; pathway to actuarial fellowship.' },

  // ── UCT ────────────────────────────────────
  { id: 'uct-bsc-cs', name: 'BSc Computer Science', universityId: 'uct', university: 'University of Cape Town',
    tier: 'University', duration: '3 years', faculty: 'Science', minAPS: 38, maxAPS: 42,
    requiredSubjects: ['Mathematics (6)', 'English (5)'],
    streamRequired: 'science', interestTags: ['technology', 'computers', 'research'],
    feeEstimate: 58200,
    description: 'One of the top CS programmes in Africa. Strong in machine learning, algorithms and systems.' },

  { id: 'uct-bcom-fin', name: 'BCom Finance', universityId: 'uct', university: 'University of Cape Town',
    tier: 'University', duration: '3 years', faculty: 'Commerce', minAPS: 37, maxAPS: 42,
    requiredSubjects: ['Mathematics (5)', 'English (5)'],
    streamRequired: 'commerce', interestTags: ['finance', 'business'],
    feeEstimate: 54900,
    description: 'Corporate finance, investments and financial markets. Strong CFA and banking pipeline.' },

  { id: 'uct-mbbch', name: 'MBBCh Medicine', universityId: 'uct', university: 'University of Cape Town',
    tier: 'University', duration: '6 years', faculty: 'Health Sciences', minAPS: 42, maxAPS: 42,
    requiredSubjects: ['Mathematics (6)', 'Physical Sciences (6)', 'English (6)', 'Life Sciences (6)'],
    streamRequired: 'science', interestTags: ['healthcare', 'research'],
    feeEstimate: 82100,
    description: 'Globally ranked medical degree. Requires NBT and excellent NSC results.' },

  { id: 'uct-ba-ppp', name: 'BA Politics, Philosophy & Economics', universityId: 'uct', university: 'University of Cape Town',
    tier: 'University', duration: '3 years', faculty: 'Humanities', minAPS: 36, maxAPS: 42,
    requiredSubjects: ['English (6)', 'Mathematics (5)'],
    streamRequired: 'humanities', interestTags: ['government', 'research', 'writing'],
    feeEstimate: 52400,
    description: 'Interdisciplinary PPE degree. Pathway to policy, law, journalism and public service.' },

  { id: 'uct-beng-mech', name: 'BSc Engineering (Mechanical)', universityId: 'uct', university: 'University of Cape Town',
    tier: 'University', duration: '4 years', faculty: 'Engineering & the Built Environment', minAPS: 40, maxAPS: 42,
    requiredSubjects: ['Mathematics (6)', 'Physical Sciences (6)', 'English (5)'],
    streamRequired: 'science', interestTags: ['engineering', 'technology'],
    feeEstimate: 61300,
    description: 'Thermodynamics, mechanics, design and manufacturing. Broad industrial applicability.' },

  // ── UP ─────────────────────────────────────
  { id: 'up-bsc-cs', name: 'BSc Computer Science', universityId: 'up', university: 'University of Pretoria',
    tier: 'University', duration: '3 years', faculty: 'Engineering, Built Environment & IT', minAPS: 34, maxAPS: 42,
    requiredSubjects: ['Mathematics (5)', 'English (5)'],
    streamRequired: 'science', interestTags: ['technology', 'computers', 'research'],
    feeEstimate: 47800,
    description: 'Strong CS programme with industry electives and honours pathway.' },

  { id: 'up-bvsc', name: 'BVSc Veterinary Science', universityId: 'up', university: 'University of Pretoria',
    tier: 'University', duration: '6 years', faculty: 'Natural & Agricultural Sciences', minAPS: 42, maxAPS: 42,
    requiredSubjects: ['Mathematics (6)', 'Physical Sciences (6)', 'Life Sciences (6)', 'English (5)'],
    streamRequired: 'science', interestTags: ['healthcare', 'environment', 'research'],
    feeEstimate: 68700,
    description: 'The only veterinary science programme in South Africa. Extremely competitive.' },

  { id: 'up-bcom-acc', name: 'BCom Accounting Sciences', universityId: 'up', university: 'University of Pretoria',
    tier: 'University', duration: '3 years', faculty: 'Economic & Management Sciences', minAPS: 34, maxAPS: 42,
    requiredSubjects: ['Mathematics (5)', 'English (5)'],
    streamRequired: 'commerce', interestTags: ['finance', 'business'],
    feeEstimate: 46500,
    description: 'CA(SA) accredited. Rigorous accounting, auditing and taxation curriculum.' },

  { id: 'up-beng-chem', name: 'BEng Chemical Engineering', universityId: 'up', university: 'University of Pretoria',
    tier: 'University', duration: '4 years', faculty: 'Engineering, Built Environment & IT', minAPS: 38, maxAPS: 42,
    requiredSubjects: ['Mathematics (6)', 'Physical Sciences (6)', 'English (5)'],
    streamRequired: 'science', interestTags: ['engineering', 'environment'],
    feeEstimate: 55200,
    description: 'Process design, petrochemicals, mining and manufacturing. ECSA-accredited.' },

  { id: 'up-ba-law', name: 'BA Law', universityId: 'up', university: 'University of Pretoria',
    tier: 'University', duration: '3 years', faculty: 'Law', minAPS: 36, maxAPS: 42,
    requiredSubjects: ['English (6)'],
    streamRequired: 'humanities', interestTags: ['law', 'government'],
    feeEstimate: 44100,
    description: 'Foundations in legal theory with humanities breadth. Pathway to LLB.' },

  // ── TUT ────────────────────────────────────
  { id: 'tut-dip-it', name: 'Diploma in Information Technology', universityId: 'tut', university: 'Tshwane University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'ICT', minAPS: 26, maxAPS: 42,
    requiredSubjects: ['Mathematics (3)', 'English (3)'],
    streamRequired: 'science', interestTags: ['technology', 'computers'],
    feeEstimate: 32400,
    description: 'Applied IT diploma — software development, networks and support.' },

  { id: 'tut-dip-eng-mech', name: 'Diploma in Mechanical Engineering', universityId: 'tut', university: 'Tshwane University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Engineering & the Built Environment', minAPS: 28, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'Physical Sciences (4)', 'English (3)'],
    streamRequired: 'science', interestTags: ['engineering'],
    feeEstimate: 36700,
    description: 'Hands-on mechanical engineering diploma. Strong industry placement.' },

  { id: 'tut-dip-acc', name: 'Diploma in Accounting', universityId: 'tut', university: 'Tshwane University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Economics & Finance', minAPS: 26, maxAPS: 42,
    requiredSubjects: ['Mathematics (3)', 'English (3)'],
    streamRequired: 'commerce', interestTags: ['finance', 'business'],
    feeEstimate: 31200,
    description: 'Practical accounting diploma leading to professional body recognition.' },

  { id: 'tut-dip-hospitality', name: 'Diploma in Hospitality Management', universityId: 'tut', university: 'Tshwane University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Management Sciences', minAPS: 24, maxAPS: 42,
    requiredSubjects: ['English (3)'],
    streamRequired: 'commerce', interestTags: ['business', 'entrepreneurship'],
    feeEstimate: 33800,
    description: 'Hotel, tourism and events management. Includes work-integrated learning.' },

  { id: 'tut-btech-journalism', name: 'Diploma in Journalism', universityId: 'tut', university: 'Tshwane University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Humanities', minAPS: 28, maxAPS: 42,
    requiredSubjects: ['English (4)'],
    streamRequired: 'humanities', interestTags: ['media', 'writing'],
    feeEstimate: 34100,
    description: 'Practical journalism — reporting, editing, digital media production.' },

  // ── DUT ────────────────────────────────────
  { id: 'dut-bsc-cs', name: 'BSc Computer Science', universityId: 'dut', university: 'Durban University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Applied Sciences', minAPS: 30, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'English (4)'],
    streamRequired: 'science', interestTags: ['technology', 'computers'],
    feeEstimate: 38900,
    description: 'CS degree with applied focus on software engineering and systems.' },

  { id: 'dut-dip-eng-elec', name: 'Diploma in Electrical Engineering', universityId: 'dut', university: 'Durban University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Engineering & the Built Environment', minAPS: 28, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'Physical Sciences (4)', 'English (3)'],
    streamRequired: 'science', interestTags: ['engineering'],
    feeEstimate: 37200,
    description: 'Power, control and electronics engineering diploma.' },

  { id: 'dut-dip-graphic', name: 'Diploma in Graphic Design', universityId: 'dut', university: 'Durban University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Arts & Design', minAPS: 26, maxAPS: 42,
    requiredSubjects: ['English (4)'],
    streamRequired: 'arts', interestTags: ['design', 'arts'],
    feeEstimate: 35500,
    description: 'Visual communication, branding and digital design practice.' },

  { id: 'dut-dip-nursing', name: 'Diploma in Nursing', universityId: 'dut', university: 'Durban University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Health Sciences', minAPS: 30, maxAPS: 42,
    requiredSubjects: ['Mathematics (3)', 'Life Sciences (4)', 'English (4)'],
    streamRequired: 'science', interestTags: ['healthcare', 'social-work'],
    feeEstimate: 39600,
    description: 'Professional nursing diploma. Registration with SANC on completion.' },

  { id: 'dut-dip-hospitality', name: 'Diploma in Hospitality & Tourism', universityId: 'dut', university: 'Durban University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Management Sciences', minAPS: 24, maxAPS: 42,
    requiredSubjects: ['English (3)'],
    streamRequired: 'commerce', interestTags: ['business', 'entrepreneurship'],
    feeEstimate: 33400,
    description: 'Tourism operations, event management and hospitality business skills.' },

  // ── CPUT ───────────────────────────────────
  { id: 'cput-beng-chem', name: 'BEng Tech Chemical Engineering', universityId: 'cput', university: 'Cape Peninsula University of Technology',
    tier: 'University of Technology', duration: '4 years', faculty: 'Engineering & the Built Environment', minAPS: 34, maxAPS: 42,
    requiredSubjects: ['Mathematics (5)', 'Physical Sciences (5)', 'English (4)'],
    streamRequired: 'science', interestTags: ['engineering', 'environment'],
    feeEstimate: 44800,
    description: 'Process engineering with strong petrochemical and food industry links.' },

  { id: 'cput-dip-it', name: 'Diploma in ICT', universityId: 'cput', university: 'Cape Peninsula University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Informatics & Design', minAPS: 28, maxAPS: 42,
    requiredSubjects: ['Mathematics (3)', 'English (3)'],
    streamRequired: 'science', interestTags: ['technology', 'computers'],
    feeEstimate: 34600,
    description: 'Software development, networking and multimedia applications.' },

  { id: 'cput-dip-design', name: 'Diploma in Fashion Design', universityId: 'cput', university: 'Cape Peninsula University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Informatics & Design', minAPS: 26, maxAPS: 42,
    requiredSubjects: ['English (4)'],
    streamRequired: 'arts', interestTags: ['design', 'arts'],
    feeEstimate: 33100,
    description: 'Pattern-making, garment construction and fashion business.' },

  { id: 'cput-btech-foodtech', name: 'BTech Food Technology', universityId: 'cput', university: 'Cape Peninsula University of Technology',
    tier: 'University of Technology', duration: '4 years', faculty: 'Applied Sciences', minAPS: 30, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'Physical Sciences (4)', 'English (4)'],
    streamRequired: 'science', interestTags: ['research', 'environment', 'healthcare'],
    feeEstimate: 40900,
    description: 'Food processing, quality assurance and product development.' },

  { id: 'cput-dip-tourism', name: 'Diploma in Tourism Management', universityId: 'cput', university: 'Cape Peninsula University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Business & Management Sciences', minAPS: 24, maxAPS: 42,
    requiredSubjects: ['English (3)'],
    streamRequired: 'commerce', interestTags: ['business', 'entrepreneurship'],
    feeEstimate: 32400,
    description: 'Destination management, tour operations and travel technology.' },

  // ── VUT ────────────────────────────────────
  { id: 'vut-dip-eng-mech', name: 'Diploma in Mechanical Engineering', universityId: 'vut', university: 'Vaal University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Engineering & Technology', minAPS: 28, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'Physical Sciences (3)', 'English (3)'],
    streamRequired: 'science', interestTags: ['engineering'],
    feeEstimate: 33800,
    description: 'Mechanical engineering diploma with industry placements.' },

  { id: 'vut-dip-acc', name: 'Diploma in Cost & Management Accounting', universityId: 'vut', university: 'Vaal University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Management Sciences', minAPS: 26, maxAPS: 42,
    requiredSubjects: ['Mathematics (3)', 'English (3)'],
    streamRequired: 'commerce', interestTags: ['finance', 'business'],
    feeEstimate: 31200,
    description: 'Management accounting focus. CIMA pathway available.' },

  { id: 'vut-dip-it', name: 'Diploma in Information Technology', universityId: 'vut', university: 'Vaal University of Technology',
    tier: 'University of Technology', duration: '3 years', faculty: 'Applied & Computer Sciences', minAPS: 26, maxAPS: 42,
    requiredSubjects: ['Mathematics (3)', 'English (3)'],
    streamRequired: 'science', interestTags: ['technology', 'computers'],
    feeEstimate: 32900,
    description: 'Software development and systems support diploma.' },

  // ── NWU ────────────────────────────────────
  { id: 'nwu-bsc-cs', name: 'BSc Computer Science', universityId: 'nwu', university: 'North-West University',
    tier: 'University', duration: '3 years', faculty: 'Natural & Agricultural Sciences', minAPS: 32, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'English (4)'],
    streamRequired: 'science', interestTags: ['technology', 'computers', 'research'],
    feeEstimate: 43200,
    description: 'CS degree with strong focus on software systems and data.' },

  { id: 'nwu-bpharm', name: 'Bachelor of Pharmacy', universityId: 'nwu', university: 'North-West University',
    tier: 'University', duration: '4 years', faculty: 'Health Sciences', minAPS: 38, maxAPS: 42,
    requiredSubjects: ['Mathematics (5)', 'Physical Sciences (5)', 'Life Sciences (5)', 'English (5)'],
    streamRequired: 'science', interestTags: ['healthcare', 'research'],
    feeEstimate: 52300,
    description: 'Pharmacist registration pathway. Strong chemistry and pharmacology content.' },

  { id: 'nwu-bed-foundation', name: 'BEd Foundation Phase', universityId: 'nwu', university: 'North-West University',
    tier: 'University', duration: '4 years', faculty: 'Education', minAPS: 30, maxAPS: 42,
    requiredSubjects: ['English (4)'],
    streamRequired: 'humanities', interestTags: ['teaching', 'social-work'],
    feeEstimate: 38900,
    description: 'Foundation phase teacher training (Grade R–3).' },

  { id: 'nwu-bcom-man', name: 'BCom Management Sciences', universityId: 'nwu', university: 'North-West University',
    tier: 'University', duration: '3 years', faculty: 'Economic & Management Sciences', minAPS: 30, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'English (4)'],
    streamRequired: 'commerce', interestTags: ['business', 'entrepreneurship'],
    feeEstimate: 41200,
    description: 'Broad management degree with majors in strategy, HR and marketing.' },

  { id: 'nwu-ba-psych', name: 'BA Psychology', universityId: 'nwu', university: 'North-West University',
    tier: 'University', duration: '3 years', faculty: 'Humanities', minAPS: 28, maxAPS: 42,
    requiredSubjects: ['English (4)'],
    streamRequired: 'humanities', interestTags: ['psychology', 'social-work'],
    feeEstimate: 36200,
    description: 'Psychology major with honours and professional pathway options.' },

  // ── UFS ────────────────────────────────────
  { id: 'ufs-mbchb', name: 'MBChB Medicine', universityId: 'ufs', university: 'University of the Free State',
    tier: 'University', duration: '5 years', faculty: 'Health Sciences', minAPS: 40, maxAPS: 42,
    requiredSubjects: ['Mathematics (5)', 'Physical Sciences (5)', 'Life Sciences (5)', 'English (5)'],
    streamRequired: 'science', interestTags: ['healthcare', 'research'],
    feeEstimate: 68900,
    description: 'Five-year medical degree. Strong rural health focus.' },

  { id: 'ufs-bsc-agri', name: 'BSc Agriculture', universityId: 'ufs', university: 'University of the Free State',
    tier: 'University', duration: '4 years', faculty: 'Natural & Agricultural Sciences', minAPS: 30, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'Physical Sciences (4)', 'Life Sciences (4)'],
    streamRequired: 'science', interestTags: ['environment', 'research'],
    feeEstimate: 41800,
    description: 'Agricultural sciences covering crop, animal and soil science.' },

  { id: 'ufs-ba-law', name: 'BA Law', universityId: 'ufs', university: 'University of the Free State',
    tier: 'University', duration: '3 years', faculty: 'Law', minAPS: 32, maxAPS: 42,
    requiredSubjects: ['English (5)'],
    streamRequired: 'humanities', interestTags: ['law', 'government'],
    feeEstimate: 38900,
    description: 'Pre-LLB humanities degree with strong law component.' },

  { id: 'ufs-bcom-acc', name: 'BCom Accounting', universityId: 'ufs', university: 'University of the Free State',
    tier: 'University', duration: '3 years', faculty: 'Economic & Management Sciences', minAPS: 32, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'English (4)'],
    streamRequired: 'commerce', interestTags: ['finance', 'business'],
    feeEstimate: 40200,
    description: 'SAICA-accredited accounting degree.' },

  // ── Rhodes ─────────────────────────────────
  { id: 'ru-ba-journalism', name: 'BA Journalism', universityId: 'ru', university: 'Rhodes University',
    tier: 'University', duration: '3 years', faculty: 'Humanities', minAPS: 34, maxAPS: 42,
    requiredSubjects: ['English (6)'],
    streamRequired: 'humanities', interestTags: ['media', 'writing'],
    feeEstimate: 44100,
    description: 'One of the top journalism schools in Africa. Practical and critical training.' },

  { id: 'ru-llb', name: 'LLB Law', universityId: 'ru', university: 'Rhodes University',
    tier: 'University', duration: '4 years', faculty: 'Law', minAPS: 38, maxAPS: 42,
    requiredSubjects: ['English (6)'],
    streamRequired: 'humanities', interestTags: ['law', 'government'],
    feeEstimate: 46500,
    description: 'Four-year professional LLB degree.' },

  { id: 'ru-bsc-pharm', name: 'BPharm Pharmacy', universityId: 'ru', university: 'Rhodes University',
    tier: 'University', duration: '4 years', faculty: 'Pharmacy', minAPS: 38, maxAPS: 42,
    requiredSubjects: ['Mathematics (5)', 'Physical Sciences (5)', 'Life Sciences (5)'],
    streamRequired: 'science', interestTags: ['healthcare', 'research'],
    feeEstimate: 51200,
    description: 'Pharmacist registration pathway with strong research focus.' },

  { id: 'ru-bsc-ict', name: 'BSc Information Systems', universityId: 'ru', university: 'Rhodes University',
    tier: 'University', duration: '3 years', faculty: 'Science', minAPS: 32, maxAPS: 42,
    requiredSubjects: ['Mathematics (4)', 'English (5)'],
    streamRequired: 'science', interestTags: ['technology', 'computers'],
    feeEstimate: 42300,
    description: 'IS degree blending computer science and business systems.' },

  // ── Stellenbosch ───────────────────────────
  { id: 'sun-bsc-actuarial', name: 'BSc Actuarial Science', universityId: 'sun', university: 'Stellenbosch University',
    tier: 'University', duration: '3 years', faculty: 'Science', minAPS: 40, maxAPS: 42,
    requiredSubjects: ['Mathematics (6)', 'English (5)'],
    streamRequired: 'science', interestTags: ['finance', 'research'],
    feeEstimate: 52300,
    description: 'Rigorous quantitative degree. Professional actuarial exams pathway.' },

  { id: 'sun-beng-elec', name: 'BEng Electrical Engineering', universityId: 'sun', university: 'Stellenbosch University',
    tier: 'University', duration: '4 years', faculty: 'Engineering', minAPS: 38, maxAPS: 42,
    requiredSubjects: ['Mathematics (6)', 'Physical Sciences (6)', 'English (5)'],
    streamRequired: 'science', interestTags: ['engineering', 'technology'],
    feeEstimate: 57400,
    description: 'ECSA-accredited electrical engineering degree.' },

  { id: 'sun-mbchb', name: 'MBChB Medicine', universityId: 'sun', university: 'Stellenbosch University',
    tier: 'University', duration: '6 years', faculty: 'Medicine & Health Sciences', minAPS: 42, maxAPS: 42,
    requiredSubjects: ['Mathematics (6)', 'Physical Sciences (6)', 'Life Sciences (6)', 'English (6)'],
    streamRequired: 'science', interestTags: ['healthcare', 'research'],
    feeEstimate: 76400,
    description: 'Medical degree with a strong research and rural health component.' },

  { id: 'sun-bcom-acc', name: 'BCom Accounting', universityId: 'sun', university: 'Stellenbosch University',
    tier: 'University', duration: '3 years', faculty: 'Economic & Management Sciences', minAPS: 36, maxAPS: 42,
    requiredSubjects: ['Mathematics (5)', 'English (5)'],
    streamRequired: 'commerce', interestTags: ['finance', 'business'],
    feeEstimate: 48100,
    description: 'CA(SA) accredited accounting degree.' },

  { id: 'sun-ba-ppp', name: 'BA Humanities', universityId: 'sun', university: 'Stellenbosch University',
    tier: 'University', duration: '3 years', faculty: 'Arts & Social Sciences', minAPS: 34, maxAPS: 42,
    requiredSubjects: ['English (5)'],
    streamRequired: 'humanities', interestTags: ['writing', 'research', 'government'],
    feeEstimate: 42300,
    description: 'Broad humanities degree with majors across languages, politics and philosophy.' },
  // ── Tshwane North TVET ─────────────────────
  { id: 'tvt-ncv-business', name: 'NC(V) Business Administration', universityId: 'tvt', university: 'Tshwane North TVET College',
    tier: 'TVET', duration: '3 years', faculty: 'Business Studies', minAPS: 20, maxAPS: 42,
    requiredSubjects: ['English (2)', 'Mathematics (2)'],
    streamRequired: 'commerce', interestTags: ['business', 'finance', 'entrepreneurship'],
    feeEstimate: 18500,
    description: 'National Certificate (Vocational) in Business Administration. Practical office, finance and small-business skills.' },

  { id: 'tvt-ncv-it', name: 'NC(V) Information Technology & Computer Science', universityId: 'tvt', university: 'Tshwane North TVET College',
    tier: 'TVET', duration: '3 years', faculty: 'Engineering Studies', minAPS: 22, maxAPS: 42,
    requiredSubjects: ['English (2)', 'Mathematics (2)'],
    streamRequired: 'science', interestTags: ['technology', 'computers'],
    feeEstimate: 19800,
    description: 'NC(V) IT & Computer Science — hardware, software, networks and programming fundamentals.' },

  { id: 'tvt-ncv-electrical', name: 'NC(V) Electrical Infrastructure Construction', universityId: 'tvt', university: 'Tshwane North TVET College',
    tier: 'TVET', duration: '3 years', faculty: 'Engineering Studies', minAPS: 22, maxAPS: 42,
    requiredSubjects: ['English (2)', 'Mathematics (2)', 'Physical Sciences (2)'],
    streamRequired: 'technical', interestTags: ['engineering', 'technology'],
    feeEstimate: 21000,
    description: 'Hands-on electrical infrastructure training. Pathway to artisan trades and NATED engineering.' },

  // ── False Bay TVET ─────────────────────────
  { id: 'fetc-ncv-hospitality', name: 'NC(V) Hospitality', universityId: 'fetc', university: 'False Bay TVET College',
    tier: 'TVET', duration: '3 years', faculty: 'Hospitality & Tourism', minAPS: 20, maxAPS: 42,
    requiredSubjects: ['English (2)'],
    streamRequired: 'commerce', interestTags: ['business', 'entrepreneurship'],
    feeEstimate: 22000,
    description: 'NC(V) Hospitality — food preparation, front-of-house, accommodation services and tourism.' },

  { id: 'fetc-ncv-engineering', name: 'NC(V) Engineering & Related Design', universityId: 'fetc', university: 'False Bay TVET College',
    tier: 'TVET', duration: '3 years', faculty: 'Engineering Studies', minAPS: 22, maxAPS: 42,
    requiredSubjects: ['English (2)', 'Mathematics (2)', 'Physical Sciences (2)'],
    streamRequired: 'technical', interestTags: ['engineering'],
    feeEstimate: 20500,
    description: 'NC(V) Engineering & Related Design. Fitting, turning, welding and mechanical drawing.' },

  { id: 'fetc-nated-business', name: 'NATED Business Management N4-N6', universityId: 'fetc', university: 'False Bay TVET College',
    tier: 'TVET', duration: '2 years', faculty: 'Business Studies', minAPS: 24, maxAPS: 42,
    requiredSubjects: ['English (3)'],
    streamRequired: 'commerce', interestTags: ['business', 'finance', 'entrepreneurship'],
    feeEstimate: 17500,
    description: 'NATED Report 191 Business Management. Broad business and management grounding.' },

  // ── Rosebank College ──────────────────────
  { id: 'rosebank-dip-it', name: 'IIE Diploma in Information Technology', universityId: 'rosebank', university: 'Rosebank College',
    tier: 'Private College', duration: '3 years', faculty: 'Information Technology', minAPS: 26, maxAPS: 42,
    requiredSubjects: ['English (3)', 'Mathematics (2)'],
    streamRequired: 'science', interestTags: ['technology', 'computers'],
    feeEstimate: 48500,
    description: 'IIE-accredited IT diploma — software development, networking and systems analysis.' },

  { id: 'rosebank-dip-business', name: 'IIE Diploma in Business Management', universityId: 'rosebank', university: 'Rosebank College',
    tier: 'Private College', duration: '3 years', faculty: 'Business', minAPS: 24, maxAPS: 42,
    requiredSubjects: ['English (3)'],
    streamRequired: 'commerce', interestTags: ['business', 'finance', 'entrepreneurship'],
    feeEstimate: 44500,
    description: 'IIE-accredited business management diploma. Marketing, HR, operations and finance.' },

  { id: 'rosebank-hcert-design', name: 'IIE Higher Certificate in Design', universityId: 'rosebank', university: 'Rosebank College',
    tier: 'Private College', duration: '1 year', faculty: 'Design & Arts', minAPS: 22, maxAPS: 42,
    requiredSubjects: ['English (3)'],
    streamRequired: 'arts', interestTags: ['design', 'arts'],
    feeEstimate: 36500,
    description: 'Foundation year in graphic and digital design. Pathway to the IIE design degree.' },

  // ── Varsity College ───────────────────────
  { id: 'varsity-bcom', name: 'IIE Bachelor of Commerce', universityId: 'varsity', university: 'Varsity College',
    tier: 'Private College', duration: '3 years', faculty: 'Commerce', minAPS: 30, maxAPS: 42,
    requiredSubjects: ['English (4)', 'Mathematics (3)'],
    streamRequired: 'commerce', interestTags: ['business', 'finance'],
    feeEstimate: 66500,
    description: 'IIE degree in Commerce with majors in management, marketing, finance and economics.' },

  { id: 'varsity-ba-psych', name: 'IIE Bachelor of Arts in Psychology', universityId: 'varsity', university: 'Varsity College',
    tier: 'Private College', duration: '3 years', faculty: 'Psychology & Social Sciences', minAPS: 30, maxAPS: 42,
    requiredSubjects: ['English (4)'],
    streamRequired: 'humanities', interestTags: ['psychology', 'social-work', 'research'],
    feeEstimate: 63500,
    description: 'IIE psychology degree. Pathway to honours and applied psychology careers.' },

  { id: 'varsity-hcert-it', name: 'IIE Higher Certificate in IT', universityId: 'varsity', university: 'Varsity College',
    tier: 'Private College', duration: '1 year', faculty: 'Information Technology', minAPS: 24, maxAPS: 42,
    requiredSubjects: ['English (3)'],
    streamRequired: 'science', interestTags: ['technology', 'computers'],
    feeEstimate: 42500,
    description: 'One-year IT foundation. Pathway to the IIE IT diploma or degree.' },
];


export const COURSE_BY_ID = COURSES.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

export function coursesByInstitution(universityId) {
  return COURSES.filter((c) => c.universityId === universityId);
}
