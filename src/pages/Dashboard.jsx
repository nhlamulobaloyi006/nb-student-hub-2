import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProgressRing from '../components/ProgressRing';
import {
  WidgetStreak,
  WidgetApplications,
  WidgetWellness,
  WidgetFinance,
} from '../components/dashboard/Widgets';

import { pickQuote } from '../data/dashboardQuotes';
import { STREAM_LABELS } from '../data/subjects';
import { COURSES } from '../data/courses';
import { FUNDING, daysUntilDeadline } from '../data/funding';
import { getNextAction, getRoadmapMilestones } from '../utils/getNextAction';
import { checkEligibility } from '../utils/eligibilityChecker';
import FirstRunSeed from '../components/FirstRunSeed';
import ResumeSetupBanner from '../components/ResumeSetupBanner';

import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = useMemo(() => (user?.name || 'there').split(' ')[0], [user]);

  const quote = useMemo(() => pickQuote(user?.email || 'guest'), [user?.email]);

  const streamLabel = user?.stream ? STREAM_LABELS[user.stream] : 'No stream yet';
  const province = user?.preferences?.province || 'Province not set';
  const subjectsCount = countSubjects(user);
  const subtitle = `${subjectsCount} subject${subjectsCount === 1 ? '' : 's'} · ${streamLabel} stream · ${province}`;

  const nextAction = useMemo(() => getNextAction(user), [user]);
  const roadmap = useMemo(() => getRoadmapMilestones(user), [user]);

  const daysToFinals = useMemo(() => daysUntilMatricFinals(), []);
  const finalsLabel = daysToFinals > 0
    ? `MATRIC FINALS IN ${daysToFinals} DAY${daysToFinals === 1 ? '' : 'S'}`
    : 'MATRIC FINALS UNDERWAY';

  const fundingGap = useMemo(() => estimateFundingGap(user), [user]);

  return (
    <div className="dash">
      {/* ─── Hero row ───────────────────────────────────── */}
      <header className="dash-hero">
        <div className="dash-hero-left">
          <h1 className="dash-greeting">
            Good {timeOfDay()}, {firstName}
          </h1>
          <div className="dash-subline">{subtitle}</div>
          <div className="dash-quote">"{quote.text}"{quote.author && <span className="dash-quote-author"> — {quote.author}</span>}</div>
        </div>
        <div className="dash-hero-right">
          <div className="dash-countdown">
            <span className="dash-countdown-dot" aria-hidden="true" />
            {finalsLabel}
          </div>
        </div>
      </header>

      {/* ─── Resume setup (if onboarding incomplete) ── */}
      <ResumeSetupBanner />

      {/* ─── First-run seed (only for empty profiles) ── */}
      <FirstRunSeed />

      {/* ─── Two-column body ────────────────────────────── */}
      <div className="dash-body">
        {/* MAIN COLUMN */}
        <div className="dash-main">
          {/* Priority card */}
          <PriorityCard action={nextAction} />

          {/* Quick actions */}
          <QuickActions />

          {/* Widget row */}
          <div className="dash-widgets">
            <WidgetStreak
              current={user?.streaks?.current || 0}
              checkins={user?.streaks?.checkins || []}
            />
            <WidgetApplications applications={user?.applications || []} />
            <WidgetWellness checkins={user?.wellness?.checkins || []} />
            <WidgetFinance gap={fundingGap} courseName={topCourseName(user)} />
          </div>

          {/* Roadmap strip */}
          <section className="dash-section">
            <div className="section-head">
              <div>
                <div className="section-title">Your Student Roadmap</div>
                <div className="section-sub">
                  {roadmap.completed} of {roadmap.total} milestones completed
                </div>
              </div>
              <Link to="/roadmap" className="section-link">
                View full roadmap <MiniArrow />
              </Link>
            </div>

            <div className="dash-roadmap-strip">
              {roadmap.milestones.map((m) => (
                <RoadmapCard key={m.id} milestone={m} />
              ))}
            </div>
          </section>

          {/* Discover row */}
          <section className="dash-section">
            <div className="section-head">
              <div className="section-title">Discover more</div>
              <Link to="/courses" className="section-link">
                View all <MiniArrow />
              </Link>
            </div>

            <div className="dash-discover">
              <DiscoverCard
                title="Careers for you"
                sub="Explore career paths that match your interests and subjects."
                image="careers"
                to="/careers"
              />
              <DiscoverCard
                title="Courses to explore"
                sub="Discover courses, entry requirements and career outcomes."
                image="courses"
                to="/courses"
              />
              <DiscoverCard
                title="Institutions to compare"
                sub="Find the right university, college or TVET for you."
                image="institutions"
                to="/institutions"
              />
              <DiscoverCard
                title="Funding opportunities"
                sub="Bursaries, NSFAS and other ways to fund your studies."
                image="funding"
                to="/funding"
              />
            </div>
          </section>
        </div>

        {/* RIGHT RAIL */}
        <aside className="dash-rail">
          <RailProgress roadmap={roadmap} user={user} />
          <RailPush
            onCourses={() => navigate('/courses')}
            onFunding={() => navigate('/funding')}
          />
        </aside>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════════════ */

function PriorityCard({ action }) {
  return (
    <Link to={action.to} className={`dash-priority dash-priority-${action.tone}`}>
      <div className="dash-priority-label">NEXT STEP</div>
      <div className="dash-priority-body">
        <div className="dash-priority-text">
          <div className="dash-priority-title">{action.title}</div>
          <div className="dash-priority-sub">{action.sub}</div>
        </div>
        <div className="dash-priority-cta">
          <span>{action.ctaLabel}</span>
          <span className="dash-priority-cta-icon"><MiniArrow /></span>
        </div>
      </div>
      <div className="dash-priority-orb" aria-hidden="true">
        <CompassIcon />
      </div>
    </Link>
  );
}

function QuickActions() {
  const items = [
    { to: '/courses',     label: 'Course Finder',   icon: SearchIcon,   tone: 'indigo' },
    { to: '/funding',     label: 'Funding',         icon: CoinIcon,     tone: 'green' },
    { to: '/cost-planner',label: 'Cost Planner',    icon: CalcIcon,     tone: 'gold' },
    { to: '/companion',   label: 'AI Companion',    icon: SparkleIcon,  tone: 'indigo' },
    { to: '/wellness',    label: 'Wellness',        icon: HeartIcon,    tone: 'green' },
  ];
  return (
    <div className="dash-quick">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Link key={it.to} to={it.to} className="dash-quick-pill">
            <span className={`dash-quick-icon dash-quick-icon-${it.tone}`}><Icon /></span>
            <span className="dash-quick-label">{it.label}</span>
            <span className="dash-quick-arrow"><MiniArrow /></span>
          </Link>
        );
      })}
    </div>
  );
}

