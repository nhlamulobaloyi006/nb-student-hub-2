import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COURSES, COURSE_BY_ID } from '../data/courses';
import { INSTITUTION_BY_ID } from '../data/institutions';
import { checkEligibility } from '../utils/eligibilityChecker';
import { calculateAPS } from '../utils/apsCalculator';
import Logo from '../components/Logo';

import './CourseFinder.css';

const STREAM_FILTERS = [
  { id: 'all',        label: 'All' },
  { id: 'science',    label: 'Science' },
  { id: 'commerce',   label: 'Commerce' },
  { id: 'humanities', label: 'Humanities' },
];

const SORTS = [
  { id: 'relevant', label: 'Most relevant' },
  { id: 'aps-low',  label: 'Lowest APS first' },
  { id: 'aps-high', label: 'Highest APS first' },
  { id: 'fee-low',  label: 'Lowest fees first' },
  { id: 'name',     label: 'Course name (A-Z)' },
];

export default function CourseFinder() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [addMode, setAddMode] = useState(() => searchParams.get('add') === '1');
  const [guidedCourse, setGuidedCourse] = useState(null); // shows glow on Apply button
  const [streamFilter, setStreamFilter] = useState('all');
  const [matchesOnly, setMatchesOnly] = useState(() => searchParams.get('matches') === 'only');
  const [sort, setSort] = useState('relevant');
  const [selectedId, setSelectedId] = useState(() => {
    const q = searchParams.get('q');
    if (!q) return null;
    const found = COURSES.find(
      (c) => c.name.toLowerCase().includes(q.toLowerCase())
    );
    return found?.id || null;
  });
  const [detailTab, setDetailTab] = useState('overview');

  /* Sync query → URL */
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (query) next.set('q', query); else next.delete('q');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  /* ── Filter + sort ─────────────────────────────────── */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = COURSES.map((c) => ({
      course: c,
      elig: checkEligibility(c, user),
    }));

    if (streamFilter !== 'all') {
      list = list.filter(({ course }) => course.streamRequired === streamFilter);
    }

    if (q) {
      list = list.filter(({ course }) => {
        const inst = INSTITUTION_BY_ID[course.universityId];
        return (
          course.name.toLowerCase().includes(q) ||
          course.university?.toLowerCase().includes(q) ||
          inst?.name.toLowerCase().includes(q) ||
          course.faculty?.toLowerCase().includes(q)
        );
      });
    }

    if (matchesOnly) {
      list = list.filter(({ elig }) => elig.status === 'pass');
    }

    const eligibleFirst = (a, b) => {
      const order = { pass: 0, warn: 1, unknown: 2, fail: 3 };
      return (order[a.elig.status] ?? 9) - (order[b.elig.status] ?? 9);
    };

    switch (sort) {
      case 'aps-low':  list.sort((a, b) => (a.course.minAPS || 0) - (b.course.minAPS || 0)); break;
      case 'aps-high': list.sort((a, b) => (b.course.minAPS || 0) - (a.course.minAPS || 0)); break;
      case 'fee-low':  list.sort((a, b) => (a.course.feeEstimate || 0) - (b.course.feeEstimate || 0)); break;
      case 'name':     list.sort((a, b) => a.course.name.localeCompare(b.course.name)); break;
      default:         list.sort(eligibleFirst);
    }

    return list;
  }, [query, streamFilter, sort, user, matchesOnly]);

  const selected = selectedId ? COURSE_BY_ID[selectedId] : null;
  const selectedElig = selected ? checkEligibility(selected, user) : null;

  /* ── Shortlist ──────────────────────────────────────── */
  const shortlist = user?.savedItems || [];
  function toggleShortlist(courseId) {
    const exists = shortlist.some((s) => s.id === courseId && s.type === 'course');
    const next = exists
      ? shortlist.filter((s) => !(s.id === courseId && s.type === 'course'))
      : [...shortlist, { id: courseId, type: 'course', addedAt: new Date().toISOString() }];
    updateUser({ savedItems: next });
  }

  /* ── Start application ──────────────────────────────── */
  function startApplication(course) {
    const existing = (user?.applications || []).find(
      (a) => a.courseId === course.id
    );
    if (existing) {
      navigate('/applications');
      return;
    }

    const inst = INSTITUTION_BY_ID[course.universityId];
    const today = new Date().toISOString().slice(0, 10);
    const refNumber = generateReferenceNumber(inst?.shortName || 'APP', course.id);

    const app = {
      id: `app_${Date.now()}`,
      institutionId: course.universityId,
      institutionName: course.university || inst?.name || 'Unknown institution',
      courseId: course.id,
      courseName: course.name,
      status: 'Preparing',
      submittedDate: null,
      deadline: inst?.applicationClose || null,
      referenceNumber: refNumber,
      documents: [
        { label: 'Certified ID copy',           status: 'Pending' },
        { label: 'Matric results (certified)',  status: 'Pending' },
        { label: 'Proof of residence',          status: 'Pending' },
        { label: 'Motivation letter',           status: 'Pending' },
        { label: 'Short CV (optional)',         status: 'Not required' },
      ],
      notes: `Draft started from Course Finder on ${today}. Awaiting document uploads before submission.`,
      createdAt: today,
    };

    updateUser({ applications: [...(user?.applications || []), app] });
    navigate('/applications?new=' + encodeURIComponent(course.id));
  }

  /* ── Add-mode banner cancel ─────────────────────────── */
  function cancelAddMode() {
    setAddMode(false);
    const next = new URLSearchParams(searchParams);
    next.delete('add');
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="cf">
      <header className="cf-head">
        <h1 className="cf-title">Course Finder</h1>
        <p className="cf-sub">
          Match your subjects, marks and interests with courses across South Africa.
        </p>
      </header>

      {addMode && (
        <div className="cf-addmode-banner">
          <span className="cf-addmode-icon" aria-hidden="true"><ClipboardIcon /></span>
          <div className="cf-addmode-body">
            <div className="cf-addmode-title">Adding a new application</div>
            <div className="cf-addmode-sub">
              Pick the course you're applying for, then click <b>Start application</b> in the detail panel.
            </div>
          </div>
          <button
            type="button"
            className="cf-addmode-cancel"
            onClick={cancelAddMode}
          >
            <XIcon /> Cancel
          </button>
        </div>
      )}

      <div className={"cf-body" + (selected ? " has-detail" : "")}>
        {/* ═════════ LEFT: LIST ═════════ */}
        <div className="cf-list-pane">
          <div className="cf-toolbar">
            <div className="cf-search-wrap">
              <SearchIcon />
              <input
                className="cf-search"
                placeholder="Search courses, universities, faculties…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="cf-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <XIcon />
                </button>
              )}
            </div>

            <div className="cf-filters">
              <button
                type="button"
                className={'cf-chip cf-chip-matches' + (matchesOnly ? ' is-active' : '')}
                onClick={() => setMatchesOnly((v) => !v)}
              >
                Matches only
              </button>
              {STREAM_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={'cf-chip' + (streamFilter === f.id ? ' is-active' : '')}
                  onClick={() => setStreamFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
              <div className="cf-spacer" />
              <select
                className="cf-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort courses"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>Sort: {s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="cf-count">
            Showing {visible.length} of {COURSES.length} courses
          </div>

          {visible.length === 0 ? (
            <div className="cf-empty">
              <div className="cf-empty-title">No courses match.</div>
              <div className="cf-empty-sub">
                Try a different search term or clear the stream filter.
              </div>
            </div>
          ) : (
            <div className="cf-rows">
              {visible.map(({ course, elig }) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  elig={elig}
                  active={course.id === selectedId}
                  onClick={() => {
                    setSelectedId(course.id);
                    setDetailTab('overview');
                    // one-shot glow: only if user has no applications yet
                    if ((user?.applications || []).length === 0) {
                      setGuidedCourse(course.id);
                      setTimeout(() => setGuidedCourse(null), 7000);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ═════════ RIGHT: DETAIL ═════════ */}
        <aside className="cf-detail-pane">
          {!selected ? (
            <div className="cf-detail-empty">
              <div className="cf-detail-empty-icon"><BookIcon /></div>
              <div className="cf-detail-empty-title">Pick a course</div>
              <div className="cf-detail-empty-sub">
                Select any course on the left to see entry requirements, costs and funding options.
              </div>
            </div>
          ) : (
            <CourseDetail
              course={selected}
              elig={selectedElig}
              tab={detailTab}
              onTab={setDetailTab}
              user={user}
              saved={shortlist.some((s) => s.id === selected.id && s.type === 'course')}
              alreadyApplied={(user?.applications || []).some((a) => a.courseId === selected.id)}
              onSave={() => toggleShortlist(selected.id)}
              onApply={() => startApplication(selected)}
              addMode={addMode}
              isGuided={guidedCourse === selected.id}
              onBack={() => setSelectedId(null)}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Course row
   ══════════════════════════════════════════════════════════ */
function CourseRow({ course, elig, active, onClick }) {
  const inst = INSTITUTION_BY_ID[course.universityId];
  const tone = elig.status === 'pass' ? 'green'
             : elig.status === 'warn' ? 'indigo'
             : elig.status === 'fail' ? 'red'
             : 'gray';
  const label = elig.status === 'pass' ? 'Potential match'
              : elig.status === 'warn' ? 'More information needed'
              : elig.status === 'fail' ? 'Requirement not met'
              : 'Unknown';

  return (
    <button
      type="button"
      className={'cf-row' + (active ? ' is-active' : '')}
      onClick={onClick}
    >
      <div className="cf-row-logo">
        <Logo logoKey={inst?.logoKey} size={44} />
      </div>

      <div className="cf-row-main">
        <div className="cf-row-inst">{course.university || inst?.name}</div>
        <div className="cf-row-name">{course.name}</div>
        <div className="cf-row-tags">
          <span className="cf-row-tag">{course.tier}</span>
          <span className="cf-row-tag-sep">·</span>
          <span className="cf-row-tag">{course.duration}</span>
          <span className="cf-row-tag-sep">·</span>
          <span className="cf-row-tag">{inst?.province}</span>
        </div>
        <div className="cf-row-reqs">
          {course.requiredSubjects.slice(0, 3).map((r) => (
            <span key={r} className="cf-row-req">{r}</span>
          ))}
        </div>
      </div>

      <div className="cf-row-right">
        <span className={`badge badge-${tone}`}>{label}</span>
        <div className="cf-row-aps">
          <div className="cf-row-aps-value">{course.minAPS || '—'}</div>
          <div className="cf-row-aps-label">APS</div>
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   Course detail panel
   ══════════════════════════════════════════════════════════ */
function CourseDetail({
  course, elig, tab, onTab, user,
  saved, alreadyApplied, onSave, onApply, addMode, isGuided, onBack,
}) {
  const inst = INSTITUTION_BY_ID[course.universityId];
  const aps = calculateAPS(user?.subjectMarks || {}).total;

  const tone = elig.status === 'pass' ? 'green'
             : elig.status === 'warn' ? 'indigo'
             : elig.status === 'fail' ? 'red'
             : 'gray';
  const label = elig.status === 'pass' ? 'Potentially eligible'
              : elig.status === 'warn' ? 'More information needed'
              : elig.status === 'fail' ? 'Requirement not met'
              : 'Unknown';

  return (
    <div className="cf-detail">
      <button type="button" className="cf-mobile-back" onClick={onBack}>
        <BackArrow /> Back to courses
      </button>
      <button type="button" className="cf-back" onClick={onBack}>
        <BackArrow /> Back to courses
      </button>

      <div className="cf-detail-body">
      <div className="cf-detail-head">
        <div className="cf-detail-logo">
          <Logo logoKey={inst?.logoKey} size={44} />
        </div>
        <div className="cf-detail-head-text">
          <div className="cf-detail-inst">{course.university || inst?.name}</div>
          <h2 className="cf-detail-name">{course.name}</h2>
          <div className="cf-detail-meta">
            <span className="cf-detail-tag">{course.tier}</span>
            <span className="cf-detail-tag">{course.duration}</span>
            {inst?.province && <span className="cf-detail-tag">{inst.province}</span>}
          </div>
        </div>
        <span className={`badge badge-${tone} cf-detail-badge`}>{label}</span>
      </div>

      <div className="cf-detail-banner" aria-hidden="true" />

      <div className={`cf-elig cf-elig-${tone}`}>
        <div className="cf-elig-icon">
          {elig.status === 'pass' ? <CheckIcon /> :
           elig.status === 'fail' ? <XIcon /> :
           <InfoIcon />}
        </div>
        <div className="cf-elig-body">
          <div className="cf-elig-title">{label}</div>
          <div className="cf-elig-sub">
            {elig.reason || `Your APS: ${aps}. Course requires APS ${course.minAPS || '—'}.`}
          </div>
        </div>
      </div>

      <div className="cf-tabs" role="tablist">
        {['overview', 'requirements', 'costs', 'funding'].map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={'cf-tab' + (tab === id ? ' is-active' : '')}
            onClick={() => onTab(id)}
          >
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>

      <div className="cf-tab-body">
        {tab === 'overview' && (
          <>
            <p className="cf-desc">{course.description}</p>
            <div className="cf-detail-grid">
              <MetaRow label="Faculty" value={course.faculty} />
              <MetaRow label="Duration" value={course.duration} />
              <MetaRow label="Entry APS" value={`${course.minAPS || '—'} – ${course.maxAPS || 42}`} />
              <MetaRow label="Institution" value={inst?.name || course.university} />
              <MetaRow label="Province" value={inst?.province || '—'} />
              <MetaRow label="Application fee" value={inst?.applicationFee ? `R${inst.applicationFee}` : 'Free'} />
            </div>
          </>
        )}

        {tab === 'requirements' && (
          <div className="cf-reqs">
            <div className="cf-reqs-title">Entry requirements</div>
            <ul className="cf-reqs-list">
              {course.requiredSubjects.map((r) => (
                <li key={r} className="cf-req-item">
                  <span className="cf-req-check"><CheckSmallIcon /></span>
                  <span>{r}</span>
                </li>
              ))}
              {course.streamRequired && (
                <li className="cf-req-item">
                  <span className="cf-req-check"><CheckSmallIcon /></span>
                  <span>Recommended stream: <b>{course.streamRequired}</b></span>
                </li>
              )}
            </ul>
            {inst?.nbt && (
              <div className="cf-reqs-note">
                <InfoIcon /> This institution requires the National Benchmark Test (NBT).
              </div>
            )}
          </div>
        )}

        {tab === 'costs' && (
          <div className="cf-costs">
            <div className="cf-cost-row">
              <span>Estimated annual tuition</span>
              <span className="cf-cost-amount">R{(course.feeEstimate || 0).toLocaleString('en-ZA')}</span>
            </div>
            <div className="cf-cost-sub">
              Tuition only — accommodation, food and other expenses are extra.
            </div>
            <Link
              to="/cost-planner"
              state={{ institutionId: course.universityId, courseId: course.id }}
              className="btn btn-primary cf-cost-cta"
            >
              Open Cost Planner <MiniArrow />
            </Link>
          </div>
        )}

        {tab === 'funding' && (
          <div className="cf-funding">
            <div className="cf-funding-sub">
              Funding options that typically apply to this course:
            </div>
            <ul className="cf-funding-list">
              <li className="cf-funding-item">
                <span className="badge badge-gold">NSFAS</span>
                <span className="cf-funding-name">NSFAS Bursary</span>
                <span className="cf-funding-meta">Up to R177 000 / year</span>
              </li>
              <li className="cf-funding-item">
                <span className="badge badge-indigo">Bursaries</span>
                <span className="cf-funding-name">Corporate bursaries</span>
                <span className="cf-funding-meta">Varies by provider</span>
              </li>
              <li className="cf-funding-item">
                <span className="badge badge-green">Scholarships</span>
                <span className="cf-funding-name">{inst?.shortName || 'Institution'} merit awards</span>
                <span className="cf-funding-meta">R10 000 – R50 000</span>
              </li>
            </ul>
            <Link to="/funding" className="cf-funding-link">
              See all funding options <MiniArrow />
            </Link>
          </div>
        )}
      </div>

      {/* Footer CTAs */}
      </div>

      <div className="cf-detail-footer">
        {alreadyApplied ? (
          <Link
            to="/applications"
            className="btn btn-primary cf-save-cta"
          >
            <ClipboardIcon /> Already applied — view tracker <MiniArrow />
          </Link>
        ) : (
          <button
            type="button"
            className={'btn btn-primary cf-save-cta' + (isGuided ? ' is-guided' : '')}
            onClick={onApply}
          >
            {isGuided && <span className="cf-guided-tip">Click here to apply</span>}
            <ClipboardIcon />
            {addMode ? 'Start application' : 'Add as application'}
          </button>
        )}

        <button
          type="button"
          className={'btn ' + (saved ? 'btn-outline' : 'btn-ghost') + ' cf-save-secondary'}
          onClick={onSave}
        >
          <BookmarkIcon filled={saved} />
          {saved ? 'Saved to shortlist' : 'Add to shortlist'}
        </button>
      </div>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="cf-meta-row">
      <div className="cf-meta-label">{label}</div>
      <div className="cf-meta-value">{value}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */
function generateReferenceNumber(shortName, courseId) {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  const key = courseId.split('-').pop().toUpperCase().slice(0, 4);
  return `${shortName.toUpperCase()}${year}/${num}-${key}`;
}

/* ══════════════════════════════════════════════════════════
   Institution logo monograms
   ══════════════════════════════════════════════════════════ */
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
function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 5l-7 7 7 7" />
    </svg>
  );
}
function SearchIcon() { return (<svg {...iconProps(16)}>
  <circle cx="11" cy="11" r="6" /><path d="m20 20-3.6-3.6" />
</svg>); }
function XIcon() { return (<svg {...iconProps(14)}>
  <path d="M6 6l12 12M18 6 6 18" />
</svg>); }
function CheckIcon() { return (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.6"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 12 5 5L20 6" />
  </svg>
); }
function CheckSmallIcon() { return (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="3"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 12 5 5L20 6" />
  </svg>
); }
function InfoIcon() { return (<svg {...iconProps(16)}>
  <circle cx="12" cy="12" r="9.4" />
  <path d="M12 10.5v6" />
  <circle cx="12" cy="7.6" r="0.9" fill="currentColor" />
</svg>); }
function BookIcon() { return (<svg {...iconProps(24)}>
  <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
  <path d="M13 4h5.5c.8 0 1.5.7 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H13z" />
</svg>); }
function BookmarkIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
         fill={filled ? 'currentColor' : 'none'}
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.6L6 20V5a1 1 0 0 1 1-1z" />
    </svg>
  );
}
function ClipboardIcon() { return (<svg {...iconProps(16)}>
  <rect x="6" y="4.5" width="12" height="16" rx="2" />
  <path d="M9.5 4.5V3.6c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v.9" />
  <path d="M9.5 11h5M9.5 14.5h5M9.5 18h3" />
</svg>); }
