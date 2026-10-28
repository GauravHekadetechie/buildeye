import React, { useMemo } from "react";

// Tiny self-contained seeded RNG (mulberry32) so the same
// rooms+style+variant combination always renders the same illustration,
// but a different variant produces a visibly different arrangement.
function seededRng(seedString) {
  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = (h ^= h >>> 16) >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PRIORITY = [
  "Kitchen",
  "Master Bedroom",
  "Bedroom 2",
  "Bedroom 3",
  "Living Room",
  "Dining Area",
  "Bathroom 1",
  "Bathroom 2",
  "Pooja Room",
  "Study/Home Office",
  "Balcony",
  "Garage",
  "Utility Area",
];

function pickPrimaryRoom(rooms) {
  for (const type of PRIORITY) {
    if (rooms.includes(type)) return type;
  }
  return rooms[0] || "Living Room";
}

export default function SectionIllustration({ rooms, palette, variant = 0 }) {
  const primary = pickPrimaryRoom(rooms);
  const rng = useMemo(() => seededRng(`${rooms.join("|")}-${variant}`), [rooms, variant]);

  // Shared randomised layout knobs so every variant looks a little different.
  const windowX = 60 + Math.round(rng() * 100);
  const windowW = 70 + Math.round(rng() * 30);
  const accentShift = Math.round(rng() * 20) - 10;

  return (
    <svg viewBox="0 0 400 260" className="w-full h-auto rounded-sm border border-ink-line">
      {/* back wall */}
      <rect x="0" y="0" width="400" height="200" fill={palette.wall} />
      {/* floor */}
      <rect x="0" y="200" width="400" height="60" fill={palette.floor} />
      {/* skirting line */}
      <rect x="0" y="196" width="400" height="4" fill={palette.trim} opacity="0.4" />

      {/* window */}
      <rect x={windowX} y="30" width={windowW} height="90" fill="#0A0F1C" opacity="0.15" stroke={palette.trim} strokeWidth="3" />
      <line x1={windowX + windowW / 2} y1="30" x2={windowX + windowW / 2} y2="120" stroke={palette.trim} strokeWidth="2" />
      <line x1={windowX} y1="75" x2={windowX + windowW} y2="75" stroke={palette.trim} strokeWidth="2" />

      {/* accent wall strip */}
      <rect x={250 + accentShift} y="0" width="40" height="200" fill={palette.accent} opacity="0.12" />

      <RoomScene type={primary} palette={palette} rng={rng} />
    </svg>
  );
}

function RoomScene({ type, palette, rng }) {
  const shiftX = Math.round(rng() * 24) - 12;

  switch (type) {
    case "Kitchen":
      return (
        <g transform={`translate(${shiftX},0)`}>
          <rect x="30" y="150" width="180" height="55" fill={palette.trim} opacity="0.85" />
          <rect x="30" y="130" width="180" height="20" fill={palette.accent} opacity="0.7" />
          <circle cx="70" cy="160" r="10" fill="#0A0F1C" opacity="0.5" />
          <circle cx="100" cy="160" r="10" fill="#0A0F1C" opacity="0.5" />
          <rect x="230" y="120" width="60" height="85" fill={palette.trim} opacity="0.6" />
        </g>
      );
    case "Master Bedroom":
    case "Bedroom 2":
    case "Bedroom 3":
      return (
        <g transform={`translate(${shiftX},0)`}>
          <rect x="60" y="150" width="140" height="55" rx="6" fill={palette.accent} opacity="0.55" />
          <rect x="60" y="140" width="140" height="18" rx="4" fill="#EDF1F7" opacity="0.85" />
          <rect x="70" y="130" width="35" height="18" rx="4" fill="#EDF1F7" />
          <rect x="215" y="165" width="30" height="40" fill={palette.trim} opacity="0.6" />
        </g>
      );
    case "Living Room":
      return (
        <g transform={`translate(${shiftX},0)`}>
          <rect x="40" y="160" width="130" height="45" rx="10" fill={palette.accent} opacity="0.6" />
          <rect x="190" y="175" width="55" height="30" fill={palette.trim} opacity="0.5" />
          <rect x="260" y="90" width="70" height="45" fill="#0A0F1C" opacity="0.55" />
        </g>
      );
    case "Dining Area":
      return (
        <g transform={`translate(${shiftX},0)`}>
          <rect x="90" y="170" width="120" height="12" fill={palette.trim} opacity="0.7" />
          <rect x="100" y="182" width="8" height="24" fill={palette.trim} opacity="0.7" />
          <rect x="192" y="182" width="8" height="24" fill={palette.trim} opacity="0.7" />
          <rect x="60" y="150" width="24" height="30" fill={palette.accent} opacity="0.5" />
          <rect x="220" y="150" width="24" height="30" fill={palette.accent} opacity="0.5" />
        </g>
      );
    case "Bathroom 1":
    case "Bathroom 2":
      return (
        <g transform={`translate(${shiftX},0)`}>
          <rect x="50" y="165" width="110" height="40" rx="16" fill="#EDF1F7" opacity="0.75" />
          <rect x="200" y="120" width="50" height="60" fill={palette.trim} opacity="0.4" />
          <rect x="210" y="130" width="30" height="40" fill="#EDF1F7" opacity="0.5" />
        </g>
      );
    case "Study/Home Office":
      return (
        <g transform={`translate(${shiftX},0)`}>
          <rect x="80" y="165" width="130" height="12" fill={palette.trim} opacity="0.7" />
          <rect x="90" y="177" width="8" height="28" fill={palette.trim} opacity="0.7" />
          <rect x="192" y="177" width="8" height="28" fill={palette.trim} opacity="0.7" />
          <rect x="130" y="140" width="50" height="25" fill={palette.accent} opacity="0.5" />
        </g>
      );
    case "Pooja Room":
      return (
        <g transform={`translate(${shiftX},0)`}>
          <rect x="150" y="140" width="60" height="65" fill={palette.trim} opacity="0.5" />
          <polygon points="150,140 180,110 210,140" fill={palette.accent} opacity="0.7" />
        </g>
      );
    case "Balcony":
      return (
        <g transform={`translate(${shiftX},0)`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={40 + i * 20} y1="150" x2={40 + i * 20} y2="205" stroke={palette.trim} strokeWidth="3" opacity="0.6" />
          ))}
          <rect x="35" y="145" width="170" height="6" fill={palette.trim} opacity="0.7" />
        </g>
      );
    case "Garage":
      return (
        <g transform={`translate(${shiftX},0)`}>
          <rect x="70" y="160" width="160" height="35" rx="10" fill={palette.accent} opacity="0.55" />
          <circle cx="100" cy="200" r="10" fill={palette.trim} />
          <circle cx="200" cy="200" r="10" fill={palette.trim} />
        </g>
      );
    default:
      return (
        <g transform={`translate(${shiftX},0)`}>
          <rect x="80" y="160" width="130" height="40" rx="8" fill={palette.accent} opacity="0.5" />
        </g>
      );
  }
}