function RoadmapCard({ milestone }) {
  const { label, sub, status } = milestone;
  const tone = status === 'done' ? 'green'
             : status === 'in-progress' ? 'gold'
             : status === 'next' ? 'indigo'
             : 'gray';
  const badge = status === 'done' ? 'Completed'
              : status === 'in-progress' ? 'In progress'
              : status === 'next' ? 'Next'
              : 'Not started';
  return (
    <div className={`roadmap-card roadmap-card-${tone}`}>
      <div className={`roadmap-card-check roadmap-card-check-${tone}`} aria-hidden="true">
        {status === 'done' ? <CheckIcon /> : <DotIcon />}
      </div>
      <div className="roadmap-card-label">{label}</div>
      <div className="roadmap-card-sub">{sub}</div>
      <div className={`roadmap-card-badge roadmap-card-badge-${tone}`}>{badge}</div>
    </div>
  );
}

function DiscoverCard({ title, sub, image, to }) {
  return (
    <Link to={to} className={`discover-card discover-${image}`}>
      <div className="discover-image" aria-hidden="true" />
      <div className="discover-body">
        <div className="discover-title">{title}</div>
        <div className="discover-sub">{sub}</div>
        <div className="discover-arrow"><MiniArrow /></div>
      </div>
    </Link>
  );
}

