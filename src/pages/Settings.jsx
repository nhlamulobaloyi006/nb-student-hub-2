import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SA_PROVINCES } from '../data/institutions';
import {
  browserNotificationsSupported,
  browserNotificationPermission,
  requestBrowserNotificationPermission,
} from '../utils/notifications';
import { seedDemoUser } from '../utils/seed';

import './Settings.css';

export default function Settings() {
  const { user, updateUser, signOut, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [nameMsg, setNameMsg] = useState('');
  const [exportMsg, setExportMsg] = useState('');
  const [seedMsg, setSeedMsg] = useState('');
  const [browserPerm, setBrowserPerm] = useState(() => browserNotificationPermission());

  const prefs = user?.preferences || {};

  function handleSaveAccount(e) {
    e.preventDefault();
    if (!name.trim()) { setNameMsg('Name cannot be empty.'); return; }
    updateUser({ name: name.trim() });
    setNameMsg('Saved.');
    setTimeout(() => setNameMsg(''), 1800);
  }

  function handleSignOut() {
    if (!window.confirm('Sign out of NB Student Hub?')) return;
    signOut();
    navigate('/signin', { replace: true });
  }

  function handleExport() {
    const raw = localStorage.getItem('nb_user') || sessionStorage.getItem('nb_user');
    const data = raw ? JSON.parse(raw) : user;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nb-student-hub-${(user?.email || 'profile').replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setExportMsg('Downloaded.');
    setTimeout(() => setExportMsg(''), 1800);
  }

  function handleReloadDemo() {
    if (!window.confirm(
      'Reload demo data?\n\n' +
      'This replaces your current profile, applications, wellness check-ins, ' +
      'streaks and saved items with the demo scenario.\n\n' +
      'Your name and email stay the same.'
    )) return;

    seedDemoUser(updateUser, user);
    setSeedMsg('Demo data loaded.');
    setTimeout(() => setSeedMsg(''), 2000);
  }

  function handleClearProfile() {
    if (!window.confirm('Clear all profile data (subjects, marks, applications, wellness, streaks)?\n\nYou will stay signed in but everything else will reset.')) return;
    updateUser({
      stream: '',
      subjects: { homeLanguage: '', fal: '', mathematics: '', electives: ['', '', ''] },
      subjectMarks: {},
      interests: [],
      aps: 0,
      savedItems: [],
      futureGoal: '',
      applications: [],
      fundingLadderManual: [],
      savedEstimates: [],
      wellness: { checkins: [], privacyAcknowledged: true },
      streaks: { current: 0, longest: 0, history: [], weeklyGoalsCompleted: 0, weeklyGoalsTotal: 5 },
    });
  }

  function handleDeleteAccount() {
    if (!window.confirm('Delete your account permanently? This removes your account and all data from this device.\n\nThis cannot be undone.')) return;
    deleteAccount();
    navigate('/signin', { replace: true });
  }

  return (
    <div className="stg">
      <header className="stg-head">
        <h1 className="stg-title">Settings</h1>
        <p className="stg-sub">Manage your account, preferences and data.</p>
      </header>

      {/* ── Account ── */}
      <Section title="Account" sub="Your name and email on this device.">
        <form className="stg-form" onSubmit={handleSaveAccount}>
          <div className="stg-row">
            <label className="field-label" htmlFor="stg-name">Full name</label>
            <input
              id="stg-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="stg-row">
            <label className="field-label" htmlFor="stg-email">Email</label>
            <input
              id="stg-email"
              className="input"
              value={email}
              readOnly
              title="Email is used as your account identifier and cannot be changed in this demo."
            />
            <div className="stg-note">
              Email is your account identifier and can't be changed in this demo.
            </div>
          </div>
          <div className="stg-form-foot">
            <span className="stg-status">{nameMsg}</span>
            <button type="submit" className="btn btn-primary">Save changes</button>
          </div>
        </form>
      </Section>

      {/* ── Preferences ── */}
      <Section title="Preferences" sub="Defaults used across the app.">
        <Toggle
          label="Notifications"
          sub="Show reminders for deadlines and check-ins on this device."
          value={prefs.notifications ?? true}
          onChange={(v) => updateUser({ preferences: { ...prefs, notifications: v } })}
        />

        {(prefs.notifications ?? true) && browserNotificationsSupported() && (
          <div className="stg-browser-notif">
            <Toggle
              label="Browser notifications"
              sub={
                browserPerm === 'granted'
                  ? 'Enabled — reminders appear as OS notifications.'
                  : browserPerm === 'denied'
                    ? 'Blocked in your browser settings. Enable to receive popups.'
                    : 'Allow this device to show popups for urgent reminders.'
              }
              value={prefs.notificationsBrowser ?? false}
              onChange={async (v) => {
                if (v) {
                  const result = await requestBrowserNotificationPermission();
                  setBrowserPerm(result);
                  if (result === 'granted') {
                    updateUser({ preferences: { ...prefs, notificationsBrowser: true } });
                  }
                } else {
                  updateUser({ preferences: { ...prefs, notificationsBrowser: false } });
                }
              }}
            />
          </div>
        )}
        <Toggle
          label="Data saver"
          sub="Reduce image quality and skip non-essential effects."
          value={prefs.dataSaver ?? false}
          onChange={(v) => updateUser({ preferences: { ...prefs, dataSaver: v } })}
        />

        <div className="stg-select-row">
          <div className="stg-row">
            <label className="field-label" htmlFor="stg-province">Preferred province</label>
            <select
              id="stg-province"
              className="select"
              value={prefs.province || ''}
              onChange={(e) => updateUser({ preferences: { ...prefs, province: e.target.value } })}
            >
              <option value="">Not set</option>
              {SA_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="stg-row">
            <label className="field-label" htmlFor="stg-accom">Accommodation preference</label>
            <select
              id="stg-accom"
              className="select"
              value={prefs.accommodation || ''}
              onChange={(e) => updateUser({ preferences: { ...prefs, accommodation: e.target.value } })}
            >
              <option value="">Not set</option>
              <option value="University residence">University residence</option>
              <option value="Private accommodation">Private accommodation</option>
              <option value="Living at home">Living at home</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section title="Appearance" sub="Theme and display options.">
        <div className="stg-theme-row">
          <div className="stg-theme is-active">
            <div className="stg-theme-preview stg-theme-dark" aria-hidden="true">
              <div className="stg-theme-bar" />
              <div className="stg-theme-line" />
              <div className="stg-theme-line stg-theme-line-short" />
            </div>
            <div className="stg-theme-label">Dark</div>
            <div className="stg-theme-sub">Default</div>
          </div>
          <div className="stg-theme is-disabled" aria-disabled="true">
            <div className="stg-theme-preview stg-theme-light" aria-hidden="true">
              <div className="stg-theme-bar" />
              <div className="stg-theme-line" />
              <div className="stg-theme-line stg-theme-line-short" />
            </div>
            <div className="stg-theme-label">Light</div>
            <div className="stg-theme-sub">Coming soon</div>
          </div>
        </div>
      </Section>

      {/* ── Data & Privacy ── */}
      <Section title="Data & Privacy" sub="Your data lives on this device only.">
        <div className="stg-actions">
          <button type="button" className="stg-action" onClick={handleExport}>
            <span className="stg-action-icon stg-action-icon-indigo"><DownloadIcon /></span>
            <span className="stg-action-body">
              <span className="stg-action-title">Export my data</span>
              <span className="stg-action-sub">Download a JSON file with everything saved on this device.</span>
            </span>
            <span className="stg-action-arrow"><MiniArrow /></span>
          </button>

          <button type="button" className="stg-action" onClick={handleClearProfile}>
            <span className="stg-action-icon stg-action-icon-amber"><RefreshIcon /></span>
            <span className="stg-action-body">
              <span className="stg-action-title">Clear profile data</span>
              <span className="stg-action-sub">Removes subjects, marks, applications, wellness and streaks.</span>
            </span>
            <span className="stg-action-arrow"><MiniArrow /></span>
          </button>

          <button type="button" className="stg-action stg-action-danger" onClick={handleDeleteAccount}>
            <span className="stg-action-icon stg-action-icon-red"><TrashIcon /></span>
            <span className="stg-action-body">
              <span className="stg-action-title">Delete account</span>
              <span className="stg-action-sub">Permanently removes your account and all data. Cannot be undone.</span>
            </span>
            <span className="stg-action-arrow"><MiniArrow /></span>
          </button>
        </div>

        {(exportMsg || seedMsg) && (
          <div className="stg-toast">{seedMsg || exportMsg}</div>
        )}

        <div className="stg-signout-row">
          <button type="button" className="btn btn-outline" onClick={handleSignOut}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, sub, children }) {
  return (
    <section className="stg-section">
      <div className="stg-section-head">
        <h2 className="stg-section-title">{title}</h2>
        {sub && <div className="stg-section-sub">{sub}</div>}
      </div>
      <div className="stg-section-body">{children}</div>
    </section>
  );
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <div className="stg-toggle">
      <div className="stg-toggle-text">
        <div className="stg-toggle-title">{label}</div>
        {sub && <div className="stg-toggle-sub">{sub}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={!!value}
        className={'stg-switch' + (value ? ' is-on' : '')}
        onClick={() => onChange(!value)}
      >
        <span className="stg-switch-dot" />
      </button>
    </div>
  );
}

/* Icons */
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
function LogoutIcon() { return (<svg {...iconProps(16)}>
  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
  <path d="M10 17l-5-5 5-5" /><path d="M15 12H5" />
</svg>); }
function DownloadIcon() { return (<svg {...iconProps(18)}>
  <path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" />
</svg>); }
function RefreshIcon() { return (<svg {...iconProps(18)}>
  <path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" /><path d="M21 3v5h-5" />
  <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" /><path d="M3 21v-5h5" />
</svg>); }
function TrashIcon() { return (<svg {...iconProps(18)}>
  <path d="M4 7h16" /><path d="M9 7V4h6v3" />
  <path d="M6 7l1 14h10l1-14" />
</svg>); }
function SparkleIcon() { return (<svg {...iconProps(18)}>
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
  <path d="M6.4 6.4 8.7 8.7M15.3 15.3l2.3 2.3M17.6 6.4 15.3 8.7M8.7 15.3 6.4 17.6" />
  <circle cx="12" cy="12" r="2.6" />
</svg>); }
