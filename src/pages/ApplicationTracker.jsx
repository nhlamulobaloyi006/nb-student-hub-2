import { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INSTITUTION_BY_ID } from '../data/institutions';
import { COURSE_BY_ID } from '../data/courses';
import Logo from '../components/Logo';

import './ApplicationTracker.css';
import { useDialog } from '../components/DialogProvider';
import FundingMatchModal from '../components/FundingMatchModal';
import CareerMatchModal from '../components/CareerMatchModal';
import { matchFunding } from '../utils/matchFunding';
import ApplicationDetailInline from './ApplicationDetail';

const STATUSES = ['Preparing', 'Submitted', 'Pending', 'Accepted', 'Rejected'];

const STATUS_TONE = {
  Submitted: 'indigo',
  Pending:   'amber',
  Preparing: 'gold',
  Accepted:  'green',
  Rejected:  'red',
};

const STATUS_NEXT_ACTION = {
  Submitted: 'Track status',
  Pending:   'Await decision',
  Preparing: 'Complete application',
  Accepted:  'View details',
  Rejected:  'Explore alternatives',
};

const SORTS = [
  { id: 'recent',   label: 'Sort by: Most recent' },
  { id: 'deadline', label: 'Sort by: Deadline' },
  { id: 'status',   label: 'Sort by: Status' },
];