function RailProgress({ roadmap, user }) {
  const submitted = (user?.applications || []).filter((a) => a.status === 'Submitted').length;
  const streak = user?.streaks?.current || 0;
  const lastCheckin = (user?.wellness?.checkins || [])[(user?.wellness?.checkins || []).length - 1];
  const gap = estimateFundingGap(user);

  return (
    <div className="rail-card rail-progress">
      <div className="rail-card-head">
        <div className="rail-card-title">Your progress</div>
      </div>

      <div className="rail-progress-ring-wrap">
        <ProgressRing value={roadmap.percent} size={120} stroke={10} />
        <div className="rail-progress-ring-caption">
          <div className="rail-progress-ring-title">Roadmap progress</div>
          <div className="rail-progress-ring-sub">
            {roadmap.completed} of {roadmap.total} milestones
          </div>
        </div>
      </div>

      <div className="rail-shortcuts">
        <RailShortcut
          icon={ClipboardIcon}
          tone="indigo"
          label="Applications"
          value={submitted === 0 ? 'None yet' : `${submitted} submitted`}
          to="/applications"
        />
        <RailShortcut
          icon={FlameIcon}
          tone="amber"
          label="Study streak"
          value={`${streak} day${streak === 1 ? '' : 's'}`}
          to="/streaks"
        />
        <RailShortcut
          icon={HeartIcon}
          tone="green"
          label="Wellness"
          value={lastCheckin ? `Last check-in ${formatDayMonth(lastCheckin.date)}` : 'Not logged'}
          to="/wellness"
        />
        <RailShortcut
          icon={CoinIcon}
          tone="gold"
          label="Financial"
          value={gap > 0 ? `R${gap.toLocaleString('en-ZA')} gap` : 'No gap yet'}
          to="/cost-planner"
        />
      </div>
    </div>
  );
}

function RailShortcut({ icon: Icon, tone, label, value, to }) {
  return (
    <Link to={to} className="rail-shortcut">
      <span className={`rail-shortcut-icon rail-shortcut-icon-${tone}`}><Icon /></span>
      <span className="rail-shortcut-text">
        <span className="rail-shortcut-label">{label}</span>
        <span className="rail-shortcut-value">{value}</span>
      </span>
      <span className="rail-shortcut-arrow"><MiniArrow /></span>
    </Link>
  );
}

function RailPush({ onCourses, onFunding }) {
  const urgents = useMemo(() => {
    return FUNDING
      .map((f) => ({ f, d: daysUntilDeadline(f.deadline) }))
      .filter(({ d }) => d >= 0 && d <= 45)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
  }, []);

  return (
    <div className="rail-card rail-push">
      <div className="rail-card-head">
        <div className="rail-card-title">Closing soon</div>
      </div>
      {urgents.length === 0 && (
        <div className="rail-push-empty">No urgent deadlines this month.</div>
      )}
      {urgents.map(({ f, d }) => (
        <Link key={f.id} to={`/funding#${f.id}`} className="rail-push-item">
          <div className="rail-push-amount">{f.amount}</div>
          <div className="rail-push-name">{f.name}</div>
          <div className="rail-push-days">
            {d} day{d === 1 ? '' : 's'} left
          </div>
        </Link>
      ))}

      <div className="rail-push-actions">
        <button type="button" className="btn btn-outline btn-block btn-sm" onClick={onCourses}>
          Browse courses
        </button>
        <button type="button" className="btn btn-primary btn-block btn-sm" onClick={onFunding}>
          Find funding
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function countSubjects(user) {
  if (!user?.subjects) return 0;
  const s = user.subjects;
  let n = 0;
  if (s.homeLanguage) n += 1;
  if (s.fal) n += 1;
  if (s.mathematics) n += 1;
  if (Array.isArray(s.electives)) n += s.electives.filter(Boolean).length;
  return n;
}

function formatDayMonth(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
}

/** Matric finals start on the 4th Monday of October (approx 26 Oct). */
function daysUntilMatricFinals() {
  const now = new Date();
  const year = now.getFullYear();
  let target = new Date(year, 9, 26);
  if (target < now) target = new Date(year + 1, 9, 26);
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target - now) / 86400000));
}

