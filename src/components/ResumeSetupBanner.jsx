import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateSubjects } from '../utils/subjectRules';
import './ResumeSetupBanner.css';

/**
 * Renders only when the user's onboarding is incomplete.
 * Tells them exactly which step they're on and links back to /onboarding.
 */
export default function ResumeSetupBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const info = useMemo(() => computeStep(user), [user]);

  if (!user || user.onboardingComplete) return null;
  if (!info) return null;

  return (
    <section className="resume-setup">
      <span className="resume-setup-icon" aria-hidden="true"><SetupIcon /></span>
      <div className="resume-setup-body">
        <div className="resume-setup-title">
          Finish setting up your profile
        </div>
        <div className="resume-setup-sub">
          {info.sub} — Step {info.step} of 4
        </div>
        <div className="resume-setup-progress">
          <div
            className="resume-setup-bar"
            style={{ width: `${((info.step - 1) / 4) * 100}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        className="btn btn-primary resume-setup-cta"
        onClick={() => navigate('/onboarding')}
      >
        Resume <MiniArrow />
      </button>
    </section>
  );
}

/**
 * Determine the current step number and sub-copy from the user object.
 * Step 1 = Stream
 * Step 2 = Subjects
 * Step 3 = Marks
 * Step 4 = Interests
 */
function computeStep(user) {
  const s = user.subjects || {};

  if (!user.stream) {
    return { step: 1, sub: 'Pick your stream' };
  }

  const subjectsValid = validateSubjects(s).valid;
  if (!subjectsValid) {
    return { step: 2, sub: 'Fill in your subjects' };
  }

  const picked = [
    s.homeLanguage, s.fal, s.mathematics,
    ...(Array.isArray(s.electives) ? s.electives : []),
  ].filter(Boolean);

  const marksComplete =
    picked.length > 0 &&
    picked.every((subj) => {
      const m = user.subjectMarks?.[subj];
      return typeof m === 'number' && m >= 0 && m <= 100;
    });
  if (!marksComplete) {
    return { step: 3, sub: 'Add your subject marks' };
  }

  if (!Array.isArray(user.interests) || user.interests.length === 0) {
    return { step: 4, sub: 'Pick your interests' };
  }

  return null;
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
function SetupIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}