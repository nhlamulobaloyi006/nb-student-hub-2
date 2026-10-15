import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  STREAMS,
  HOME_LANGUAGES,
  FAL_LANGUAGES,
  MATHEMATICS_OPTIONS,
  SUBJECT_GROUPS,
  INTEREST_GROUPS,
  STREAM_LABELS,
} from '../data/subjects';
import { COURSE_BY_ID } from '../data/courses';
import { FUNDING_BY_ID } from '../data/funding';
import {
  detectStream,
  applyStreamDefaults,
  validateSubjects,
  getTakenSubjects,
} from '../utils/subjectRules';
import { calculateAPS, MAX_APS } from '../utils/apsCalculator';

import './Profile.css';

const TABS = [
  { id: 'streams',   label: 'Streams' },
  { id: 'subjects',  label: 'Subjects' },
  { id: 'interests', label: 'Interests' },
  { id: 'saved',     label: 'Saved' },
];

export default function Profile() {
  const { user, updateUser, signOut } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('streams');
  const [draft, setDraft] = useState(() => snapshot(user));
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(snapshot(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const dirty = useMemo(() => isDirty(draft, user), [draft, user]);

  function patchDraft(patch) {
    setDraft((prev) => ({ ...prev, ...patch }));
    setError('');
  }
  function patchSubjects(patch) {
    setDraft((prev) => ({ ...prev, subjects: { ...prev.subjects, ...patch } }));
    setError('');
  }

  function selectStream(streamId) {
    const subjects = applyStreamDefaults(streamId, draft.subjects);
    setDraft((prev) => ({ ...prev, stream: streamId, subjects }));
  }

  function handleSave() {
    if (tab === 'subjects' || draft.stream) {
      const v = validateSubjects(draft.subjects);
      if (!v.valid) {
        setError(v.errors[0]);
        setTab('subjects');
        return;
      }
    }

    const autoStream = detectStream({ ...draft, stream: draft.stream });
    const finalStream = draft.stream || autoStream || '';

    // Prune marks for subjects no longer selected
    const picked = collectPickedSubjects(draft.subjects);
    const pickedSet = new Set(picked);
    const prunedMarks = {};
    for (const [k, v] of Object.entries(draft.subjectMarks || {})) {
      if (pickedSet.has(k)) prunedMarks[k] = v;
    }

    updateUser({
      name: draft.name,
      stream: finalStream,
      subjects: draft.subjects,
      subjectMarks: prunedMarks,
      interests: draft.interests,
    });
    setError('');
  }

  function handleCancel() {
    setDraft(snapshot(user));
    setError('');
  }

  function handleSignOut() {
    if (!window.confirm('Sign out of NB Student Hub?')) return;
    signOut();
    navigate('/signin', { replace: true });
  }

  const savedItems = user?.savedItems || [];
  const savedCourses = savedItems.filter((s) => s.type === 'course');
  const savedFunding = savedItems.filter((s) => s.type === 'funding');

  return (
    <div className="pr">
      <section className="pr-identity">
        <div className="pr-identity-left">
          <div className="pr-avatar" aria-hidden="true">{initials(draft.name)}</div>
          <div className="pr-identity-text">
            <div className="pr-name">{draft.name || 'Your profile'}</div>
            <div className="pr-email">{user?.email || '—'}</div>
            <div className="pr-created">Joined {formatJoin(user?.createdAt)}</div>
          </div>
        </div>

        <button type="button" className="btn btn-danger pr-signout" onClick={handleSignOut}>
          <LogoutIcon />
          Log out
        </button>
      </section>

      <nav className="pr-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={'pr-tab' + (tab === t.id ? ' is-active' : '')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === 'saved' && savedItems.length > 0 && (
              <span className="pr-tab-count">{savedItems.length}</span>
            )}
          </button>
        ))}
      </nav>

      <section className="pr-body">
        {tab === 'streams' && (
          <StreamsTab stream={draft.stream} onSelect={selectStream} />
        )}

        {tab === 'subjects' && (
          <SubjectsTab
            subjects={draft.subjects}
            marks={draft.subjectMarks}
            onChange={patchSubjects}
            onMarkChange={(subject, value) =>
              patchDraft({ subjectMarks: { ...draft.subjectMarks, [subject]: value } })
            }
          />
        )}

        {tab === 'interests' && (
          <InterestsTab
            interests={draft.interests}
            onToggle={(id) => {
              const exists = draft.interests.includes(id);
              patchDraft({
                interests: exists
                  ? draft.interests.filter((x) => x !== id)
                  : [...draft.interests, id],
              });
            }}
          />
        )}

        {tab === 'saved' && (
          <SavedTab
            courses={savedCourses}
            funding={savedFunding}
            onExploreCourses={() => navigate('/courses')}
            onRemove={(id, type) =>
              updateUser({
                savedItems: savedItems.filter((s) => !(s.id === id && s.type === type)),
              })
            }
          />
        )}
      </section>

      {tab !== 'saved' && (
        <div className="pr-savebar">
          <div className="pr-savebar-msg">
            {error ? (
              <span className="pr-error">{error}</span>
            ) : dirty ? (
              <span className="pr-dirty">You have unsaved changes.</span>
            ) : (
              <span className="pr-clean">All changes saved.</span>
            )}
          </div>
          <div className="pr-savebar-actions">
            <button type="button" className="btn btn-ghost" onClick={handleCancel} disabled={!dirty}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!dirty}>
              Save changes
            </button>
          </div>
        </div>
      )}

      {tab === 'saved' && (
        <div className="pr-savebar pr-savebar-alt">
          <span className="pr-clean">
            Saved items update immediately — no save needed on this tab.
          </span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Streams tab
   ══════════════════════════════════════════════════════════ */
function StreamsTab({ stream, onSelect }) {
  return (
    <div className="pr-tabpane">
      <div className="pr-pane-head">
        <h2 className="pr-pane-title">Your stream</h2>
        <p className="pr-pane-sub">
          Pick the stream that best matches your matric subjects. This helps us
          recommend courses you're likely to qualify for.
        </p>
      </div>

      <div className="pr-streams">
        {STREAMS.map((s) => {
          const active = stream === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={'pr-stream' + (active ? ' is-active' : '')}
              onClick={() => onSelect(s.id)}
              aria-pressed={active}
            >
              <span className="pr-stream-radio" aria-hidden="true" />
              <span className="pr-stream-label">{s.label}</span>
              <span className="pr-stream-blurb">{s.blurb}</span>
            </button>
          );
        })}
      </div>

      {stream && (
        <div className="pr-hint">
          <InfoIcon /> Selected stream: <b>{STREAM_LABELS[stream]}</b>. We've set sensible subject defaults — check the Subjects tab.
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Subjects tab
   ══════════════════════════════════════════════════════════ */
function SubjectsTab({ subjects, marks, onChange, onMarkChange }) {
  const electives = padElectives(subjects.electives);
  const allElectiveOptions = SUBJECT_GROUPS.flatMap((g) => g.subjects);

  const pickedSubjects = useMemo(() => {
    const core = [
      subjects.homeLanguage,
      subjects.fal,
      subjects.mathematics,
    ].filter(Boolean);
    const els = electives.filter(Boolean);
    return [...core, ...els];
  }, [subjects, electives]);

  const hlTaken = getTakenSubjects(subjects, 'homeLanguage');
  const falTaken = getTakenSubjects(subjects, 'fal');
  const mathTaken = getTakenSubjects(subjects, 'mathematics');

  const hlOptions = HOME_LANGUAGES.filter((o) => !hlTaken.has(o));
  const falOptions = FAL_LANGUAGES.filter((o) => !falTaken.has(o));
  const mathOptions = MATHEMATICS_OPTIONS.filter((o) => !mathTaken.has(o));

  function setElective(index, value) {
    const next = [...electives];
    next[index] = value;
    onChange({ electives: next.slice(0, 3) });
  }

  return (
    <div className="pr-tabpane">
      <div className="pr-pane-head">
        <h2 className="pr-pane-title">Your subjects</h2>
        <p className="pr-pane-sub">
          Add the subjects you're taking (or took) in matric. Then add a mark for
          each one to unlock course matching.
        </p>
      </div>

      <div className="pr-subjects-grid">
        <SelectField
          label="Home Language"
          value={subjects.homeLanguage}
          onChange={(v) => onChange({ homeLanguage: v })}
          options={hlOptions}
          placeholder="Select a language…"
        />
        <SelectField
          label="First Additional Language"
          value={subjects.fal}
          onChange={(v) => onChange({ fal: v })}
          options={falOptions}
          placeholder="Select a language…"
        />
        <SelectField
          label="Mathematics"
          value={subjects.mathematics}
          onChange={(v) => onChange({ mathematics: v })}
          options={mathOptions}
          placeholder="Select a maths option…"
        />

        {[0, 1, 2].map((i) => {
          const taken = getTakenSubjects(subjects, `elective-${i}`);
          const options = allElectiveOptions.filter((o) => !taken.has(o));
          return (
            <SelectField
              key={i}
              label={`Elective ${i + 1}`}
              value={electives[i] || ''}
              onChange={(v) => setElective(i, v)}
              options={['', ...options]}
              placeholder="Select a subject…"
            />
          );
        })}
      </div>

      <div className="pr-marks">
        <div className="pr-marks-title">Subject marks (%)</div>
        <p className="pr-marks-sub">
          Optional but recommended — we use these to calculate your APS and check
          eligibility for each course.
        </p>

        {pickedSubjects.length === 0 ? (
          <div className="pr-marks-empty">
            Select at least one subject above to start adding marks.
          </div>
        ) : (
          <div className="pr-marks-grid">
            {pickedSubjects.map((s) => (
              <div key={s} className="pr-mark-row">
                <span className="pr-mark-label">{s}</span>
                <div className="pr-mark-input-wrap">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    className="pr-mark-input"
                    value={marks[s] ?? ''}
                    placeholder="—"
                    onChange={(e) => {
                      const raw = e.target.value;
                      onMarkChange(s, raw === '' ? '' : Math.max(0, Math.min(100, Number(raw))));
                    }}
                  />
                  <span className="pr-mark-suffix">%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ApsPanel subjects={subjects} marks={marks} onChange={onChange} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   APS Panel
   ══════════════════════════════════════════════════════════ */
function ApsPanel({ subjects, marks, onChange }) {
  const apsInfo = calculateAPS(marks || {});
  const hasMarks = Object.keys(marks || {}).length > 0;

  const allPicked = collectPickedSubjects(subjects);
  const hasLO = allPicked.some((s) => String(s).toLowerCase().startsWith('life orientation'));

  const electives = padElectives(subjects?.electives);
  const firstEmptyElective = electives.findIndex((e) => !e);

  function addLO() {
    if (!onChange || firstEmptyElective === -1) return;
    const next = [...electives];
    next[firstEmptyElective] = 'Life Orientation';
    onChange({ electives: next });
  }

  const countedSubjects = apsInfo.counted.slice().sort((a, b) => b.points - a.points);
  const excludedSubjects = apsInfo.excluded.slice();

  const totalSubjectsInList = allPicked.length;
  const showExcludedNote = excludedSubjects.length > 0;

  return (
    <div className="pr-aps">
      <div className="pr-aps-head">
        <div>
          <div className="pr-aps-title">Your APS</div>
          <div className="pr-aps-sub">
            Your best six subjects count. Add Life Orientation for a fixed
            +1 point. Some universities exclude LO — always check the course page.
          </div>
        </div>
        <div className="pr-aps-score">
          <span className="pr-aps-score-value">{hasMarks ? apsInfo.total : '—'}</span>
          <span className="pr-aps-score-max">/{MAX_APS}</span>
        </div>
      </div>

      {!hasMarks ? (
        <div className="pr-aps-empty">
          Add marks above to see your APS breakdown.
        </div>
      ) : (
        <div className="pr-aps-rows">
          {countedSubjects.map((row) => (
            <div key={row.subject} className="pr-aps-row is-counted">
              <span className="pr-aps-row-subject">
                {row.subject}
                {row.isLO && <span className="pr-aps-lo-tag">LO · +1 point</span>}
              </span>
              <span className="pr-aps-row-pct">{row.percentage}%</span>
              <span className="pr-aps-row-level">L{row.points}</span>
              <span className="pr-aps-row-status">Counted</span>
            </div>
          ))}

          {excludedSubjects.map((row) => (
            <div key={row.subject} className="pr-aps-row is-excluded">
              <span className="pr-aps-row-subject">
                {row.subject}
                {row.isLO && <span className="pr-aps-lo-tag">LO · +1 point</span>}
              </span>
              <span className="pr-aps-row-pct">{row.percentage}%</span>
              <span className="pr-aps-row-level">L{row.points}</span>
              <span className="pr-aps-row-status">Not counted</span>
            </div>
          ))}

          {showExcludedNote && (
            <div className="pr-aps-note">
              {totalSubjectsInList} subjects entered. Only your top 6 count toward APS —
              the rest are shown here for reference.
            </div>
          )}
        </div>
      )}

      {!hasLO && firstEmptyElective !== -1 && hasMarks && (
        <button
          type="button"
          className="pr-aps-addlo"
          onClick={addLO}
        >
          <span className="pr-aps-addlo-icon"><PlusIcon /></span>
          <span className="pr-aps-addlo-body">
            <span className="pr-aps-addlo-title">Add Life Orientation for +1 APS point</span>
            <span className="pr-aps-addlo-sub">
              Life Orientation gives exactly 1 point toward your APS. Enter any mark
              between 30 and 100.
            </span>
          </span>
          <span className="pr-aps-addlo-arrow"><MiniArrow /></span>
        </button>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div className="pr-field">
      <label className="field-label">{label}</label>
      <select
        className="select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o || '—'}</option>
        ))}
      </select>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Interests tab
   ══════════════════════════════════════════════════════════ */
function InterestsTab({ interests, onToggle }) {
  return (
    <div className="pr-tabpane">
      <div className="pr-pane-head">
        <h2 className="pr-pane-title">Your interests</h2>
        <p className="pr-pane-sub">
          Tell us what you're curious about. We'll use these to tailor course and
          career suggestions.
        </p>
      </div>

      <div className="pr-interest-groups">
        {INTEREST_GROUPS.map((g) => (
          <div key={g.id} className="pr-interest-group">
            <div className="pr-interest-group-label">{g.label}</div>
            <div className="pr-interest-chips">
              {g.interests.map((i) => {
                const active = interests.includes(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    className={'pr-interest-chip' + (active ? ' is-active' : '')}
                    onClick={() => onToggle(i.id)}
                    aria-pressed={active}
                  >
                    {i.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {interests.length > 0 && (
        <div className="pr-hint">
          <InfoIcon /> You've picked <b>{interests.length}</b> interest
          {interests.length === 1 ? '' : 's'}.
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Saved tab
   ══════════════════════════════════════════════════════════ */
function SavedTab({ courses, funding, onExploreCourses, onRemove }) {
  return (
    <div className="pr-tabpane">
      <div className="pr-pane-head">
        <h2 className="pr-pane-title">Saved items</h2>
        <p className="pr-pane-sub">
          Courses and funding opportunities you've bookmarked.
        </p>
      </div>

      {courses.length === 0 && funding.length === 0 ? (
        <div className="pr-saved-empty">
          <div className="pr-saved-empty-title">Nothing saved yet</div>
          <div className="pr-saved-empty-sub">
            Bookmark courses on the Course Finder and funding options on the Funding
            page to keep track of them here.
          </div>
          <button type="button" className="btn btn-primary" onClick={onExploreCourses}>
            Explore courses <MiniArrow />
          </button>
        </div>
      ) : (
        <>
          {courses.length > 0 && (
            <div className="pr-saved-section">
              <div className="pr-saved-head">
                <div className="pr-saved-title">Saved courses ({courses.length})</div>
              </div>
              <div className="pr-saved-list">
                {courses.map((s) => {
                  const c = COURSE_BY_ID[s.id];
                  if (!c) return null;
                  return (
                    <div key={s.id} className="pr-saved-item">
                      <div className="pr-saved-item-body">
                        <div className="pr-saved-item-title">{c.name}</div>
                        <div className="pr-saved-item-sub">{c.university}</div>
                      </div>
                      <button
                        type="button"
                        className="pr-saved-remove"
                        onClick={() => onRemove(s.id, s.type)}
                        aria-label="Remove"
                      >
                        <XIcon />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {funding.length > 0 && (
            <div className="pr-saved-section">
              <div className="pr-saved-head">
                <div className="pr-saved-title">Saved funding ({funding.length})</div>
              </div>
              <div className="pr-saved-list">
                {funding.map((s) => {
                  const f = FUNDING_BY_ID[s.id];
                  if (!f) return null;
                  return (
                    <div key={s.id} className="pr-saved-item">
                      <div className="pr-saved-item-body">
                        <div className="pr-saved-item-title">{f.name}</div>
                        <div className="pr-saved-item-sub">{f.provider}</div>
                      </div>
                      <button
                        type="button"
                        className="pr-saved-remove"
                        onClick={() => onRemove(s.id, s.type)}
                        aria-label="Remove"
                      >
                        <XIcon />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

function padElectives(arr) {
  const next = Array.isArray(arr) ? [...arr] : [];
  while (next.length < 3) next.push('');
  return next.slice(0, 3);
}

function collectPickedSubjects(subjects) {
  if (!subjects) return [];
  const core = [subjects.homeLanguage, subjects.fal, subjects.mathematics].filter(Boolean);
  const els = padElectives(subjects.electives).filter(Boolean);
  return [...core, ...els];
}

function snapshot(user) {
  const subjects = user?.subjects || {};
  return {
    name: user?.name || '',
    stream: user?.stream || '',
    subjects: {
      homeLanguage: subjects.homeLanguage || '',
      fal: subjects.fal || '',
      mathematics: subjects.mathematics || '',
      electives: padElectives(subjects.electives),
    },
    subjectMarks: user?.subjectMarks || {},
    interests: user?.interests || [],
  };
}

function isDirty(draft, user) {
  if (!user) return false;
  const blankSubjects = { homeLanguage: '', fal: '', mathematics: '', electives: ['', '', ''] };
  return (
    draft.name !== (user.name || '') ||
    draft.stream !== (user.stream || '') ||
    JSON.stringify(draft.subjects) !== JSON.stringify(user.subjects || blankSubjects) ||
    JSON.stringify(draft.subjectMarks) !== JSON.stringify(user.subjectMarks || {}) ||
    JSON.stringify([...draft.interests].sort()) !== JSON.stringify([...(user.interests || [])].sort())
  );
}

function initials(name) {
  if (!name) return '·';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

function formatJoin(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
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
function MiniArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function PlusIcon() { return (<svg {...iconProps(14)}>
  <path d="M12 5v14M5 12h14" />
</svg>); }
function LogoutIcon() { return (<svg {...iconProps(16)}>
  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
  <path d="M10 17l-5-5 5-5" /><path d="M15 12H5" />
</svg>); }
function InfoIcon() { return (<svg {...iconProps(14)}>
  <circle cx="12" cy="12" r="9.4" />
  <path d="M12 10.5v6" /><circle cx="12" cy="7.6" r="0.9" fill="currentColor" />
</svg>); }
function XIcon() { return (<svg {...iconProps(14)}>
  <path d="M6 6l12 12M18 6 6 18" />
</svg>); }
