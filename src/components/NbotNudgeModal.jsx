import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NbotNudgeModal.css";

export default function NbotNudgeModal({ nudge, onClose, onDismiss }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  if (!nudge) return null;

  function handleChat() {
    const qs = nudge.prompt ? "?prompt=" + encodeURIComponent(nudge.prompt) : "";
    navigate("/companion" + qs);
  }

  function handleLater() {
    if (onDismiss) onDismiss();
    else if (onClose) onClose();
  }

  return (
    <div className={"nbm-scrim" + (visible ? " is-visible" : "")}>
      <div className="nbm-panel" role="dialog" aria-modal="true" aria-labelledby="nbm-title">
        <div className="nbm-panel-scrollable">
        <div className="nbm-avatar" aria-hidden="true"><BotIcon /></div>

        <div className="nbm-eyebrow">A NOTE FROM NBOT</div>

        <h1 className="nbm-title" id="nbm-title">{nudge.title}</h1>
        <p className="nbm-sub">{nudge.body}</p>

        </div>

        <div className="nbm-actions">
          <button
            type="button"
            className="btn btn-primary btn-block nbm-cta"
            onClick={handleChat}
          >
            <ChatIcon /> {nudge.cta || "Chat with NBOT"}
          </button>
          <button
            type="button"
            className="btn btn-ghost nbm-later"
            onClick={handleLater}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

function BotIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
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
function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-8a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" />
    </svg>
  );
}
