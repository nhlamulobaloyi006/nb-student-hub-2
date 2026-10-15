import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INSTITUTION_BY_ID } from '../data/institutions';
import { COURSES } from '../data/courses';
import { checkEligibility } from '../utils/eligibilityChecker';
import { calculateAPS } from '../utils/apsCalculator';
import Logo from '../components/Logo';

import './InstitutionDetail.css';

export default function InstitutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const inst = INSTITUTION_BY_ID[id];

  if (!inst) {
    return (
      <div className="id-detail">
        <div className="id-detail-missing">
          <div className="id-detail-missing-title">Institution not found</div>
          <div className="id-detail-missing-sub">
            The institution you're looking for doesn't exist or has moved.
          </div>
          <Link to="/institutions" className="btn btn-primary">
            Back to institutions
          </Link>
        </div>
      </div>
    );
  }

  const courses = useMemo(
    () => COURSES.filter((c) => c.universityId === inst.id),
    [inst.id]
  );

  const aps = calculateAPS(user?.subjectMarks || {}).total;

  const eligibleCount = useMemo(
    () => courses.filter((c) => checkEligibility(c, user).status === 'pass').length,
    [courses, user]
  );

  const savedItems = user?.savedItems || [];
  const isSaved = savedItems.some((s) => s.id === inst.id && s.type === 'institution');

  function toggleSaved() {
    if (isSaved) {
      updateUser({
        savedItems: savedItems.filter((s) => !(s.id === inst.id && s.type === 'institution')),
      });
    } else {
      updateUser({
        savedItems: [
          ...savedItems,
          { id: inst.id, type: 'institution', addedAt: new Date().toISOString() },
        ],
      });
    }
  }

  return (
    <div className="id-detail">
      {/* Breadcrumb */}
      <nav className="id-crumbs" aria-label="Breadcrumb">
        <Link to="/institutions" className="id-crumb-link">
          <BackArrow /> Institutions
        </Link>
        <span className="id-crumb-sep">›</span>
        <span className="id-crumb-current">{inst.shortName || inst.name}</span>
      </nav>

      {/* Hero */}
      <header className="id-hero">
        <div className="id-hero-logo">
          <Logo logoKey={inst.logoKey} name={inst.name} size={88} />
        </div>

        <div className="id-hero-body">
          <div className="id-hero-tier">{inst.tier}</div>
          <h1 className="id-hero-name">{inst.name}</h1>
          <div className="id-hero-meta">
            <span className="id-hero-meta-item">
              <PinIcon /> {inst.location}
            </span>
            <span className="id-hero-meta-item">
              <BuildingIcon /> {courses.length} course{courses.length === 1 ? '' : 's'}
            </span>
            {eligibleCount > 0 && (
              <span className="id-hero-meta-item id-hero-meta-eligible">
                <CheckIcon /> You may qualify for {eligibleCount}
              </span>
            )}
          </div>
          <p className="id-hero-desc">{inst.description}</p>
        </div>

        <div className="id-hero-actions">
          <a
            href={inst.website}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-primary id-hero-cta"
          >
            Visit website <ExternalIcon />
          </a>
          <button
            type="button"
            className={'btn ' + (isSaved ? 'btn-outline' : 'btn-ghost') + ' id-hero-save'}
            onClick={toggleSaved}
          >
            <BookmarkIcon filled={isSaved} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </header>

      {/* Info strip */}
      <section className="id-info">
        <InfoCell
          label="Application opens"
          value={inst.applicationOpen ? formatDate(inst.applicationOpen) : '—'}
        />
        <InfoCell
          label="Application closes"
          value={inst.applicationClose ? formatDate(inst.applicationClose) : '—'}
          tone={isClosingSoon(inst.applicationClose) ? 'warning' : null}
        />
        <InfoCell
          label="Application fee"
          value={inst.applicationFee ? `R${inst.applicationFee}` : 'Free'}
        />
        <InfoCell
          label="NBT required"
          value={inst.nbt ? 'Yes' : 'No'}
          tone={inst.nbt ? 'info' : null}
        />
      </section>

      {/* Two column body */}
      <div className="id-body">
        <div className="id-main">
          {/* Courses */}
          <section className="id-card">
            <div className="id-card-head">
              <div>
                <div className="id-card-title">
                  Courses at {inst.shortName || inst.name}
                </div>
                <div className="id-card-sub">
                  {courses.length} course{courses.length === 1 ? '' : 's'} available. Your APS: {aps}.
                </div>
              </div>
              <Link
                to={`/courses?inst=${inst.id}`}
                className="id-card-link"
              >
                Open in Course Finder <MiniArrow />
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="id-empty">
                No courses listed for this institution yet.
              </div>
            ) : (
              <div className="id-course-list">
                {courses.map((c) => {
                  const elig = checkEligibility(c, user);
                  const tone = elig.status === 'pass' ? 'green'
                             : elig.status === 'warn' ? 'indigo'
                             : elig.status === 'fail' ? 'red'
                             : 'gray';
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="id-course"
                      onClick={() => navigate(`/courses?q=${encodeURIComponent(c.name)}`)}
                    >
                      <div className="id-course-body">
                        <div className="id-course-name">{c.name}</div>
                        <div className="id-course-meta">
                          <span>{c.duration}</span>
                          <span className="id-course-dot">·</span>
                          <span>{c.faculty}</span>
                          <span className="id-course-dot">·</span>
                          <span>APS {c.minAPS || '—'}</span>
                        </div>
                      </div>
                      <span className={`badge badge-${tone}`}>
                        {elig.status === 'pass' ? 'Qualifies'
                          : elig.status === 'warn' ? 'Check'
                          : elig.status === 'fail' ? 'Not yet'
                          : 'Unknown'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Faculties */}
          {inst.faculties?.length > 0 && (
            <section className="id-card">
              <div className="id-card-head">
                <div className="id-card-title">Faculties</div>
              </div>
              <div className="id-chips">
                {inst.faculties.map((f) => (
                  <span key={f} className="id-chip">{f}</span>
                ))}
              </div>
            </section>
          )}

          {/* Campuses */}
          {inst.campuses?.length > 0 && (
            <section className="id-card">
              <div className="id-card-head">
                <div className="id-card-title">Campuses</div>
              </div>
              <div className="id-chips">
                {inst.campuses.map((c) => (
                  <span key={c} className="id-chip id-chip-campus">
                    <PinIcon /> {c}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="id-rail">
          {/* Contact */}
          <div className="id-card id-card-tight">
            <div className="id-card-title">Contact</div>
            <div className="id-contact">
              {inst.contact?.phone && (
                <a className="id-contact-row" href={`tel:${inst.contact.phone}`}>
                  <PhoneIcon /> {inst.contact.phone}
                </a>
              )}
              {inst.contact?.email && (
                <a className="id-contact-row" href={`mailto:${inst.contact.email}`}>
                  <MailIcon /> {inst.contact.email}
                </a>
              )}
              {inst.website && (
                <a
                  className="id-contact-row"
                  href={inst.website}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <GlobeIcon /> {inst.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>

          {/* Deadline callout */}
          {inst.applicationClose && isClosingSoon(inst.applicationClose) && (
            <div className="id-callout">
              <span className="id-callout-icon"><WarningIcon /></span>
              <div>
                <div className="id-callout-title">Applications close soon</div>
                <div className="id-callout-sub">
                  {daysUntil(inst.applicationClose)} day
                  {daysUntil(inst.applicationClose) === 1 ? '' : 's'} left
                  ({formatDate(inst.applicationClose)})
                </div>
              </div>
            </div>
          )}

          {/* Shortcuts */}
          <div className="id-card id-card-tight">
            <div className="id-card-title">Quick links</div>
            <div className="id-shortcuts">
              <Link to="/cost-planner" className="id-shortcut">
                <CalcIcon /> Estimate costs <MiniArrow />
              </Link>
              <Link to="/funding" className="id-shortcut">
                <CoinIcon /> Find funding <MiniArrow />
              </Link>
              <Link to="/applications" className="id-shortcut">
                <ClipboardIcon /> Track applications <MiniArrow />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Small pieces
   ──────────────────────────────────────────────────────────── */

function InfoCell({ label, value, tone }) {
  return (
    <div className={`id-info-cell${tone ? ' id-info-cell-' + tone : ''}`}>
      <div className="id-info-label">{label}</div>
      <div className="id-info-value">{value}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(iso) {
  if (!iso) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso + 'T00:00:00');
  return Math.max(0, Math.round((d - today) / 86400000));
}

function isClosingSoon(iso) {
  const days = daysUntil(iso);
  return days >= 0 && days <= 45;
}

/* ────────────────────────────────────────────────────────────
   Icons — SVG only
   ──────────────────────────────────────────────────────────── */

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
function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 5l-7 7 7 7" />
    </svg>
  );
}
function PinIcon() { return (<svg {...iconProps(14)}>
  <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
  <circle cx="12" cy="10" r="2.4" />
</svg>); }
function BuildingIcon() { return (<svg {...iconProps(14)}>
  <path d="M3 20h18" /><path d="M5 20V8l7-4 7 4v12" /><path d="M9.5 20v-6h5v6" />
</svg>); }
function CheckIcon() { return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="3"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 12 5 5L20 6" />
  </svg>
); }
function ExternalIcon() { return (<svg {...iconProps(12)}>
  <path d="M15 4h5v5" /><path d="M20 4 10 14" />
  <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
</svg>); }
function PhoneIcon() { return (<svg {...iconProps(14)}>
  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 20 20 0 0 1-8.6-3.1 20 20 0 0 1-6-6 20 20 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.5 2.6a2 2 0 0 1-.4 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c.8.2 1.7.4 2.6.5A2 2 0 0 1 22 16.9z" />
</svg>); }
function MailIcon() { return (<svg {...iconProps(14)}>
  <rect x="3" y="5" width="18" height="14" rx="2" />
  <path d="m3 7 9 6 9-6" />
</svg>); }
function GlobeIcon() { return (<svg {...iconProps(14)}>
  <circle cx="12" cy="12" r="9.4" />
  <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
</svg>); }
function WarningIcon() { return (<svg {...iconProps(16)}>
  <path d="M12 3 2 20h20L12 3z" />
  <path d="M12 10v4" /><circle cx="12" cy="17" r="0.9" fill="currentColor" />
</svg>); }
function CalcIcon() { return (<svg {...iconProps(14)}>
  <rect x="5" y="3" width="14" height="18" rx="2.2" />
  <path d="M8 7h8" />
  <path d="M8.5 11h1.5M8.5 14.5h1.5M8.5 18h1.5M13 11h1.5M13 14.5h1.5M13 18h1.5" />
</svg>); }
function CoinIcon() { return (<svg {...iconProps(14)}>
  <circle cx="12" cy="12" r="8.4" />
  <path d="M14.6 9.4c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.6.8-2.6 2s1 1.9 2.6 2.1c1.8.2 2.8.9 2.8 2.2 0 1.2-1.1 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4" />
  <path d="M12 6.6v10.8" />
</svg>); }
function ClipboardIcon() { return (<svg {...iconProps(14)}>
  <rect x="6" y="4.5" width="12" height="16" rx="2" />
  <path d="M9.5 4.5V3.6c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v.9" />
  <path d="M9.5 11h5M9.5 14.5h5M9.5 18h3" />
</svg>); }
function BookmarkIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
         fill={filled ? 'currentColor' : 'none'}
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.6L6 20V5a1 1 0 0 1 1-1z" />
    </svg>
  );
}
