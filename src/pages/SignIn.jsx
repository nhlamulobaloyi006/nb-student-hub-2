import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      signIn({ email, password, remember });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            <AuthLogo />
          </div>
          <div>
            <div className="auth-brand-name">NB Student Hub</div>
            <div className="auth-brand-tag">Know your options. Plan your future.</div>
          </div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue your journey.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="si-email">Email</label>
            <input
              id="si-email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="si-pass">Password</label>
            <input
              id="si-pass"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <label className="auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me on this device</span>
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={busy}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-foot">
          New here? <Link to="/signup" className="auth-link">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

function AuthLogo() {
  const [failed, setFailed] = useState(false);
  if (failed) return <BrandGlyph />;
  return (
    <img
      src="/logos/logo.png"
      alt=""
      className="auth-logo-img"
      onError={() => setFailed(true)}
    />
  );
}

function BrandGlyph() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
      <path d="M16 4.5 L18.6 13.4 L27.5 16 L18.6 18.6 L16 27.5 L13.4 18.6 L4.5 16 L13.4 13.4 Z"
            fill="#0A0E1A" />
      <circle cx="16" cy="16" r="1.6" fill="#F5C542" />
    </svg>
  );
}
