import { useEffect, useState } from 'react';
import './SplashScreen.css';

/**
 * Full-screen splash shown on cold start.
 *
 * Stages:
 *   'ring'  — only the SVG ring is drawing (0 → 550ms)
 *   'logo'  — logo fades in, wordmark follows (550ms → duration-350)
 *   'out'   — fade out (duration-350 → duration)
 *
 * @param {function} onDone  called once the splash has fully faded
 * @param {number}   duration  total ms; default 1600
 * @param {string}   logoSrc   path to logo file; default /logos/app-icon.png
 */
export default function SplashScreen({
  onDone,
  duration = 1600,
  logoSrc = '/logos/logo.png',
}) {
  const [stage, setStage] = useState('ring');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const toLogo = setTimeout(() => setStage('logo'), 550);
    const toOut = setTimeout(() => setStage('out'), Math.max(600, duration - 350));
    const done = setTimeout(() => onDone?.(), duration);

    return () => {
      clearTimeout(toLogo);
      clearTimeout(toOut);
      clearTimeout(done);
    };
  }, [duration, onDone]);

  const showFallback = imageFailed;

  return (
    <div className={`splash ${stage === 'out' ? 'fade-out' : ''}`}>
      <div className="splash-ring-wrap">
        {/* Animated ring */}
        <svg
          className="splash-ring"
          viewBox="0 0 200 200"
          width="220"
          height="220"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="splash-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5C542" />
              <stop offset="50%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="3"
          />

          {/* Animated stroke */}
          <circle
            className="splash-ring-stroke"
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="url(#splash-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="502.65"
            strokeDashoffset="502.65"
          />
        </svg>

        {/* Logo — real image if present, monogram fallback otherwise */}
        {!showFallback && (
          <img
            src={logoSrc}
            alt="NB Student Hub"
            className={`splash-logo ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageFailed(true);
              setImageLoaded(true);
            }}
          />
        )}

        {showFallback && (
          <div className={`splash-logo-fallback ${imageLoaded ? 'loaded' : ''}`}>
            <BrandMark />
          </div>
        )}

        {/* Wordmark */}
        <div className={`splash-wordmark ${stage !== 'ring' ? 'loaded' : ''}`}>
        </div>
      </div>
    </div>
  );
}

/* Inline brand mark — used when the logo file is missing */
function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" width="72" height="72" aria-hidden="true">
      <path
        d="M16 4.5 L18.6 13.4 L27.5 16 L18.6 18.6 L16 27.5 L13.4 18.6 L4.5 16 L13.4 13.4 Z"
        fill="#0A0E1A"
      />
      <circle cx="16" cy="16" r="1.6" fill="#F5C542" />
    </svg>
  );
}
