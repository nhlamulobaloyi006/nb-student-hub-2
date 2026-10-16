import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit =
    name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(email.trim()) &&
    password.length >= 6 &&
    password === confirm;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('Please fill in every field correctly.');
      return;
    }

    setBusy(true);
    try {
      signUp({ name, email, password });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create account.');
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">It takes less than a minute.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="su-name">Full name</label>
            <input
              id="su-name"
              className="input"
              type="text"
              autoComplete="name"
              placeholder="Abby Mkhize"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="su-email">Email</label>
            <input
              id="su-email"
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
            <label className="field-label" htmlFor="su-pass">Password</label>
            <input
              id="su-pass"
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="su-confirm">Confirm password</label>
            <input
              id="su-confirm"
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={busy}
          >
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-foot">
          Already have an account?{' '}
          <Link to="/signin" className="auth-link">Sign in</Link>
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
