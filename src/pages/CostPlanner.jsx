import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INSTITUTIONS, INSTITUTION_BY_ID } from '../data/institutions';
import { COURSES, coursesByInstitution, COURSE_BY_ID } from '../data/courses';
import { FUNDING, daysUntilDeadline } from '../data/funding';
import { checkEligibility } from '../utils/eligibilityChecker';

import './CostPlanner.css';

/* ── Cost constants (demo data) ─────────────────────────── */
const ACCOMMODATION_OPTIONS = [
  { id: 'residence', label: 'University residence', sub: 'On-campus, shared room', yearly: 14000, icon: ResidenceIcon },
  { id: 'private',   label: 'Private accommodation', sub: 'Off-campus, shared/mono', yearly: 18000, icon: HomeIcon },
  { id: 'home',      label: 'Living at home',        sub: 'With family, commuting', yearly: 6000,  icon: FamilyIcon },
];

const OTHER_EXPENSES_DEFAULT = 5000; // books, device, data, etc.

export default function CostPlanner() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  /* ── Form state ──────────────────────────────────────── */
  const [institutionId, setInstitutionId] = useState(user?.savedEstimates?.[0]?.institutionId || '');
  const [courseId, setCourseId] = useState(user?.savedEstimates?.[0]?.courseId || '');
  const [accommodationId, setAccommodationId] = useState('residence');
  const [transport, setTransport] = useState(800);
  const [food, setFood] = useState(2500);
  const [includeBooks, setIncludeBooks] = useState(true);
  const [extraExpenses, setExtraExpenses] = useState(0);
  const [duration, setDuration] = useState('3 years');

  /* Reset course when institution changes and course no longer belongs */
  useEffect(() => {
    if (!institutionId) { setCourseId(''); return; }
    const c = COURSE_BY_ID[courseId];
    if (!c || c.universityId !== institutionId) setCourseId('');
  }, [institutionId, courseId]);

  const institution = INSTITUTION_BY_ID[institutionId] || null;
  const course = COURSE_BY_ID[courseId] || null;
  const availableCourses = institutionId ? coursesByInstitution(institutionId) : COURSES;

  /* ── Cost breakdown (computed) ───────────────────────── */
  const breakdown = useMemo(() => {
    const tuition = course?.feeEstimate || 0;
    const accommodation = ACCOMMODATION_OPTIONS.find((a) => a.id === accommodationId)?.yearly || 0;
    const foodYear = food * 12;
    const transportYear = transport * 12;
    const books = includeBooks ? 1500 : 0;
    const other = OTHER_EXPENSES_DEFAULT + Math.max(0, Number(extraExpenses) || 0);

    const total = tuition + accommodation + foodYear + transportYear + books + other;
    const rows = [
      { key: 'tuition',       label: 'Tuition fees',      amount: tuition,       tone: 'indigo' },
      { key: 'accommodation', label: 'Accommodation',     amount: accommodation, tone: 'success' },
      { key: 'food',          label: 'Food',              amount: foodYear,      tone: 'warning' },
      { key: 'transport',     label: 'Transport',         amount: transportYear, tone: 'gold' },
      { key: 'books',         label: 'Books & supplies',  amount: books,         tone: 'indigo' },
      { key: 'other',         label: 'Other expenses',    amount: other,         tone: 'gray' },
    ];

    const withPct = rows.map((r) => ({
      ...r,
      pct: total > 0 ? Math.round((r.amount / total) * 100) : 0,
    }));

    return { total, rows: withPct };
  }, [course, accommodationId, food, transport, includeBooks, extraExpenses]);

  /* ── Potential funding + gap ─────────────────────────── */
  const fundingEstimate = useMemo(() => {
    // If user's own profile suggests a strong match, higher potential.
    // Base demo assumption: NSFAS-level support (R62k) when a course is picked.
    const base = course ? 62000 : 0;
    return base;
  }, [course]);

  const gap = Math.max(0, breakdown.total - fundingEstimate);

  /* ── Related funding opportunities ───────────────────── */
  const fundingMatches = useMemo(() => {
    if (!course) return [];
    const eligible = FUNDING
      .map((f) => {
        const elig = checkEligibility({ requiredSubjects: [], minAPS: f.minAPS, name: f.name }, user);
        return { f, status: elig.status };
      })
      .filter(({ status }) => status === 'pass' || status === 'warn' || status === 'unknown')
      .slice(0, 3);
    if (eligible.length > 0) return eligible.map((x) => x.f);
    return FUNDING.slice(0, 3);
  }, [course, user]);

  /* ── Save to user.savedEstimates ────────────────────── */
  function handleSave() {
    if (!course) return;
    const estimate = {
      id: `est_${Date.now()}`,
      createdAt: new Date().toISOString(),
      institutionId,
      institutionName: institution?.name || '',
      courseId,
      courseName: course.name,
      accommodationId,
      transport,
      food,
      includeBooks,
      extraExpenses: Math.max(0, Number(extraExpenses) || 0),
      duration,
      breakdown: breakdown.rows,
      total: breakdown.total,
      potentialFunding: fundingEstimate,
      gap,
    };
    const existing = user?.savedEstimates || [];
    updateUser({ savedEstimates: [estimate, ...existing].slice(0, 5) });
  }

  function handleFindFunding() {
    if (!course) { navigate('/funding'); return; }
    navigate(`/funding?courseId=${course.id}&gap=${gap}`);
  }

  return (
    <div className="cp">
      {/* Page header */}
      <header className="cp-head">
        <nav className="cp-breadcrumb" aria-label="Breadcrumb">
          <Link to="/dashboard">Home</Link>
          <span className="cp-breadcrumb-sep">›</span>
          <span>Cost Planner</span>
        </nav>
        <h1 className="cp-title">Cost Planner</h1>
        <p className="cp-sub">
          Get an estimate of what your studies might cost and see how much funding you may need.
        </p>
      </header>

      <div className="cp-body">
        {/* ─── LEFT: INPUTS ────────────────────────────── */}
        <div className="cp-form">

          {/* Step 1 — Study details */}
          <section className="cp-card">
            <div className="cp-step-head">
              <span className="cp-step-num">1</span>
              <h2 className="cp-step-title">Your study details</h2>
            </div>

            <div className="cp-field">
              <label className="field-label" htmlFor="cp-inst">Institution</label>
              <select
                id="cp-inst"
                className="select"
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
              >
                <option value="">Select an institution…</option>
                {INSTITUTIONS.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>

            <div className="cp-field">
              <label className="field-label" htmlFor="cp-course">Course</label>
              <select
                id="cp-course"
                className="select"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                disabled={!institutionId}
              >
                <option value="">
                  {institutionId ? 'Select a course…' : 'Pick an institution first'}
                </option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {course && (
              <div className="cp-demo-note">
                <InfoIcon />
                <span>
                  Fee estimates are based on publicly available information and may not
                  reflect the exact amount. (Updated: 2025)
                </span>
              </div>
            )}
          </section>

          {/* Step 2 — Accommodation */}
          <section className="cp-card">
            <div className="cp-step-head">
              <span className="cp-step-num">2</span>
              <h2 className="cp-step-title">Accommodation</h2>
            </div>
            <div className="cp-tiles">
              {ACCOMMODATION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = accommodationId === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    className={'cp-tile' + (active ? ' is-active' : '')}
                    onClick={() => setAccommodationId(opt.id)}
                    aria-pressed={active}
                  >
                    <span className="cp-tile-radio" aria-hidden="true" />
                    <span className="cp-tile-icon"><Icon /></span>
                    <span className="cp-tile-label">{opt.label}</span>
                    <span className="cp-tile-sub">{opt.sub}</span>
                    <span className="cp-tile-price">R{opt.yearly.toLocaleString('en-ZA')} / year</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 3 — Monthly costs */}
          <section className="cp-card">
            <div className="cp-step-head">
              <span className="cp-step-num">3</span>
              <h2 className="cp-step-title">Monthly costs</h2>
            </div>

            <div className="cp-slider-row">
              <div className="cp-slider-label">
                <span>Monthly transport {accommodationId === 'home' ? '(if not living on campus)' : ''}</span>
                <span className="cp-slider-value">R{transport.toLocaleString('en-ZA')} / month</span>
              </div>
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={transport}
                onChange={(e) => setTransport(Number(e.target.value))}
                className="cp-range"
              />
              <div className="cp-slider-ends">
                <span>R0</span><span>R2 000</span>
              </div>
            </div>

            <div className="cp-slider-row">
              <div className="cp-slider-label">
                <span>Monthly food budget</span>
                <span className="cp-slider-value">R{food.toLocaleString('en-ZA')} / month</span>
              </div>
              <input
                type="range"
                min={500}
                max={3000}
                step={100}
                value={food}
                onChange={(e) => setFood(Number(e.target.value))}
                className="cp-range"
              />
              <div className="cp-slider-ends">
                <span>R500</span><span>R3 000</span>
              </div>
            </div>
          </section>

          {/* Step 4 — Extras */}
          <section className="cp-card">
            <div className="cp-step-head">
              <span className="cp-step-num">4</span>
              <h2 className="cp-step-title">Extras</h2>
            </div>

            <div className="cp-toggle-row">
              <div className="cp-toggle-text">
                <div className="cp-toggle-title">Include textbooks & supplies</div>
                <div className="cp-toggle-sub">Estimated at R1 500 per year</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={includeBooks}
                className={'cp-switch' + (includeBooks ? ' is-on' : '')}
                onClick={() => setIncludeBooks((v) => !v)}
              >
                <span className="cp-switch-dot" />
              </button>
            </div>

            <div className="cp-field">
              <label className="field-label" htmlFor="cp-extra">
                Additional study expenses (optional)
              </label>
              <div className="cp-extra-wrap">
                <span className="cp-extra-prefix">R</span>
                <input
                  id="cp-extra"
                  className="input cp-extra-input"
                  type="number"
                  min={0}
                  step={100}
                  placeholder="e.g. laptop, software, equipment"
                  value={extraExpenses || ''}
                  onChange={(e) => setExtraExpenses(e.target.value === '' ? 0 : Number(e.target.value))}
                />
              </div>
            </div>
          </section>

          {/* Step 5 — Duration */}
          <section className="cp-card">
            <div className="cp-step-head">
              <span className="cp-step-num">5</span>
              <h2 className="cp-step-title">Study duration</h2>
            </div>
            <select
              className="select"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option>1 year (Certificate)</option>
              <option>2 years (Diploma)</option>
              <option>3 years (Undergraduate)</option>
              <option>4 years (Professional / Engineering)</option>
              <option>5 years (Medicine)</option>
              <option>6 years (Medicine / Veterinary)</option>
            </select>
          </section>

          <div className="cp-source">
            Source: UJ 2025 fee information (demo data) · Last updated: 10 Oct 2025
          </div>
        </div>

        {/* ─── RIGHT: RESULT PANEL ─────────────────────── */}
        <aside className="cp-result">

          <div className="cp-result-card">
            <div className="cp-result-head">
              <div>
                <div className="cp-result-label">ESTIMATED ANNUAL COST</div>
                <div className="cp-result-big">
                  R{breakdown.total.toLocaleString('en-ZA')}
                  <span className="cp-result-per">per year</span>
                </div>
              </div>
              <div className="cp-result-badge">
                <InfoIcon />
                <span>ESTIMATE</span>
              </div>
            </div>
            <div className="cp-result-note">
              Figures are estimates and may change. Not official {institution?.shortName || 'university'} fees.
            </div>

            {/* Stacked bar */}
            <div className="cp-bar" role="img" aria-label="Cost breakdown">
              {breakdown.rows.map((r) => (
                <div
                  key={r.key}
                  className={`cp-bar-seg cp-bar-${r.tone}`}
                  style={{ width: `${r.pct}%` }}
                  title={`${r.label}: R${r.amount.toLocaleString('en-ZA')}`}
                />
              ))}
            </div>

            {/* Breakdown list */}
            <div className="cp-breakdown">
              {breakdown.rows.map((r) => (
                <div key={r.key} className="cp-breakdown-row">
                  <span className={`cp-breakdown-dot cp-bar-${r.tone}`} aria-hidden="true" />
                  <span className="cp-breakdown-label">{r.label}</span>
                  <span className="cp-breakdown-amount">R{r.amount.toLocaleString('en-ZA')}</span>
                  <span className="cp-breakdown-pct">{r.pct}%</span>
                </div>
              ))}
            </div>

            {/* Funding vs gap tiles */}
            <div className="cp-tiles-2">
              <div className="cp-tile-result cp-tile-result-green">
                <div className="cp-tile-result-label">Potential funding</div>
                <div className="cp-tile-result-big">R{fundingEstimate.toLocaleString('en-ZA')}</div>
                <div className="cp-tile-result-sub">(e.g. NSFAS + bursaries)</div>
              </div>
              <div className="cp-tile-result cp-tile-result-amber">
                <div className="cp-tile-result-label">Estimated remaining gap</div>
                <div className="cp-tile-result-big">R{gap.toLocaleString('en-ZA')}</div>
                <div className="cp-tile-result-sub">(you may need to cover this)</div>
              </div>
            </div>

            {/* Funding opportunities */}
            <div className="cp-opp-head">
              <div className="cp-opp-title">Potential funding opportunities</div>
              <Link to="/funding" className="section-link">View all</Link>
            </div>
            <div className="cp-opp-grid">
              {fundingMatches.map((f) => {
                const d = daysUntilDeadline(f.deadline);
                const urgent = d >= 0 && d <= 30;
                return (
                  <Link key={f.id} to={`/funding#${f.id}`} className="cp-opp-card">
                    <div className="cp-opp-top">
                      <span className={`badge badge-${tierTone(f.tier)}`}>{f.tier}</span>
                      <span className="cp-opp-provider">{f.provider}</span>
                    </div>
                    <div className="cp-opp-name">{f.name}</div>
                    <div className="cp-opp-amount">{f.amount}</div>
                    <div className={`cp-opp-deadline ${urgent ? 'is-urgent' : ''}`}>
                      Deadline: {formatDate(f.deadline)}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="cp-cta-row">
              <button
                type="button"
                className="btn btn-primary cp-cta-primary"
                onClick={handleFindFunding}
                disabled={!course}
              >
                <CoinIcon />
                Find funding for my estimated gap
              </button>
              <button
                type="button"
                className="btn btn-outline cp-cta-secondary"
                onClick={handleSave}
                disabled={!course}
              >
                <BookmarkIcon />
                Save estimate
              </button>
            </div>

            {!course && (
              <div className="cp-hint">
                Pick an institution and course to enable funding matches and saving.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

function tierTone(tier) {
  switch (tier) {
    case 'NSFAS':         return 'gold';
    case 'Bursaries':     return 'indigo';
    case 'Scholarships':  return 'green';
    case 'Student loans': return 'amber';
    case 'SETA':          return 'gray';
    default:              return 'gray';
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ══════════════════════════════════════════════════════════
   Icons
   ══════════════════════════════════════════════════════════ */

function iconProps(size = 16) {
  return {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
}
function ResidenceIcon() { return (<svg {...iconProps(20)}>
  <path d="M3 20h18" /><path d="M5 20V9l7-5 7 5v11" /><path d="M9.5 20v-6h5v6" />
</svg>); }
function HomeIcon() { return (<svg {...iconProps(20)}>
  <path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5V14h4v5.5" />
</svg>); }
function FamilyIcon() { return (<svg {...iconProps(20)}>
  <circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" />
  <path d="M3 19c.6-3 3-4.6 6-4.6s5.4 1.6 6 4.6" /><path d="M14.5 19c.4-2.2 2-3.4 4-3.4s3.6 1.2 4 3.4" />
</svg>); }
function InfoIcon() { return (<svg {...iconProps(14)}>
  <circle cx="12" cy="12" r="9.4" /><path d="M12 10.5v6" /><circle cx="12" cy="7.6" r="0.9" fill="currentColor" />
</svg>); }
function CoinIcon() { return (<svg {...iconProps(16)}>
  <circle cx="12" cy="12" r="8.4" />
  <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
  <path d="M12 6.6v10.8" />
</svg>); }
function BookmarkIcon() { return (<svg {...iconProps(16)}>
  <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.6L6 20V5a1 1 0 0 1 1-1z" />
</svg>); }
