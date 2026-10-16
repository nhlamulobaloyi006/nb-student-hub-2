import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CourseMatchCards,
  CostEstimateCard,
  FundingCards,
  StepList,
  NextActionCard,
  CompareCards,
  CareerCards,
} from '../components/companion/RichCards';
import {
  detectIntent,
  buildResponse,
  welcomeMessage,
} from '../utils/aiEngine';
import { STREAM_LABELS } from '../data/subjects';
import { COURSES } from '../data/courses';
import { promptText } from '../utils/nudges';

import './AICompanion.css';

/* Session-only store of the chat history.
   The welcome message is NEVER persisted — it is regenerated on every mount
   from the current user object so that "next step" hints stay accurate. */
const SESSION_KEY = 'nb_companion_session';

/** Strip out any stored welcome messages (bot + no kind + no payload + no chips). */
function isWelcomeMessage(m) {
  if (!m || m.role !== 'bot') return false;
  if (m.kind) return false;
  if (m.payload) return false;
  if (Array.isArray(m.chips) && m.chips.length > 0) return false;
  return true;
}

export default function AICompanion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const listRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    const fresh = welcomeMessage(user);

    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [fresh];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [fresh];
      const rest = parsed.filter((m) => !isWelcomeMessage(m));
      return [fresh, ...rest];
    } catch {
      return [fresh];
    }
  });
  /* Seed a message from ?prompt= (and optionally ?course=) on mount */
  useEffect(() => {
    const promptKey = searchParams.get('prompt');
    const courseId = searchParams.get('course');
    if (!promptKey) return;

    let courseName = '';
    if (courseId) {
      const course = COURSES.find((c) => c.id === courseId);
      if (course) courseName = course.name;
    }

    const text = promptText(promptKey, courseName);
    if (!text) return;

    const next = new URLSearchParams(searchParams);
    next.delete('prompt');
    next.delete('course');
    setSearchParams(next, { replace: true });

    const userMsg = { id: 'u_' + Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);
    setTimeout(() => {
      const intent = detectIntent(text);
      const reply = buildResponse(intent, user, text);
      const botMsg = { id: reply.id, role: 'bot', ...reply };
      setMessages((prev) => [...prev, botMsg]);
      setThinking(false);
    }, 380);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  /* Persist to sessionStorage on change (welcome excluded) */
  useEffect(() => {
    const persistable = messages.filter((m) => !isWelcomeMessage(m));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(persistable));
  }, [messages]);

  /* Auto-scroll on new messages */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  function handleSend(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed || thinking) return;

    const userMsg = { id: `u_${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const intent = detectIntent(trimmed);
      const reply = buildResponse(intent, user, trimmed);
      const botMsg = { id: reply.id, role: 'bot', ...reply };
      setMessages((prev) => [...prev, botMsg]);
      setThinking(false);
    }, 380);
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleSend(input);
  }

  function handleChip(chip) {
    handleSend(chip);
  }

  function handleReset() {
    const fresh = welcomeMessage(user);
    setMessages([fresh]);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([]));
  }

  return (
    <div className="aic">
      <div className="aic-main">
        <header className="aic-head">
          <div className="aic-head-left">
            <div className="aic-avatar" aria-hidden="true"><BotIcon /></div>
            <div>
              <h1 className="aic-title">NBOT — Your Student Assistant</h1>
              <p className="aic-sub">I can help you pick a course, find funding and stay on track.</p>
            </div>
          </div>
          <div className="aic-head-right">
            <span className="aic-demo-pill">
              <span className="aic-demo-dot" aria-hidden="true" />
              Demo Assistant
            </span>
            <button
              type="button"
              className="aic-reset"
              onClick={handleReset}
              title="Start a new conversation"
              aria-label="Start a new conversation"
            >
              <RefreshIcon />
            </button>
          </div>
        </header>
<div className="aic-list" ref={listRef}>
          {messages.map((m) => (
            <MessageRow
              key={m.id}
              message={m}
              onChip={handleChip}
            />
          ))}

          {thinking && (
            <div className="aic-msg aic-msg-bot">
              <div className="aic-msg-avatar" aria-hidden="true"><BotIcon /></div>
              <div className="aic-bubble aic-bubble-bot">
                <span className="aic-typing">
                  <span /><span /><span />
                </span>
              </div>
            </div>
          )}
        </div>

        <form className="aic-input-bar" onSubmit={handleSubmit}>
          <button
            type="button"
            className="aic-attach"
            aria-label="Attach a file"
            title="Attachments coming soon"
            disabled
          >
            <PaperclipIcon />
          </button>
          <input
            type="text"
            className="aic-input"
            placeholder="Ask me anything about your studies…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={thinking}
          />
          <button
            type="submit"
            className="aic-send"
            disabled={!input.trim() || thinking}
            aria-label="Send"
          >
            <SendIcon />
          </button>
        </form>

        <div className="aic-foot-note">
          This is a demo assistant using sample data from the application.
        </div>
      </div>

      <aside className="aic-rail">
        <QuickActionsRail navigate={navigate} />
        <StudentContextRail user={user} />
        <PrivacyNote />
        <HelpfulLinks />
      </aside>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Message row
   ══════════════════════════════════════════════════════════ */

function MessageRow({ message, onChip }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="aic-msg aic-msg-user">
        <div className="aic-bubble aic-bubble-user">{message.text}</div>
      </div>
    );
  }

  return (
    <div className="aic-msg aic-msg-bot">
      <div className="aic-msg-avatar" aria-hidden="true"><BotIcon /></div>
      <div className="aic-msg-body">
        <div className="aic-bubble aic-bubble-bot">
          <RichText text={message.text} />
        </div>

        {message.kind === 'courses'   && <CourseMatchCards matches={message.payload?.matches || []} />}
        {message.kind === 'cost'      && <CostEstimateCard estimate={message.payload} />}
        {message.kind === 'funding'   && <FundingCards funds={message.payload?.funds || []} />}
        {message.kind === 'steps'     && <StepList steps={message.payload?.steps || []} />}
        {message.kind === 'next-action' && <NextActionCard action={message.payload} />}
        {message.kind === 'compare'   && <CompareCards institutions={message.payload?.institutions || []} />}
        {message.kind === 'careers'   && <CareerCards careers={message.payload?.careers || []} courseName={message.payload?.courseName || ''} total={message.payload?.total} />}

        {Array.isArray(message.chips) && message.chips.length > 0 && (
          <div className="aic-inline-chips">
            {message.chips.map((c) => (
              <button
                key={c}
                type="button"
                className="aic-inline-chip"
                onClick={() => onChip(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RichText({ text }) {
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   Right rail
   ══════════════════════════════════════════════════════════ */

function QuickActionsRail({ navigate }) {
  const items = [
    { label: 'Course Finder',        icon: SearchIcon,    to: '/courses' },
    { label: 'Funding Finder',       icon: CoinIcon,      to: '/funding' },
    { label: 'Cost Planner',         icon: CalcIcon,      to: '/cost-planner' },
    { label: 'Application Tracker',  icon: ClipboardIcon, to: '/applications' },
    { label: 'Institutions',         icon: BuildingIcon,  to: '/institutions' },
  ];
  return (
    <div className="rail-card">
      <div className="rail-card-head">
        <div className="rail-card-title">Quick Actions</div>
        <span className="rail-card-hint">Jump to the tools you need.</span>
      </div>
      <div className="rail-quick">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.to}
              type="button"
              className="rail-quick-item"
              onClick={() => navigate(it.to)}
            >
              <span className="rail-quick-icon"><Icon /></span>
              <span className="rail-quick-label">{it.label}</span>
              <span className="rail-quick-arrow"><MiniArrow /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StudentContextRail({ user }) {
  const stream = user?.stream ? STREAM_LABELS[user.stream] : '—';
  const subjectsCount = countSubjects(user);
  const province = user?.preferences?.province || 'Not set';
  const accommodation = user?.preferences?.accommodation || 'Not set';
  const studyMode = user?.preferences?.studyMode || 'Full-time';
  const studyGoal = user?.futureGoal || 'Not set';

  const rows = [
    { label: 'Subjects',       value: `${subjectsCount} added` },
    { label: 'Study goal',     value: studyGoal },
    { label: 'Stream',         value: stream },
    { label: 'Preferred province', value: province },
    { label: 'Accommodation preference', value: accommodation },
    { label: 'Study mode',     value: studyMode },
  ];

  return (
    <div className="rail-card">
      <div className="rail-card-head">
        <div className="rail-card-title">Your Student Context</div>
        <Link to="/profile" className="rail-card-link">Edit</Link>
      </div>
      <div className="rail-context">
        {rows.map((r) => (
          <div key={r.label} className="rail-context-row">
            <span className="rail-context-label">{r.label}</span>
            <span className="rail-context-value">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyNote() {
  return (
    <div className="rail-card rail-card-privacy">
      <div className="rail-card-head">
        <div className="rail-card-title">
          <span className="rail-privacy-icon"><LockIcon /></span>
          Your privacy matters
        </div>
      </div>
      <p className="rail-privacy-text">
        Your conversations and personal information stay on your device in this prototype.
      </p>
      <Link to="/settings" className="rail-privacy-link">
        Learn more <MiniArrow />
      </Link>
    </div>
  );
}

function HelpfulLinks() {
  const links = [
    { label: 'NSFAS Official Site',            sub: 'nsfas.org.za',  url: 'https://www.nsfas.org.za' },
    { label: 'Department of Higher Education', sub: 'dhet.gov.za',   url: 'https://www.dhet.gov.za' },
    { label: 'SAQA (Qualifications)',          sub: 'saqa.org.za',   url: 'https://www.saqa.org.za' },
  ];
  return (
    <div className="rail-card">
      <div className="rail-card-head">
        <div className="rail-card-title">Helpful Links</div>
      </div>
      <div className="rail-links">
        {links.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noreferrer noopener"
            className="rail-link"
          >
            <span className="rail-link-icon"><ExternalIcon /></span>
            <span className="rail-link-body">
              <span className="rail-link-label">{l.label}</span>
              <span className="rail-link-sub">{l.sub}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Constants + helpers
   ══════════════════════════════════════════════════════════ */

const SUGGESTED = [
  'What can I study with my marks?',
  'What careers fit my top match?',
  'Compare these institutions',
  'How do I apply for NSFAS?',
  'What would studying this course cost?',
  'Which bursaries might suit me?',
  'What should I do next?',
];

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
function BotIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="7" width="16" height="13" rx="3" />
      <path d="M12 3v4" />
      <circle cx="9" cy="13" r="1.2" fill="currentColor" />
      <circle cx="15" cy="13" r="1.2" fill="currentColor" />
      <path d="M9 17h6" />
    </svg>
  );
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
function RefreshIcon() {
  return (<svg {...iconProps(16)}>
    <path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" />
    <path d="M3 21v-5h5" />
  </svg>);
}
function PaperclipIcon() {
  return (<svg {...iconProps(18)}>
    <path d="m21 12-8.5 8.5a5 5 0 0 1-7.1-7.1L14 5a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-2.9-2.9L15 8" />
  </svg>);
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4z" />
    </svg>
  );
}
function SearchIcon() { return (<svg {...iconProps(16)}>
  <circle cx="11" cy="11" r="6" /><path d="m20 20-3.6-3.6" />
</svg>); }
function CoinIcon() { return (<svg {...iconProps(16)}>
  <circle cx="12" cy="12" r="8.4" />
  <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
  <path d="M12 6.6v10.8" />
</svg>); }
function CalcIcon() { return (<svg {...iconProps(16)}>
  <rect x="5" y="3" width="14" height="18" rx="2.2" /><path d="M8 7h8" />
  <path d="M8.5 11h1.5M8.5 14.5h1.5M8.5 18h1.5M13 11h1.5M13 14.5h1.5M13 18h1.5" />
</svg>); }
function ClipboardIcon() { return (<svg {...iconProps(16)}>
  <rect x="6" y="4.5" width="12" height="16" rx="2" />
  <path d="M9.5 4.5V3.6c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v.9" />
  <path d="M9.5 11h5M9.5 14.5h5M9.5 18h3" />
</svg>); }
function BuildingIcon() { return (<svg {...iconProps(16)}>
  <path d="M3 20h18" /><path d="M5 20V8l7-4 7 4v12" /><path d="M9.5 20v-6h5v6" />
</svg>); }
function LockIcon() { return (<svg {...iconProps(14)}>
  <rect x="5" y="11" width="14" height="9" rx="2" />
  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
</svg>); }
function ExternalIcon() { return (<svg {...iconProps(14)}>
  <path d="M15 4h5v5" /><path d="M20 4 10 14" />
  <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
</svg>); }
