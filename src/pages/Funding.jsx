import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FUNDING, FUNDING_TIERS, daysUntilDeadline } from '../data/funding';
import { INSTITUTIONS } from '../data/institutions';
import { STREAMS } from '../data/subjects';
import { COURSE_BY_ID } from '../data/courses';
import Logo from '../components/Logo';

import './Funding.css';

const STUDY_LEVELS = [
  { id: 'TVET',          label: 'TVET' },
  { id: 'Undergraduate', label: 'Undergraduate' },
  { id: 'Postgraduate',  label: 'Postgraduate' },
];

const ELIGIBILITY_OPTS = [
  { id: 'sa-citizen',     label: 'South African citizen' },
  { id: 'financial-need', label: 'Financial need required' },
];

export default function Funding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const courseParam = searchParams.get('course') || '';
  const activeCourse = courseParam ? (COURSE_BY_ID[courseParam] || null) : null;
  const [activeTab, setActiveTab] = useState('All');
  const [filters, setFilters] = useState({
    tiers: [],
    fieldOfStudy: 'all',
    studyLevels: [],
    province: 'all',
    institutionType: 'all',
    eligibility: [],
  });

  /* Deep-link: /funding#nsfas-tvet scrolls to and highlights that card */
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const el = document.getElementById(`fund-${hash}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('is-highlighted');
      const t = setTimeout(() => el.classList.remove('is-highlighted'), 2200);
      return () => clearTimeout(t);
    }
  }, []);

  /* ── Filter logic ────────────────────────────────────── */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = FUNDING.map((f) => ({ fund: f, days: daysUntilDeadline(f.deadline) }));

    if (activeTab !== 'All') {
      list = list.filter(({ fund }) => fund.tier === activeTab);
    }
    if (q) {
      list = list.filter(({ fund }) =>
        fund.name.toLowerCase().includes(q) ||
        fund.provider.toLowerCase().includes(q) ||
        fund.description.toLowerCase().includes(q)
      );
    }
    if (filters.tiers.length > 0) {
      list = list.filter(({ fund }) => filters.tiers.includes(fund.tier));
    }
    if (filters.eligibility.includes('financial-need')) {
      list = list.filter(({ fund }) =>
        fund.eligibility.some((e) => /financial|income|need/i.test(e))
      );
    }
    if (filters.eligibility.includes('sa-citizen')) {
      list = list.filter(({ fund }) =>
        fund.eligibility.some((e) => /South African/i.test(e))
      );
    }

    list.sort((a, b) => a.days - b.days);
    return list;
  }, [query, activeTab, filters]);

  const shortlist = user?.savedItems || [];
  function toggleSaved(fundId) {
    const exists = shortlist.some((s) => s.id === fundId && s.type === 'funding');
    const next = exists
      ? shortlist.filter((s) => !(s.id === fundId && s.type === 'funding'))
      : [...shortlist, { id: fundId, type: 'funding', addedAt: new Date().toISOString() }];
    updateUser({ savedItems: next });
  }

  /* ── Ladder state ────────────────────────────────────── */
  const ladder = useMemo(() => computeLadder(user), [user]);

  function toggleLadderStep(stepId) {
    const manual = new Set(user?.fundingLadderManual || []);
    const step = ladder.steps.find((s) => s.id === stepId);
    const isDone = step.status === 'done';
    const autoDone = step.autoDone;

    // If it's auto-completed by real data, we don't allow un-checking it —
    // that would contradict reality. Navigate instead.
    if (autoDone) {
      navigate(step.to);
      return;
    }

    // Toggle the manual override
    if (isDone) manual.delete(stepId);
    else manual.add(stepId);

    updateUser({ fundingLadderManual: Array.from(manual) });
  }

  /* Tab counts */
  const tabCounts = useMemo(() => {
    const acc = { All: FUNDING.length };
    FUNDING_TIERS.forEach((t) => {
      acc[t] = FUNDING.filter((f) => f.tier === t).length;
    });
    return acc;
  }, []);

  const hasFilters =
    filters.tiers.length > 0 ||
    filters.fieldOfStudy !== 'all' ||
    filters.studyLevels.length > 0 ||
    filters.province !== 'all' ||
    filters.institutionType !== 'all' ||
    filters.eligibility.length > 0;

  function resetFilters() {
    setFilters({
      tiers: [],
      fieldOfStudy: 'all',
      studyLevels: [],
      province: 'all',
      institutionType: 'all',
      eligibility: [],
    });
    setActiveTab('All');
    setQuery('');
  }

  function toggleArr(arr, value, key) {
    const exists = arr.includes(value);
    const next = exists ? arr.filter((v) => v !== value) : [...arr, value];
    setFilters({ ...filters, [key]: next });
  }

  return (
    <div className="fn">
      <header className="fn-head">
        <div>
          <h1 className="fn-title">Funding Finder</h1>
          <p className="fn-sub">
            Discover bursaries, scholarships, loans and other funding opportunities for your studies.
          </p>
        </div>
      </header>

      {activeCourse && (
        <div className="fn-course-banner">
          <span className="fn-course-banner-icon" aria-hidden="true"><SearchIcon /></span>
          <div className="fn-course-banner-body">
            <div className="fn-course-banner-title">
              Matched to {activeCourse.name}
            </div>
            <div className="fn-course-banner-sub">
              Sorted by relevance to your course and profile.
            </div>
          </div>
          <button
            type="button"
            className="fn-course-banner-clear"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete('course');
              setSearchParams(next, { replace: true });
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Tabs + search */}
      <div className="fn-tabs-row">
        <div className="fn-tabs">
          {['All', ...FUNDING_TIERS].map((tab) => (
            <button
              key={tab}
              type="button"
              className={'fn-tab' + (activeTab === tab ? ' is-active' : '')}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="fn-tab-count">{tabCounts[tab] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="fn-search-wrap">
          <SearchIcon />
          <input
            className="fn-search"
            placeholder="Search funding opportunities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="fn-search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <XIcon />
            </button>
          )}
        </div>
      </div>

      {/* ── Funding Ladder — interactive ── */}
      <section className="fn-ladder">
        <div className="fn-ladder-head">
          <div className="fn-ladder-icon" aria-hidden="true"><LadderIcon /></div>
          <div className="fn-ladder-head-text">
            <div className="fn-ladder-title">Your Funding Ladder</div>
            <div className="fn-ladder-sub">
              Follow these 4 steps to find and apply for funding opportunities.
            </div>
          </div>
          <div className="fn-ladder-progress">
            <div className="fn-ladder-progress-value">
              {ladder.completed} / {ladder.steps.length}
            </div>
            <div className="fn-ladder-progress-label">steps done</div>
          </div>
        </div>

        <div className="fn-ladder-track" aria-hidden="true">
          <div
            className="fn-ladder-track-fill"
            style={{ width: `${(ladder.completed / ladder.steps.length) * 100}%` }}
          />
        </div>

        <ol className="fn-ladder-steps">
          {ladder.steps.map((step, i) => {
            const Icon = step.icon;
            const isDone = step.status === 'done';
            const isCurrent = step.status === 'current';
            const isNext = step.status === 'next';
            return (
              <li key={step.id} className="fn-ladder-step">
                <button
                  type="button"
                  className={
                    'fn-ladder-step-btn' +
                    (isDone ? ' is-done' : '') +
                    (isCurrent ? ' is-current' : '') +
                    (isNext ? ' is-next' : '')
                  }
                  onClick={() => toggleLadderStep(step.id)}
                  aria-pressed={isDone}
                >
                  <span className="fn-ladder-num">
                    {isDone ? <CheckIcon /> : <span>{i + 1}</span>}
                  </span>
                  <span className="fn-ladder-step-body">
                    <span className="fn-ladder-step-title">
                      <span className="fn-ladder-step-icon"><Icon /></span>
                      {step.title}
                    </span>
                    <span className="fn-ladder-step-sub">{step.sub}</span>
                  </span>
                  <span className="fn-ladder-step-arrow">
                    <MiniArrow />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {ladder.completed === ladder.steps.length && (
          <div className="fn-ladder-done">
            <TrophyIcon />
            Funding steps complete. Keep an eye on deadlines — the list below stays live.
          </div>
        )}
      </section>

      {/* Body: filters + list + help rail */}
      <div className="fn-body">
        {/* LEFT: filters */}
        <aside className="fn-filters">
          <div className="fn-filters-head">
            <div className="fn-filters-title">
              <SlidersIcon />
              Filter opportunities
            </div>
            <button
              type="button"
              className="fn-filters-reset"
              onClick={resetFilters}
              disabled={!hasFilters}
            >
              Reset
            </button>
          </div>

          <FilterSection label="Funding type">
            {FUNDING_TIERS.map((t) => (
              <CheckRow
                key={t}
                label={t}
                count={FUNDING.filter((f) => f.tier === t).length}
                checked={filters.tiers.includes(t)}
                onChange={() => toggleArr(filters.tiers, t, 'tiers')}
              />
            ))}
          </FilterSection>

          <FilterSection label="Field of study">
            <select
              className="fn-select"
              value={filters.fieldOfStudy}
              onChange={(e) => setFilters({ ...filters, fieldOfStudy: e.target.value })}
            >
              <option value="all">All fields</option>
              {STREAMS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </FilterSection>

          <FilterSection label="Study level">
            {STUDY_LEVELS.map((s) => (
              <CheckRow
                key={s.id}
                label={s.label}
                count={levelCount(s.id)}
                checked={filters.studyLevels.includes(s.id)}
                onChange={() => toggleArr(filters.studyLevels, s.id, 'studyLevels')}
              />
            ))}
          </FilterSection>

          <FilterSection label="Province">
            <select
              className="fn-select"
              value={filters.province}
              onChange={(e) => setFilters({ ...filters, province: e.target.value })}
            >
              <option value="all">All provinces</option>
              {INSTITUTIONS.map((i) => i.province).filter(unique).sort().map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </FilterSection>

          <FilterSection label="Institution type">
            <select
              className="fn-select"
              value={filters.institutionType}
              onChange={(e) => setFilters({ ...filters, institutionType: e.target.value })}
            >
              <option value="all">All institutions</option>
              <option value="University">University</option>
              <option value="University of Technology">University of Technology</option>
              <option value="TVET">TVET</option>
              <option value="Private College">Private College</option>
            </select>
          </FilterSection>

          <FilterSection label="Eligibility">
            {ELIGIBILITY_OPTS.map((e) => (
              <CheckRow
                key={e.id}
                label={e.label}
                checked={filters.eligibility.includes(e.id)}
                onChange={() => toggleArr(filters.eligibility, e.id, 'eligibility')}
              />
            ))}
          </FilterSection>

          <button type="button" className="btn btn-primary btn-block fn-apply">
            <SearchIcon />
            Apply filters
          </button>
        </aside>

        {/* CENTER: list */}
        <div className="fn-list-pane">
          <div className="fn-list-count">
            Showing {visible.length} of {FUNDING.length} opportunities
          </div>

          {visible.length === 0 ? (
            <div className="fn-empty">
              <div className="fn-empty-title">No funding opportunities match.</div>
              <div className="fn-empty-sub">
                Try adjusting the filters or clearing the search.
              </div>
            </div>
          ) : (
            <div className="fn-rows">
              {visible.map(({ fund, days }) => (
                <FundingCard
                  key={fund.id}
                  fund={fund}
                  days={days}
                  saved={shortlist.some((s) => s.id === fund.id && s.type === 'funding')}
                  onSave={() => toggleSaved(fund.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: help */}
        <aside className="fn-help">
          <div className="fn-help-card">
            <div className="fn-help-title">
              <BulbIcon /> Need help?
            </div>
            <p className="fn-help-text">
              Not sure where to start? Ask our AI Companion for personalised funding
              recommendations.
            </p>
            <Link to="/companion" className="btn btn-outline btn-block fn-help-cta">
              Ask the AI Companion <MiniArrow />
            </Link>
          </div>

          <div className="fn-help-card fn-help-card-info">
            <div className="fn-help-title">
              <InfoIcon /> Important
            </div>
            <p className="fn-help-text">
              Funding information is based on publicly available data and may change.
              Always check the official provider website for the latest details and
              requirements.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Ladder computation
   ══════════════════════════════════════════════════════════ */

function computeLadder(user) {
  const u = user || {};
  const manual = new Set(u.fundingLadderManual || []);

  const hasMarks = !!(u.subjectMarks && Object.keys(u.subjectMarks).length > 0);
  const apps = u.applications || [];
  const hasPreparedDocs =
    apps.length > 0 &&
    apps.some((a) =>
      (a.documents || []).every((d) => d.status !== 'Pending') &&
      (a.documents || []).length > 0
    );
  const hasApplied = apps.some((a) =>
    ['Submitted', 'Pending', 'Accepted', 'Rejected'].includes(a.status)
  );
  const hasTracked =
    (u.wellness?.checkins || []).length > 0 ||
    (u.streaks?.history || []).length > 0;

  const defs = [
    {
      id: 'eligibility',
      title: 'Check eligibility',
      sub: 'See what you qualify for',
      autoDone: hasMarks,
      to: '/profile',
      icon: CheckCircleIcon,
    },
    {
      id: 'documents',
      title: 'Prepare documents',
      sub: 'Gather what you need',
      autoDone: hasPreparedDocs,
      to: '/applications',
      icon: FileIcon,
    },
    {
      id: 'apply',
      title: 'Apply',
      sub: 'Use official channels',
      autoDone: hasApplied,
      to: '/applications',
      icon: SendIcon,
    },
    {
      id: 'track',
      title: 'Track progress',
      sub: 'Follow up and get updates',
      autoDone: hasTracked,
      to: '/applications',
      icon: TrackIcon,
    },
  ];

  const steps = defs.map((d) => {
    const done = d.autoDone || manual.has(d.id);
    return { ...d, status: done ? 'done' : 'todo' };
  });

  // The first non-done step becomes the "current" step. The one after it is "next".
  const firstUndone = steps.findIndex((s) => s.status !== 'done');
  if (firstUndone !== -1) {
    steps[firstUndone].status = 'current';
    if (steps[firstUndone + 1]) steps[firstUndone + 1].status = 'next';
  }

  const completed = steps.filter((s) => s.status === 'done').length;
  return { steps, completed };
}

/* ══════════════════════════════════════════════════════════
   Funding card
   ══════════════════════════════════════════════════════════ */
function FundingCard({ fund, days, saved, onSave }) {
  const tierTone =
    fund.tier === 'NSFAS' ? 'gold'
    : fund.tier === 'Scholarships' ? 'green'
    : fund.tier === 'Bursaries' ? 'indigo'
    : fund.tier === 'Student loans' ? 'amber'
    : 'gray';

  const statusTone =
    fund.minAPS === null || fund.minAPS === undefined ? 'green'
    : 'indigo';
  const statusLabel =
    fund.minAPS === null || fund.minAPS === undefined
      ? 'Potentially eligible'
      : 'More information needed';

  const urgent = days >= 0 && days <= 30;

  return (
    <article
      id={`fund-${fund.id}`}
      className={'fn-card' + (urgent ? ' is-urgent' : '')}
    >
      <div className="fn-card-logo">
        <Logo logoKey={fund.logoKey} name={fund.provider} size={52} />
      </div>

      <div className="fn-card-body">
        <div className="fn-card-top">
          <span className={`badge badge-${tierTone}`}>{fund.tier}</span>
          <span className="fn-card-provider">{fund.provider}</span>
        </div>

        <h3 className="fn-card-name">{fund.name}</h3>
        <p className="fn-card-desc">{fund.description}</p>

        <div className="fn-card-meta">
          <span className="fn-card-meta-item">
            <CoinIcon /> {fund.amount}
          </span>
          {fund.eligibility.slice(0, 2).map((e) => (
            <span key={e} className="fn-card-meta-item">
              <CheckSmallIcon /> {e}
            </span>
          ))}
          <span className={`fn-card-meta-item fn-card-deadline${urgent ? ' is-urgent' : ''}`}>
            <CalendarIcon /> {days >= 0 ? `${days} day${days === 1 ? '' : 's'} left` : 'Closed'}
          </span>
        </div>

        <div className="fn-card-footer">
          <a
            className="fn-card-link"
            href={fund.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            Official website <ExternalIcon />
          </a>
        </div>
      </div>

      <div className="fn-card-actions">
        <span className={`badge badge-${statusTone} fn-card-status`}>
          <DotIcon />
          {statusLabel}
        </span>
        <a
          className="btn btn-primary fn-card-cta"
          href={fund.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          View details <MiniArrow />
        </a>
        <button
          type="button"
          className={'fn-card-save' + (saved ? ' is-saved' : '')}
          onClick={onSave}
          aria-label={saved ? 'Remove from saved' : 'Save'}
        >
          <BookmarkIcon filled={saved} />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   Filter bits
   ══════════════════════════════════════════════════════════ */
function FilterSection({ label, children }) {
  return (
    <div className="fn-filter-section">
      <div className="fn-filter-label">{label}</div>
      <div className="fn-filter-body">{children}</div>
    </div>
  );
}

function CheckRow({ label, count, checked, onChange }) {
  return (
    <label className="fn-check-row">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="fn-check-box" aria-hidden="true" />
      <span className="fn-check-label">{label}</span>
      {typeof count === 'number' && (
        <span className="fn-check-count">({count})</span>
      )}
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   Funding logos (monogram tiles)
   ══════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */
function unique(v, i, arr) { return arr.indexOf(v) === i; }
function levelCount(level) {
  if (level === 'Postgraduate') return FUNDING.filter((f) => /Postgraduate|NRF/i.test(f.name)).length;
  if (level === 'TVET') return FUNDING.filter((f) => /TVET|DHET/i.test(f.name)).length;
  return FUNDING.filter((f) => !/Postgraduate|NRF/i.test(f.name)).length;
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
function MiniArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function SearchIcon() { return (<svg {...iconProps(16)}>
  <circle cx="11" cy="11" r="6" /><path d="m20 20-3.6-3.6" />
</svg>); }
function XIcon() { return (<svg {...iconProps(14)}>
  <path d="M6 6l12 12M18 6 6 18" />
</svg>); }
function LadderIcon() { return (<svg {...iconProps(26)}>
  <path d="M6 21V3M18 21V3" />
  <path d="M6 7h12M6 12h12M6 17h12" />
</svg>); }
function SlidersIcon() { return (<svg {...iconProps(16)}>
  <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
  <circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" />
</svg>); }
function BulbIcon() { return (<svg {...iconProps(16)}>
  <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1v1h5v-1c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
</svg>); }
function InfoIcon() { return (<svg {...iconProps(16)}>
  <circle cx="12" cy="12" r="9.4" />
  <path d="M12 10.5v6" /><circle cx="12" cy="7.6" r="0.9" fill="currentColor" />
</svg>); }
function CoinIcon() { return (<svg {...iconProps(14)}>
  <circle cx="12" cy="12" r="8.4" />
  <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
  <path d="M12 6.6v10.8" />
</svg>); }
function CheckSmallIcon() { return (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="3"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 12 5 5L20 6" />
  </svg>
); }
function CheckIcon() { return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="3"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 12 5 5L20 6" />
  </svg>
); }
function CalendarIcon() { return (<svg {...iconProps(14)}>
  <rect x="3.5" y="5" width="17" height="15" rx="2" />
  <path d="M8 3v4M16 3v4M3.5 10h17" />
</svg>); }
function ExternalIcon() { return (<svg {...iconProps(12)}>
  <path d="M15 4h5v5" /><path d="M20 4 10 14" />
  <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
</svg>); }
function DotIcon() { return (
  <svg width="7" height="7" viewBox="0 0 10 10" aria-hidden="true">
    <circle cx="5" cy="5" r="3" fill="currentColor" />
  </svg>
); }
function BookmarkIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
         fill={filled ? 'currentColor' : 'none'}
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.6L6 20V5a1 1 0 0 1 1-1z" />
    </svg>
  );
}
function CheckCircleIcon() { return (<svg {...iconProps(16)}>
  <circle cx="12" cy="12" r="9" />
  <path d="m8.5 12 2.5 2.5L16 10" />
</svg>); }
function FileIcon() { return (<svg {...iconProps(16)}>
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  <path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" />
</svg>); }
function SendIcon() { return (<svg {...iconProps(16)}>
  <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" />
</svg>); }
function TrackIcon() { return (<svg {...iconProps(16)}>
  <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
</svg>); }
function TrophyIcon() { return (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
    <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" />
    <path d="M10 12v4h4v-4M9 20h6M12 16v4" />
  </svg>
); }