function topCourseName(user) {
  if (!user?.subjectMarks || Object.keys(user.subjectMarks).length === 0) return '';
  const passes = COURSES
    .map((c) => ({ c, e: checkEligibility(c, user) }))
    .filter((x) => x.e.status === 'pass')
    .sort((a, b) => (b.c.minAPS || 0) - (a.c.minAPS || 0));
  return passes[0]?.c?.name || '';
}

/** Prefer the latest saved estimate. Fall back to a rough guess from profile. */
function estimateFundingGap(user) {
  const saved = user?.savedEstimates?.[0];
  if (saved && typeof saved.gap === 'number') return saved.gap;

  const hasProfile = user?.stream && user?.subjectMarks &&
    Object.keys(user.subjectMarks).length > 0;
  if (!hasProfile) return 0;

  const top = COURSES
    .map((c) => ({ c, e: checkEligibility(c, user) }))
    .filter((x) => x.e.status === 'pass')
    .sort((a, b) => (b.c.minAPS || 0) - (a.c.minAPS || 0))[0]?.c;

  if (!top) return 0;
  const tuition = top.feeEstimate || 0;
  const accommodation = 14000;
  const food = 2500 * 12;
  const transport = 800 * 12;
  const books = 1500;
  const other = 5000;
  const total = tuition + accommodation + food + transport + books + other;
  const potential = 62000;
  return Math.max(0, total - potential);
}

/* ══════════════════════════════════════════════════════════
   Icons
   ══════════════════════════════════════════════════════════ */

function iconProps(size = 18) {
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
function SearchIcon() {
  return (<svg {...iconProps()}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-3.6-3.6" />
  </svg>);
}
function CoinIcon() {
  return (<svg {...iconProps()}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
    <path d="M12 6.6v10.8" />
  </svg>);
}
function CalcIcon() {
  return (<svg {...iconProps()}>
    <rect x="5" y="3" width="14" height="18" rx="2.2" />
    <path d="M8 7h8" />
    <path d="M8.5 11h1.5M8.5 14.5h1.5M8.5 18h1.5M13 11h1.5M13 14.5h1.5M13 18h1.5" />
  </svg>);
}
function SparkleIcon() {
  return (<svg {...iconProps()}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="M6.4 6.4 8.7 8.7M15.3 15.3l2.3 2.3M17.6 6.4 15.3 8.7M8.7 15.3 6.4 17.6" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>);
}
function HeartIcon() {
  return (<svg {...iconProps()}>
    <path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3c0 5-7 9.4-7 9.4z" />
  </svg>);
}
function ClipboardIcon() {
  return (<svg {...iconProps()}>
    <rect x="6" y="4.5" width="12" height="16" rx="2" />
    <path d="M9.5 4.5V3.6c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v.9" />
    <path d="M9.5 11h5M9.5 14.5h5M9.5 18h3" />
  </svg>);
}
function FlameIcon() {
  return (<svg {...iconProps()}>
    <path d="M12 3c1.5 3 5 4.6 5 8.5A5 5 0 0 1 7 12c0-1.4.5-2.4 1.2-3.2C9.4 7.4 11 6 12 3z" />
    <path d="M12 21a3.5 3.5 0 0 1-2-6.4c.4 1.4 1 1.9 2 2 .2-1.2 0-2.2-.4-3 1.6 1.2 3.4 2.7 3.4 4.9A3.5 3.5 0 0 1 12 21z" />
  </svg>);
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
function DotIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <circle cx="5" cy="5" r="2.5" fill="currentColor" />
    </svg>
  );
}
function CompassIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.3"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" />
      <path d="m15.6 8.4-2.3 6.9-6.9 2.3 2.3-6.9z" />
    </svg>
  );
}