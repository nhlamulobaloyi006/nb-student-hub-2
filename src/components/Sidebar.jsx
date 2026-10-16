import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { computeBadges } from '../utils/badges';
import NavBadge from './NavBadge';
import './Sidebar.css';

const SECTIONS = [
  {
    label: 'MAIN',
    items: [
      { to: '/dashboard', label: 'Home',               icon: HomeIcon },
      { to: '/roadmap',   label: 'My Student Roadmap', icon: RoadmapIcon },
      { to: '/profile',   label: 'Profile',            icon: ProfileIcon },
    ],
  },
  {
    label: 'GUIDANCE',
    items: [
      { to: '/courses',      label: 'Course Finder',       icon: SearchIcon },
      { to: '/institutions', label: 'Institutions',        icon: BuildingIcon },
      { to: '/careers',      label: 'Careers',             icon: BriefcaseIcon },
      { to: '/funding',      label: 'Funding',             icon: CoinIcon },
      { to: '/cost-planner', label: 'Cost Planner',        icon: CalcIcon },
      { to: '/applications', label: 'Application Tracker', icon: ClipboardIcon },
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

export default function Sidebar() {
  const { user } = useAuth();
  const badges = useMemo(() => computeBadges(user), [user]);
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo sidebar-logo-image" aria-hidden="true">
          <SidebarLogo />
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">NB Student Hub</div>
          <div className="sidebar-brand-tag">Know your options. Plan your future.</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {SECTIONS.map((section) => (
          <div className="sidebar-section" key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    'sidebar-link' + (isActive ? ' is-active' : '')
                  }
                >
                  <span className="sidebar-link-icon"><Icon /></span>
                  <span className="sidebar-link-label">{item.label}</span>
                  <NavBadge badge={badges[item.to]} inline />
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-motivator">
        <div className="sidebar-motivator-icon" aria-hidden="true"><CapIcon /></div>
        <div className="sidebar-motivator-title">Your future matters.</div>
        <div className="sidebar-motivator-sub">
          We're here to help you find the right path.
        </div>
      </div>

      <div className="sidebar-status">
        <span className="status-dot" aria-hidden="true" />
        <span>Online</span>
        <span className="sidebar-status-sep">|</span>
        <span>Data saver: Off</span>
      </div>
    </aside>
  );
}

function baseProps() {
  return {
    width: 20, height: 20, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
}
function HomeIcon() { return (<svg {...baseProps()}>
  <path d="M3 11.5 12 4l9 7.5" />
  <path d="M5.5 10v9.5h13V10" />
  <path d="M10 19.5V14h4v5.5" />
</svg>); }
function RoadmapIcon() { return (<svg {...baseProps()}>
  <circle cx="6" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" />
  <path d="M8.4 6H15a3 3 0 0 1 0 6h-6a3 3 0 0 0 0 6h6.6" />
</svg>); }
function ProfileIcon() { return (<svg {...baseProps()}>
  <circle cx="12" cy="8.5" r="3.6" />
  <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4S18.3 16.4 19.5 20" />
</svg>); }
function SearchIcon() { return (<svg {...baseProps()}>
  <circle cx="11" cy="11" r="6" /><path d="m20 20-3.6-3.6" />
</svg>); }
function BuildingIcon() { return (<svg {...baseProps()}>
  <path d="M3 20h18" /><path d="M5 20V8l7-4 7 4v12" /><path d="M9.5 20v-6h5v6" />
</svg>); }
function BriefcaseIcon() { return (<svg {...baseProps()}>
  <rect x="3" y="7" width="18" height="13" rx="2" />
  <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  <path d="M3 13h18" /><path d="M11 13v2h2v-2" />
</svg>); }
function CoinIcon() { return (<svg {...baseProps()}>
  <circle cx="12" cy="12" r="8.4" />
  <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
  <path d="M12 6.6v10.8" />
</svg>); }
function CalcIcon() { return (<svg {...baseProps()}>
  <rect x="5" y="3" width="14" height="18" rx="2.2" /><path d="M8 7h8" />
  <path d="M8.5 11h1.5M8.5 14.5h1.5M8.5 18h1.5M13 11h1.5M13 14.5h1.5M13 18h1.5" />
</svg>); }
function ClipboardIcon() { return (<svg {...baseProps()}>
  <rect x="6" y="4.5" width="12" height="16" rx="2" />
  <path d="M9.5 4.5V3.6c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v.9" />
  <path d="M9.5 11h5M9.5 14.5h5M9.5 18h3" />
</svg>); }
function BookIcon() { return (<svg {...baseProps()}>
  <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
  <path d="M13 4h5.5c.8 0 1.5.7 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H13z" />
</svg>); }
function HeartIcon() { return (<svg {...baseProps()}>
  <path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3c0 5-7 9.4-7 9.4z" />
</svg>); }
function FlameIcon() { return (<svg {...baseProps()}>
  <path d="M12 3c1.5 3 5 4.6 5 8.5A5 5 0 0 1 7 12c0-1.4.5-2.4 1.2-3.2C9.4 7.4 11 6 12 3z" />
  <path d="M12 21a3.5 3.5 0 0 1-2-6.4c.4 1.4 1 1.9 2 2 .2-1.2 0-2.2-.4-3 1.6 1.2 3.4 2.7 3.4 4.9A3.5 3.5 0 0 1 12 21z" />
</svg>); }
function SparkleIcon() { return (<svg {...baseProps()}>
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
  <path d="M6.4 6.4 8.7 8.7M15.3 15.3l2.3 2.3M17.6 6.4 15.3 8.7M8.7 15.3 6.4 17.6" />
  <circle cx="12" cy="12" r="2.6" />
</svg>); }
function CogIcon() { return (<svg {...baseProps()}>
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H2.9a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V2.9a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z" />
</svg>); }
function CapIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round">
  <path d="M3 9.5 12 5l9 4.5L12 14 3 9.5z" />
  <path d="M7 11.5V17c0 .8 2.2 2 5 2s5-1.2 5-2v-5.5" />
  <path d="M21 9.5v5" />
</svg>); }

function SidebarLogo() {
  const [failed, setFailed] = useState(false);
  if (failed) return <BrandMark />;
  return (
    <img
      src="/logos/logo.png"
      alt="NB Student Hub"
      className="sidebar-logo-img"
      onError={() => setFailed(true)}
    />
  );
}

/* The image itself provides the visual — no gold background needed. */
SidebarLogo.displayName = 'SidebarLogo';

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="#0A0E1A" strokeWidth="1.6" opacity="0.35" />
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="#0A0E1A" strokeWidth="1.6" opacity="0.55" />
      <path d="M16 4.5 L18.6 13.4 L27.5 16 L18.6 18.6 L16 27.5 L13.4 18.6 L4.5 16 L13.4 13.4 Z" fill="#0A0E1A" />
      <circle cx="16" cy="16" r="1.6" fill="#F5C542" />
    </svg>
  );
}
