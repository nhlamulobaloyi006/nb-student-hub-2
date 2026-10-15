import './Placeholder.css';

export default function Placeholder({ title, phase, description }) {
  return (
    <div className="placeholder">
      <div className="placeholder-card">
        <div className="placeholder-badge">Phase {phase}</div>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-sub">
          {description || 'This screen is scaffolded and coming in a later phase.'}
        </p>
        <div className="placeholder-hint">
          Routes, layout, and auth are wired. Feature code lands next.
        </div>
      </div>
    </div>
  );
}
