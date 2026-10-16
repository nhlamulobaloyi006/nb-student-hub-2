import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { matchCareersForCourse } from "../utils/matchCareers";
import "./CareerMatchModal.css";

/**
 * Fires ~5s after the funding match modal is dismissed on /applications.
 * Pitches the careers angle and routes to NBOT with a pre-seeded prompt.
 */
export default function CareerMatchModal({ course, onClose, onDismiss }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  if (!course) return null;

  const matches = matchCareersForCourse(course, { limit: 4 });
  if (matches.length === 0) return null;

  const total = matches.length;
  const preview = matches.slice(0, 3).map(({ career }) => career);

  function handleOpen() {
    const qs =
      "?prompt=careers-for-course&course=" + encodeURIComponent(course.id);
    navigate("/companion" + qs);
  }

  function handleLater() {
    if (onDismiss) onDismiss();
    else if (onClose) onClose();
  }

  return (
    <div className={"cmm-scrim" + (visible ? " is-visible" : "")}>
      <div className="cmm-panel" role="dialog" aria-modal="true" aria-labelledby="cmm-title">
        <div className="cmm-avatar" aria-hidden="true"><CompassIcon /></div>

        <div className="cmm-eyebrow">A NOTE FROM NBOT</div>

        <h1 className="cmm-title" id="cmm-title">
          What careers can I do with {course.name}?
        </h1>
        <p className="cmm-sub">
          This course opens up to {total} career{total === 1 ? "" : "s"}.
          Want NBOT to show you what they pay and which other courses get you there?
        </p>

        {preview.length > 0 && (
          <div className="cmm-preview">
            {preview.map((c) => (
              <div key={c.id} className="cmm-preview-row">
                <span className="cmm-preview-dot" aria-hidden="true" />
                <span className="cmm-preview-title">{c.title}</span>
                <span className="cmm-preview-salary">{c.salaryRange.split("/")[0].trim()}+</span>
              </div>
            ))}
          </div>
        )}

        <div className="cmm-actions">
          <button
            type="button"
            className="btn btn-primary btn-block cmm-cta"
            onClick={handleOpen}
          >
            <SparkIcon /> See careers with NBOT
          </button>
          <button
            type="button"
            className="btn btn-ghost cmm-later"
            onClick={handleLater}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

function CompassIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" />
      <path d="m15.6 8.4-2.3 6.9-6.9 2.3 2.3-6.9z" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}
