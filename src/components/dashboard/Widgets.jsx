import { Link } from 'react-router-dom';
import './Widgets.css';

/* ────────────────────────────────────────────────────────────
   Study Streak — "N days" + weekly M-T-W-T-F-S-S strip
   ──────────────────────────────────────────────────────────── */
export function WidgetStreak({ current = 0, history = [] }) {
  const today = new Date();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayIndex = (today.getDay() + 6) % 7; // Monday=0

  // Which of the last 7 days have study minutes logged?
  const activeDays = new Set(
    history
      .filter((h) => {
        const d = new Date(h.date + 'T00:00:00');
        const diff = Math.floor((today - d) / 86400000);
        return diff >= 0 && diff < 7;
      })
      .map((h) => {
        const d = new Date(h.date + 'T00:00:00');
        return (d.getDay() + 6) % 7;
      })
  );

  return (
    <div className="widget widget-streak">
      <div className="widget-head">
        <div className="widget-icon widget-icon-fire" aria-hidden="true"><FlameIcon /></div>
        <div>
          <div className="widget-title">Study Streak</div>
          <div className="widget-big">
            {current} day{current === 1 ? '' : 's'}
          </div>
          <div className="widget-sub">Keep it going!</div>
        </div>
      </div>

      <div className="widget-streak-strip">
        {days.map((d, i) => {
          const isActive = activeDays.has(i);
          const isFuture = i > dayIndex;
          const isToday = i === dayIndex;
          return (
            <div
              key={i}
              className={
                'streak-day' +
                (isActive ? ' is-active' : '') +
                (isFuture ? ' is-future' : '') +
                (isToday ? ' is-today' : '')
              }
            >
              <span className="streak-day-dot" />
              <span className="streak-day-letter">{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Applications — "N submitted, M pending" + progress bar
   ──────────────────────────────────────────────────────────── */
export function WidgetApplications({ applications = [] }) {
  const submitted = applications.filter((a) => a.status === 'Submitted').length;
  const pending = applications.filter((a) => a.status === 'Pending').length;
  const accepted = applications.filter((a) => a.status === 'Accepted').length;
  const total = applications.length || 1;

  return (
    <div className="widget widget-apps">
      <div className="widget-head">
        <div className="widget-icon widget-icon-indigo" aria-hidden="true"><ClipboardIcon /></div>
        <div>
          <div className="widget-title">Applications</div>
          <div className="widget-sub">
            {submitted} submitted · {pending} pending
          </div>
        </div>
      </div>

      <div className="widget-apps-bar">
        <div className="widget-apps-bar-fill" style={{ width: `${(submitted / total) * 100}%` }} />
      </div>

      <div className="widget-apps-legend">
        <span><i className="dot dot-green" /> Submitted <b>{submitted}</b></span>
        <span><i className="dot dot-amber" /> Pending <b>{pending}</b></span>
        <span><i className="dot dot-gold" /> Accepted <b>{accepted}</b></span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Wellness — "Last check-in [date]" + mood label
   ──────────────────────────────────────────────────────────── */
export function WidgetWellness({ checkins = [] }) {
  const last = checkins[checkins.length - 1];
  const moodLabel = last ? moodToLabel(last.mood) : 'Not logged';

  return (
    <div className="widget widget-wellness">
      <div className="widget-head">
        <div className="widget-icon widget-icon-green" aria-hidden="true"><HeartIcon /></div>
        <div>
          <div className="widget-title">Wellness</div>
          <div className="widget-sub">
            {last ? `Last check-in ${formatShort(last.date)}` : 'No check-ins yet'}
          </div>
        </div>
      </div>

      <div className="widget-wellness-mood">
        <span className="widget-wellness-emoji" aria-hidden="true">
          {last ? moodToEmoji(last.mood) : '·'}
        </span>
        <div>
          <div className="widget-wellness-label">Mood</div>
          <div className="widget-wellness-value">{moodLabel}</div>
        </div>
      </div>

      <Link to="/wellness" className="widget-link">
        Log your check-in <ArrowIcon />
      </Link>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Financial Planning — "R[N] funding gap"
   ──────────────────────────────────────────────────────────── */
export function WidgetFinance({ gap = 0, courseName = '' }) {
  const hasGap = Number.isFinite(gap) && gap > 0;
  return (
    <div className="widget widget-finance">
      <div className="widget-head">
        <div className="widget-icon widget-icon-gold" aria-hidden="true"><CoinIcon /></div>
        <div>
          <div className="widget-title">Financial Planning</div>
          <div className="widget-sub">Estimated funding gap</div>
        </div>
      </div>

      <div className="widget-big widget-big-gold">
        R{hasGap ? gap.toLocaleString('en-ZA') : '0'}
      </div>
      {courseName && <div className="widget-sub">{courseName}</div>}

      <Link to="/cost-planner" className="widget-link">
        View cost planner <ArrowIcon />
      </Link>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */
function moodToLabel(mood) {
  switch (mood) {
    case 'very-low': return 'Very low';
    case 'low':      return 'Low';
    case 'okay':     return 'Okay';
    case 'good':     return 'Good';
    case 'great':    return 'Great';
    default:         return 'Not logged';
  }
}
function moodToEmoji(mood) {
  switch (mood) {
    case 'very-low': return '😞';
    case 'low':      return '🙁';
    case 'okay':     return '🙂';
    case 'good':     return '😊';
    case 'great':    return '😄';
    default:         return '🙂';
  }
}
function formatShort(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
}

/* ─── Icons ─── */
function baseProps() {
  return {
    width: 18, height: 18, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
}
function FlameIcon() {
  return (
    <svg {...baseProps()}>
      <path d="M12 3c1.5 3 5 4.6 5 8.5A5 5 0 0 1 7 12c0-1.4.5-2.4 1.2-3.2C9.4 7.4 11 6 12 3z" />
      <path d="M12 21a3.5 3.5 0 0 1-2-6.4c.4 1.4 1 1.9 2 2 .2-1.2 0-2.2-.4-3 1.6 1.2 3.4 2.7 3.4 4.9A3.5 3.5 0 0 1 12 21z" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg {...baseProps()}>
      <rect x="6" y="4.5" width="12" height="16" rx="2" />
      <path d="M9.5 4.5V3.6c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v.9" />
      <path d="M9.5 11h5M9.5 14.5h5M9.5 18h3" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg {...baseProps()}>
      <path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3c0 5-7 9.4-7 9.4z" />
    </svg>
  );
}
function CoinIcon() {
  return (
    <svg {...baseProps()}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
      <path d="M12 6.6v10.8" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
