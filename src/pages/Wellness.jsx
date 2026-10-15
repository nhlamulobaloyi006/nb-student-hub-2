import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Wellness.css';

const MOODS = [
  { id: 'very-low', label: 'Very low' },
  { id: 'low',      label: 'Low' },
  { id: 'okay',     label: 'Okay' },
  { id: 'good',     label: 'Good' },
  { id: 'great',    label: 'Great' },
];

const MOOD_BY_ID = MOODS.reduce((acc, m) => { acc[m.id] = m; return acc; }, {});

const SLEEP_OPTIONS = [
  '3 hours', '4 hours', '5 hours', '6 hours', '7 hours', '8 hours', '9+ hours',
];

export default function Wellness() {
  const { user, updateUser } = useAuth();
  const checkins = user?.wellness?.checkins || [];

  const [mood, setMood] = useState('okay');
  const [stress, setStress] = useState(4);
  const [sleep, setSleep] = useState('7 hours');
  const [note, setNote] = useState('');

  const todayIso = new Date().toISOString().slice(0, 10);
  const alreadyCheckedInToday = checkins.some((c) => c.date === todayIso);

  const trends = useMemo(() => computeTrends(checkins), [checkins]);

  function handleSave(e) {
    e.preventDefault();
    if (alreadyCheckedInToday) return;
    const entry = {
      id: `chk_${Date.now()}`,
      date: todayIso,
      mood,
      stress: Number(stress),
      sleep,
      note: note.trim(),
    };
    updateUser({
      wellness: {
        ...(user?.wellness || { privacyAcknowledged: true }),
        checkins: [...checkins, entry],
      },
    });
    setNote('');
  }

  function handleManageData() {
    if (!window.confirm('Clear all wellness check-ins? This cannot be undone.')) return;
    updateUser({
      wellness: {
        ...(user?.wellness || { privacyAcknowledged: true }),
        checkins: [],
      },
    });
  }

  return (
    <div className="wl">
      <header className="wl-head">
        <div>
          <h1 className="wl-title">Your wellness</h1>
          <p className="wl-sub">
            Check in with yourself. Small steps can make a big difference.
          </p>
        </div>
        <div className="wl-privacy-pill">
          <LockIcon />
          Your data stays on this device
        </div>
      </header>

      <div className="wl-body">
        <div className="wl-main">
          <section className="wl-card">
            <div className="wl-checkin-head">
              <div className="wl-checkin-head-left">
                <span className="wl-checkin-icon"><CalendarIcon /></span>
                <div>
                  <div className="wl-checkin-title">Weekly check-in</div>
                  <div className="wl-checkin-sub">
                    How are you feeling today? This helps you spot patterns and get useful suggestions.
                  </div>
                </div>
              </div>
              <div className="wl-checkin-date">{formatLongDate(todayIso)}</div>
            </div>

            <form className="wl-form" onSubmit={handleSave}>
              <div className="wl-form-row">
                <label className="wl-form-label">Mood</label>
                <div className="wl-mood">
                  {MOODS.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      className={`wl-mood-btn${mood === m.id ? ' is-active' : ''}`}
                      onClick={() => setMood(m.id)}
                      aria-pressed={mood === m.id}
                    >
                      <span className="wl-mood-icon">
                        <MoodIcon iconKey={m.id} />
                      </span>
                      <span className="wl-mood-label">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="wl-form-cols">
                <div className="wl-form-row">
                  <label className="wl-form-label" htmlFor="wl-stress">
                    <BoltIcon />
                    Stress level
                  </label>
                  <div className="wl-slider-wrap">
                    <input
                      id="wl-stress"
                      type="range"
                      min={0}
                      max={10}
                      value={stress}
                      onChange={(e) => setStress(Number(e.target.value))}
                      className="wl-range"
                      style={{ '--fill': `${(stress / 10) * 100}%` }}
                    />
                    <span className="wl-slider-value">{stress} / 10</span>
                  </div>
                </div>

                <div className="wl-form-row">
                  <label className="wl-form-label" htmlFor="wl-sleep">
                    <MoonIcon />
                    Sleep duration
                  </label>
                  <select
                    id="wl-sleep"
                    className="wl-select"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                  >
                    {SLEEP_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="wl-form-row">
                <label className="wl-form-label" htmlFor="wl-note">
                  Quick note (optional)
                </label>
                <div className="wl-note-wrap">
                  <textarea
                    id="wl-note"
                    className="wl-textarea"
                    placeholder="How are you feeling? Anything on your mind?"
                    maxLength={200}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <span className="wl-note-count">{note.length}/200</span>
                </div>
              </div>

              <div className="wl-form-actions">
                <button
                  type="submit"
                  className="btn btn-primary wl-save"
                  disabled={alreadyCheckedInToday}
                >
                  {alreadyCheckedInToday ? 'Already checked in today' : 'Save check-in'}
                </button>
              </div>
            </form>
          </section>

          <section className="wl-section">
            <div className="wl-section-title">
              <span className="wl-section-dot" aria-hidden="true" />
              Quick tools
            </div>
            <div className="wl-tools">
              <ToolCard tone="indigo" title="Breathing exercise" sub="5 minutes" icon={WindIcon} />
              <ToolCard tone="green"  title="Study break"        sub="Recharge your mind" icon={CoffeeIcon} />
              <ToolCard tone="purple" title="Mood journal"       sub="Track your feelings" icon={HeartIcon} />
              <ToolCard tone="blue"   title="Helpful resources"  sub="Support & guidance" icon={BookIcon} />
            </div>
          </section>

          <section className="wl-section">
            <div className="wl-section-head">
              <div className="wl-section-title">
                <span className="wl-section-dot" aria-hidden="true" />
                Your check-in history
              </div>
              {checkins.length > 5 && (
                <button type="button" className="wl-view-all">View all</button>
              )}
            </div>

            {checkins.length === 0 ? (
              <div className="wl-empty">
                No check-ins yet. Save your first one above to start tracking patterns.
              </div>
            ) : (
              <div className="wl-table">
                <div className="wl-table-head">
                  <span>Date</span>
                  <span>Mood</span>
                  <span>Stress</span>
                  <span>Sleep</span>
                  <span>Note</span>
                  <span />
                </div>
                {[...checkins].reverse().slice(0, 5).map((c) => {
                  const m = MOOD_BY_ID[c.mood] || MOOD_BY_ID.okay;
                  return (
                    <div className="wl-table-row" key={c.id}>
                      <span className="wl-cell-date">{formatLongDate(c.date)}</span>
                      <span className="wl-cell-mood">
                        <span className="wl-table-mood"><MoodIcon iconKey={m.id} size={18} /></span>
                      </span>
                      <span className="wl-cell-stress">{c.stress}/10</span>
                      <span className="wl-cell-sleep">{c.sleep}</span>
                      <span className="wl-cell-note">{c.note || '—'}</span>
                      <span className="wl-cell-arrow"><MiniArrow /></span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="wl-rail">
          <section className="wl-rail-card">
            <div className="wl-rail-title">
              <BarChartIcon />
              Your trends
            </div>
            <div className="wl-rail-sub">Based on your past check-ins</div>

            <div className="wl-trend">
              <div className="wl-trend-left">
                <span className="wl-trend-icon">
                  <MoodIcon iconKey={trends.mood.iconKey} size={18} />
                </span>
                <div>
                  <div className="wl-trend-name">Mood</div>
                  <div className="wl-trend-status">{trends.mood.status}</div>
                </div>
              </div>
              <MiniArrow />
            </div>
            <div className="wl-trend-note">{trends.mood.note}</div>

            <div className="wl-trend">
              <div className="wl-trend-left">
                <span className="wl-trend-icon wl-trend-icon-amber"><BoltIcon /></span>
                <div>
                  <div className="wl-trend-name">Stress</div>
                  <div className="wl-trend-status">{trends.stress.status}</div>
                </div>
              </div>
              <MiniArrow />
            </div>
            <div className="wl-trend-note">{trends.stress.note}</div>

            <div className="wl-trend">
              <div className="wl-trend-left">
                <span className="wl-trend-icon wl-trend-icon-indigo"><MoonIcon /></span>
                <div>
                  <div className="wl-trend-name">Sleep</div>
                  <div className="wl-trend-status">{trends.sleep.status}</div>
                </div>
              </div>
              <MiniArrow />
            </div>
            <div className="wl-trend-note">{trends.sleep.note}</div>

            <div className="wl-chart-head">Mood trend (last 7 check-ins)</div>
            <MoodChart checkins={checkins.slice(-7)} />
          </section>

          <section className="wl-rail-card">
            <div className="wl-rail-title">Suggested actions</div>
            <div className="wl-rail-sub">Simple tools to support your wellbeing.</div>
            <div className="wl-actions">
              <ActionRow icon={PersonIcon} title="Talk to a counsellor" sub="Get professional support when you need it. (Private & confidential)" />
              <ActionRow icon={WindIcon}   title="Try a five-minute reset" sub="A short breathing exercise to help you feel calmer." />
              <ActionRow icon={UsersIcon}  title="Study with a friend" sub="Share goals, stay motivated, feel less alone." />
            </div>
          </section>

          <section className="wl-rail-card wl-rail-card-gold">
            <div className="wl-rail-title">
              <ShieldIcon />
              Your privacy matters
            </div>
            <p className="wl-rail-text">
              Your wellness check-ins stay on this device in this prototype. You can delete your records at any time.
            </p>
            <button type="button" className="btn btn-outline wl-manage" onClick={handleManageData}>
              Manage my data
            </button>
          </section>

          <div className="wl-motivate">
            <div className="wl-motivate-text">You're doing better than you think.</div>
            <div className="wl-motivate-sun" aria-hidden="true" />
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════════════ */

function ToolCard({ tone, title, sub, icon: Icon }) {
  return (
    <button type="button" className={`wl-tool wl-tool-${tone}`}>
      <span className={`wl-tool-icon wl-tool-icon-${tone}`}><Icon /></span>
      <span className="wl-tool-body">
        <span className="wl-tool-title">{title}</span>
        <span className="wl-tool-sub">{sub}</span>
      </span>
      <span className="wl-tool-arrow"><MiniArrow /></span>
    </button>
  );
}

function ActionRow({ icon: Icon, title, sub }) {
  return (
    <button type="button" className="wl-action">
      <span className="wl-action-icon"><Icon /></span>
      <span className="wl-action-body">
        <span className="wl-action-title">{title}</span>
        <span className="wl-action-sub">{sub}</span>
      </span>
      <span className="wl-action-arrow"><MiniArrow /></span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   Mood chart
   ══════════════════════════════════════════════════════════ */

function MoodChart({ checkins }) {
  const W = 300, H = 90, PAD_X = 16, PAD_Y = 14;

  const scoreOf = (id) =>
    id === 'very-low' ? 1 : id === 'low' ? 2 : id === 'okay' ? 3 : id === 'good' ? 4 : 5;

  const points = checkins.map((c, i) => ({
    x: PAD_X + (i * (W - 2 * PAD_X)) / Math.max(1, checkins.length - 1),
    y: H - PAD_Y - ((scoreOf(c.mood) - 1) / 4) * (H - 2 * PAD_Y),
    day: new Date(c.date + 'T00:00:00').toLocaleDateString('en-ZA', { weekday: 'short' }).slice(0, 3),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  if (points.length === 0) {
    return (
      <div className="wl-chart-empty">
        Complete a few check-ins to see your mood trend.
      </div>
    );
  }

  return (
    <div className="wl-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="wl-chart-svg">
        <line x1={PAD_X} x2={W - PAD_X} y1={H - PAD_Y} y2={H - PAD_Y}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <path d={pathD} fill="none" stroke="#F5C542" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y}
                  r={i === points.length - 1 ? 4.5 : 3}
                  fill={i === points.length - 1 ? '#F5C542' : '#0A0E1A'}
                  stroke="#F5C542" strokeWidth="2" />
        ))}
      </svg>
      <div className="wl-chart-labels">
        {points.map((p, i) => (<span key={i}>{p.day}</span>))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Trend computation — returns icon keys, not emojis
   ══════════════════════════════════════════════════════════ */

function computeTrends(checkins) {
  if (checkins.length === 0) {
    return {
      mood:   { iconKey: 'okay', status: 'Not enough data', note: 'Complete your first check-in to see trends.' },
      stress: { status: 'Not enough data', note: '—' },
      sleep:  { status: 'Not enough data', note: '—' },
    };
  }

  const recent = checkins.slice(-7);

  const moodScore = (id) =>
    id === 'very-low' ? 1 : id === 'low' ? 2 : id === 'okay' ? 3 : id === 'good' ? 4 : 5;

  const moodVals = recent.map((c) => moodScore(c.mood));
  const moodAvg = moodVals.reduce((a, b) => a + b, 0) / moodVals.length;
  const moodDelta = moodVals.length > 1 ? moodVals[moodVals.length - 1] - moodVals[0] : 0;

  const moodStatus =
    moodAvg >= 4   ? 'Mostly good'
    : moodAvg >= 3.4 ? 'Mostly stable'
    : moodAvg >= 2.5 ? 'Up and down'
    : 'Running low';

  const moodNote =
    Math.abs(moodDelta) < 0.6
      ? 'No major changes in the last ' + recent.length + ' check-ins.'
      : moodDelta > 0
        ? 'Your mood has been trending up recently.'
        : 'Your mood has dipped lately. Be kind to yourself.';

  const moodKey =
    moodAvg >= 4 ? 'good' : moodAvg >= 3 ? 'okay' : moodAvg >= 2 ? 'low' : 'very-low';

  const stressVals = recent.map((c) => Number(c.stress) || 0);
  const stressAvg = stressVals.reduce((a, b) => a + b, 0) / stressVals.length;
  const stressDelta = stressVals.length > 1
    ? stressVals[stressVals.length - 1] - stressVals[0]
    : 0;

  const stressStatus =
    stressAvg >= 7 ? 'Elevated'
    : stressAvg >= 5 ? 'Moderate'
    : stressAvg >= 3 ? 'Slight increase'
    : 'Low';

  const stressNote =
    stressDelta > 0.8 ? 'Your stress has increased recently.'
    : stressDelta < -0.8 ? 'Your stress has eased recently.'
    : 'Stress levels have been steady.';

  const sleepHours = (s) => {
    const m = String(s).match(/(\d+)/);
    return m ? Number(m[1]) : 7;
  };
  const sleepVals = recent.map((c) => sleepHours(c.sleep));
  const sleepAvg = sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length;

  const sleepStatus =
    sleepAvg >= 7.5 ? 'Good'
    : sleepAvg >= 6.5 ? 'Consistent'
    : sleepAvg >= 5.5 ? 'Slightly short'
    : 'Running low';

  const sleepNote =
    sleepAvg >= 7 ? `You're getting ${Math.round(sleepAvg)}+ hours most nights.`
    : `You're averaging ${sleepAvg.toFixed(1)} hours. Aim for 7-8.`;

  return {
    mood:   { iconKey: moodKey, status: moodStatus, note: moodNote },
    stress: { status: stressStatus, note: stressNote },
    sleep:  { status: sleepStatus, note: sleepNote },
  };
}

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

function formatLongDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

/* ══════════════════════════════════════════════════════════
   Icons — SVG only
   ══════════════════════════════════════════════════════════ */

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
function LockIcon() { return (<svg {...iconProps(14)}>
  <rect x="5" y="11" width="14" height="9" rx="2" />
  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
</svg>); }
function CalendarIcon() { return (<svg {...iconProps(18)}>
  <rect x="3.5" y="5" width="17" height="15" rx="2" />
  <path d="M8 3v4M16 3v4M3.5 10h17" />
</svg>); }
function BoltIcon() { return (<svg {...iconProps(14)}>
  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
</svg>); }
function MoonIcon() { return (<svg {...iconProps(14)}>
  <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
</svg>); }
function WindIcon() { return (<svg {...iconProps(18)}>
  <path d="M3 8h10a3 3 0 1 0-3-3" />
  <path d="M3 12h14a3 3 0 1 1-3 3" />
  <path d="M3 16h8" />
</svg>); }
function CoffeeIcon() { return (<svg {...iconProps(18)}>
  <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
  <path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2" />
  <path d="M8 3v2M12 3v2" />
</svg>); }
function HeartIcon() { return (<svg {...iconProps(18)}>
  <path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3c0 5-7 9.4-7 9.4z" />
</svg>); }
function BookIcon() { return (<svg {...iconProps(18)}>
  <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
  <path d="M13 4h5.5c.8 0 1.5.7 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H13z" />
</svg>); }
function BarChartIcon() { return (<svg {...iconProps(16)}>
  <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
</svg>); }
function PersonIcon() { return (<svg {...iconProps(18)}>
  <circle cx="12" cy="8" r="3.6" />
  <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4S18.3 16.4 19.5 20" />
</svg>); }
function UsersIcon() { return (<svg {...iconProps(18)}>
  <circle cx="9" cy="8" r="3.2" />
  <path d="M3 19c.6-3 3-4.4 6-4.4s5.4 1.4 6 4.4" />
  <circle cx="17" cy="9.5" r="2.4" />
  <path d="M14.5 19c.3-2 1.7-3.1 3.5-3.1s3.2 1.1 3.5 3.1" />
</svg>); }
function ShieldIcon() { return (<svg {...iconProps(14)}>
  <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
</svg>); }

/* ══════════════════════════════════════════════════════════
   Mood icon — SVG face by mood key. NO emojis.
   ══════════════════════════════════════════════════════════ */

function MoodIcon({ iconKey, size = 22 }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  // Every face is a circle + eyes + a mouth that changes shape per mood
  const eyes = (
    <>
      <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none" />
    </>
  );

  switch (iconKey) {
    case 'very-low':
      return (<svg {...props}>
        <circle cx="12" cy="12" r="9.4" />
        {eyes}
        <path d="M8 17c1-1.2 2.4-1.8 4-1.8s3 .6 4 1.8" />
      </svg>);
    case 'low':
      return (<svg {...props}>
        <circle cx="12" cy="12" r="9.4" />
        {eyes}
        <path d="M8.5 16.5c1-.8 2.2-1.2 3.5-1.2s2.5.4 3.5 1.2" />
      </svg>);
    case 'okay':
      return (<svg {...props}>
        <circle cx="12" cy="12" r="9.4" />
        {eyes}
        <path d="M9 16h6" />
      </svg>);
    case 'good':
      return (<svg {...props}>
        <circle cx="12" cy="12" r="9.4" />
        {eyes}
        <path d="M8 15.5c1 1.2 2.4 1.8 4 1.8s3-.6 4-1.8" />
      </svg>);
    case 'great':
      return (<svg {...props}>
        <circle cx="12" cy="12" r="9.4" />
        <path d="M8 9.5c.3-.4.7-.7 1-.7M16 9.5c-.3-.4-.7-.7-1-.7" />
        <circle cx="9" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
        <path d="M7.8 15c1 1.4 2.4 2.2 4.2 2.2s3.2-.8 4.2-2.2" />
      </svg>);
    default:
      return (<svg {...props}>
        <circle cx="12" cy="12" r="9.4" />
        {eyes}
        <path d="M9 16h6" />
      </svg>);
  }
}
