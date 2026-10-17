import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INSTITUTION_BY_ID } from '../data/institutions';
import Logo from '../components/Logo';

import './ApplicationDetail.css';
import { useDialog } from '../components/DialogProvider';

const STATUSES = ['Preparing', 'Submitted', 'Pending', 'Accepted', 'Rejected'];

const STATUS_TONE = {
  Submitted: 'indigo',
  Pending:   'amber',
  Preparing: 'gold',
  Accepted:  'green',
  Rejected:  'red',
};

export default function ApplicationDetail({ id: propId, onClose }) {
  const { confirm } = useDialog();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const id = propId || urlId;

  const applications = useMemo(() => user?.applications || [], [user]);
  const app = applications.find((a) => a.id === id) || null;

  const [tab, setTab] = useState('details');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => toDraft(app));

  useEffect(() => {
    if (app) setDraft(toDraft(app));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, app?.status, app?.submittedDate, app?.deadline, app?.referenceNumber, app?.notes]);

  if (!app) {
    return (
      <div className="ad">
        <button
          type="button"
          className="ad-back"
          onClick={() => onClose ? onClose() : navigate('/applications')}
        >
          <BackArrow /> Back to applications
        </button>
        <div className="ad-missing">
          <div className="ad-missing-icon" aria-hidden="true"><FileIcon /></div>
          <div className="ad-missing-title">Application not found</div>
          <div className="ad-missing-sub">
            This application may have been deleted. Head back to the list to see your other applications.
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/applications')}
          >
            Back to applications <MiniArrow />
          </button>
        </div>
      </div>
    );
  }

  const inst = INSTITUTION_BY_ID[app.institutionId];
  const docs = app.documents?.length ? app.documents : defaultDocs();

  function openEditor(presets = {}) {
    setDraft({ ...toDraft(app), ...presets });
    setEditing(true);
  }

  function patch(patchData) {
    const next = applications.map((a) => (a.id === app.id ? { ...a, ...patchData } : a));
    updateUser({ applications: next });
  }

  function saveEditor() {
    const patchData = {
      status: draft.status,
      submittedDate: draft.status === 'Submitted'
        ? (draft.submittedDate || today())
        : (draft.submittedDate || null),
      deadline: draft.deadline || null,
      referenceNumber: draft.referenceNumber || makeRef(inst?.shortName || 'APP'),
      notes: draft.notes,
    };
    patch(patchData);
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
    patch({ documents: next });
  }

  async function deleteApp() {
    const ok = await confirm({
      title: 'Delete this application?',
      body: app.institutionName + ' — ' + app.courseName + '. This cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    const next = applications.filter((a) => a.id !== app.id);
    updateUser({ applications: next });
    if (onClose) onClose(); else navigate('/applications', { replace: true });
  }

  return (
    <div className="ad">
      <button
        type="button"
        className="ad-back"
        onClick={() => navigate('/applications')}
      >
        <BackArrow /> Back to applications
      </button>

      <div className="ad-detail">
        <div className="ad-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'details'}
            className={`ad-tab${tab === 'details' ? ' is-active' : ''}`}
            onClick={() => setTab('details')}
          >
            Application details
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'checklist'}
            className={`ad-tab${tab === 'checklist' ? ' is-active' : ''}`}
            onClick={() => setTab('checklist')}
          >
            Document checklist
          </button>
        </div>

        <div className="ad-detail-body">
          <div className="ad-detail-head">
            <div className="ad-detail-logo" aria-hidden="true">
              <Logo logoKey={inst?.logoKey || 'generic'} />
            </div>
            <div className="ad-detail-head-text">
              <div className="ad-detail-inst">{app.institutionName}</div>
              <div className="ad-detail-course">{app.courseName}</div>
              <span className={`badge badge-${STATUS_TONE[app.status] || 'indigo'} ad-detail-badge`}>
                {app.status}
              </span>
            </div>
          </div>

          {app.status === 'Preparing' && !editing && (
            <button
              type="button"
              className="ad-submit-cta"
              onClick={() => openEditor({ status: 'Submitted', submittedDate: today() })}
            >
              <SendIcon />
              Submit application
              <MiniArrow />
            </button>
          )}

          <div className="ad-meta-strip">
            <MetaCell label="Submitted" value={app.submittedDate ? formatDate(app.submittedDate) : '—'} />
            <MetaCell label="Deadline"  value={app.deadline ? formatDate(app.deadline) : '—'} />
            <MetaCell label="Reference number" value={app.referenceNumber || '—'} small />
          </div>

          {editing && (
            <div className="ad-editor">
              <div className="ad-editor-head">
                <div className="ad-editor-title">Update application</div>
                <button
                  type="button"
                  className="ad-editor-close"
                  onClick={() => setEditing(false)}
                  aria-label="Close"
                >
                  <XIcon />
                </button>
              </div>

              <div className="ad-editor-grid">
                <div className="ad-editor-field">
                  <label className="ad-editor-label">Status</label>
                  <select
                    className="ad-editor-input"
                    value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="ad-editor-field">
                  <label className="ad-editor-label">Submitted date</label>
                  <input
                    type="date"
                    className="ad-editor-input"
                    value={draft.submittedDate || ''}
                    onChange={(e) => setDraft({ ...draft, submittedDate: e.target.value })}
                  />
                </div>

                <div className="ad-editor-field">
                  <label className="ad-editor-label">Deadline</label>
                  <input
                    type="date"
                    className="ad-editor-input"
                    value={draft.deadline || ''}
                    onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                  />
                </div>

                <div className="ad-editor-field">
                  <label className="ad-editor-label">Reference number</label>
                  <input
                    type="text"
                    className="ad-editor-input"
                    value={draft.referenceNumber}
                    onChange={(e) => setDraft({ ...draft, referenceNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="ad-editor-field">
                <label className="ad-editor-label">Notes</label>
                <textarea
                  className="ad-editor-input ad-editor-textarea"
                  rows={3}
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </div>

              <div className="ad-editor-actions">
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

          {!editing && tab === 'details' && (
            <>
              <div className="ad-section">
                <div className="ad-section-title">Application status</div>
                <Timeline status={app.status} submittedDate={app.submittedDate} />
              </div>

              <div className="ad-section">
                <div className="ad-section-head">
                  <div className="ad-section-title">Notes</div>
                  <button
                    type="button"
                    className="ad-section-action"
                    onClick={() => openEditor()}
                  >
                    Edit
                  </button>
                </div>
                <div className="ad-notes">
                  {app.notes || defaultNote(app)}
                </div>
              </div>

              <div className="ad-section">
                <div className="ad-section-title">Useful links</div>
                <div className="ad-links">
                  {inst?.website && (
                    <a
                      className="ad-link"
                      href={inst.website}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <LinkIcon /> {inst.shortName || 'Institution'} applications portal
                      <ExternalIcon />
                    </a>
                  )}
                  <Link to={`/courses?q=${encodeURIComponent(app.courseName)}`} className="ad-link">
                    <LinkIcon /> Course information
                    <MiniArrow />
                  </Link>
                </div>
              </div>

              <div className="ad-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-block ad-update"
                  onClick={() => openEditor()}
                >
                  Update application
                </button>
                <button
                  type="button"
                  className="btn btn-ghost ad-delete"
                  onClick={deleteApp}
                >
                  <TrashIcon /> Delete application
                </button>
              </div>
            </>
          )}

          {!editing && tab === 'checklist' && (
            <div className="ad-section">
              <div className="ad-section-head">
                <div className="ad-section-title">Required documents</div>
                <span className="ad-section-hint">Click a document to update</span>
              </div>
              <div className="ad-docs">
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
    </div>
  );
}

function MetaCell({ label, value, small }) {
  return (
    <div className="ad-meta-cell">
      <div className="ad-meta-label">{label}</div>
      <div className={`ad-meta-value${small ? ' is-small' : ''}`}>{value}</div>
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
      body: status === 'Accepted' ? 'Accepted'
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
    <ol className="ad-timeline">
      {steps.map((s, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'current' : 'todo';
        const decisionState = s.key === 'decision'
          ? (status === 'Accepted' ? 'done'
            : status === 'Rejected' ? 'fail'
            : 'todo')
          : null;
        const cls = decisionState || state;
        return (
          <li key={s.key} className={`ad-timeline-step ad-timeline-${cls}`}>
            <span className="ad-timeline-marker">
              {cls === 'done' ? <CheckIcon /> :
               cls === 'fail' ? <XIcon /> :
               <span className="ad-timeline-dot" />}
            </span>
            <div className="ad-timeline-body">
              <div className="ad-timeline-label">{s.label}</div>
              <div className="ad-timeline-sub">{s.body}</div>
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
      className="ad-doc"
      onClick={onClick}
      title="Click to cycle: Pending -> Uploaded -> Not required"
    >
      <span className="ad-doc-icon"><FileIcon /></span>
      <span className="ad-doc-label">{doc.label}</span>
      <span className={`ad-doc-status ad-doc-status-${tone}`}>{doc.status}</span>
      <span className="ad-doc-arrow"><RefreshIcon /></span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

function toDraft(app) {
  if (!app) {
    return { status: 'Preparing', submittedDate: '', deadline: '', referenceNumber: '', notes: '' };
  }
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

function makeRef(shortName) {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${String(shortName || 'APP').toUpperCase()}-${year}-${num}`;
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
function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 5l-7 7 7 7" />
    </svg>
  );
}
function SendIcon() { return (<svg {...iconProps(16)}>
  <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" />
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
