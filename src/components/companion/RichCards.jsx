import { Link, useNavigate } from 'react-router-dom';
import './RichCards.css';

/* ══════════════════════════════════════════════════════════
   1. Course match cards — 3-up grid
   ══════════════════════════════════════════════════════════ */
export function CourseMatchCards({ matches = [] }) {
  if (!matches.length) return null;
  return (
    <div className="rc-courses">
      {matches.map((m) => (
        <CourseMatchCard key={m.courseId} match={m} />
      ))}
    </div>
  );
}

function CourseMatchCard({ match }) {
  const tone = match.status === 'pass' ? 'green'
             : match.status === 'warn' ? 'indigo'
             : 'red';
  const label = match.status === 'pass' ? 'Potential match'
              : match.status === 'warn' ? 'More information needed'
              : 'Requirement not met';

  return (
    <div className={`rc-course rc-course-${tone}`}>
      <span className={`rc-course-badge rc-course-badge-${tone}`}>{label}</span>
      <div className="rc-course-name">{match.courseName}</div>
      <div className="rc-course-uni">
        <span className="rc-course-uni-name">{match.universityName}</span>
        {match.province && <span className="rc-course-uni-prov">{match.province}</span>}
      </div>

      <div className="rc-course-reqs">
        {match.requiredSubjects.slice(0, 3).map((r) => (
          <span key={r} className="rc-course-req">{r}</span>
        ))}
      </div>

      <div className="rc-course-meta">
        <span className="rc-course-aps">APS {match.aps ?? '—'}</span>
        <span className="rc-course-dot">·</span>
        <span>{match.duration}</span>
      </div>

      {match.reason && <div className="rc-course-reason">{match.reason}</div>}

      <Link to="/courses" className="rc-course-cta">
        View course <Arrow />
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   2. Cost estimate card
   ══════════════════════════════════════════════════════════ */
export function CostEstimateCard({ estimate }) {
  const navigate = useNavigate();
  if (!estimate) return null;

  return (
    <div className="rc-cost">
      <div className="rc-cost-head">
        <div>
          <div className="rc-cost-course">{estimate.courseName}</div>
          <div className="rc-cost-uni">{estimate.universityName}</div>
        </div>
      </div>

      <div className="rc-cost-big">
        <span className="rc-cost-currency">R</span>
        {estimate.total.toLocaleString('en-ZA')}
        <span className="rc-cost-per">per year (estimated)</span>
      </div>

      <div className="rc-cost-grid">
        {estimate.rows.map((r) => (
          <div key={r.label} className="rc-cost-row">
            <span className="rc-cost-row-label">{r.label}</span>
            <span className="rc-cost-row-amount">R{r.amount.toLocaleString('en-ZA')}</span>
            <span className="rc-cost-row-pct">{r.pct}%</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-primary btn-block rc-cost-cta"
        onClick={() => navigate('/cost-planner')}
      >
        Open Cost Planner <Arrow />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3. Funding opportunity cards — 3-up grid
   ══════════════════════════════════════════════════════════ */
export function FundingCards({ funds = [] }) {
  if (!funds.length) return null;
  return (
    <div className="rc-funds">
      {funds.map((f) => (
        <FundingCard key={f.id} fund={f} />
      ))}
    </div>
  );
}

function FundingCard({ fund }) {
  const urgent = fund.daysLeft >= 0 && fund.daysLeft <= 30;
  const tierTone =
    fund.tier === 'NSFAS' ? 'gold'
    : fund.tier === 'Scholarships' ? 'green'
    : fund.tier === 'Bursaries' ? 'indigo'
    : fund.tier === 'Student loans' ? 'amber'
    : 'gray';

  return (
    <Link to={`/funding#${fund.id}`} className="rc-fund">
      <div className="rc-fund-top">
        <span className={`badge badge-${tierTone}`}>{fund.tier}</span>
        <span className="rc-fund-provider">{fund.provider}</span>
      </div>
      <div className="rc-fund-name">{fund.name}</div>
      <div className="rc-fund-amount">{fund.amount}</div>
      <div className={`rc-fund-deadline ${urgent ? 'is-urgent' : ''}`}>
        {urgent ? `${fund.daysLeft} day${fund.daysLeft === 1 ? '' : 's'} left` : `Deadline: ${formatDate(fund.deadline)}`}
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════
   4. Step list (for NSFAS, study tips, etc.)
   ══════════════════════════════════════════════════════════ */
export function StepList({ steps = [] }) {
  if (!steps.length) return null;
  return (
    <ol className="rc-steps">
      {steps.map((s, i) => (
        <li key={i} className="rc-step">
          <span className="rc-step-num">{i + 1}</span>
          <div className="rc-step-body">
            <div className="rc-step-title">{s.title}</div>
            <div className="rc-step-text">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ══════════════════════════════════════════════════════════
   5. Next-action card
   ══════════════════════════════════════════════════════════ */
export function NextActionCard({ action }) {
  const navigate = useNavigate();
  if (!action) return null;
  const tone = action.tone || 'gold';

  return (
    <div className={`rc-next rc-next-${tone}`}>
      <div className={`rc-next-label rc-next-label-${tone}`}>SUGGESTED NEXT STEP</div>
      <div className="rc-next-title">{action.title}</div>
      <div className="rc-next-sub">{action.sub}</div>
      <button
        type="button"
        className="btn btn-primary rc-next-cta"
        onClick={() => navigate(action.to)}
      >
        {action.ctaLabel} <Arrow />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   6. Compare institutions — side-by-side grid
   ══════════════════════════════════════════════════════════ */
export function CompareCards({ institutions = [] }) {
  if (!institutions.length) return null;
  return (
    <div className="rc-compare">
      {institutions.map((inst) => (
        <div key={inst.institutionId} className="rc-compare-card">
          <div className="rc-compare-logo" aria-hidden="true">
            <span className="rc-compare-monogram">
              {inst.shortName || inst.name.slice(0, 3).toUpperCase()}
            </span>
          </div>
          <div className="rc-compare-tier">{inst.tier}</div>
          <div className="rc-compare-name">{inst.name}</div>
          <div className="rc-compare-loc">
            {inst.province}
            {inst.location ? ` · ${inst.location}` : ''}
          </div>

          <div className="rc-compare-rows">
            <div className="rc-compare-row">
              <span className="rc-compare-label">Application closes</span>
              <span className="rc-compare-value">
                {inst.applicationClose ? formatDate(inst.applicationClose) : '—'}
              </span>
            </div>
            <div className="rc-compare-row">
              <span className="rc-compare-label">Application fee</span>
              <span className="rc-compare-value">
                {inst.applicationFee ? `R${inst.applicationFee}` : 'Free'}
              </span>
            </div>
            <div className="rc-compare-row">
              <span className="rc-compare-label">NBT required</span>
              <span className={`rc-compare-value rc-compare-${inst.nbt ? 'yes' : 'no'}`}>
                {inst.nbt ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="rc-compare-row">
              <span className="rc-compare-label">Courses offered</span>
              <span className="rc-compare-value">{inst.courseCount}</span>
            </div>
          </div>

          {inst.topCourses?.length > 0 && (
            <div className="rc-compare-courses">
              <div className="rc-compare-courses-label">You may qualify for</div>
              {inst.topCourses.map((name) => (
                <div key={name} className="rc-compare-course">{name}</div>
              ))}
            </div>
          )}

          {inst.website && (
            <a
              className="rc-compare-link"
              href={inst.website}
              target="_blank"
              rel="noreferrer noopener"
            >
              Visit website <Arrow />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   7. Career cards — careers this course leads to
   ══════════════════════════════════════════════════════════ */
export function CareerCards({ careers = [], courseName = "", total = null }) {
  if (!careers.length) return null;
  const shown = careers.length;
  const grand = total ?? shown;

  return (
    <div className="rc-careers-wrap">
      {courseName && (
        <div className="rc-careers-head">
          <span className="rc-careers-head-line" />
          <span className="rc-careers-head-text">
            Careers this course opens up
          </span>
        </div>
      )}

      <div className="rc-careers">
        {careers.map((c) => (
          <CareerCard key={c.id} career={c} />
        ))}
      </div>

      {grand > shown && (
        <Link to="/careers" className="rc-careers-more">
          See all {grand} careers <Arrow />
        </Link>
      )}
    </div>
  );
}

function CareerCard({ career }) {
  return (
    <div className="rc-career">
      <div className="rc-career-top">
        <span className="rc-career-icon" aria-hidden="true">
          <CareerIcon iconKey={career.iconKey} />
        </span>
        <span className="rc-career-title">{career.title}</span>
      </div>
      <div className="rc-career-blurb">{career.blurb}</div>
      <div className="rc-career-salary">
        <span className="rc-career-salary-label">Salary</span>
        <span className="rc-career-salary-value">{career.salaryRange}</span>
      </div>
      <Link to="/careers" className="rc-career-cta">
        Explore <Arrow />
      </Link>
    </div>
  );
}

/** Small icon per career — inline SVG in currentColor */
function CareerIcon({ iconKey }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (iconKey) {
    case "code":
      return (<svg {...props}><path d="m8 6-6 6 6 6" /><path d="m16 6 6 6-6 6" /></svg>);
    case "chart":
      return (<svg {...props}><path d="M3 3v18h18" /><circle cx="9" cy="12" r="1.6" /><circle cx="14" cy="8" r="1.6" /><circle cx="18" cy="15" r="1.6" /></svg>);
    case "bridge":
      return (<svg {...props}><path d="M3 18h18" /><path d="M5 18v-6a7 7 0 0 1 14 0v6" /><path d="M9 18v-4M15 18v-4" /></svg>);
    case "gear":
      return (<svg {...props}><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /></svg>);
    case "bolt":
      return (<svg {...props}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></svg>);
    case "flask":
      return (<svg {...props}><path d="M9 3h6" /><path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" /><path d="M6.5 15h11" /></svg>);
    case "heart-pulse":
      return (<svg {...props}><path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3c0 5-7 9.4-7 9.4z" /><path d="M4.5 12h2.5l1.5-2.5 2 4 1.5-3 1.5 1.5h5" /></svg>);
    case "nurse":
      return (<svg {...props}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.9-3.4 3.7-5.2 7-5.2S18.1 16.6 19 20" /></svg>);
    case "pill":
      return (<svg {...props}><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" /><path d="M8.5 15.5 15.5 8.5" /></svg>);
    case "brain":
      return (<svg {...props}><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.8v.2a3 3 0 0 0 3 3v1a3 3 0 0 0 4 2.8V4.5A3 3 0 0 0 9 4z" /><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5.8v.2a3 3 0 0 1-3 3v1a3 3 0 0 1-4 2.8V4.5A3 3 0 0 1 15 4z" /></svg>);
    case "hand-heart":
      return (<svg {...props}><path d="M11 12V5.5a1.5 1.5 0 0 1 3 0V12" /><path d="M14 11V8a1.5 1.5 0 0 1 3 0v6" /><path d="M8 13v-3a1.5 1.5 0 0 1 3 0v2" /><path d="M6.5 12.5 4 15a2 2 0 0 0 0 2.8l3 3A2 2 0 0 0 8.4 21H17a3 3 0 0 0 3-3v-4" /></svg>);
    case "chalkboard":
      return (<svg {...props}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M9 4v12M12 7.5h6M12 10.5h4" /><path d="M8 20h8M12 16v4" /></svg>);
    case "calculator":
      return (<svg {...props}><rect x="5" y="3" width="14" height="18" rx="2.2" /><path d="M8 7h8" /><path d="M8.5 11h1.5M8.5 14.5h1.5M8.5 18h1.5M13 11h1.5M13 14.5h1.5M13 18h1.5" /></svg>);
    case "chart-bar":
      return (<svg {...props}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>);
    case "sigma":
      return (<svg {...props}><path d="M18 5H6l6 7-6 7h12" /></svg>);
    case "rocket":
      return (<svg {...props}><path d="M14 4c3 0 6 3 6 6-2 5-8 9-10 9l-3-3c0-2 4-8 9-10z" /><circle cx="15" cy="9" r="1.4" /><path d="m6 16-2 4 4-2M9 13l2 2M6 19l3-3" /></svg>);
    case "scales":
      return (<svg {...props}><path d="M12 3v18M8 21h8M5 8h14" /><path d="M5 8 2 14a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z" /></svg>);
    case "mic":
      return (<svg {...props}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3M9 21h6" /></svg>);
    case "palette":
      return (<svg {...props}><path d="M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3c1.5 0 2.7-1.2 2.7-2.7C20 6.9 16.4 3 12 3z" /><circle cx="7.5" cy="10" r="1.2" fill="currentColor" stroke="none" /><circle cx="10" cy="6.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="14.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="17" cy="10" r="1.2" fill="currentColor" stroke="none" /></svg>);
    case "cursor":
      return (<svg {...props}><path d="m5 3 6 18 2.5-7L21 11.5z" /></svg>);
    case "compass":
      return (<svg {...props}><circle cx="12" cy="12" r="9.4" /><path d="m15.6 8.4-2.3 6.9-6.9 2.3 2.3-6.9z" /></svg>);
    case "seedling":
      return (<svg {...props}><path d="M12 21v-7" /><path d="M12 14a5 5 0 0 0-5-5H5a5 5 0 0 1 5-5" /><path d="M12 14a5 5 0 0 1 5-5h2a5 5 0 0 0-5-5" /></svg>);
    case "leaf":
      return (<svg {...props}><path d="M20 4C10 4 4 10 4 18a8 8 0 0 0 8 2c6 0 8-6 8-16z" /><path d="M4 20 14 10" /></svg>);
    case "paw":
      return (<svg {...props}><ellipse cx="8" cy="9" rx="1.7" ry="2.3" /><ellipse cx="16" cy="9" rx="1.7" ry="2.3" /><ellipse cx="5.5" cy="14" rx="1.5" ry="2" /><ellipse cx="18.5" cy="14" rx="1.5" ry="2" /><path d="M12 12c-2.5 0-4 2.5-4 5 0 1.6 1.3 3 3 3h2c1.7 0 3-1.4 3-3 0-2.5-1.5-5-4-5z" /></svg>);
    case "globe":
      return (<svg {...props}><circle cx="12" cy="12" r="9.4" /><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" /></svg>);
    case "document":
      return (<svg {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></svg>);
    case "music-note":
      return (<svg {...props}><path d="M9 18V6l11-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>);
    case "film":
      return (<svg {...props}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5" /></svg>);
    case "bed":
      return (<svg {...props}><path d="M3 12v7M3 12V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" /><path d="M3 12h18v7M21 12V9a2 2 0 0 0-2-2h-6" /></svg>);
    default:
      return (<svg {...props}><circle cx="12" cy="12" r="9.4" /><path d="M12 8v.01M11 12h1v5h1" /></svg>);
  }
}

/* ══════════════════════════════════════════════════════════
   Shared bits
   ══════════════════════════════════════════════════════════ */

function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}
