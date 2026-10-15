import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Streaks.css';

const SUBJECT_PROGRESS = [
  { name: 'Mathematics',           pct: 70 },
  { name: 'English',               pct: 85 },
  { name: 'Life Orientation',      pct: 95 },
  { name: 'Business Applications', pct: 55 },
];

const BADGES = [
  { id: 'consistent',  name: 'Consistent',   sub: '7-day streak reached',     iconKey: 'flame',   tone: 'gold' },
  { id: 'goal-getter', name: 'Goal Getter',  sub: '5 weekly goals completed', iconKey: 'target',  tone: 'green' },
  { id: 'study-hero',  name: 'Study Hero',   sub: '10 past papers completed', iconKey: 'trophy',  tone: 'indigo' },
  { id: 'early-bird',  name: 'Early Bird',   sub: '5 morning sessions',       iconKey: 'sunrise', tone: 'amber' },
  { id: 'focused',     name: 'Focused',      sub: '3 hours logged in a day',  iconKey: 'brain',   tone: 'purple' },
  { id: 'comeback',    name: 'Comeback',     sub: 'Restarted after a break',  iconKey: 'seed',    tone: 'green' },
];

export default function Streaks() {
  const { user, updateUser } = useAuth();
  const streaks = user?.streaks || defaultStreaks();

  const [logging, setLogging] = useState(false);

  const weekDays = useMemo(() => buildWeekStrip(streaks.history || []), [streaks.history]);

  const papersThisWeek = useMemo(() => {
    const now = Date.now();
    return (streaks.history || []).filter((h) => {
      const d = new Date(h.date + 'T00:00:00').getTime();
      const diff = (now - d) / 86400000;
      return diff >= 0 && diff < 7 && h.subject;
    }).length;
  }, [streaks.history]);

  function handleStartStudying() {
    if (logging) return;
    setLogging(true);

    const today = new Date().toISOString().slice(0, 10);
    const entry = { date: today, subject: 'Mathematics', minutes: 45 };

    const history = [...(streaks.history || []), entry];
    const uniqueDays = new Set(history.map((h) => h.date));
    const current = computeCurrentStreak(Array.from(uniqueDays));
    const weeklyGoalsCompleted = Math.min(5, distinctDaysThisWeek(uniqueDays));

    updateUser({
      streaks: {
        ...streaks,
        history,
        current,
        longest: Math.max(streaks.longest || 0, current),
        weeklyGoalsCompleted,
        weeklyGoalsTotal: 5,
      },
    });

    setTimeout(() => setLogging(false), 600);
  }

  return (
    <div className="st">
      <header className="st-head">
        <div>
          <h1 className="st-title">Your momentum</h1>
          <p className="st-sub">Small consistent steps add up. Keep showing up.</p>
        </div>
      </header>

      <div className="st-body">
        <div className="st-main">
          <section className="st-hero">
            <div className="st-hero-glow" aria-hidden="true" />
            <div className="st-hero-content">
              <div className="st-hero-flame" aria-hidden="true"><FlameIcon size={42} /></div>
              <div className="st-hero-text">
                <div className="st-hero-title">
                  {streaks.current} day{streaks.current === 1 ? '' : 's'} in a row
                </div>
                <div className="st-hero-sub">
                  {streaks.current >= 3 ? 'Keep it going!' : 'Every day counts. Start today.'}
                </div>
              </div>
              <div className="st-hero-stats">
                <div className="st-hero-stat">
                  <div className="st-hero-stat-value">{streaks.longest || 0}</div>
                  <div className="st-hero-stat-label">Longest streak</div>
                </div>
                <div className="st-hero-stat">
                  <div className="st-hero-stat-value">{streaks.history?.length || 0}</div>
                  <div className="st-hero-stat-label">Total sessions</div>
                </div>
              </div>
            </div>
          </section>

          <section className="st-card">
            <div className="st-card-head">
              <div className="st-card-title">This week</div>
              <div className="st-card-sub">
                {weekDays.filter((d) => d.active).length} of 7 days active
              </div>
            </div>
            <div className="st-week">
              {weekDays.map((d) => (
                <div
                  key={d.iso}
                  className={
                    'st-week-day' +
                    (d.active ? ' is-active' : '') +
                    (d.isToday ? ' is-today' : '') +
                    (d.isFuture ? ' is-future' : '')
                  }
                >
                  <span className="st-week-dot" />
                  <span className="st-week-letter">{d.letter}</span>
                  <span className="st-week-date">{d.dayNum}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="st-card">
            <div className="st-card-head">
              <div className="st-card-title">Subject progress</div>
              <div className="st-card-sub">Based on your study sessions</div>
            </div>
            <div className="st-subjects">
              {SUBJECT_PROGRESS.map((s) => (
                <div key={s.name} className="st-subject">
                  <div className="st-subject-top">
                    <span className="st-subject-name">{s.name}</span>
                    <span className="st-subject-pct">{s.pct}%</span>
                  </div>
                  <div className="st-subject-bar">
                    <div className="st-subject-bar-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="st-card st-card-row">
            <div className="st-card-icon st-card-icon-indigo" aria-hidden="true">
              <FileIcon />
            </div>
            <div className="st-card-row-body">
              <div className="st-card-title">
                {papersThisWeek} past paper{papersThisWeek === 1 ? '' : 's'} completed this week
              </div>
              <div className="st-card-sub">
                {papersThisWeek >= 3
                  ? 'Nice pace — past papers beat re-reading notes.'
                  : 'Try to hit 3+ this week. It makes a real difference.'}
              </div>
            </div>
          </section>
        </div>

        <aside className="st-rail">
          <section className="st-card st-goal">
            <div className="st-goal-label">TODAY'S GOAL</div>
            <div className="st-goal-title">Complete one Mathematics past paper.</div>
            <div className="st-goal-sub">About 45 minutes. Focused, timed, no phone.</div>
            <button
              type="button"
              className="btn btn-primary btn-block st-goal-cta"
              onClick={handleStartStudying}
              disabled={logging}
            >
              {logging ? 'Logging…' : 'Start studying'}
              {!logging && <MiniArrow />}
            </button>
          </section>

          <section className="st-card">
            <div className="st-card-head">
              <div className="st-card-title">Weekly goals</div>
            </div>
            <div className="st-wgoal">
              <div className="st-wgoal-num">
                {streaks.weeklyGoalsCompleted || 0}
                <span className="st-wgoal-num-total">/{streaks.weeklyGoalsTotal || 5}</span>
              </div>
              <div className="st-wgoal-text">
                goals completed
                <div className="st-wgoal-sub">Resets every Monday</div>
              </div>
            </div>
            <div className="st-wgoal-bar">
              <div
                className="st-wgoal-bar-fill"
                style={{
                  width: `${((streaks.weeklyGoalsCompleted || 0) / (streaks.weeklyGoalsTotal || 5)) * 100}%`,
                }}
              />
            </div>
          </section>

          <section className="st-card">
            <div className="st-card-head">
              <div className="st-card-title">Badges</div>
              <button type="button" className="st-view-all">View all</button>
            </div>
            <div className="st-badges">
              {BADGES.slice(0, 3).map((b) => (
                <div key={b.id} className={`st-badge st-badge-${b.tone}`}>
                  <span className="st-badge-icon" aria-hidden="true">
                    <BadgeIcon iconKey={b.iconKey} />
                  </span>
                  <span className="st-badge-body">
                    <span className="st-badge-name">{b.name}</span>
                    <span className="st-badge-sub">{b.sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

function defaultStreaks() {
  return { current: 0, longest: 0, history: [], weeklyGoalsCompleted: 0, weeklyGoalsTotal: 5 };
}

function buildWeekStrip(history) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayIndex = (today.getDay() + 6) % 7;

  const activeDates = new Set((history || []).map((h) => h.date));
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return letters.map((letter, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - dayIndex + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      iso, letter,
      dayNum: d.getDate(),
      isToday: i === dayIndex,
      isFuture: i > dayIndex,
      active: activeDates.has(iso) && i <= dayIndex,
    };
  });
}

function computeCurrentStreak(sortedIsos) {
  if (!sortedIsos.length) return 0;
  const dates = sortedIsos.map((iso) => new Date(iso + 'T00:00:00').getTime()).sort((a, b) => b - a);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const ONE_DAY = 86400000;

  const first = dates[0];
  const gap = (todayMs - first) / ONE_DAY;
  if (gap > 1) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i - 1] - dates[i]) / ONE_DAY;
    if (diff === 1) streak += 1;
    else break;
  }
  return streak;
}

function distinctDaysThisWeek(isoSet) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayIndex = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(monday.getDate() - dayIndex);
  const mondayMs = monday.getTime();
  const ONE_DAY = 86400000;

  return isoSet.filter((iso) => {
    const t = new Date(iso + 'T00:00:00').getTime();
    return t >= mondayMs && t <= mondayMs + 7 * ONE_DAY;
  }).length;
}

/* ══════════════════════════════════════════════════════════
   Icons — SVG only. NO emojis.
   ══════════════════════════════════════════════════════════ */

function iconProps(size = 16) {
  return {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': true,
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

function FlameIcon({ size = 42 }) { return (<svg {...iconProps(size)}>
  <path d="M12 3c1.5 3 5 4.6 5 8.5A5 5 0 0 1 7 12c0-1.4.5-2.4 1.2-3.2C9.4 7.4 11 6 12 3z" />
  <path d="M12 21a3.5 3.5 0 0 1-2-6.4c.4 1.4 1 1.9 2 2 .2-1.2 0-2.2-.4-3 1.6 1.2 3.4 2.7 3.4 4.9A3.5 3.5 0 0 1 12 21z" />
</svg>); }
function FileIcon() { return (<svg {...iconProps(18)}>
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  <path d="M14 3v5h5" />
  <path d="M9 13h6M9 17h4" />
</svg>); }

/* Badge icons — every badge maps to its own SVG, no emoji */
function BadgeIcon({ iconKey }) {
  const props = iconProps(18);
  switch (iconKey) {
    case 'flame':
      return (<svg {...props}>
        <path d="M12 3c1.5 3 5 4.6 5 8.5A5 5 0 0 1 7 12c0-1.4.5-2.4 1.2-3.2C9.4 7.4 11 6 12 3z" />
        <path d="M12 21a3.5 3.5 0 0 1-2-6.4c.4 1.4 1 1.9 2 2 .2-1.2 0-2.2-.4-3 1.6 1.2 3.4 2.7 3.4 4.9A3.5 3.5 0 0 1 12 21z" />
      </svg>);
    case 'target':
      return (<svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      </svg>);
    case 'trophy':
      return (<svg {...props}>
        <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
        <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" />
        <path d="M10 12v4h4v-4M9 20h6M12 16v4" />
      </svg>);
    case 'sunrise':
      return (<svg {...props}>
        <path d="M3 19h18" />
        <path d="M6 15a6 6 0 0 1 12 0" />
        <path d="M12 3v4M5.5 6.5 7 8M18.5 6.5 17 8M3 11h2M19 11h2" />
      </svg>);
    case 'brain':
      return (<svg {...props}>
        <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.8v.2a3 3 0 0 0 3 3v1a3 3 0 0 0 4 2.8V4.5A3 3 0 0 0 9 4z" />
        <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5.8v.2a3 3 0 0 1-3 3v1a3 3 0 0 1-4 2.8V4.5A3 3 0 0 1 15 4z" />
      </svg>);
    case 'seed':
      return (<svg {...props}>
        <path d="M12 21v-7" />
        <path d="M12 14a5 5 0 0 0-5-5H5a5 5 0 0 1 5-5" />
        <path d="M12 14a5 5 0 0 1 5-5h2a5 5 0 0 0-5-5" />
      </svg>);
    default:
      return (<svg {...props}><circle cx="12" cy="12" r="9" /></svg>);
  }
}
