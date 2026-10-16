import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import "./UpdatePrompt.css";

export default function UpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);

  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Poll for updates every 5 minutes while the tab is open
      if (r) {
        setInterval(() => {
          r.update();
        }, 5 * 60 * 1000);
      }
    },
    onRegisterError(err) {
      // eslint-disable-next-line no-console
      console.warn("SW registration error:", err);
    },
  });

  // Reset dismissal when a fresh update is detected
  useEffect(() => {
    if (needRefresh) setDismissed(false);
  }, [needRefresh]);

  if (dismissed) return null;
  if (!needRefresh && !offlineReady) return null;

  function handleReload() {
    updateServiceWorker(true);
  }

  return (
    <div className="update-prompt" role="status">
      <span className="update-prompt-icon" aria-hidden="true">
        {needRefresh ? <RefreshIcon /> : <CheckIcon />}
      </span>
      <div className="update-prompt-body">
        <div className="update-prompt-title">
          {needRefresh ? "A new version is ready" : "Ready to work offline"}
        </div>
        <div className="update-prompt-sub">
          {needRefresh
            ? "Reload to get the latest features."
            : "You can now use NB Student Hub without internet."}
        </div>
      </div>
      {needRefresh && (
        <button
          type="button"
          className="update-prompt-cta"
          onClick={handleReload}
        >
          Reload
        </button>
      )}
      <button
        type="button"
        className="update-prompt-close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <XIcon />
      </button>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
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
