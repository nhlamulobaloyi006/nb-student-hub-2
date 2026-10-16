import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  RULES,
  hasCheckedInToday,
  computeCurrentStreak,
  countThisMonth,
  countThisWeek,
  applyBreakRules,
  checkInToday,
} from '../utils/streaks';
import './Streaks.css';

/* ============================================================
   Constants
   ============================================================ */

const BADGE_DEFS = [
  { id: 'comeback',   name: 'Comeback Kid', sub: 'Restored a broken streak', iconKey: 'seed',   tone: 'green' },
  { id: 'consistent', name: 'Consistent',   sub: '7-day streak reached',     iconKey: 'flame',  tone: 'gold' },
  { id: 'goal',       name: 'Goal Getter',  sub: '20-day streak reached',    iconKey: 'target', tone: 'green' },
  { id: 'hero',       name: 'Study Hero',   sub: '50-day streak reached',    iconKey: 'trophy', tone: 'indigo' },
];

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/* ============================================================
   Main
   ============================================================ */

export default function Streaks() {
  const { user, updateUser } = useAuth();

  /* Break detection on mount */
  useEffect(() => {
    if (!user?.streaks) return;
    const result = applyBreakRules(user.streaks);
    if (result.changed) {
      updateUser({ streaks: result.streaks });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const streaks = user?.streaks || {
    current: 0, longest: 0, checkins: [],
    brokenStreak: null, graceDayLastUsed: null,
  };

  const doneToday = hasCheckedInToday(streaks);
  const { current, atRiskToday } = useMemo(
    () => computeCurrentStreak(streaks.checkins || []),
    [streaks.checkins]
  );
  const thisMonth = useMemo(
    () => countThisMonth(streaks.checkins || []),
    [streaks.checkins]
  );
  const thisWeek = useMemo(
    () => countThisWeek(streaks.checkins || []),
    [streaks.checkins]
  );

  function handleCheckIn() {
    if (doneToday) return;
    const result = checkInToday(streaks);
    if (result.changed) {
      updateUser({ streaks: result.streaks });
    }
  }

  const streakState = getStreakState(streaks, doneToday, atRiskToday);

  return (
    <div className="st">
      <header className="st-head">
        <div>
          <h1 className="st-title">Your momentum</h1>
          <p className="st-sub">Check in every day. Small steps add up.</p>
        </div>
      </header>

      {/* 1. Check-in card */}
      <CheckInCard
        doneToday={doneToday}
        current={current}
        atRiskToday={atRiskToday}
        brokenStreak={streaks.brokenStreak}
        onCheckIn={handleCheckIn}
      />

      {/* 2. Streak hero */}
      <section className={`st-hero st-hero-${streakState.tone}`}>
        <div className="st-hero-glow" aria-hidden="true" />
        <div className="st-hero-content">
          <div className={`st-hero-flame st-hero-flame-${streakState.tone}`}>
            {streakState.tone === 'ash' ? <AshIcon /> : <FlameIcon size={42} />}
          </div>
          <div className="st-hero-text">
            <div className="st-hero-title">{streakState.headline}</div>
            <div className="st-hero-sub">{streakState.sub}</div>
          </div>
          <div className="st-hero-stats">
            <div className="st-hero-stat">
              <div className="st-hero-stat-value">{streaks.longest || 0}</div>
              <div className="st-hero-stat-label">Longest</div>
            </div>
            <div className="st-hero-stat">
              <div className="st-hero-stat-value">{thisMonth}</div>
              <div className="st-hero-stat-label">This month</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Week strip */}
      <WeekStrip checkins={streaks.checkins || []} />

      {/* 4. Progress cards */}
      <div className="st-two">
        <section className="st-card st-card-tight">
          <div className="st-card-icon st-card-icon-gold"><FlameIcon size={18} /></div>
          <div className="st-card-row-body">
            <div className="st-card-title">{thisWeek} of 7 days this week</div>
            <div className="st-card-sub">
              {thisWeek >= 5
                ? 'Strong week. Keep it up.'
                : thisWeek >= 2
                  ? 'Good pace. Aim for 5+ this week.'
                  : 'Try to check in at least 5 days this week.'}
            </div>
          </div>
        </section>

        <section className="st-card st-card-tight">
          <div className="st-card-icon st-card-icon-indigo"><TargetIcon /></div>
          <div className="st-card-row-body">
            <div className="st-card-title">
              {thisMonth} / {RULES.THIS_MONTH_TARGET} check-ins this month
            </div>
            <div className="st-card-sub">
              {thisMonth >= RULES.THIS_MONTH_TARGET
                ? "You've hit the monthly goal."
                : `${RULES.THIS_MONTH_TARGET - thisMonth} more to hit the monthly goal.`}
            </div>
          </div>
        </section>
      </div>

      {/* 5. Recent check-ins */}
      <RecentCheckins checkins={streaks.checkins || []} />

      {/* 6. Badges */}
      <section className="st-card">
        <div className="st-card-head">
          <div className="st-card-title">Badges</div>
        </div>
        <div className="st-badges">
          {BADGE_DEFS.map((b) => (
            <div key={b.id} className={`st-badge st-badge-${b.tone}`}>
              <span className="st-badge-icon"><BadgeIcon iconKey={b.iconKey} /></span>
              <span className="st-badge-body">
                <span className="st-badge-name">{b.name}</span>
                <span className="st-badge-sub">{b.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   Check-in card
   ============================================================ */

function CheckInCard({ doneToday, current, atRiskToday, brokenStreak, onCheckIn }) {
  const broken = !!brokenStreak;

  return (
    <section className={`st-session${doneToday ? ' is-done' : ''}${broken ? ' st-session-restore' : ''}`}>
      <div className="st-session-head">
        <div className="st-session-label">
          {broken ? 'RESTORE YOUR STREAK' : "TODAY'S CHECK-IN"}
        </div>
        {doneToday && (
          <span className="st-done-badge"><CheckIcon /> Done today</span>
        )}
      </div>

      {broken && !doneToday && (
        <div className="st-session-restore-body">
          <div className="st-session-restore-title">
            Check in to bring it back
          </div>
          <div className="st-session-restore-sub">
            You lost your {brokenStreak.count > 0 ? brokenStreak.count + '-day' : ''} streak.
            One check-in today and it's back.
          </div>
        </div>
      )}

      {!broken && !doneToday && atRiskToday && (
        <div className="st-session-restore-body">
          <div className="st-session-restore-title">
            Don't lose your {current}-day streak
          </div>
          <div className="st-session-restore-sub">
            You haven't checked in yet today.
          </div>
        </div>
      )}

      {!broken && !doneToday && !atRiskToday && current === 0 && (
        <div className="st-session-restore-body">
          <div className="st-session-restore-title">
            Start a new streak
          </div>
          <div className="st-session-restore-sub">
            Check in today to get the flame going.
          </div>
        </div>
      )}

      {doneToday && (
        <div className="st-session-restore-body">
          <div className="st-session-restore-title">
            You're checked in for today
          </div>
          <div className="st-session-restore-sub">
            Come back tomorrow to keep it going.
          </div>
        </div>
      )}

      <button
        type="button"
        className={
          'btn btn-block st-session-btn ' +
          (doneToday ? 'btn-outline st-session-btn-done' : 'btn-primary')
        }
        onClick={onCheckIn}
        disabled={doneToday}
      >
        {doneToday ? (
          <>
            <CheckIcon /> Checked in today
          </>
        ) : (
          <>
            <FlameIcon size={16} /> Check in today
          </>
        )}
      </button>
    </section>
  );
}

/* ============================================================
   Week strip
   ============================================================ */

function WeekStrip({ checkins }) {
  const set = useMemo(() => new Set(checkins || []), [checkins]);
  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7; // Mon = 0

  const days = WEEKDAY_LETTERS.map((letter, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - dayIndex + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      iso, letter,
      isToday: i === dayIndex,
      isFuture: i > dayIndex,
      active: set.has(iso) && i <= dayIndex,
    };
  });

  return (
    <section className="st-card">
      <div className="st-card-head">
        <div className="st-card-title">This week</div>
        <div className="st-card-sub">
          {days.filter((d) => d.active).length} of 7 days checked in
        </div>
      </div>
      <div className="st-week">
        {days.map((d) => (
          <div
            key={d.iso}
            className={
              'st-week-day' +
              (d.active ? ' is-active' : '') +
              (d.isToday ? ' is-today' : '') +
              (d.isFuture ? ' is-future' : '')
            }
          >
            <span className="st-week-dot">
              {d.active && <CheckIcon />}
            </span>
            <span className="st-week-letter">{d.letter}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Recent check-ins
   ============================================================ */

function RecentCheckins({ checkins }) {
  const sorted = useMemo(
    () => [...(checkins || [])].sort((a, b) => b.localeCompare(a)).slice(0, 10),
    [checkins]
  );

  return (
    <section className="st-card">
      <div className="st-card-head">
        <div className="st-card-title">Recent check-ins</div>
      </div>
      {sorted.length === 0 ? (
        <div className="st-empty-compact">No check-ins yet. Tap the button above.</div>
      ) : (
        <div className="st-history">
          {sorted.map((iso) => (
            <div key={iso} className="st-history-row">
              <span className="st-history-date-inline">{formatDayLabel(iso)}</span>
              <span className="st-history-status">
                <CheckIcon /> Checked in
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function getStreakState(streaks, doneToday, atRiskToday) {
  const current = streaks.current || 0;
  const broken = !!streaks.brokenStreak;

  if (broken) {
    return {
      tone: 'ash',
      headline: 'Your streak is resting',
      sub: 'Check in today to wake it back up.',
    };
  }
  if (current === 0 && !doneToday) {
    return {
      tone: 'idle',
      headline: 'Start a new streak',
      sub: 'Check in today to get the flame going.',
    };
  }
  if (!doneToday && atRiskToday) {
    return {
      tone: 'risk',
      headline: `${current} day${current === 1 ? '' : 's'} — at risk today`,
      sub: 'Check in to keep it alive.',
    };
  }
  return {
    tone: 'gold',
    headline: `${current} day${current === 1 ? '' : 's'} in a row`,
    sub: current >= 3 ? 'Keep it going!' : 'Every day counts.',
  };
}

function formatDayLabel(iso) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(iso + 'T00:00:00');
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-ZA', { weekday: 'short', day: '2-digit', month: 'short' });
}

/* ============================================================
   Icons
   ============================================================ */

function iconProps(size = 16) {
  return {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': true,
  };
}
function FlameIcon({ size = 42 }) { return (<svg {...iconProps(size)}>
  <path d="M12 3c1.5 3 5 4.6 5 8.5A5 5 0 0 1 7 12c0-1.4.5-2.4 1.2-3.2C9.4 7.4 11 6 12 3z" />
  <path d="M12 21a3.5 3.5 0 0 1-2-6.4c.4 1.4 1 1.9 2 2 .2-1.2 0-2.2-.4-3 1.6 1.2 3.4 2.7 3.4 4.9A3.5 3.5 0 0 1 12 21z" />
</svg>); }
function AshIcon() { return (<svg {...iconProps(42)}>
  <path d="M6 16h12" />
  <path d="M7 19h10" />
  <path d="M9 13c.5-1.5 1.5-2.5 3-2.5s2.5 1 3 2.5" />
  <circle cx="10" cy="9" r="1" fill="currentColor" stroke="none" />
  <circle cx="14" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
  <circle cx="12" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
</svg>); }
function CheckIcon() { return (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="3"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 12 5 5L20 6" />
  </svg>
); }
function TargetIcon() { return (<svg {...iconProps(18)}>
  <circle cx="12" cy="12" r="9" />
  <circle cx="12" cy="12" r="5" />
  <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
</svg>); }
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
    case 'seed':
    default:
      return (<svg {...props}>
        <path d="M12 21v-7" />
        <path d="M12 14a5 5 0 0 0-5-5H5a5 5 0 0 1 5-5" />
        <path d="M12 14a5 5 0 0 1 5-5h2a5 5 0 0 0-5-5" />
      </svg>);
  }
}