import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MobileNav.css';
import { useMemo } from 'react';
import { computeBadges } from '../utils/badges';
import NavBadge from './NavBadge';

const TABS = [
  { to: '/dashboard',    label: 'Home',      icon: HomeIcon },
  { to: '/courses',      label: 'Courses',   icon: SearchIcon },
  { to: '/funding',      label: 'Funding',   icon: CoinIcon },
  { to: '/applications', label: 'Applications', icon: ClipboardIcon },
  { to: '/companion',    label: 'Assistant', icon: SparkleIcon },
];

export default function MobileNav({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const badges = useMemo(() => computeBadges(user), [user]);
  const location = useLocation();

  const initials = (user?.name || '·')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '·';

  // Title derived from the current route — used in the top bar
  const title = deriveTitle(location.pathname);

  return (
    <>
      {/* ── Top bar ──────────────────────────────── */}
      <header className="mnav-top">
        <button
          type="button"
          className="mnav-menu"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>

        <div className="mnav-brand">
          <div className="mnav-brand-mark mnav-brand-mark-image" aria-hidden="true">
            <MobileLogo />
          </div>
          <span className="mnav-brand-name">{title}</span>
        </div>

        <button
          type="button"
          className="mnav-avatar"
          aria-label={user?.onboardingComplete ? 'Profile' : 'Continue setup'}
          onClick={() =>
            navigate(user?.onboardingComplete ? '/profile' : '/onboarding')
          }
        >
          {initials}
        </button>
      </header>

      {/* ── Bottom tab bar ───────────────────────── */}
      <nav className="mnav-tabs" role="tablist" aria-label="Primary">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => 'mnav-tab' + (isActive ? ' is-active' : '')}
              role="tab"
            >
              <span className="mnav-tab-icon">
                <Icon />
                <NavBadge badge={badges[tab.to]} />
              </span>
              <span className="mnav-tab-label">{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}

/* ══════════════════════════════════════════════════════════ */

function deriveTitle(pathname) {
  if (!pathname || pathname === '/') return 'Home';
  const map = {
    '/dashboard':    'Home',
    '/roadmap':      'Roadmap',
    '/profile':      'Profile',
    '/courses':      'Course Finder',
    '/institutions': 'Institutions',
    '/careers':      'Careers',
    '/funding':      'Funding',
    '/cost-planner': 'Cost Planner',
    '/applications': 'Applications',
    '/resources':    'Resources',
    '/wellness':     'Wellness',
    '/streaks':      'Streaks',
    '/companion':    'Assistant',
    '/settings':     'Settings',
    '/future':       'Future Goal',
  };
  if (pathname.startsWith('/institutions/')) return 'Institution';
  return map[pathname] || 'NB Student Hub';
}

/* ══════════════════════════════════════════════════════════
   Icons — inline SVG only
   ══════════════════════════════════════════════════════════ */

function iconProps(size = 22) {
  return {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': true,
  };
}
function HomeIcon() { return (<svg {...iconProps(22)}>
  <path d="M3 11.5 12 4l9 7.5" />
  <path d="M5.5 10v9.5h13V10" />
  <path d="M10 19.5V14h4v5.5" />
</svg>); }
function SearchIcon() { return (<svg {...iconProps(22)}>
  <circle cx="11" cy="11" r="6" /><path d="m20 20-3.6-3.6" />
</svg>); }
function CoinIcon() { return (<svg {...iconProps(22)}>
  <circle cx="12" cy="12" r="8.4" />
  <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
  <path d="M12 6.6v10.8" />
</svg>); }
function ClipboardIcon() { return (<svg {...iconProps(22)}>
  <rect x="6" y="4.5" width="12" height="16" rx="2" />
  <path d="M9.5 4.5V3.6c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v.9" />
  <path d="M9.5 11h5M9.5 14.5h5M9.5 18h3" />
</svg>); }
function SparkleIcon() { return (<svg {...iconProps(22)}>
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
  <path d="M6.4 6.4 8.7 8.7M15.3 15.3l2.3 2.3M17.6 6.4 15.3 8.7M8.7 15.3 6.4 17.6" />
  <circle cx="12" cy="12" r="2.6" />
</svg>); }
function MenuIcon() { return (<svg {...iconProps(22)}>
  <path d="M4 7h16M4 12h16M4 17h16" />
</svg>); }
function MobileLogo() {
  const [failed, setFailed] = useState(false);
  if (failed) return <BrandMark />;
  return (
    <img
      src="/logos/logo.png"
      alt=""
      className="mnav-brand-img"
      onError={() => setFailed(true)}
    />
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <path d="M16 4.5 L18.6 13.4 L27.5 16 L18.6 18.6 L16 27.5 L13.4 18.6 L4.5 16 L13.4 13.4 Z"
            fill="#0A0E1A" />
      <circle cx="16" cy="16" r="1.6" fill="#F5C542" />
    </svg>
  );
}
