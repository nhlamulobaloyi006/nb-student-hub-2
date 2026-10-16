import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import "./MatchCelebrationModal.css";

export default function MatchCelebrationModal({ summary, onClose }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  if (!summary) return null;
  const { total, top } = summary;

  function handleBrowse() {
    navigate("/courses?matches=only");
  }

  function handleLater() {
    onClose && onClose();
  }

  return (
    <div className={"mcm-scrim" + (visible ? " is-visible" : "")}>
      <div className="mcm-panel" role="dialog" aria-modal="true" aria-labelledby="mcm-title">
        <div className="mcm-celebration" aria-hidden="true">
          <span className="mcm-spark mcm-spark-1" />
          <span className="mcm-spark mcm-spark-2" />
          <span className="mcm-spark mcm-spark-3" />
          <span className="mcm-spark mcm-spark-4" />
        </div>

        <div className="mcm-icon" aria-hidden="true"><img src="/logos/logo.png" alt="" className="mcm-icon-img" /></div>

        <h1 className="mcm-title" id="mcm-title">
          We found <span className="mcm-num">{total}</span> course{total === 1 ? "" : "s"} you qualify for
        </h1>
        <p className="mcm-sub">
          Based on your subjects, marks and stream. Here are your top picks:
        </p>

        {top.length > 0 && (
          <div className="mcm-matches">
            {top.map((m) => (
              <div key={m.courseId} className="mcm-match">
                <Logo logoKey={m.logoKey} name={m.universityName} size={40} />
                <div className="mcm-match-body">
                  <div className="mcm-match-name">{m.courseName}</div>
                  <div className="mcm-match-univ">{m.universityName}</div>
                </div>
                <div className="mcm-match-aps">
                  <div className="mcm-match-aps-value">{m.minAPS}</div>
                  <div className="mcm-match-aps-label">APS</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mcm-actions">
          <button
            type="button"
            className="btn btn-primary btn-block mcm-cta"
            onClick={handleBrowse}
          >
            Browse all {total} matches <MiniArrow />
          </button>
          <button
            type="button"
            className="btn btn-ghost mcm-later"
            onClick={handleLater}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function TrophyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" />
      <path d="M10 12v4h4v-4M9 20h6M12 16v4" />
    </svg>
  );
}
