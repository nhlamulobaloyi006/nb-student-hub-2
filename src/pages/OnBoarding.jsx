import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  STREAMS,
  HOME_LANGUAGES,
  FAL_LANGUAGES,
  MATHEMATICS_OPTIONS,
  SUBJECT_GROUPS,
  INTEREST_GROUPS,
} from '../data/subjects';
import {
  detectStream,
  validateSubjects,
  getTakenSubjects,
} from '../utils/subjectRules';
import { calculateAPS } from '../utils/apsCalculator';
import './Onboarding.css';
import Logo from '../components/Logo';
import MatchCelebrationModal from '../components/MatchCelebrationModal';
import { getMatchSummary } from '../utils/matchCourses';

const STEPS = ['stream', 'subjects', 'marks', 'interests'];

/* ============================================================
   Main
   ============================================================ */

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState(null);
  const [direction, setDirection] = useState('forward'); // 'forward' | 'back'

  const [stream, setStream] = useState(user?.stream || '');
  const [subjects, setSubjects] = useState(() => normaliseSubjects(user?.subjects));
  const [subjectMarks, setSubjectMarks] = useState(() => user?.subjectMarks || {});

  function updateSubjects(nextSubjects) {
    const picked = getPickedSubjects(nextSubjects);
    const pickedSet = new Set(picked);
    const prunedMarks = {};
    for (const [k, v] of Object.entries(subjectMarks || {})) {
      if (pickedSet.has(k)) prunedMarks[k] = v;
    }
    setSubjects(nextSubjects);
    setSubjectMarks(prunedMarks);
  }
  const [interests, setInterests] = useState(() => user?.interests || []);

  /* Reset scroll on step change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  /* Auto-detect stream if user hasn't picked one but their subjects imply one */
  useEffect(() => {
    if (!stream) {
      const detected = detectStream({ stream: '', subjects, interests });
      if (detected) setStream(detected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Validation per step ---- */
  const stepValid = useMemo(() => {
    if (step === 0) return !!stream;
    if (step === 1) return validateSubjects(subjects).valid;
    if (step === 2) {
      // Every picked subject has a mark from 0–100
      const picked = getPickedSubjects(subjects);
      if (picked.length === 0) return false;
      return picked.every((s) => {
        const m = subjectMarks[s];
        return typeof m === 'number' && m >= 0 && m <= 100;
      });
    }
    if (step === 3) return interests.length >= 1;
    return false;
  }, [step, stream, subjects, subjectMarks, interests]);

  const canSaveAll =
    !!stream &&
    validateSubjects(subjects).valid &&
    getPickedSubjects(subjects).every((s) => {
      const m = subjectMarks[s];
      return typeof m === 'number' && m >= 0 && m <= 100;
    }) &&
    interests.length >= 1;

  /* ---- Actions ---- */
  function goNext() {
    if (!stepValid || step >= STEPS.length - 1) return;
    setDirection('forward');
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) return;
    setDirection('back');
    setStep((s) => s - 1);
  }

  function handleSave() {
    if (!canSaveAll) return;
    const nextUser = {
      ...user,
      stream,
      subjects,
      subjectMarks,
      interests,
      onboardingComplete: true,
      aps: calculateAPS(subjectMarks).total,
    };
    updateUser(nextUser);

    const matchSummary = getMatchSummary(nextUser, 3);
    if (matchSummary.total > 0) {
      setSummary(matchSummary);
    } else {
      navigate('/dashboard?welcome=1');
    }
  }

  function closeCelebration() {
    setSummary(null);
    navigate('/dashboard?welcome=1');
  }

  function handleSkip() {
    if (!window.confirm('Skip setup? You can always finish it later from your Profile.')) return;
    navigate('/dashboard');
  }

  /* ---- Render ---- */
  return (
    <div className="ob">
      <header className="ob-head">
        <div className="ob-head-left">
          <div className="ob-brand">
            <div className="ob-brand-mark" aria-hidden="true"><img src="/logos/logo.png" alt="" className="ob-brand-img" /></div>
            <div className="ob-brand-name">NB Student Hub</div>
          </div>
          <div className="ob-step-caption">
            Step {step + 1} of {STEPS.length}
          </div>
        </div>
        <button type="button" className="ob-skip" onClick={handleSkip}>
          Skip for now
        </button>
      </header>

      {/* Progress dots */}
      <div className="ob-progress">
        <div className="ob-progress-track">
          <div
            className="ob-progress-fill"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="ob-progress-dots">
          {STEPS.map((id, i) => (
            <div
              key={id}
              className={
                'ob-progress-dot' +
                (i < step ? ' is-done' : '') +
                (i === step ? ' is-current' : '')
              }
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className={`ob-body ob-body-${direction}`} key={step}>
        {step === 0 && (
          <StreamStep
            stream={stream}
            subjects={subjects}
            interests={interests}
            onPick={setStream}
          />
        )}
        {step === 1 && (
          <SubjectsStep
            subjects={subjects}
            onChange={updateSubjects}
          />
        )}
        {step === 2 && (
          <MarksStep
            subjects={subjects}
            marks={subjectMarks}
            onChange={setSubjectMarks}
          />
        )}
        {step === 3 && (
          <InterestsStep
            interests={interests}
            onToggle={(id) => {
              setInterests((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              );
            }}
          />
        )}
      </div>

      {summary && (
        <MatchCelebrationModal
          summary={summary}
          onClose={closeCelebration}
        />
      )}

      {/* Footer navigation */}
      <div className="ob-footer">
        <button
          type="button"
          className="btn btn-ghost ob-back"
          onClick={goBack}
          disabled={step === 0}
        >
          <BackArrow /> Back
        </button>

        <div className="ob-footer-right">
          <div className="ob-footer-hint">
            {!stepValid && step === 0 && 'Pick a stream to continue'}
            {!stepValid && step === 1 && 'Fill all 6 subjects to continue'}
            {!stepValid && step === 2 && 'Add a mark for every subject'}
            {!stepValid && step === 3 && 'Pick at least 1 interest to finish'}
            {stepValid && step < STEPS.length - 1 && 'Looking good — next step'}
            {stepValid && step === STEPS.length - 1 && 'Ready to save'}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary ob-next"
              onClick={goNext}
              disabled={!stepValid}
            >
              Continue <MiniArrow />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary ob-next"
              onClick={handleSave}
              disabled={!canSaveAll}
            >
              Create my profile <MiniArrow />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Step 1 — Stream
   ============================================================ */

function StreamStep({ stream, subjects, interests, onPick }) {
  const auto = useMemo(
    () => detectStream({ stream: '', subjects, interests }),
    [subjects, interests]
  );

  return (
    <section className="ob-pane">
      <h1 className="ob-title">Which stream are you in?</h1>
      <p className="ob-sub">
        Your stream shapes the courses and careers we suggest. You can change it later.
      </p>

      <div className="ob-streams">
        {STREAMS.map((s) => {
          const active = stream === s.id;
          const isAuto = auto === s.id && !stream;
          return (
            <button
              key={s.id}
              type="button"
              className={'ob-stream' + (active ? ' is-active' : '')}
              onClick={() => onPick(s.id)}
              aria-pressed={active}
            >
              <span className="ob-stream-radio" aria-hidden="true" />
              <span className="ob-stream-label">{s.label}</span>
              <span className="ob-stream-blurb">{s.blurb}</span>
              {isAuto && (
                <span className="ob-stream-hint">Looks like you — suggested</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   Step 2 — Subjects
   ============================================================ */

function SubjectsStep({ subjects, onChange }) {
  const electives = padElectives(subjects.electives);
  const allElectiveOptions = SUBJECT_GROUPS.flatMap((g) => g.subjects);

  function setField(field, value) {
    onChange({ ...subjects, [field]: value });
  }

  function setElective(index, value) {
    const next = [...electives];
    next[index] = value;
    onChange({ ...subjects, electives: next.slice(0, 3) });
  }

  const hlTaken = getTakenSubjects(subjects, 'homeLanguage');
  const falTaken = getTakenSubjects(subjects, 'fal');
  const mathTaken = getTakenSubjects(subjects, 'mathematics');

  const hlOptions = HOME_LANGUAGES.filter((o) => !hlTaken.has(o));
  const falOptions = FAL_LANGUAGES.filter((o) => !falTaken.has(o));
  const mathOptions = MATHEMATICS_OPTIONS.filter((o) => !mathTaken.has(o));

  return (
    <section className="ob-pane">
      <h1 className="ob-title">Which subjects are you taking?</h1>
      <p className="ob-sub">
        Pick the 6 subjects you're doing (or did) in matric. No duplicates allowed.
      </p>

      <div className="ob-grid">
        <ObSelect
          label="Home Language"
          value={subjects.homeLanguage}
          onChange={(v) => setField('homeLanguage', v)}
          options={hlOptions}
          placeholder="Select a language…"
        />
        <ObSelect
          label="First Additional Language"
          value={subjects.fal}
          onChange={(v) => setField('fal', v)}
          options={falOptions}
          placeholder="Select a language…"
        />
        <ObSelect
          label="Mathematics"
          value={subjects.mathematics}
          onChange={(v) => setField('mathematics', v)}
          options={mathOptions}
          placeholder="Select a maths option…"
        />
        {[0, 1, 2].map((i) => {
          const taken = getTakenSubjects(subjects, `elective-${i}`);
          const options = allElectiveOptions.filter((o) => !taken.has(o));
          return (
            <ObSelect
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
    </section>
  );
}

function ObSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div className="ob-field">
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

/* ============================================================
   Step 3 — Marks
   ============================================================ */

function MarksStep({ subjects, marks, onChange }) {
  const picked = useMemo(() => getPickedSubjects(subjects), [subjects]);

  function setMark(subject, raw) {
    const v = raw === '' ? '' : Math.max(0, Math.min(100, Number(raw)));
    onChange({ ...marks, [subject]: v });
  }

  return (
    <section className="ob-pane">
      <h1 className="ob-title">Add your marks</h1>
      <p className="ob-sub">
        Enter each subject's percentage. We use these to calculate your APS and
        match you with courses you qualify for.
      </p>

      {picked.length === 0 ? (
        <div className="ob-empty">
          Pick your subjects in the previous step first.
        </div>
      ) : (
        <div className="ob-marks">
          {picked.map((s) => (
            <div key={s} className="ob-mark-row">
              <span className="ob-mark-label">{s}</span>
              <div className="ob-mark-input-wrap">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  className="ob-mark-input"
                  value={marks[s] ?? ''}
                  placeholder="—"
                  onChange={(e) => setMark(s, e.target.value)}
                />
                <span className="ob-mark-suffix">%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   Step 4 — Interests
   ============================================================ */

function InterestsStep({ interests, onToggle }) {
  return (
    <section className="ob-pane">
      <h1 className="ob-title">What are you curious about?</h1>
      <p className="ob-sub">
        Pick at least one. We'll use these to tailor course and career suggestions.
      </p>

      <div className="ob-interest-groups">
        {INTEREST_GROUPS.map((g) => (
          <div key={g.id} className="ob-interest-group">
            <div className="ob-interest-group-label">{g.label}</div>
            <div className="ob-interest-chips">
              {g.interests.map((i) => {
                const active = interests.includes(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    className={'ob-interest-chip' + (active ? ' is-active' : '')}
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
        <div className="ob-hint">
          You've picked <b>{interests.length}</b> interest{interests.length === 1 ? '' : 's'}.
        </div>
      )}
    </section>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function normaliseSubjects(s) {
  return {
    homeLanguage: s?.homeLanguage || '',
    fal: s?.fal || '',
    mathematics: s?.mathematics || '',
    electives: padElectives(s?.electives),
  };
}

function padElectives(arr) {
  const next = Array.isArray(arr) ? [...arr] : [];
  while (next.length < 3) next.push('');
  return next.slice(0, 3);
}

function getPickedSubjects(subjects) {
  const core = [
    subjects?.homeLanguage,
    subjects?.fal,
    subjects?.mathematics,
  ].filter(Boolean);
  const els = padElectives(subjects?.electives).filter(Boolean);
  return [...core, ...els];
}

/* ============================================================
   Icons
   ============================================================ */

function MiniArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
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
function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
      <path d="M16 4.5 L18.6 13.4 L27.5 16 L18.6 18.6 L16 27.5 L13.4 18.6 L4.5 16 L13.4 13.4 Z" fill="#0A0E1A" />
      <circle cx="16" cy="16" r="1.6" fill="#F5C542" />
    </svg>
  );
}