export default function ApplicationTracker() {
  const { confirm } = useDialog();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const applications = useMemo(() => user?.applications || [], [user]);

  const [fundingMatch, setFundingMatch] = useState(null);
  const [lastAppliedCourse, setLastAppliedCourse] = useState(null);
  const [careerMatch, setCareerMatch] = useState(null);
  const [sort, setSort] = useState('recent');
  const [selectedId, setSelectedId] = useState(null);

  // On desktop, auto-select the first application if none is selected
  useEffect(() => {
    if (applications.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !applications.some((a) => a.id === selectedId)) {
      setSelectedId(applications[0].id);
    }
  }, [applications, selectedId]);

  /* React to ?new=<courseId> — opens the funding modal, then clears
     the param so a refresh doesn't re-open it. This is where the
     "Add as application" flow lands from Courses on mobile. */
  useEffect(() => {
    const courseId = searchParams.get('new');
    if (!courseId) return;
    const course = COURSE_BY_ID[courseId];
    if (!course) return;
    const result = matchFunding(user, course, { max: 6 });
    setFundingMatch({ course, funds: result.top });
    setLastAppliedCourse(course);
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function closeFundingMatch() {
    setFundingMatch(null);
    if (!lastAppliedCourse) return;
    if (isCareerMuted(lastAppliedCourse.id)) return;
    setTimeout(() => {
      if (window.location.pathname !== '/applications') return;
      setCareerMatch({ course: lastAppliedCourse });
    }, 5000);
  }

  function closeCareerMatch() {
    if (careerMatch?.course) muteCareer(careerMatch.course.id);
    setCareerMatch(null);
  }

  function isCareerMuted(courseId) {
    try {
      const raw = localStorage.getItem('nb_careers_muted');
      const map = raw ? JSON.parse(raw) : {};
      const at = map[courseId];
      if (!at) return false;
      const days = (Date.now() - Number(at)) / 86400000;
      return days < 3;
    } catch { return false; }
  }

  function muteCareer(courseId) {
    try {
      const raw = localStorage.getItem('nb_careers_muted');
      const map = raw ? JSON.parse(raw) : {};
      map[courseId] = Date.now();
      localStorage.setItem('nb_careers_muted', JSON.stringify(map));
    } catch { /* ignore */ }
  }

  /* ── Sorted list ──────────────────────────────────────── */
  const sorted = useMemo(() => {
    const list = [...applications];
    switch (sort) {
      case 'deadline':
        return list.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.localeCompare(b.deadline);
        });
      case 'status': {
        const order = { Preparing: 0, Submitted: 1, Pending: 2, Accepted: 3, Rejected: 4 };
        return list.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
      }
      case 'recent':
      default:
        return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
  }, [applications, sort]);

  /* ── Stats ────────────────────────────────────────────── */
  const stats = useMemo(() => ({
    Submitted: applications.filter((a) => a.status === 'Submitted').length,
    Pending:   applications.filter((a) => a.status === 'Pending').length,
    Accepted:  applications.filter((a) => a.status === 'Accepted').length,
    Rejected:  applications.filter((a) => a.status === 'Rejected').length,
  }), [applications]);

  const upcomingDeadline = useMemo(() => {
    if (applications.length === 0) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const withDays = applications
      .filter((a) => a.deadline)
      .filter((a) => a.status === 'Preparing' || a.status === 'Pending')
      .map((a) => {
        const d = new Date(a.deadline + 'T00:00:00');
        const days = Math.round((d - now) / 86400000);
        return { app: a, days };
      })
      .filter((x) => x.days >= 0)
      .sort((a, b) => a.days - b.days);
    return withDays[0] || null;
  }, [applications]);

  function handleAddApplication() {
    navigate('/courses?add=1');
  }

  function openDetail(id) {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches;
    if (isMobile) {
      navigate('/applications/' + id);
    } else {
      setSelectedId(id);
    }
  }

  function startFromShortlist(courseId) {
    const course = COURSE_BY_ID[courseId];
    if (!course) return;
    if (applications.some((a) => a.courseId === courseId)) {
      const existing = applications.find((a) => a.courseId === courseId);
      navigate('/applications/' + existing.id);
      return;
    }
    const inst = INSTITUTION_BY_ID[course.universityId];
    const today = new Date().toISOString().slice(0, 10);
    const app = {
      id: `app_${Date.now()}`,
      institutionId: course.universityId,
      institutionName: course.university || inst?.name || 'Unknown',
      courseId: course.id,
      courseName: course.name,
      status: 'Preparing',
      submittedDate: null,
      deadline: inst?.applicationClose || null,
      referenceNumber: makeRef(inst?.shortName || 'APP'),
      documents: defaultDocs(),
      notes: `Draft started from your shortlist on ${today}.`,
      createdAt: today,
    };
    updateUser({ applications: [...applications, app] });
    /* Stay on the list. Tap the row to open the detail. */
  }

  /* ── Mutators (used by row kebab menu) ─────────────────── */
  function patchApp(id, patch) {
    const next = applications.map((a) => (a.id === id ? { ...a, ...patch } : a));
    updateUser({ applications: next });
  }

  async function deleteApp(id) {
    const app = applications.find((a) => a.id === id);
    if (!app) return;
    const ok = await confirm({
      title: 'Delete this application?',
      body: app.institutionName + ' — ' + app.courseName + '. This cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    const next = applications.filter((a) => a.id !== id);
    updateUser({ applications: next });
    /* If the deleted app was the one open in the detail route, bounce to list */
    if (selectedId === id) setSelectedId(null);
  }

  function quickStatus(id, status) {
    const today = new Date().toISOString().slice(0, 10);
    const patch = { status };
    if (status === 'Submitted') {
      const existing = applications.find((a) => a.id === id);
      if (!existing?.submittedDate) patch.submittedDate = today;
      if (!existing?.referenceNumber) patch.referenceNumber = makeRef(shortNameOf(existing));
    }
    patchApp(id, patch);
  }

  /* ── Empty state ──────────────────────────────────────── */
  if (applications.length === 0) {
    const shortlist = (user?.savedItems || []).filter((s) => s.type === 'course');
    return (
      <div className="at">
        <header className="at-head">
          <div>
            <h1 className="at-title">Your applications</h1>
            <p className="at-sub">Keep track of where you've applied and what comes next.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary at-add"
            onClick={handleAddApplication}
          >
            <PlusIcon /> Add application
          </button>
        </header>

        <EmptyState
          onExplore={handleAddApplication}
          shortlist={shortlist}
          onStartFromShortlist={startFromShortlist}
        />
      </div>
    );
  }

  /* ── Normal render ────────────────────────────────────── */
  return (
    <div className="at">
      <header className="at-head">
        <div>
          <h1 className="at-title">Your applications</h1>
          <p className="at-sub">Keep track of where you've applied and what comes next.</p>
        </div>
        <div className="at-head-right">
          <span className="at-finals-pill">
            <CalendarIcon /> MATRIC FINALS IN {daysToFinals()} DAYS
          </span>
          <button
            type="button"
            className="btn btn-primary at-add"
            onClick={handleAddApplication}
          >
            <PlusIcon /> Add application
          </button>
        </div>
      </header>

      <div className="at-stats">
        <StatCard tone="indigo" label="Submitted" value={stats.Submitted} icon={SendIcon} />
        <StatCard tone="amber"  label="Pending"   value={stats.Pending}   icon={ClockIcon} />
        <StatCard tone="green"  label="Accepted"  value={stats.Accepted}  icon={CheckIcon} />
        <StatCard tone="red"    label="Rejected"  value={stats.Rejected}  icon={XIcon} />
      </div>

      <div className="at-body">
        <div className="at-main">
          <div className="at-list-head">
            <div className="at-list-title">Your applications ({applications.length})</div>
            <select
              className="at-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="at-list">
            {sorted.map((app) => (
              <ApplicationRow
                key={app.id}
                app={app}
                active={app.id === selectedId}
                onClick={() => openDetail(app.id)}
                onQuickStatus={(status) => quickStatus(app.id, status)}
                onDelete={() => deleteApp(app.id)}
              />
            ))}
          </div>

          {upcomingDeadline && (
            <div className="at-callout">
              <div className="at-callout-icon" aria-hidden="true"><WarningIcon /></div>
              <div className="at-callout-body">
                <div className="at-callout-title">Upcoming deadline</div>
                <div className="at-callout-sub">
                  {upcomingDeadline.app.institutionName} application deadline is in{' '}
                  {upcomingDeadline.days} day{upcomingDeadline.days === 1 ? '' : 's'} (
                  {formatDate(upcomingDeadline.app.deadline)}).
                </div>
              </div>
              <Link to="/funding" className="at-callout-link">
                View all deadlines <MiniArrow />
              </Link>
            </div>
          )}
        </div>

        <aside className="at-rail">
          {selectedId ? (
             <ApplicationDetailInline id={selectedId} onClose={() => setSelectedId(null)} />
          ) : (
            <div className="at-rail-empty">
              <div className="at-rail-empty-icon" aria-hidden="true"><FileIcon /></div>
              <div className="at-rail-empty-title">Select an application</div>
              <div className="at-rail-empty-sub">
                Pick an application on the left to see its details, documents and status.
              </div>
            </div>
          )}
        </aside>
      </div>

      {fundingMatch && (
        <FundingMatchModal
          course={fundingMatch.course}
          funds={fundingMatch.funds}
          onClose={closeFundingMatch}
        />
      )}

      {careerMatch && (
        <CareerMatchModal
          course={careerMatch.course}
          onClose={closeCareerMatch}
          onDismiss={closeCareerMatch}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Empty state
   ══════════════════════════════════════════════════════════ */
function EmptyState({ onExplore, shortlist = [], onStartFromShortlist }) {
  return (
    <div className="at-empty">
      <div className="at-empty-icon" aria-hidden="true"><FileIcon /></div>
      <div className="at-empty-title">No applications yet?</div>
      <div className="at-empty-sub">
        Explore courses, compare institutions and start your application journey.
      </div>
      <button type="button" className="btn btn-primary at-empty-cta" onClick={onExplore}>
        Explore courses <MiniArrow />
      </button>

      {shortlist.length > 0 && (
        <div className="at-empty-shortlist">
          <div className="at-empty-shortlist-head">
            <span className="at-empty-shortlist-dot" aria-hidden="true" />
            Or start from your shortlist
          </div>
          <div className="at-empty-shortlist-list">
            {shortlist.slice(0, 4).map((s) => {
              const c = COURSE_BY_ID[s.id];
              if (!c) return null;
              const inst = INSTITUTION_BY_ID[c.universityId];
              return (
                <button
                  key={s.id}
                  type="button"
                  className="at-empty-shortlist-item"
                  onClick={() => onStartFromShortlist(s.id)}
                >
                  <span className="at-empty-shortlist-logo">
                    <Logo logoKey={inst?.logoKey || 'generic'} />
                  </span>
                  <span className="at-empty-shortlist-body">
                    <span className="at-empty-shortlist-name">{c.name}</span>
                    <span className="at-empty-shortlist-sub">{c.university || inst?.name}</span>
                  </span>
                  <span className="at-empty-shortlist-cta">
                    Start <MiniArrow />
                  </span>
                </button>
              );
            })}
          </div>
          {shortlist.length > 4 && (
            <div className="at-empty-shortlist-more">
              +{shortlist.length - 4} more in your shortlist
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Stat card
   ══════════════════════════════════════════════════════════ */
function StatCard({ tone, label, value, icon: Icon }) {
  return (
    <div className={`at-stat at-stat-${tone}`}>
      <div className={`at-stat-icon at-stat-icon-${tone}`} aria-hidden="true">
        <Icon />
      </div>
      <div className="at-stat-body">
        <div className="at-stat-value">{value}</div>
        <div className="at-stat-label">
          {label} {value === 1 ? 'application' : 'applications'}
        </div>
      </div>
      <span className="at-stat-arrow"><MiniArrow /></span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Application row (with kebab menu)
   ══════════════════════════════════════════════════════════ */
function ApplicationRow({ app, active, onClick, onQuickStatus, onDelete }) {
  const inst = INSTITUTION_BY_ID[app.institutionId];
  const nextLabel = STATUS_NEXT_ACTION[app.status] || 'View';
  const tone = STATUS_TONE[app.status] || 'indigo';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <div className={`at-row${active ? ' is-active' : ''}`} onClick={onClick}>
      <div className="at-row-logo" aria-hidden="true">
        <Logo logoKey={inst?.logoKey || 'generic'} />
      </div>

      <div className="at-row-main">
        <div className="at-row-title">{app.institutionName}</div>
        <div className="at-row-sub">{app.courseName}</div>
        <span className={`badge badge-${tone} at-row-badge`}>{app.status}</span>
      </div>

      <div className="at-row-meta">
        <div className="at-row-meta-col">
          <div className="at-row-meta-label">Submitted</div>
          <div className="at-row-meta-value">
            {app.submittedDate ? formatDate(app.submittedDate) : '—'}
          </div>
        </div>
        <div className="at-row-meta-col">
          <div className="at-row-meta-label">Deadline</div>
          <div className="at-row-meta-value">
            {app.deadline ? formatDate(app.deadline) : '—'}
          </div>
        </div>
        <div className="at-row-meta-col at-row-meta-col-next">
          <div className="at-row-meta-label">Next action</div>
          <div className="at-row-meta-value at-row-meta-link">
            {nextLabel} <MiniArrow />
          </div>
        </div>
      </div>

      <div className="at-row-kebab" ref={menuRef}>
        <button
          type="button"
          className="at-kebab-btn"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          aria-label="Application actions"
          aria-expanded={menuOpen}
        >
          <KebabIcon />
        </button>

        {menuOpen && (
          <div className="at-kebab-menu" role="menu">
            <div className="at-kebab-label">Set status</div>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                role="menuitem"
                className={`at-kebab-item${app.status === s ? ' is-current' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickStatus(s);
                  setMenuOpen(false);
                }}
              >
                <span className={`at-kebab-dot at-kebab-dot-${STATUS_TONE[s]}`} />
                {s}
                {app.status === s && <span className="at-kebab-current">current</span>}
              </button>
            ))}
            <div className="at-kebab-sep" />
            <button
              type="button"
              role="menuitem"
              className="at-kebab-item at-kebab-item-danger"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDelete();
              }}
            >
              <TrashIcon /> Delete application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

function makeRef(shortName) {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${String(shortName || 'APP').toUpperCase()}-${year}-${num}`;
}

function shortNameOf(app) {
  if (!app) return 'APP';
  const inst = INSTITUTION_BY_ID[app.institutionId];
  return inst?.shortName || 'APP';
}

function defaultDocs() {
  return [
    { label: 'Certified ID copy',           status: 'Pending' },
    { label: 'Matric results (certified)',  status: 'Pending' },
    { label: 'Proof of residence',          status: 'Pending' },
    { label: 'Motivation letter',           status: 'Pending' },
    { label: 'Short CV (optional)',         status: 'Not required' },
  ];
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysToFinals() {
  const now = new Date();
  const year = now.getFullYear();
  let target = new Date(year, 9, 26);
  if (target < now) target = new Date(year + 1, 9, 26);
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target - now) / 86400000));
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
function PlusIcon() { return (<svg {...iconProps(16)}>
  <path d="M12 5v14M5 12h14" />
</svg>); }
function CalendarIcon() { return (<svg {...iconProps(14)}>
  <rect x="3.5" y="5" width="17" height="15" rx="2" />
  <path d="M8 3v4M16 3v4M3.5 10h17" />
</svg>); }
function SendIcon() { return (<svg {...iconProps(16)}>
  <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" />
</svg>); }
function ClockIcon() { return (<svg {...iconProps(16)}>
  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
</svg>); }
function CheckIcon() { return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="3"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 12 5 5L20 6" />
  </svg>
); }
function XIcon() { return (<svg {...iconProps(16)}>
  <path d="M6 6l12 12M18 6 6 18" />
</svg>); }
function WarningIcon() { return (<svg {...iconProps(16)}>
  <path d="M12 3 2 20h20L12 3z" />
  <path d="M12 10v4" /><circle cx="12" cy="17" r="0.9" fill="currentColor" />
</svg>); }
function KebabIcon() { return (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </svg>
); }
function FileIcon() { return (<svg {...iconProps(16)}>
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  <path d="M14 3v5h5" />
  <path d="M9 13h6M9 17h4" />
</svg>); }
function TrashIcon() { return (<svg {...iconProps(14)}>
  <path d="M4 7h16" /><path d="M9 7V4h6v3" />
  <path d="M6 7l1 14h10l1-14" />
</svg>); }
