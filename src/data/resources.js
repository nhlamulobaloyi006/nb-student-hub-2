/**
 * Study resources — past papers, revision notes, and guides.
 * All demo data with fake sizes. `type` groups for the tab filters.
 */

export const RESOURCES = [
  // Mathematics
  { id: 'math-p1-2024', title: 'Mathematics Paper 1 — Nov 2024', subject: 'Mathematics',
    type: 'Past Papers', size: '2.4 MB', year: 2024, language: 'English' },
  { id: 'math-p2-2024', title: 'Mathematics Paper 2 — Nov 2024', subject: 'Mathematics',
    type: 'Past Papers', size: '2.1 MB', year: 2024, language: 'English' },
  { id: 'math-memo-2024', title: 'Mathematics Memo Pack — 2024', subject: 'Mathematics',
    type: 'Revision', size: '4.8 MB', year: 2024, language: 'English' },
  { id: 'math-study-guide', title: 'Mathematics Study Guide (Grade 12)', subject: 'Mathematics',
    type: 'Guides', size: '6.2 MB', year: 2024, language: 'English' },
  { id: 'math-algebra-drill', title: 'Algebra Drill Book', subject: 'Mathematics',
    type: 'Revision', size: '1.8 MB', year: 2023, language: 'English' },

  // Mathematical Literacy
  { id: 'mlit-p1-2024', title: 'Mathematical Literacy Paper 1 — 2024', subject: 'Mathematical Literacy',
    type: 'Past Papers', size: '1.6 MB', year: 2024, language: 'English' },
  { id: 'mlit-p2-2024', title: 'Mathematical Literacy Paper 2 — 2024', subject: 'Mathematical Literacy',
    type: 'Past Papers', size: '1.7 MB', year: 2024, language: 'English' },

  // Physical Sciences
  { id: 'phys-p1-2024', title: 'Physical Sciences Paper 1 — Nov 2024', subject: 'Physical Sciences',
    type: 'Past Papers', size: '2.6 MB', year: 2024, language: 'English' },
  { id: 'phys-p2-2024', title: 'Physical Sciences Paper 2 — Nov 2024', subject: 'Physical Sciences',
    type: 'Past Papers', size: '2.8 MB', year: 2024, language: 'English' },
  { id: 'phys-memo', title: 'Physical Sciences Memo Pack', subject: 'Physical Sciences',
    type: 'Revision', size: '5.4 MB', year: 2024, language: 'English' },
  { id: 'phys-formula', title: 'Physics Formula Sheet', subject: 'Physical Sciences',
    type: 'Guides', size: '0.4 MB', year: 2024, language: 'English' },

  // Life Sciences
  { id: 'life-p1-2024', title: 'Life Sciences Paper 1 — 2024', subject: 'Life Sciences',
    type: 'Past Papers', size: '2.2 MB', year: 2024, language: 'English' },
  { id: 'life-p2-2024', title: 'Life Sciences Paper 2 — 2024', subject: 'Life Sciences',
    type: 'Past Papers', size: '2.3 MB', year: 2024, language: 'English' },
  { id: 'life-diagrams', title: 'Life Sciences Diagrams Pack', subject: 'Life Sciences',
    type: 'Revision', size: '3.6 MB', year: 2024, language: 'English' },

  // English
  { id: 'eng-hl-p1', title: 'English HL Paper 1 — 2024', subject: 'English',
    type: 'Past Papers', size: '1.4 MB', year: 2024, language: 'English' },
  { id: 'eng-hl-p2', title: 'English HL Paper 2 — 2024', subject: 'English',
    type: 'Past Papers', size: '1.5 MB', year: 2024, language: 'English' },
  { id: 'eng-hl-p3', title: 'English HL Paper 3 — 2024', subject: 'English',
    type: 'Past Papers', size: '1.2 MB', year: 2024, language: 'English' },
  { id: 'eng-essay', title: 'English Essay Writing Guide', subject: 'English',
    type: 'Guides', size: '1.1 MB', year: 2023, language: 'English' },
  { id: 'eng-poetry', title: 'English Poetry Analysis Notes', subject: 'English',
    type: 'Revision', size: '2.0 MB', year: 2024, language: 'English' },

  // Afrikaans
  { id: 'afr-hl-p1', title: 'Afrikaans HL Paper 1 — 2024', subject: 'Afrikaans',
    type: 'Past Papers', size: '1.3 MB', year: 2024, language: 'Afrikaans' },
  { id: 'afr-hl-p2', title: 'Afrikaans HL Paper 2 — 2024', subject: 'Afrikaans',
    type: 'Past Papers', size: '1.4 MB', year: 2024, language: 'Afrikaans' },

  // Accounting
  { id: 'acc-p1-2024', title: 'Accounting Paper 1 — 2024', subject: 'Accounting',
    type: 'Past Papers', size: '1.9 MB', year: 2024, language: 'English' },
  { id: 'acc-p2-2024', title: 'Accounting Paper 2 — 2024', subject: 'Accounting',
    type: 'Past Papers', size: '2.0 MB', year: 2024, language: 'English' },
  { id: 'acc-ledger', title: 'Accounting Ledger Practice Pack', subject: 'Accounting',
    type: 'Revision', size: '2.7 MB', year: 2024, language: 'English' },

  // Business Studies
  { id: 'bus-p1-2024', title: 'Business Studies Paper 1 — 2024', subject: 'Business Studies',
    type: 'Past Papers', size: '1.8 MB', year: 2024, language: 'English' },
  { id: 'bus-p2-2024', title: 'Business Studies Paper 2 — 2024', subject: 'Business Studies',
    type: 'Past Papers', size: '1.8 MB', year: 2024, language: 'English' },

  // Economics
  { id: 'econ-p1-2024', title: 'Economics Paper 1 — 2024', subject: 'Economics',
    type: 'Past Papers', size: '1.7 MB', year: 2024, language: 'English' },
  { id: 'econ-p2-2024', title: 'Economics Paper 2 — 2024', subject: 'Economics',
    type: 'Past Papers', size: '1.7 MB', year: 2024, language: 'English' },

  // History
  { id: 'hist-p1-2024', title: 'History Paper 1 — 2024', subject: 'History',
    type: 'Past Papers', size: '2.5 MB', year: 2024, language: 'English' },
  { id: 'hist-p2-2024', title: 'History Paper 2 — 2024', subject: 'History',
    type: 'Past Papers', size: '2.6 MB', year: 2024, language: 'English' },
  { id: 'hist-source', title: 'History Source-Based Skills Pack', subject: 'History',
    type: 'Revision', size: '3.1 MB', year: 2024, language: 'English' },

  // Geography
  { id: 'geo-p1-2024', title: 'Geography Paper 1 — 2024', subject: 'Geography',
    type: 'Past Papers', size: '2.3 MB', year: 2024, language: 'English' },
  { id: 'geo-p2-2024', title: 'Geography Paper 2 — 2024', subject: 'Geography',
    type: 'Past Papers', size: '2.4 MB', year: 2024, language: 'English' },
  { id: 'geo-map', title: 'Map Skills Practice Book', subject: 'Geography',
    type: 'Revision', size: '4.2 MB', year: 2024, language: 'English' },

  // EGD
  { id: 'egd-p1-2024', title: 'EGD Paper 1 — 2024', subject: 'EGD',
    type: 'Past Papers', size: '3.1 MB', year: 2024, language: 'English' },
  { id: 'egd-p2-2024', title: 'EGD Paper 2 — 2024', subject: 'EGD',
    type: 'Past Papers', size: '3.2 MB', year: 2024, language: 'English' },

  // General
  { id: 'matric-guide', title: 'Matric Finals Survival Guide', subject: 'General',
    type: 'Guides', size: '1.2 MB', year: 2024, language: 'English' },
  { id: 'study-plan', title: '8-Week Study Planner', subject: 'General',
    type: 'Guides', size: '0.6 MB', year: 2024, language: 'English' },
  { id: 'exam-stress', title: 'Managing Exam Stress', subject: 'General',
    type: 'Guides', size: '0.9 MB', year: 2024, language: 'English' },
  { id: 'study-skills', title: 'Study Skills Handbook', subject: 'General',
    type: 'Guides', size: '1.5 MB', year: 2024, language: 'English' },
];

export const RESOURCE_TYPES = ['Past Papers', 'Revision', 'Guides'];

export const RESOURCE_BY_ID = RESOURCES.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {});
