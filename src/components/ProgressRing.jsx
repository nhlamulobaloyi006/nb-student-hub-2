import './ProgressRing.css';

/**
 * SVG donut progress ring.
 *
 * @param {number} value     0-100 (clamped)
 * @param {number} size      outer px (default 96)
 * @param {number} stroke    stroke width px (default 8)
 * @param {string} tone      'gold' | 'success' | 'info' (default 'gold')
 * @param {node}   children  optional center content (defaults to "NN%")
 */
export default function ProgressRing({
  value = 0,
  size = 96,
  stroke = 8,
  tone = 'gold',
  children,
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className={`ring ring-${tone}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="ring-value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-center">
        {children ?? <span className="ring-pct">{Math.round(pct)}%</span>}
      </div>
    </div>
  );
}
