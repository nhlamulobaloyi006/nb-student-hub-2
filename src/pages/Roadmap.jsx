import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProgressRing from '../components/ProgressRing';
import { getRoadmapMilestones } from '../utils/getNextAction';

import './Roadmap.css';

/**
 * Status meta per milestone id — controls icon, tone, CTA label.
 * The 9 ids come from getRoadmapMilestones().milestones.
 */
const META = {
  profile:     { tone: 'gold',   icon: UserIcon,     cta: 'Go to profile',    to: '/profile' },
  explore:     { tone: 'indigo', icon: CompassIcon,  cta: 'Browse courses',   to: '/courses' },
  compare:     { tone: 'indigo', icon: BuildingIcon, cta: 'Compare now',      to: '/institutions' },
  costs:       { tone: 'gold',   icon: CalcIcon,     cta: 'Open Cost Planner', to: '/cost-planner' },
  funding:     { tone: 'green',  icon: CoinIcon,     cta: 'Find funding',     to: '/funding' },
  eligibility: { tone: 'success', icon: CheckIcon,   cta: 'Log your marks',   to: '/profile' },
  documents:   { tone: 'amber',  icon: FileIcon,     cta: 'Open tracker',     to: '/applications' },
  apply:       { tone: 'amber',  icon: SendIcon,     cta: 'Start applying',   to: '/courses' },
  track:       { tone: 'indigo', icon: ChartIcon,    cta: 'Track progress',   to: '/applications' },
};

export default function Roadmap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const roadmap = useMemo(() => getRoadmapMilestones(user), [user]);

  const completed = roadmap.milestones.filter((m) => m.status === 'done').length;
  const inProgress = roadmap.milestones.find((m) => m.status === 'in-progress' || m.status === 'next');
  const remaining = roadmap.milestones.length - completed;

  return (
    <div className="rm">
      <header className="rm-head">
        <div>
          <h1 className="rm-title">My Student Roadmap</h1>
          <p className="rm-sub">
            Follow these steps to go from matric to tertiary. We'll keep track of where you are.
          </p>
        </div>
        <div className="rm-head-progress">
          <ProgressRing value={roadmap.percent} size={64} stroke={7} />
          <div className="rm-head-progress-text">
            <div className="rm-head-progress-value">
              {completed} / {roadmap.milestones.length}
            </div>
            <div className="rm-head-progress-label">milestones completed</div>
          </div>
        </div>
      </header>

      {/* Next focus card */}
      {inProgress && (
        <section className="rm-next">
          <div className="rm-next-label">UP NEXT</div>
          <div className="rm-next-body">
            <div className="rm-next-text">
              <div className="rm-next-title">{inProgress.label}</div>
              <div className="rm-next-sub">{inProgress.sub}</div>
            </div>
            <Link
              to={META[inProgress.id]?.to || '/dashboard'}
              className="rm-next-cta"
            >
              {META[inProgress.id]?.cta || 'Continue'}
              <MiniArrow />
            </Link>
          </div>
        </section>
      )}

      {/* Milestones list */}
      <section className="rm-list">
        {roadmap.milestones.map((m, i) => {
          const meta = META[m.id] || META.profile;
          const Icon = meta.icon;
          const tone = statusTone(m.status, meta.tone);
          const isLast = i === roadmap.milestones.length - 1;

          return (
            <div key={m.id} className={`rm-item rm-item-${tone}`}>
              <div className="rm-item-rail" aria-hidden="true">
                <div className={`rm-item-node rm-item-node-${tone}`}>
                  {m.status === 'done'
                    ? <CheckIcon />
                    : <span className="rm-item-node-num">{i + 1}</span>}
                </div>
                {!isLast && <div className="rm-item-line" />}
              </div>

              <div className="rm-item-body">
                <div className="rm-item-head">
                  <span className={`rm-item-icon rm-item-icon-${tone}`}>
                    <Icon />
                  </span>
                  <div className="rm-item-head-text">
                    <div className="rm-item-title">{m.label}</div>
                    <div className="rm-item-sub">{m.sub}</div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>

                {m.status !== 'done' && (
                  <div className="rm-item-actions">
                    <button
                      type="button"
                      className={`btn ${m.status === 'next' || m.status === 'in-progress' ? 'btn-primary' : 'btn-outline'} rm-item-cta`}
                      onClick={() => navigate(meta.to || '/dashboard')}
                    >
                      {meta.cta || 'Continue'} <MiniArrow />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Footer summary */}
      <section className="rm-summary">
        <div className="rm-summary-item">
          <div className="rm-summary-value rm-summary-value-green">{completed}</div>
          <div className="rm-summary-label">Completed</div>
        </div>
        <div className="rm-summary-item">
          <div className="rm-summary-value rm-summary-value-gold">
            {roadmap.milestones.filter((m) => m.status === 'in-progress').length}
          </div>
          <div className="rm-summary-label">In progress</div>
        </div>
        <div className="rm-summary-item">
          <div className="rm-summary-value rm-summary-value-muted">{remaining}</div>
          <div className="rm-summary-label">Remaining</div>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    done:        { label: 'Completed',   tone: 'green' },
    'in-progress': { label: 'In progress', tone: 'gold' },
    next:        { label: 'Next',        tone: 'indigo' },
    todo:        { label: 'Not started', tone: 'gray' },
  };
  const cfg = map[status] || map.todo;
  return <span className={`badge badge-${cfg.tone} rm-item-badge`}>{cfg.label}</span>;
}

function statusTone(status, fallbackTone) {
  if (status === 'done') return 'green';
  if (status === 'in-progress') return 'gold';
  if (status === 'next') return 'indigo';
  return 'gray';
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
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="3"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}
function UserIcon() { return (<svg {...iconProps(18)}>
  <circle cx="12" cy="8.5" r="3.6" />
  <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4S18.3 16.4 19.5 20" />
</svg>); }
function CompassIcon() { return (<svg {...iconProps(18)}>
  <circle cx="12" cy="12" r="9.4" />
  <path d="m15.6 8.4-2.3 6.9-6.9 2.3 2.3-6.9z" />
</svg>); }
function BuildingIcon() { return (<svg {...iconProps(18)}>
  <path d="M3 20h18" /><path d="M5 20V8l7-4 7 4v12" /><path d="M9.5 20v-6h5v6" />
</svg>); }
function CalcIcon() { return (<svg {...iconProps(18)}>
  <rect x="5" y="3" width="14" height="18" rx="2.2" /><path d="M8 7h8" />
  <path d="M8.5 11h1.5M8.5 14.5h1.5M8.5 18h1.5M13 11h1.5M13 14.5h1.5M13 18h1.5" />
</svg>); }
function CoinIcon() { return (<svg {...iconProps(18)}>
  <circle cx="12" cy="12" r="8.4" />
  <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
  <path d="M12 6.6v10.8" />
</svg>); }
function FileIcon() { return (<svg {...iconProps(18)}>
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  <path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" />
</svg>); }
function SendIcon() { return (<svg {...iconProps(18)}>
  <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" />
</svg>); }
function ChartIcon() { return (<svg {...iconProps(18)}>
  <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
</svg>); }
