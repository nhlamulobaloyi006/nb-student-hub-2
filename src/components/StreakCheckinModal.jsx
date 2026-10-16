import { useState } from "react";
import "./StreakCheckinModal.css";

/**
 * One-tap streak check-in modal.
 * Fires daily on Dashboard when the user has not checked in today.
 *
 * @param {number}   current      current streak count (before today)
 * @param {function} onCheckIn    performs the check-in, returns new count
 * @param {function} onClose      called after success or dismissal
 */
export default function StreakCheckinModal({ current = 0, onCheckIn, onClose }) {
  const [done, setDone] = useState(false);
  const [newCount, setNewCount] = useState(0);

  function handleCheckIn() {
    const next = typeof onCheckIn === "function" ? onCheckIn() : 0;
    setNewCount(Number(next) || 0);
    setDone(true);
    setTimeout(() => onClose && onClose(), 1500);
  }

  return (
    <div className="scm-scrim">
      <div className="scm-panel" role="dialog" aria-modal="true" aria-labelledby="scm-title">
        <button
          type="button"
          className="scm-close"
          onClick={onClose}
          aria-label="Dismiss"
        >
          <XIcon />
        </button>

        <div className={"scm-avatar" + (done ? " is-success" : "")}>
          {done ? <CheckIcon /> : <FlameIcon />}
        </div>

        {!done ? (
          <>
            <div className="scm-eyebrow">A NOTE FROM NBOT</div>
            <h1 className="scm-title" id="scm-title">
              {current === 0
                ? "Start your streak today"
                : "Keep your " + current + "-day streak alive"}
            </h1>
            <p className="scm-sub">
              {current === 0
                ? "Check in once a day to build momentum. One tap, that is it."
                : "You have not checked in today. One tap and you are sorted."}
            </p>

            <div className="scm-actions">
              <button
                type="button"
                className="btn btn-primary btn-block scm-cta"
                onClick={handleCheckIn}
              >
                <FlameIcon size={16} /> Check in today
              </button>
              <button
                type="button"
                className="btn btn-ghost scm-later"
                onClick={onClose}
              >
                Not today
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="scm-eyebrow scm-eyebrow-success">CHECKED IN</div>
            <h1 className="scm-title">
              {newCount} day{newCount === 1 ? "" : "s"} in a row
            </h1>
            <p className="scm-sub">
              Nice work. Come back tomorrow to keep the flame going.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function FlameIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3c1.5 3 5 4.6 5 8.5A5 5 0 0 1 7 12c0-1.4.5-2.4 1.2-3.2C9.4 7.4 11 6 12 3z" />
      <path d="M12 21a3.5 3.5 0 0 1-2-6.4c.4 1.4 1 1.9 2 2 .2-1.2 0-2.2-.4-3 1.6 1.2 3.4 2.7 3.4 4.9A3.5 3.5 0 0 1 12 21z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.6"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
