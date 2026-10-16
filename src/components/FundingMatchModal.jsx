import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import "./FundingMatchModal.css";

export default function FundingMatchModal({ course, funds, onClose }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  if (!course || !funds || funds.length === 0) return null;

  const top = funds.slice(0, 3);

  function handleBrowse() {
    const qs = course.id ? "?course=" + encodeURIComponent(course.id) : "";
    navigate("/funding" + qs);
  }

  function handleLater() {
    onClose && onClose();
  }

  return (
    <div className={"fmm-scrim" + (visible ? " is-visible" : "")}>
      <div className="fmm-panel" role="dialog" aria-modal="true" aria-labelledby="fmm-title">
        <div className="fmm-icon" aria-hidden="true"><img src="/logos/logo.png" alt="" className="fmm-icon-img" /></div>

        <div className="fmm-eyebrow">APPLICATION STARTED</div>

        <h1 className="fmm-title" id="fmm-title">
          {course.name}
        </h1>
        <p className="fmm-sub">
          We found <b>{funds.length}</b> funding option{funds.length === 1 ? "" : "s"} that fit this course and your profile.
        </p>

        <div className="fmm-funds">
          {top.map((f) => {
            const d = daysLeft(f.deadline);
            const urgent = d >= 0 && d <= 30;
            const tierTone =
              f.tier === "NSFAS" ? "gold" :
              f.tier === "Scholarships" ? "green" :
              f.tier === "Bursaries" ? "indigo" :
              f.tier === "Student loans" ? "amber" : "gray";
            return (
              <div key={f.id} className="fmm-fund">
                <Logo logoKey={f.logoKey} name={f.provider} size={40} />
                <div className="fmm-fund-body">
                  <span className={"badge badge-" + tierTone + " fmm-fund-tier"}>{f.tier}</span>
                  <div className="fmm-fund-name">{f.name}</div>
                  <div className="fmm-fund-provider">{f.provider}</div>
                </div>
                <div className="fmm-fund-right">
                  <div className="fmm-fund-amount">{f.amount}</div>
                  {urgent && (
                    <div className="fmm-fund-days">{d} day{d === 1 ? "" : "s"} left</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {funds.length > 3 && (
          <div className="fmm-more">+{funds.length - 3} more matching option{funds.length - 3 === 1 ? "" : "s"}</div>
        )}

        <div className="fmm-actions">
          <button
            type="button"
            className="btn btn-primary btn-block fmm-cta"
            onClick={handleBrowse}
          >
            See all funding options <MiniArrow />
          </button>
          <button
            type="button"
            className="btn btn-ghost fmm-later"
            onClick={handleLater}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

function daysLeft(iso) {
  if (!iso) return -1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso + "T00:00:00");
  return Math.round((d - today) / 86400000);
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
function CoinIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.4" />
      <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
      <path d="M12 6.6v10.8" />
    </svg>
  );
}
