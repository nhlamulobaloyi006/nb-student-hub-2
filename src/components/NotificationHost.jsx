import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  evaluateNotifications,
  selectNotificationsToFire,
  severityTone,
  fireBrowserNotification,
  browserNotificationPermission,
} from '../utils/notifications';
import './NotificationHost.css';

const RE_EVAL_MS = 5 * 60 * 1000; // re-check every 5 minutes while the tab is open
const AUTO_DISMISS_MS = 12 * 1000; // toasts disappear after 12s

export default function NotificationHost() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  /* ── Evaluate rules ─────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    if (user.preferences?.notifications === false) return;

    function run() {
      const all = evaluateNotifications(user);
      const last = user.preferences?.lastNotified || {};
      const { toFire, updatedLastNotified } = selectNotificationsToFire(all, last);
      if (toFire.length === 0) return;

      // Persist cooldown so we don't fire again today
      updateUser({
        preferences: {
          ...(user.preferences || {}),
          lastNotified: updatedLastNotified,
        },
      });

      // Queue toasts (max 3 visible at a time)
      setToasts((prev) => [...prev, ...toFire.map(toastFromNotification)].slice(-3));

      // Fire OS notifications if permitted
      if (
        user.preferences?.notificationsBrowser &&
        browserNotificationPermission() === 'granted'
      ) {
        toFire.forEach((n) => {
          fireBrowserNotification({ title: n.title, body: n.body });
        });
      }
    }

    run();
    const interval = setInterval(run, RE_EVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.preferences?.notifications, user?.preferences?.notificationsBrowser]);

  /* ── Toast helpers ──────────────────────────────────── */
  function toastFromNotification(n) {
    return {
      key: `${n.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      id: n.id,
      severity: n.severity,
      title: n.title,
      body: n.body,
      to: n.to,
      cta: n.cta,
    };
  }

  function dismiss(key) {
    setToasts((prev) => prev.filter((t) => t.key !== key));
    const t = timers.current.get(key);
    if (t) clearTimeout(t);
    timers.current.delete(key);
  }

  function handleClick(toast) {
    dismiss(toast.key);
    if (toast.to) navigate(toast.to);
  }

  /* Auto-dismiss each toast */
  useEffect(() => {
    toasts.forEach((t) => {
      if (timers.current.has(t.key)) return;
      const timer = setTimeout(() => dismiss(t.key), AUTO_DISMISS_MS);
      timers.current.set(t.key, timer);
    });
    // Cleanup timers on unmount
    return () => {
      // nothing here — dismissal clears timers
    };
  }, [toasts]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="nh-host" role="region" aria-label="Notifications">
      {toasts.map((t) => {
        const tone = severityTone(t.severity);
        return (
          <div key={t.key} className={`nh-toast nh-toast-${tone}`}>
            <span className="nh-toast-icon" aria-hidden="true">
              {t.severity === 'urgent' ? <BellUrgentIcon /> :
               t.severity === 'warning' ? <BellWarningIcon /> :
               <BellIcon />}
            </span>
            <div className="nh-toast-body" onClick={() => handleClick(t)} role="button" tabIndex={0}
                 onKeyDown={(e) => { if (e.key === 'Enter') handleClick(t); }}>
              <div className="nh-toast-title">{t.title}</div>
              <div className="nh-toast-text">{t.body}</div>
            </div>
            {t.cta && t.to && (
              <button
                type="button"
                className="nh-toast-cta"
                onClick={() => handleClick(t)}
              >
                {t.cta}
              </button>
            )}
            <button
              type="button"
              className="nh-toast-close"
              onClick={() => dismiss(t.key)}
              aria-label="Dismiss"
            >
              <XIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────── */
function iconProps(size = 16) {
  return {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
}
function BellIcon() { return (<svg {...iconProps(16)}>
  <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16z" />
  <path d="M10 21a2 2 0 0 0 4 0" />
</svg>); }
function BellUrgentIcon() { return (<svg {...iconProps(16)}>
  <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16z" />
  <path d="M10 21a2 2 0 0 0 4 0" />
  <circle cx="19" cy="6" r="3" fill="currentColor" stroke="none" />
</svg>); }
function BellWarningIcon() { return (<svg {...iconProps(16)}>
  <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16z" />
  <path d="M10 21a2 2 0 0 0 4 0" />
  <circle cx="19" cy="6" r="2.4" fill="currentColor" stroke="none" />
</svg>); }
function XIcon() { return (<svg {...iconProps(14)}>
  <path d="M6 6l12 12M18 6 6 18" />
</svg>); }
