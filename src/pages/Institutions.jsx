import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { INSTITUTIONS } from '../data/institutions';
import { COURSES } from '../data/courses';
import Logo from '../components/Logo';

import './Institutions.css';

const TIER_TABS = [
  { id: 'all',      label: 'All' },
  { id: 'University', label: 'University' },
  { id: 'University of Technology', label: 'University of Technology' },
  { id: 'TVET',     label: 'TVET' },
  { id: 'Private College', label: 'Private College' },
];

export default function Institutions() {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState('all');

  const courseCountByInst = useMemo(() => {
    const acc = {};
    COURSES.forEach((c) => {
      acc[c.universityId] = (acc[c.universityId] || 0) + 1;
    });
    return acc;
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INSTITUTIONS.filter((i) => {
      if (tier !== 'all' && i.tier !== tier) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.shortName.toLowerCase().includes(q) ||
        i.province.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
      );
    });
  }, [query, tier]);

  return (
    <div className="in">
      <header className="in-head">
        <h1 className="in-title">Institutions</h1>
        <p className="in-sub">
          Explore South African universities, universities of technology and TVET colleges.
        </p>
      </header>

      <div className="in-toolbar">
        <div className="in-search-wrap">
          <SearchIcon />
          <input
            className="in-search"
            placeholder="Search institutions by name or province…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="in-search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <XIcon />
            </button>
          )}
        </div>

        <div className="in-tabs">
          {TIER_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={'in-chip' + (tier === t.id ? ' is-active' : '')}
              onClick={() => setTier(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="in-count">
        {visible.length} institution{visible.length === 1 ? '' : 's'}
      </div>

      {visible.length === 0 ? (
        <div className="in-empty">
          <div className="in-empty-title">No institutions match.</div>
          <div className="in-empty-sub">Try a different search or clear the filter.</div>
        </div>
      ) : (
        <div className="in-grid">
          {visible.map((inst) => (
            <InstitutionCard
              key={inst.id}
              inst={inst}
              courseCount={courseCountByInst[inst.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InstitutionCard({ inst, courseCount }) {
  return (
    <Link to={`/institutions/${inst.id}`} className="in-card">
      <div className="in-card-logo">
        <Logo logoKey={inst.logoKey} name={inst.name} size={52} />
      </div>
      <div className="in-card-body">
        <div className="in-card-tier">{inst.tier}</div>
        <div className="in-card-name">{inst.name}</div>
        <div className="in-card-location">
          <PinIcon /> {inst.location}
        </div>
        <div className="in-card-desc">{inst.description}</div>
        <div className="in-card-foot">
          <span className="in-card-count">
            {courseCount} course{courseCount === 1 ? '' : 's'} available
          </span>
          <span className="in-card-arrow">
            View <MiniArrow />
          </span>
        </div>
      </div>
    </Link>
  );
}

function iconProps(size = 14) {
  return {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
}
function SearchIcon() { return (<svg {...iconProps(16)}>
  <circle cx="11" cy="11" r="6" /><path d="m20 20-3.6-3.6" />
</svg>); }
function XIcon() { return (<svg {...iconProps(14)}>
  <path d="M6 6l12 12M18 6 6 18" />
</svg>); }
function PinIcon() { return (<svg {...iconProps(12)}>
  <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
  <circle cx="12" cy="10" r="2.4" />
</svg>); }
function MiniArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
