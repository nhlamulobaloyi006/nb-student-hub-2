import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RESOURCES, RESOURCE_TYPES } from '../data/resources';
import './StudyResources.css';
import { useDialog } from '../components/DialogProvider';

const TYPE_TABS = ['All', ...RESOURCE_TYPES];

/* Map a user's subject label → possible resource subject tags */
function subjectMatches(resourceSubject, userSubjects) {
  if (!userSubjects.length) return true;
  const r = String(resourceSubject || '').toLowerCase();
  return userSubjects.some((s) => {
    const subj = String(s || '').toLowerCase();
    // Direct match, or the resource tag is contained in the user's subject
    // (e.g. "Afrikaans First Additional Language" contains "afrikaans")
    return (
      r === subj ||
      subj.includes(r) ||
      r.includes(subj) ||
      // Handle common shorthand: 'Mathematics' matches 'Mathematical Literacy' too
      (r === 'mathematics' && subj.includes('mathematics')) ||
      (r === 'mathematical literacy' && subj.includes('mathematical literacy'))
    );
  });
}

export default function StudyResources() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [mineOnly, setMineOnly] = useState(true);

  const userSubjects = useMemo(() => {
    const s = user?.subjects || {};
    const list = [];
    if (s.homeLanguage) list.push(s.homeLanguage);
    if (s.fal) list.push(s.fal);
    if (s.mathematics) list.push(s.mathematics);
    if (Array.isArray(s.electives)) {
      s.electives.filter(Boolean).forEach((e) => list.push(e));
    }
    // Always allow "General" resources through
    return list;
  }, [user?.subjects]);

  const hasSubjects = userSubjects.length > 0;
  const applyFilter = hasSubjects && mineOnly;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (type !== 'All' && r.type !== type) return false;
      if (q && !(r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q))) return false;
      if (applyFilter && r.subject !== 'General') {
        if (!subjectMatches(r.subject, userSubjects)) return false;
      }
      return true;
    });
  }, [query, type, applyFilter, userSubjects]);

  const counts = useMemo(() => {
    const acc = { All: RESOURCES.length };
    RESOURCE_TYPES.forEach((t) => {
      acc[t] = RESOURCES.filter((r) => r.type === t).length;
    });
    return acc;
  }, []);

  return (
    <div className="sr">
      <header className="sr-head">
        <div>
          <h1 className="sr-title">Study Resources</h1>
          <p className="sr-sub">
            Past papers, revision packs and study guides to help you prepare.
          </p>
        </div>
      </header>

      {/* Filter row */}
      <div className="sr-filterbar">
        <div className="sr-filterbar-left">
          {hasSubjects ? (
            <button
              type="button"
              className={'sr-toggle' + (mineOnly ? ' is-on' : '')}
              onClick={() => setMineOnly((v) => !v)}
              aria-pressed={mineOnly}
            >
              <span className="sr-toggle-switch">
                <span className="sr-toggle-dot" />
              </span>
              <span className="sr-toggle-label">
                My subjects only
              </span>
              <span className="sr-toggle-count">
                ({userSubjects.length} subject{userSubjects.length === 1 ? '' : 's'} matched)
              </span>
            </button>
          ) : (
            <Link to="/profile" className="sr-emptyhint">
              <InfoIcon />
              Add your subjects on Profile to see resources tailored to you.
            </Link>
          )}
        </div>
      </div>

      <div className="sr-toolbar">
        <div className="sr-search-wrap">
          <SearchIcon />
          <input
            className="sr-search"
            placeholder="Search by title or subject…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="sr-search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <XIcon />
            </button>
          )}
        </div>

        <div className="sr-tabs">
          {TYPE_TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={'sr-chip' + (type === t ? ' is-active' : '')}
              onClick={() => setType(t)}
            >
              {t}
              <span className="sr-chip-count">{counts[t] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sr-count">
        Showing {visible.length} of {RESOURCES.length} resources
        {applyFilter && (
          <> · filtered to your subjects</>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="sr-empty">
          <div className="sr-empty-title">No resources match.</div>
          <div className="sr-empty-sub">
            {applyFilter
              ? 'Try turning off "My subjects only" to see everything.'
              : 'Try a different search term or clear the filter.'}
          </div>
        </div>
      ) : (
        <div className="sr-list">
          {visible.map((r) => (
            <ResourceRow key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceRow({ resource }) {
  const { alert } = useDialog();
  const typeTone =
    resource.type === 'Past Papers' ? 'indigo'
    : resource.type === 'Revision' ? 'gold'
    : 'green';

  return (
    <div className="sr-row">
      <div className="sr-row-icon"><FileIcon /></div>

      <div className="sr-row-body">
        <div className="sr-row-title">{resource.title}</div>
        <div className="sr-row-meta">
          <span className="sr-row-subject">{resource.subject}</span>
          <span className="sr-row-dot" />
          <span className={`badge badge-${typeTone}`}>{resource.type}</span>
          {resource.year && (<>
            <span className="sr-row-dot" />
            <span>{resource.year}</span>
          </>)}
          <span className="sr-row-dot" />
          <span>{resource.size}</span>
          {resource.language && resource.language !== 'English' && (<>
            <span className="sr-row-dot" />
            <span>{resource.language}</span>
          </>)}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-outline sr-row-dl"
        onClick={() => {
          alert({
            title: 'Demo download',
            body: resource.title + ' — in the real app this would open or download the PDF.',
            confirmLabel: 'Got it',
          });
        }}
      >
        <DownloadIcon />
        Download
      </button>
    </div>
  );
}

function iconProps(size = 16) {
  return {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
}
function SearchIcon() { return (<svg {...iconProps(16)}>
  <circle cx="11" cy="11" r="6" /><path d="m20 20-3.6-3.6" />
</svg>); }
function XIcon() { return (<svg {...iconProps(14)}>
  <path d="M6 6l12 12M18 6 6 18" />
</svg>); }
function FileIcon() { return (<svg {...iconProps(20)}>
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  <path d="M14 3v5h5" />
  <path d="M9 13h6M9 17h4" />
</svg>); }
function DownloadIcon() { return (<svg {...iconProps(14)}>
  <path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" />
</svg>); }
function InfoIcon() { return (<svg {...iconProps(14)}>
  <circle cx="12" cy="12" r="9.4" />
  <path d="M12 10.5v6" /><circle cx="12" cy="7.6" r="0.9" fill="currentColor" />
</svg>); }
