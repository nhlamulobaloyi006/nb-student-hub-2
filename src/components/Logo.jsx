import { useState } from 'react';
import './Logo.css';

/**
 * Tries each of these extensions in order for /logos/<key>.<ext>.
 * First one that loads wins. If all fail, renders a monogram tile.
 */
const EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'svg'];

export default function Logo({ logoKey, name = '', size = 44, rounded = true }) {
  const [extIdx, setExtIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const config = MONOGRAMS[logoKey] || MONOGRAMS.generic;
  const radius = rounded ? Math.round(size * 0.27) : '50%';
  const fontSize = Math.max(10, Math.round(size * 0.30));

  const src = logoKey ? `/logos/${logoKey}.${EXTENSIONS[extIdx]}` : null;
  const showImage = src && !failed;

  function handleError() {
    if (extIdx < EXTENSIONS.length - 1) {
      setExtIdx(extIdx + 1);
    } else {
      setFailed(true);
    }
  }

  return (
    <span
      className="logo-tile"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: showImage && loaded ? 'transparent' : config.bg,
        color: config.fg,
        fontSize,
      }}
    >
      {showImage && (
        <img
          className="logo-img"
          src={src}
          alt={name || logoKey || ''}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          style={{ borderRadius: radius, display: loaded ? 'block' : 'none' }}
        />
      )}
      {(!showImage || !loaded) && (
        <span className="logo-mono">
          {config.mono || initials(name)}
        </span>
      )}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   Monogram fallbacks — colored tile + abbreviation
   ══════════════════════════════════════════════════════════ */

export const MONOGRAMS = {
  // Institutions
  uj:       { bg: '#F5C542', fg: '#0A0E1A', mono: 'UJ' },
  wits:     { bg: '#6366F1', fg: '#FFFFFF', mono: 'W' },
  uct:      { bg: '#22C55E', fg: '#0A0E1A', mono: 'UCT' },
  up:       { bg: '#EF4444', fg: '#FFFFFF', mono: 'UP' },
  tut:      { bg: '#F59E0B', fg: '#0A0E1A', mono: 'TUT' },
  dut:      { bg: '#0EA5E9', fg: '#FFFFFF', mono: 'DUT' },
  cput:     { bg: '#A855F7', fg: '#FFFFFF', mono: 'CPUT' },
  vut:      { bg: '#14B8A6', fg: '#FFFFFF', mono: 'VUT' },
  nwu:      { bg: '#DC2626', fg: '#FFFFFF', mono: 'NWU' },
  ufs:      { bg: '#2563EB', fg: '#FFFFFF', mono: 'UFS' },
  ru:       { bg: '#7C3AED', fg: '#FFFFFF', mono: 'RU' },
  sun:      { bg: '#B91C1C', fg: '#FFFFFF', mono: 'SU' },
  tvt:      { bg: '#0891B2', fg: '#FFFFFF', mono: 'TNC' },
  fetc:     { bg: '#1D4ED8', fg: '#FFFFFF', mono: 'FBC' },
  rosebank: { bg: '#B45309', fg: '#FFFFFF', mono: 'RC' },
  varsity:  { bg: '#166534', fg: '#FFFFFF', mono: 'VC' },

  // Funding providers
  nsfas:        { bg: '#F5C542', fg: '#0A0E1A', mono: 'NSFAS' },
  sasol:        { bg: '#0057B8', fg: '#FFFFFF', mono: 'Sasol' },
  mtn:          { bg: '#FFCC00', fg: '#0A0E1A', mono: 'MTN' },
  dhet:         { bg: '#1E40AF', fg: '#FFFFFF', mono: 'DHET' },
  dbe:          { bg: '#166534', fg: '#FFFFFF', mono: 'DBE' },
  nrf:          { bg: '#7C3AED', fg: '#FFFFFF', mono: 'NRF' },
  anglo:        { bg: '#0F766E', fg: '#FFFFFF', mono: 'AA' },
  investec:     { bg: '#0A0E1A', fg: '#F5C542', mono: 'INV' },
  standardbank: { bg: '#0033A1', fg: '#FFFFFF', mono: 'SB' },
  discovery:    { bg: '#8B1D74', fg: '#FFFFFF', mono: 'DISC' },
  eskom:        { bg: '#EE7623', fg: '#FFFFFF', mono: 'ESC' },
  transnet:     { bg: '#0E7C42', fg: '#FFFFFF', mono: 'TFR' },
  sasria:       { bg: '#334155', fg: '#FFFFFF', mono: 'SAS' },
  sita:         { bg: '#0EA5E9', fg: '#FFFFFF', mono: 'SITA' },
  merseta:      { bg: '#B45309', fg: '#FFFFFF', mono: 'mer' },
  foodbev:      { bg: '#D97706', fg: '#FFFFFF', mono: 'FB' },
  agriseta:     { bg: '#65A30D', fg: '#FFFFFF', mono: 'AGRI' },
  ceta:         { bg: '#B91C1C', fg: '#FFFFFF', mono: 'CETA' },
  netcare:      { bg: '#0E7490', fg: '#FFFFFF', mono: 'NET' },
  absa:         { bg: '#C8102E', fg: '#FFFFFF', mono: 'ABSA' },

  // Extra keys seen in your /public/logos folder
  boston:       { bg: '#0E7490', fg: '#FFFFFF', mono: 'BC' },
  gcc:          { bg: '#DC2626', fg: '#FFFFFF', mono: 'GCC' },
  mict:         { bg: '#0F172A', fg: '#FFFFFF', mono: 'MICT' },
  ntc:          { bg: '#0891B2', fg: '#FFFFFF', mono: 'NTC' },
  tsc:          { bg: '#166534', fg: '#FFFFFF', mono: 'TSC' },
  jc:           { bg: '#7C3AED', fg: '#FFFFFF', mono: 'JC' },

  // Fallback
  generic:      { bg: '#334155', fg: '#FFFFFF', mono: '·' },
};

function initials(name) {
  if (!name) return '·';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
