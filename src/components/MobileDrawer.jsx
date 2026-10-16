import { useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MobileDrawer.css';
import NavBadge from './NavBadge';
import { computeBadges } from '../utils/badges';

const SECTIONS = [
  {
    label: 'MAIN',
    items: [
      { to: '/dashboard', label: 'Home',                icon: HomeIcon },
      { to: '/roadmap',   label: 'My Student Roadmap',  icon: RoadmapIcon },
      { to: '/profile',   label: 'Profile',             icon: ProfileIcon },
    ],
  },
  {
    label: 'GUIDANCE',
    items: [
      { to: '/courses',       label: 'Course Finder',       icon: SearchIcon },
      { to: '/institutions',  label: 'Institutions',        icon: BuildingIcon },
      { to: '/careers',       label: 'Careers',             icon: BriefcaseIcon },
      { to: '/funding',       label: 'Funding',             icon: CoinIcon },
      { to: '/cost-planner',  label: 'Cost Planner',        icon: CalcIcon },
      { to: '/applications',  label: 'Application Tracker', icon: ClipboardIcon },
    ],
  },
  {
    label: 'GROWTH',
    items: [
      { to: '/resources', label: 'Study Resources', icon: BookIcon },
      { to: '/wellness',  label: 'Wellness',        icon: HeartIcon },
      { to: '/streaks',   label: 'Study Streaks',   icon: FlameIcon },
    ],
  },
  {
    label: 'SUPPORT',
    items: [
      { to: '/companion', label: 'AI Companion', icon: SparkleIcon },
      { to: '/settings',  label: 'Settings',     icon: CogIcon },
    ],
  },
];

export default function MobileDrawer({ open, onClose }) {
  const { user, signOut } = useAuth();
  const badges = useMemo(() => computeBadges(user), [user]);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const initials = (user?.name || '·')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '·';

  return (
    <>
      <div
        className={`mdraw-scrim${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`mdraw${open ? ' is-open' : ''}`} aria-hidden={!open}>
        {/* Header */}
        <div className="mdraw-head">
          <div className="mdraw-avatar" aria-hidden="true">{initials}</div>
          <div className="mdraw-head-text">
            <div className="mdraw-name">{user?.name || 'Student'}</div>
            <div className="mdraw-email">{user?.email || '—'}</div>
          </div>
          <button
            type="button"
            className="mdraw-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <XIcon />
          </button>
        </div>

        {/* Nav */}
        <nav className="mdraw-nav">
          {SECTIONS.map((section) => (
            <div key={section.label} className="mdraw-section">
              <div className="mdraw-section-label">{section.label}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      'mdraw-link' + (isActive ? ' is-active' : '')
                    }
                    onClick={onClose}
                  >
                    <span className="mdraw-link-icon"><Icon /></span>
                    <span className="mdraw-link-label">{item.label}</span>
                    <NavBadge badge={badges[item.to]} inline />
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="mdraw-foot">
          <button
            type="button"
            className="mdraw-signout"
            onClick={() => {
              if (window.confirm('Sign out of NB Student Hub?')) {
                onClose();
                signOut();
              }
            }}
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

/* ══════════════════════════════════════════════════════════ */

function iconProps(size = 20) {
  return {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': true,
  };
}
function HomeIcon() { return (<svg {...iconProps()}>
  <path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5V14h4v5.5" />
</svg>); }
function RoadmapIcon() { return (<svg {...iconProps()}>
  <circle cx="6" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" />
  <path d="M8.4 6H15a3 3 0 0 1 0 6h-6a3 3 0 0 0 0 6h6.6" />
</svg>); }
function ProfileIcon() { return (<svg {...iconProps()}>
  <circle cx="12" cy="8.5" r="3.6" />
  <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4S18.3 16.4 19.5 20" />
</svg>); }
function SearchIcon() { return (<svg {...iconProps()}>
  <circle cx="11" cy="11" r="6" /><path d="m20 20-3.6-3.6" />
</svg>); }
function BuildingIcon() { return (<svg {...iconProps()}>
  <path d="M3 20h18" /><path d="M5 20V8l7-4 7 4v12" /><path d="M9.5 20v-6h5v6" />
</svg>); }
function BriefcaseIcon() { return (<svg {...iconProps()}>
  <rect x="3" y="7" width="18" height="13" rx="2" />
  <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  <path d="M3 13h18" /><path d="M11 13v2h2v-2" />
</svg>); }
function CoinIcon() { return (<svg {...iconProps()}>
  <circle cx="12" cy="12" r="8.4" />
  <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
  <path d="M12 6.6v10.8" />
</svg>); }
function CalcIcon() { return (<svg {...iconProps()}>
  <rect x="5" y="3" width="14" height="18" rx="2.2" /><path d="M8 7h8" />
  <path d="M8.5 11h1.5M8.5 14.5h1.5M8.5 18h1.5M13 11h1.5M13 14.5h1.5M13 18h1.5" />
</svg>); }
function ClipboardIcon() { return (<svg {...iconProps()}>
  <rect x="6" y="4.5" width="12" height="16" rx="2" />
  <path d="M9.5 4.5V3.6c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v.9" />
  <path d="M9.5 11h5M9.5 14.5h5M9.5 18h3" />
</svg>); }
function BookIcon() { return (<svg {...iconProps()}>
  <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
  <path d="M13 4h5.5c.8 0 1.5.7 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H13z" />
</svg>); }
function HeartIcon() { return (<svg {...iconProps()}>
  <path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3c0 5-7 9.4-7 9.4z" />
</svg>); }
function FlameIcon() { return (<svg {...iconProps()}>
  <path d="M12 3c1.5 3 5 4.6 5 8.5A5 5 0 0 1 7 12c0-1.4.5-2.4 1.2-3.2C9.4 7.4 11 6 12 3z" />
  <path d="M12 21a3.5 3.5 0 0 1-2-6.4c.4 1.4 1 1.9 2 2 .2-1.2 0-2.2-.4-3 1.6 1.2 3.4 2.7 3.4 4.9A3.5 3.5 0 0 1 12 21z" />
</svg>); }
function SparkleIcon() { return (<svg {...iconProps()}>
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
  <path d="M6.4 6.4 8.7 8.7M15.3 15.3l2.3 2.3M17.6 6.4 15.3 8.7M8.7 15.3 6.4 17.6" />
  <circle cx="12" cy="12" r="2.6" />
</svg>); }
function CogIcon() { return (<svg {...iconProps()}>
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H2.9a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V2.9a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z" />
</svg>); }
function XIcon() { return (<svg {...iconProps(18)}>
  <path d="M6 6l12 12M18 6 6 18" />
</svg>); }
function LogoutIcon() { return (<svg {...iconProps(18)}>
  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
  <path d="M10 17l-5-5 5-5" /><path d="M15 12H5" />
</svg>); }
