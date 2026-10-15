import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './FutureGoal.css';

const GOALS = [
  {
    id: 'university-degree',
    title: 'Get a university degree',
    sub: 'Bachelor\'s or higher at a public university.',
    icon: CapIcon,
    tone: 'gold',
    next: '/courses',
    nextLabel: 'Browse degrees',
  },
  {
    id: 'uot-diploma',
    title: 'Diploma at a university of technology',
    sub: 'Career-focused diplomas with strong industry links.',
    icon: GearIcon,
    tone: 'indigo',
    next: '/courses',
    nextLabel: 'Browse diplomas',
  },
  {
    id: 'tvet-trade',
    title: 'Learn a trade at TVET',
    sub: 'Artisan and technical training — fast track to work.',
    icon: WrenchIcon,
    tone: 'green',
    next: '/institutions',
    nextLabel: 'Explore TVET colleges',
  },
  {
    id: 'private-college',
    title: 'Study at a private college',
    sub: 'IIE-accredited degrees and diplomas.',
    icon: BuildingIcon,
    tone: 'amber',
    next: '/institutions',
    nextLabel: 'See private colleges',
  },
  {
    id: 'gap-year',
    title: 'Take a gap year first',
    sub: 'Work, travel or volunteer before you apply.',
    icon: CompassIcon,
    tone: 'indigo',
    next: '/resources',
    nextLabel: 'Explore resources',
  },
  {
    id: 'not-sure',
    title: 'Not sure yet',
    sub: 'That\'s okay. We\'ll help you explore options.',
    icon: QuestionIcon,
    tone: 'gray',
    next: '/companion',
    nextLabel: 'Ask the AI Companion',
  },
];

export default function FutureGoal() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(user?.futureGoal || '');
  const [hover, setHover] = useState(null);

  function handleContinue() {
    if (!selected) return;
    updateUser({ futureGoal: selected });
    const goal = GOALS.find((g) => g.id === selected);
    navigate(goal?.next || '/dashboard');
  }

  function handleSkip() {
    updateUser({ futureGoal: 'not-sure' });
    navigate('/dashboard');
  }

  return (
    <div className="fg">
      <header className="fg-head">
        <div className="fg-head-icon" aria-hidden="true"><CapIcon /></div>
        <div>
          <h1 className="fg-title">Pick your future goal</h1>
          <p className="fg-sub">
            This helps us shape your roadmap. You can change it any time from Profile.
          </p>
        </div>
      </header>

      <div className="fg-grid">
        {GOALS.map((g) => {
          const Icon = g.icon;
          const active = selected === g.id;
          return (
            <button
              key={g.id}
              type="button"
              className={`fg-card fg-card-${g.tone}${active ? ' is-active' : ''}`}
              onClick={() => setSelected(g.id)}
              onMouseEnter={() => setHover(g.id)}
              onMouseLeave={() => setHover(null)}
              aria-pressed={active}
            >
              <span className={`fg-card-icon fg-card-icon-${g.tone}`}>
                <Icon />
              </span>
              <span className="fg-card-title">{g.title}</span>
              <span className="fg-card-sub">{g.sub}</span>
              <span className="fg-card-radio" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="fg-foot">
        <button type="button" className="btn btn-ghost fg-skip" onClick={handleSkip}>
          Skip for now
        </button>
        <div className="fg-foot-right">
          <div className="fg-foot-hint">
            {selected
              ? `You picked: ${GOALS.find((g) => g.id === selected)?.title}`
              : 'Pick one to continue'}
          </div>
          <button
            type="button"
            className="btn btn-primary fg-continue"
            onClick={handleContinue}
            disabled={!selected}
          >
            Continue <MiniArrow />
          </button>
        </div>
      </div>
    </div>
  );
}

function iconProps(size = 22) {
  return {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
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
function CapIcon() { return (<svg {...iconProps(24)}>
  <path d="M3 9.5 12 5l9 4.5L12 14 3 9.5z" />
  <path d="M7 11.5V17c0 .8 2.2 2 5 2s5-1.2 5-2v-5.5" />
  <path d="M21 9.5v5" />
</svg>); }
function GearIcon() { return (<svg {...iconProps(22)}>
  <circle cx="12" cy="12" r="3" />
  <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
</svg>); }
function WrenchIcon() { return (<svg {...iconProps(22)}>
  <path d="M14.7 6.3a4 4 0 0 0 5 5L21 9.5l-6.5 6.5L13 17l-2-2 6.7-6.7z" />
  <path d="m13 17-7.5 2.5L8 17l-2-2 2.5-7.5" />
</svg>); }
function BuildingIcon() { return (<svg {...iconProps(22)}>
  <path d="M3 20h18" /><path d="M5 20V8l7-4 7 4v12" /><path d="M9.5 20v-6h5v6" />
</svg>); }
function CompassIcon() { return (<svg {...iconProps(22)}>
  <circle cx="12" cy="12" r="9.4" />
  <path d="m15.6 8.4-2.3 6.9-6.9 2.3 2.3-6.9z" />
</svg>); }
function QuestionIcon() { return (<svg {...iconProps(22)}>
  <circle cx="12" cy="12" r="9.4" />
  <path d="M9.5 9.5a2.5 2.5 0 1 1 3.8 2.1c-.8.5-1.3 1.1-1.3 2v.6" />
  <circle cx="12" cy="17" r="0.9" fill="currentColor" />
</svg>); }
