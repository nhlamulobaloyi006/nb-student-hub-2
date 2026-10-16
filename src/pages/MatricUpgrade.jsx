import { Link, useSearchParams } from "react-router-dom";
import { COURSE_BY_ID } from "../data/courses";
import { INSTITUTION_BY_ID } from "../data/institutions";
import { useAuth } from "../context/AuthContext";
import { calculateAPS } from "../utils/apsCalculator";
import "./MatricUpgrade.css";

const PATHS = [
  {
    id: "rewrite-subjects",
    tone: "gold",
    icon: "RewriteIcon",
    title: "Rewrite specific subjects",
    sub: "The most common path — fix the subjects that are letting you down.",
    cost: "R300 – R700 per subject",
    duration: "Prep 2–3 months, exam Nov or May/June",
    who: "Learners who failed or underperformed in one or two subjects but otherwise have a solid matric.",
    how: [
      "Register at any DHET-registered exam centre by mid-February (for May/June) or mid-August (for Nov).",
      "You rewrite only the subjects you choose — not the full matric.",
      "Your best result per subject is used for your final APS.",
      "New APS is recalculated automatically — no need to submit new documents unless a university asks.",
    ],
    cta: { label: "Find an exam centre", url: "https://www.education.gov.za/Programmes/ABET/ABETExaminationCentres.aspx" },
  },
  {
    id: "full-rewrite",
    tone: "indigo",
    icon: "RewriteIcon",
    title: "Full matric rewrite",
    sub: "Rewriting all 6 subjects to aim for a completely different result.",
    cost: "R1 500 – R2 500 total",
    duration: "Full academic year of prep",
    who: "Learners whose overall APS is far below what they need — a fresh full pass opens new doors.",
    how: [
      "Same registration window as subject rewrite.",
      "All 6 subjects are re-examined at the end of the year.",
      "Best result per subject is kept — your original marks are not lost.",
      "Realistic for learners who need 6+ more APS points than their current total.",
    ],
    cta: { label: "Register for matric rewrite", url: "https://www.education.gov.za/Programmes/ABET.aspx" },
  },
  {
    id: "adult-matric",
    tone: "green",
    icon: "AdultIcon",
    title: "Adult matric / Senior Certificate (Amended)",
    sub: "For learners 21 and older who want a formal matric without the school pathway.",
    cost: "Varies by centre — from free to ~R3 500",
    duration: "18 months – 3 years, part-time",
    who: "Adults returning to study, or learners who left school without finishing matric.",
    how: [
      "Offered by public adult learning centres (DHET), and private distance providers.",
      "Choose 6 subjects, including a Home Language and either Maths or Maths Literacy.",
      "Completed over multiple exam cycles (Nov each year).",
      "Recognised the same as a regular NSC for most tertiary institutions.",
    ],
    cta: { label: "Find adult learning centres", url: "https://www.education.gov.za/Programmes/AdultEducation.aspx" },
  },
  {
    id: "tvet-bridging",
    tone: "amber",
    icon: "ToolIcon",
    title: "TVET bridging (NC(V) Level 2 or 3)",
    sub: "Enter a TVET college at a lower level, work up to a matric-equivalent NC(V) Level 4.",
    cost: "Funded by NSFAS — often no out-of-pocket fees",
    duration: "1–3 years, depending on entry level",
    who: "Learners with weak matric marks who want a practical, trade-focused qualification.",
    how: [
      "Apply directly to any public TVET college.",
      "Many NC(V) programmes accept learners with APS as low as 14.",
      "Complete Levels 2, 3 and 4 to earn an NC(V) qualification equivalent to matric.",
      "Strong pathway to artisan trades, employment or further study.",
    ],
    cta: { label: "Open Course Finder", to: "/courses" },
  },
  {
    id: "higher-cert",
    tone: "indigo",
    icon: "BookIcon",
    title: "Higher Certificate pathway",
    sub: "One-year foundation at a university of technology or private college, then a diploma or degree.",
    cost: "R25 000 – R40 000 for the year",
    duration: "1 year certificate + 3 years diploma/degree",
    who: "Learners who miss direct entry by a few APS points and want a low-risk bridge.",
    how: [
      "Find a Higher Certificate (NQF 5) in your field of interest.",
      "Complete the year with a pass — direct entry to the linked diploma or degree is guaranteed at most institutions.",
      "Common at CPUT, DUT, TUT, VUT, Rosebank College and Varsity College.",
      "Often counts as a full qualification on its own if you decide to stop after a year.",
    ],
    cta: { label: "See Higher Certificate courses", to: "/courses?q=higher+certificate" },
  },
  {
    id: "seta-learner",
    tone: "green",
    icon: "BriefcaseIcon",
    title: "SETA learnership",
    sub: "Earn a stipend while you learn a trade or skill. No full matric required for many programmes.",
    cost: "Free — you get paid a stipend",
    duration: "12 – 24 months",
    who: "Learners who want to start earning immediately while building a qualification.",
    how: [
      "Browse SETA websites (merSETA, FoodBev, AgriSETA, CETA) and the government's learnership portal.",
      "Entry requirements vary — some need only Grade 10 or a partial matric.",
      "Complete a workplace component alongside classroom training.",
      "Get an NQF-registered qualification at the end.",
    ],
    cta: { label: "Browse learnerships", url: "https://www.gov.za/services/learnerships" },
  },
];

