import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { seedDemoUser, isFreshProfile } from '../utils/seed';
import './FirstRunSeed.css';

/**
 * Small banner shown on the Dashboard when the signed-in user has an
 * essentially empty profile. One click loads the demo dataset so judges
 * and screenshots see a full app.
 */
export default function FirstRunSeed() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!isFreshProfile(user)) return null;

  function handleLoad() {
    setLoading(true);
    // Tiny delay so the button feels alive; then seed and land on Wellness
    // so the user sees the check-in history they just got.
    setTimeout(() => {
      seedDemoUser(updateUser, user);
      setLoading(false);
      navigate('/dashboard');
    }, 250);
  }

  return (
    <section className="seed">
      <div className="seed-glow" aria-hidden="true" />
      <div className="seed-body">
        <div className="seed-icon" aria-hidden="true"><SparkleIcon /></div>
        <div className="seed-text">
          <div className="seed-title">This is a demo profile</div>
          <div className="seed-sub">
            Load a realistic student scenario (subjects, marks, applications,
            wellness check-ins, funding shortlist) so you can explore every
            screen. Nothing leaves this device.
          </div>
        </div>
        <div className="seed-actions">
          <button
            type="button"
            className="btn btn-primary seed-btn"
            onClick={handleLoad}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Load demo data'}
            {!loading && <MiniArrow />}
          </button>
        </div>
      </div>
    </section>
  );
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

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M6.4 6.4 8.7 8.7M15.3 15.3l2.3 2.3M17.6 6.4 15.3 8.7M8.7 15.3 6.4 17.6" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}
