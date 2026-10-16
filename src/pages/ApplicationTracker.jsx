import { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INSTITUTION_BY_ID } from '../data/institutions';
import { COURSE_BY_ID } from '../data/courses';
import Logo from '../components/Logo';

import './ApplicationTracker.css';
import { useDialog } from '../components/DialogProvider';
import FundingMatchModal from '../components/FundingMatchModal';
import { matchFunding } from '../utils/matchFunding';
import { useSearchParams } from 'react-router-dom';

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

  const applications = useMemo(() => user?.applications || [], [user]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [fundingMatch, setFundingMatch] = useState(null);

  // React to ?new=<courseId> — opens the funding modal
  useEffect(() => {
    const courseId = searchParams.get('new');
    if (!courseId) return;
    const course = COURSE_BY_ID[courseId];
    if (!course) return;
    const result = matchFunding(user, course, { max: 6 });
    setFundingMatch({ course, funds: result.top });
    // clear the URL param so a refresh doesn't re-open the modal
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function closeFundingMatch() {
    setFundingMatch(null);
  }

  const [selectedId, setSelectedId] = useState(() => applications[0]?.id || null);
  const [sort, setSort] = useState('recent');

  useEffect(() => {
    if (applications.length === 0) { setSelectedId(null); return; }
    if (!applications.some((a) => a.id === selectedId)) {
      setSelectedId(applications[0].id);
    }
  }, [applications, selectedId]);

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

  const selected = applications.find((a) => a.id === selectedId) || null;

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

  function startFromShortlist(courseId) {
    const course = COURSE_BY_ID[courseId];
    if (!course) return;
    if (applications.some((a) => a.courseId === courseId)) {
      const existing = applications.find((a) => a.courseId === courseId);
      setSelectedId(existing.id);
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
    setSelectedId(app.id);
  }

  /* ── Mutators ─────────────────────────────────────────── */
  function patchApp(id, patch) {
    const next = applications.map((a) =>
      a.id === id ? { ...a, ...patch } : a
    );
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
    setSelectedId(next[0]?.id || null);
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

      <div className={"at-body" + (selected ? " has-detail" : "")}>
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
                onClick={() => setSelectedId(app.id)}
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
          {selected && (
            <DetailPanel
              app={selected}
              onBack={() => setSelectedId(null)}
              onPatch={(patch) => patchApp(selected.id, patch)}
              onDelete={() => deleteApp(selected.id)}
            />
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
   Detail panel
   ══════════════════════════════════════════════════════════ */
function DetailPanel({ app, onPatch, onDelete, onBack }) {
  const [tab, setTab] = useState('details');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => toDraft(app));

  useEffect(() => {
    setDraft(toDraft(app));
  }, [app.id, app.status, app.submittedDate, app.deadline, app.referenceNumber, app.notes]);

  const inst = INSTITUTION_BY_ID[app.institutionId];
  const docs = app.documents?.length ? app.documents : defaultDocs();

  function openEditor(presets = {}) {
    setDraft({ ...toDraft(app), ...presets });
    setEditing(true);
  }

  function saveEditor() {
    const patch = {
      status: draft.status,
      submittedDate: draft.status === 'Submitted' ? (draft.submittedDate || today()) : draft.submittedDate || null,
      deadline: draft.deadline || null,
      referenceNumber: draft.referenceNumber || makeRef(inst?.shortName || 'APP'),
      notes: draft.notes,
    };
    onPatch(patch);
    setEditing(false);
  }

  function toggleDoc(index) {
    const next = docs.map((d, i) => {
      if (i !== index) return d;
      const cycle = {
        'Pending': 'Uploaded',
        'Uploaded': 'Not required',
        'Not required': 'Pending',
      };
      return { ...d, status: cycle[d.status] || 'Pending' };
    });
    onPatch({ documents: next });
  }

  return (
    <div className="at-detail">
      {onBack && (
        <button type="button" className="at-mobile-back" onClick={onBack}>
          <BackArrow /> Back to applications
        </button>
      )}
      <div className="at-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'details'}
          className={`at-tab${tab === 'details' ? ' is-active' : ''}`}
          onClick={() => setTab('details')}
        >
          Application details
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'checklist'}
          className={`at-tab${tab === 'checklist' ? ' is-active' : ''}`}
          onClick={() => setTab('checklist')}
        >
          Document checklist
        </button>
      </div>

      <div className="at-detail-body">
        <div className="at-detail-head">
          <div className="at-detail-logo" aria-hidden="true">
            <Logo logoKey={inst?.logoKey || 'generic'} />
          </div>
          <div className="at-detail-head-text">
            <div className="at-detail-inst">{app.institutionName}</div>
            <div className="at-detail-course">{app.courseName}</div>
            <span className={`badge badge-${STATUS_TONE[app.status] || 'indigo'} at-detail-badge`}>
              {app.status}
            </span>
          </div>
        </div>

        {/* Submit CTA — visible until the app is actually Submitted or beyond */}
        {app.status === 'Preparing' && !editing && (
          <button
            type="button"
            className="at-submit-cta"
            onClick={() => openEditor({ status: 'Submitted', submittedDate: today() })}
          >
            <SendIcon />
            Submit application
            <MiniArrow />
          </button>
        )}

        <div className="at-meta-strip">
          <MetaCell label="Submitted" value={app.submittedDate ? formatDate(app.submittedDate) : '—'} />
          <MetaCell label="Deadline"  value={app.deadline ? formatDate(app.deadline) : '—'} />
          <MetaCell label="Reference number" value={app.referenceNumber || '—'} small />
        </div>

        {/* ─── EDITOR ─────────────────────────────── */}
        {editing && (
          <div className="at-editor">
            <div className="at-editor-head">
              <div className="at-editor-title">Update application</div>
              <button
                type="button"
                className="at-editor-close"
                onClick={() => setEditing(false)}
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="at-editor-grid">
              <div className="at-editor-field">
                <label className="at-editor-label">Status</label>
                <select
                  className="at-editor-input"
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="at-editor-field">
                <label className="at-editor-label">Submitted date</label>
                <input
                  type="date"
                  className="at-editor-input"
                  value={draft.submittedDate || ''}
                  onChange={(e) => setDraft({ ...draft, submittedDate: e.target.value })}
                />
              </div>

              <div className="at-editor-field">
                <label className="at-editor-label">Deadline</label>
                <input
                  type="date"
                  className="at-editor-input"
                  value={draft.deadline || ''}
                  onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                />
              </div>

              <div className="at-editor-field">
                <label className="at-editor-label">Reference number</label>
                <input
                  type="text"
                  className="at-editor-input"
                  value={draft.referenceNumber}
                  onChange={(e) => setDraft({ ...draft, referenceNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="at-editor-field">
              <label className="at-editor-label">Notes</label>
              <textarea
                className="at-editor-input at-editor-textarea"
                rows={3}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </div>

            <div className="at-editor-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveEditor}
              >
                Save changes
              </button>
            </div>
          </div>
        )}

        {/* ─── TABS BODY ──────────────────────────── */}
        {!editing && tab === 'details' && (
          <>
            <div className="at-section">
              <div className="at-section-title">Application status</div>
              <Timeline status={app.status} submittedDate={app.submittedDate} />
            </div>

            <div className="at-section">
              <div className="at-section-head">
                <div className="at-section-title">Notes</div>
                <button
                  type="button"
                  className="at-section-action"
                  onClick={() => openEditor()}
                >
                  Edit
                </button>
              </div>
              <div className="at-notes">
                {app.notes || defaultNote(app)}
              </div>
            </div>

            <div className="at-section">
              <div className="at-section-title">Useful links</div>
              <div className="at-links">
                {inst?.website && (
                  <a
                    className="at-link"
                    href={inst.website}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <LinkIcon /> {inst.shortName || 'Institution'} applications portal
                    <ExternalIcon />
                  </a>
                )}
                <Link to={`/courses?q=${encodeURIComponent(app.courseName)}`} className="at-link">
                  <LinkIcon /> Course information
                  <MiniArrow />
                </Link>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block at-update"
              onClick={() => openEditor()}
            >
              Update application
            </button>
          </>
        )}

        {!editing && tab === 'checklist' && (
          <div className="at-section">
            <div className="at-section-head">
              <div className="at-section-title">Required documents</div>
              <span className="at-section-hint">Click a document to update</span>
            </div>
            <div className="at-docs">
              {docs.map((doc, i) => (
                <DocumentRow
                  key={i}
                  doc={doc}
                  onClick={() => toggleDoc(i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaCell({ label, value, small }) {
  return (
    <div className="at-meta-cell">
      <div className="at-meta-label">{label}</div>
      <div className={`at-meta-value${small ? ' is-small' : ''}`}>{value}</div>
    </div>
  );
}

function Timeline({ status, submittedDate }) {
  const steps = [
    {
      key: 'prepared',
      label: 'Application prepared',
      body: status === 'Preparing' ? 'Currently editing' : 'Completed',
    },
    {
      key: 'submitted',
      label: 'Submitted to institution',
      body: submittedDate ? formatDate(submittedDate) : '—',
    },
    {
      key: 'awaiting',
      label: 'Awaiting response',
      body: status === 'Pending' ? 'In progress' : (status === 'Accepted' || status === 'Rejected') ? 'Completed' : '—',
    },
    {
      key: 'decision',
      label: 'Decision',
      body: status === 'Accepted' ? 'Accepted 🎉'
          : status === 'Rejected' ? 'Not this time'
          : 'Not yet available',
    },
  ];

  const activeIndex =
    status === 'Preparing' ? 0
    : status === 'Submitted' ? 1
    : status === 'Pending' ? 2
    : status === 'Accepted' || status === 'Rejected' ? 3
    : 1;

  return (
    <ol className="at-timeline">
      {steps.map((s, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'current' : 'todo';
        const decisionState = s.key === 'decision'
          ? (status === 'Accepted' ? 'done'
            : status === 'Rejected' ? 'fail'
            : 'todo')
          : null;
        const cls = decisionState || state;
        return (
          <li key={s.key} className={`at-timeline-step at-timeline-${cls}`}>
            <span className="at-timeline-marker">
              {cls === 'done' ? <CheckIcon /> :
               cls === 'fail' ? <XIcon /> :
               <span className="at-timeline-dot" />}
            </span>
            <div className="at-timeline-body">
              <div className="at-timeline-label">{s.label}</div>
              <div className="at-timeline-sub">{s.body}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function DocumentRow({ doc, onClick }) {
  const tone =
    doc.status === 'Uploaded' ? 'green'
    : doc.status === 'Pending' ? 'amber'
    : 'gray';
  return (
    <button
      type="button"
      className="at-doc"
      onClick={onClick}
      title="Click to cycle: Pending → Uploaded → Not required"
    >
      <span className="at-doc-icon"><FileIcon /></span>
      <span className="at-doc-label">{doc.label}</span>
      <span className={`at-doc-status at-doc-status-${tone}`}>{doc.status}</span>
      <span className="at-doc-arrow"><RefreshIcon /></span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   Institution logo monograms
   ══════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

function toDraft(app) {
  return {
    status: app.status || 'Preparing',
    submittedDate: app.submittedDate || '',
    deadline: app.deadline || '',
    referenceNumber: app.referenceNumber || '',
    notes: app.notes || '',
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Short, readable reference number: ABC-2026-1234 */
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

function defaultNote(app) {
  return `Application submitted through the ${app.institutionName} online portal. Reference number: ${app.referenceNumber || '—'}.`;
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
function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 5l-7 7 7 7" />
    </svg>
  );
}
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
function LinkIcon() { return (<svg {...iconProps(14)}>
  <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" />
  <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" />
</svg>); }
function ExternalIcon() { return (<svg {...iconProps(12)}>
  <path d="M15 4h5v5" /><path d="M20 4 10 14" />
  <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
</svg>); }
function RefreshIcon() { return (<svg {...iconProps(14)}>
  <path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" /><path d="M21 3v5h-5" />
  <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" /><path d="M3 21v-5h5" />
</svg>); }
function TrashIcon() { return (<svg {...iconProps(14)}>
  <path d="M4 7h16" /><path d="M9 7V4h6v3" />
  <path d="M6 7l1 14h10l1-14" />
</svg>); }