export default function MatricUpgrade() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("course") || "";
  const course = courseId ? COURSE_BY_ID[courseId] : null;
  const inst = course ? INSTITUTION_BY_ID[course.universityId] : null;

  const aps = user?.subjectMarks ? calculateAPS(user.subjectMarks).total : 0;
  const gap = course && course.minAPS && aps < course.minAPS ? course.minAPS - aps : 0;

  return (
    <div className="mu">
      <header className="mu-head">
        <div className="mu-eyebrow">SECOND CHANCES</div>
        <h1 className="mu-title">Matric Upgrade</h1>
        <p className="mu-sub">
          Not happy with your marks? You have real options. Below are the six standard
          pathways South African learners take to improve their results — each with
          costs, timelines and next steps.
        </p>
      </header>

      {course && gap > 0 && (
        <section className="mu-gap">
          <div className="mu-gap-icon" aria-hidden="true"><TargetIcon /></div>
          <div className="mu-gap-body">
            <div className="mu-gap-title">
              You are {gap} APS point{gap === 1 ? "" : "s"} short of {course.name}
            </div>
            <div className="mu-gap-sub">
              {course.university || inst?.name} requires APS {course.minAPS}. You have {aps}.
              The paths below show how to close that gap.
            </div>
          </div>
        </section>
      )}

      <section className="mu-paths">
        {PATHS.map((p) => (
          <PathCard key={p.id} path={p} />
        ))}
      </section>

      <footer className="mu-foot">
        <div className="mu-foot-title">Need help deciding?</div>
        <div className="mu-foot-sub">
          NBOT can look at your current marks and recommend the path most likely to
          get you where you want to go.
        </div>
        <Link
          to={course ? "/companion?prompt=improve-marks&course=" + course.id : "/companion?prompt=improve-marks"}
          className="btn btn-primary mu-foot-cta"
        >
          Ask NBOT what to do <MiniArrow />
        </Link>
      </footer>
    </div>
  );
}

function PathCard({ path }) {
  const Icon = ICONS[path.icon] || RewriteIcon;
  return (
    <article className={`mu-card mu-card-${path.tone}`}>
      <div className="mu-card-head">
        <span className={`mu-card-icon mu-card-icon-${path.tone}`} aria-hidden="true">
          <Icon />
        </span>
        <div className="mu-card-head-text">
          <div className="mu-card-title">{path.title}</div>
          <div className="mu-card-sub">{path.sub}</div>
        </div>
      </div>

      <div className="mu-card-meta">
        <div className="mu-meta-item">
          <span className="mu-meta-label">Cost</span>
          <span className="mu-meta-value">{path.cost}</span>
        </div>
        <div className="mu-meta-item">
          <span className="mu-meta-label">Timeline</span>
          <span className="mu-meta-value">{path.duration}</span>
        </div>
      </div>

      <div className="mu-card-who">
        <span className="mu-card-who-label">Who it is for</span>
        <span className="mu-card-who-value">{path.who}</span>
      </div>

      <ol className="mu-card-steps">
        {path.how.map((step, i) => (
          <li key={i}>
            <span className="mu-step-num">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {path.cta.url ? (
        <a
          href={path.cta.url}
          target="_blank"
          rel="noreferrer noopener"
          className="btn btn-outline mu-card-cta"
        >
          {path.cta.label} <ExternalIcon />
        </a>
      ) : (
        <Link to={path.cta.to} className="btn btn-outline mu-card-cta">
          {path.cta.label} <MiniArrow />
        </Link>
      )}
    </article>
  );
}

const ICONS = {
  RewriteIcon,
  AdultIcon,
  ToolIcon,
  BookIcon,
  BriefcaseIcon,
};

function RewriteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
function AdultIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4S18.3 16.4 19.5 20" />
    </svg>
  );
}
function ToolIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0 5 5L21 9.5l-6.5 6.5L13 17l-2-2 6.7-6.7z" />
      <path d="m13 17-7.5 2.5L8 17l-2-2 2.5-7.5" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M13 4h5.5c.8 0 1.5.7 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H13z" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" /><path d="M11 13v2h2v-2" />
    </svg>
  );
}
function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
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
function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 4h5v5" /><path d="M20 4 10 14" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}
