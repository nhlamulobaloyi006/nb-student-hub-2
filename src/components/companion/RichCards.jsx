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
