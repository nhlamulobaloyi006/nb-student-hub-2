import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CAREERS } from '../data/careers';
import { INTEREST_LABELS, INTEREST_GROUPS } from '../data/subjects';
import { COURSES } from '../data/courses';

import './Careers.css';

export default function Careers() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const userInterests = user?.interests || [];

  const relatedCourseCount = useMemo(() => {
    const acc = {};
    CAREERS.forEach((c) => {
      acc[c.id] = COURSES.filter((course) =>
        course.interestTags?.some((t) => c.interestTags.includes(t))
      ).length;
    });
    return acc;
  }, []);

  const filterChips = useMemo(() => [
    { id: 'all', label: 'All' },
    ...INTEREST_GROUPS.map((g) => ({ id: g.id, label: g.label })),
  ], []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = CAREERS;
    if (filter !== 'all') {
      const group = INTEREST_GROUPS.find((g) => g.id === filter);
      if (group) {
        const ids = group.interests.map((i) => i.id);
        list = list.filter((c) => c.interestTags.some((t) => ids.includes(t)));
      }
    }
    if (q) {
      list = list.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.blurb.toLowerCase().includes(q)
      );
    }
    const scored = list.map((c) => {
      const overlap = userInterests.length
        ? c.interestTags.filter((t) => userInterests.includes(t)).length
        : 0;
      return { career: c, overlap };
    });
    scored.sort((a, b) => b.overlap - a.overlap || a.career.title.localeCompare(b.career.title));
    return scored.map((s) => s.career);
  }, [query, filter, userInterests]);

  const forYou = useMemo(() => {
    if (!userInterests.length) return [];
    return CAREERS
      .filter((c) => c.interestTags.some((t) => userInterests.includes(t)))
      .slice(0, 3);
  }, [userInterests]);

  return (
    <div className="cr">
      <header className="cr-head">
        <div>
          <h1 className="cr-title">Careers</h1>
          <p className="cr-sub">
            Explore career paths that match your interests and subjects — then find courses that lead there.
          </p>
        </div>
      </header>

      {forYou.length > 0 && (
        <section className="cr-foryou">
          <div className="cr-foryou-head">
            <div className="cr-foryou-label">
              <span className="cr-foryou-dot" aria-hidden="true" />
              Picked for your interests
            </div>
            <Link to="/profile" className="cr-foryou-edit">Edit interests</Link>
          </div>
          <div className="cr-foryou-grid">
            {forYou.map((c) => (
              <CareerMiniCard key={c.id} career={c} highlight />
            ))}
          </div>
        </section>
      )}

      <div className="cr-toolbar">
        <div className="cr-search-wrap">
          <SearchIcon />
          <input
            className="cr-search"
            placeholder="Search careers by name or description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="cr-search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <XIcon />
            </button>
          )}
        </div>

        <div className="cr-chips">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={'cr-chip' + (filter === chip.id ? ' is-active' : '')}
              onClick={() => setFilter(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cr-count">
        Showing {visible.length} of {CAREERS.length} careers
      </div>

      {visible.length === 0 ? (
        <div className="cr-empty">
          <div className="cr-empty-title">No careers match.</div>
          <div className="cr-empty-sub">Try a different search or clear the filter.</div>
        </div>
      ) : (
        <div className="cr-grid">
          {visible.map((c) => (
            <CareerCard
              key={c.id}
              career={c}
              courseCount={relatedCourseCount[c.id] || 0}
              inInterests={userInterests.length > 0 && c.interestTags.some((t) => userInterests.includes(t))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Cards
   ══════════════════════════════════════════════════════════ */

function CareerCard({ career, courseCount, inInterests }) {
  const coursesLink = buildCoursesLink(career);
  return (
    <article className="cr-card">
      <div className="cr-card-top">
        <span className="cr-card-icon" aria-hidden="true">
          <CareerIcon iconKey={career.iconKey} size={22} />
        </span>
        {inInterests && (
          <span className="badge badge-gold cr-card-badge">Matches you</span>
        )}
      </div>

      <div className="cr-card-title">{career.title}</div>
      <div className="cr-card-blurb">{career.blurb}</div>

      <div className="cr-card-salary">
        <span className="cr-card-salary-label">Salary range</span>
        <span className="cr-card-salary-value">{career.salaryRange}</span>
      </div>

      <div className="cr-card-tags">
        {career.interestTags.slice(0, 3).map((t) => (
          <span key={t} className="cr-card-tag">
            {INTEREST_LABELS[t] || t}
          </span>
        ))}
      </div>

      <Link to={coursesLink} className="cr-card-cta">
        {courseCount > 0
          ? `See ${courseCount} matching course${courseCount === 1 ? '' : 's'}`
          : 'Explore courses'}
        <MiniArrow />
      </Link>
    </article>
  );
}

function CareerMiniCard({ career, highlight }) {
  const coursesLink = buildCoursesLink(career);
  return (
    <Link to={coursesLink} className={'cr-mini' + (highlight ? ' is-highlight' : '')}>
      <span className="cr-mini-icon" aria-hidden="true">
        <CareerIcon iconKey={career.iconKey} size={20} />
      </span>
      <span className="cr-mini-body">
        <span className="cr-mini-title">{career.title}</span>
        <span className="cr-mini-sub">{career.salaryRange}</span>
      </span>
      <span className="cr-mini-arrow"><MiniArrow /></span>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

function buildCoursesLink(career) {
  const primary = career.interestTags[0] || '';
  return `/courses?career=${encodeURIComponent(career.title)}#${primary}`;
}

/* ══════════════════════════════════════════════════════════
   Career icon — SVG by iconKey. NO emojis.
   ══════════════════════════════════════════════════════════ */

function iconProps(size) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
}

function CareerIcon({ iconKey, size = 20 }) {
  const props = iconProps(size);

  switch (iconKey) {
    case 'code':
      return (<svg {...props}>
        <path d="m8 6-6 6 6 6" /><path d="m16 6 6 6-6 6" />
      </svg>);
    case 'chart':
      return (<svg {...props}>
        <path d="M3 3v18h18" />
        <circle cx="9" cy="12" r="1.6" />
        <circle cx="14" cy="8" r="1.6" />
        <circle cx="18" cy="15" r="1.6" />
      </svg>);
    case 'bridge':
      return (<svg {...props}>
        <path d="M3 18h18" />
        <path d="M5 18v-6a7 7 0 0 1 14 0v6" />
        <path d="M9 18v-4M15 18v-4" />
      </svg>);
    case 'gear':
      return (<svg {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
      </svg>);
    case 'bolt':
      return (<svg {...props}>
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>);
    case 'flask':
      return (<svg {...props}>
        <path d="M9 3h6" /><path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
        <path d="M6.5 15h11" />
      </svg>);
    case 'heart-pulse':
      return (<svg {...props}>
        <path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3c0 5-7 9.4-7 9.4z" />
        <path d="M4.5 12h2.5l1.5-2.5 2 4 1.5-3 1.5 1.5h5" />
      </svg>);
    case 'nurse':
      return (<svg {...props}>
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c.9-3.4 3.7-5.2 7-5.2S18.1 16.6 19 20" />
        <path d="M12 11.6v3.5M10.4 13.4h3.2" />
      </svg>);
    case 'pill':
      return (<svg {...props}>
        <rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" />
        <path d="M8.5 15.5 15.5 8.5" />
      </svg>);
    case 'brain':
      return (<svg {...props}>
        <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.8v.2a3 3 0 0 0 3 3v1a3 3 0 0 0 4 2.8V4.5A3 3 0 0 0 9 4z" />
        <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5.8v.2a3 3 0 0 1-3 3v1a3 3 0 0 1-4 2.8V4.5A3 3 0 0 1 15 4z" />
      </svg>);
    case 'hand-heart':
      return (<svg {...props}>
        <path d="M11 12V5.5a1.5 1.5 0 0 1 3 0V12" />
        <path d="M14 11V8a1.5 1.5 0 0 1 3 0v6" />
        <path d="M8 13v-3a1.5 1.5 0 0 1 3 0v2" />
        <path d="M6.5 12.5 4 15a2 2 0 0 0 0 2.8l3 3A2 2 0 0 0 8.4 21H17a3 3 0 0 0 3-3v-4" />
      </svg>);
    case 'chalkboard':
      return (<svg {...props}>
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M9 4v12M12 7.5h6M12 10.5h4" />
        <path d="M8 20h8M12 16v4" />
      </svg>);
    case 'calculator':
      return (<svg {...props}>
        <rect x="5" y="3" width="14" height="18" rx="2.2" />
        <path d="M8 7h8" />
        <path d="M8.5 11h1.5M8.5 14.5h1.5M8.5 18h1.5M13 11h1.5M13 14.5h1.5M13 18h1.5" />
      </svg>);
    case 'chart-bar':
      return (<svg {...props}>
        <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
      </svg>);
    case 'sigma':
      return (<svg {...props}>
        <path d="M18 5H6l6 7-6 7h12" />
      </svg>);
    case 'rocket':
      return (<svg {...props}>
        <path d="M14 4c3 0 6 3 6 6-2 5-8 9-10 9l-3-3c0-2 4-8 9-10z" />
        <circle cx="15" cy="9" r="1.4" />
        <path d="m6 16-2 4 4-2M9 13l2 2M6 19l3-3" />
      </svg>);
    case 'scales':
      return (<svg {...props}>
        <path d="M12 3v18M8 21h8" />
        <path d="M5 8h14" />
        <path d="M5 8 2 14a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z" />
      </svg>);
    case 'mic':
      return (<svg {...props}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v3M9 21h6" />
      </svg>);
    case 'palette':
      return (<svg {...props}>
        <path d="M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3c1.5 0 2.7-1.2 2.7-2.7C20 6.9 16.4 3 12 3z" />
        <circle cx="7.5" cy="10" r="1.2" fill="currentColor" />
        <circle cx="10" cy="6.5" r="1.2" fill="currentColor" />
        <circle cx="14.5" cy="6.5" r="1.2" fill="currentColor" />
        <circle cx="17" cy="10" r="1.2" fill="currentColor" />
      </svg>);
    case 'cursor':
      return (<svg {...props}>
        <path d="m5 3 6 18 2.5-7L21 11.5z" />
      </svg>);
    case 'compass':
      return (<svg {...props}>
        <circle cx="12" cy="12" r="9.4" />
        <path d="m15.6 8.4-2.3 6.9-6.9 2.3 2.3-6.9z" />
      </svg>);
    case 'seedling':
      return (<svg {...props}>
        <path d="M12 21v-7" />
        <path d="M12 14a5 5 0 0 0-5-5H5a5 5 0 0 1 5-5" />
        <path d="M12 14a5 5 0 0 1 5-5h2a5 5 0 0 0-5-5" />
      </svg>);
    case 'leaf':
      return (<svg {...props}>
        <path d="M20 4C10 4 4 10 4 18a8 8 0 0 0 8 2c6 0 8-6 8-16z" />
        <path d="M4 20 14 10" />
      </svg>);
    case 'paw':
      return (<svg {...props}>
        <ellipse cx="8" cy="9" rx="1.7" ry="2.3" />
        <ellipse cx="16" cy="9" rx="1.7" ry="2.3" />
        <ellipse cx="5.5" cy="14" rx="1.5" ry="2" />
        <ellipse cx="18.5" cy="14" rx="1.5" ry="2" />
        <path d="M12 12c-2.5 0-4 2.5-4 5 0 1.6 1.3 3 3 3h2c1.7 0 3-1.4 3-3 0-2.5-1.5-5-4-5z" />
      </svg>);
    case 'globe':
      return (<svg {...props}>
        <circle cx="12" cy="12" r="9.4" />
        <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
      </svg>);
    case 'document':
      return (<svg {...props}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h4" />
      </svg>);
    case 'music-note':
      return (<svg {...props}>
        <path d="M9 18V6l11-2v12" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
      </svg>);
    case 'film':
      return (<svg {...props}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5" />
      </svg>);
    case 'bed':
      return (<svg {...props}>
        <path d="M3 12v7M3 12V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
        <path d="M3 12h18v7M21 12V9a2 2 0 0 0-2-2h-6" />
      </svg>);
    default:
      return (<svg {...props}>
        <circle cx="12" cy="12" r="9.4" />
        <path d="M12 8v.01M11 12h1v5h1" />
      </svg>);
  }
}

/* ══════════════════════════════════════════════════════════
   UI icons
   ══════════════════════════════════════════════════════════ */

function SearchIcon() { return (<svg {...iconProps(16)}>
  <circle cx="11" cy="11" r="6" /><path d="m20 20-3.6-3.6" />
</svg>); }
function XIcon() { return (<svg {...iconProps(14)}>
  <path d="M6 6l12 12M18 6 6 18" />
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
