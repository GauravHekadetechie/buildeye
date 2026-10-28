import React from "react";

export default function RoomOverlay({ imageUrl, rooms, northAngle }) {
  return (
    <div className="relative border border-ink-line rounded-sm overflow-hidden bg-ink">
      <img src={imageUrl} alt="Uploaded blueprint" className="w-full h-auto block" />

      {rooms.map((r) => (
        <div
          key={r.name + r.box.xPct}
          className="absolute border border-beam/70 bg-beam/5"
          style={{
            left: `${r.box.xPct}%`,
            top: `${r.box.yPct}%`,
            width: `${r.box.wPct}%`,
            height: `${r.box.hPct}%`,
          }}
        >
          <span className="absolute -top-5 left-0 tag-label bg-ink/90 px-1.5 py-0.5 whitespace-nowrap text-beam">
            {r.name}
          </span>
        </div>
      ))}

      {/* compass rose */}
      <div
        className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-ink/80 border border-ink-line flex items-center justify-center"
        title={`North is ${northAngle}° from the top of the image`}
      >
        <svg viewBox="0 0 40 40" width="30" height="30" style={{ transform: `rotate(${northAngle}deg)` }}>
          <circle cx="20" cy="20" r="18" fill="none" stroke="#1E2A3F" strokeWidth="1.5" />
          <polygon points="20,4 24,20 20,17 16,20" fill="#2F80ED" />
          <polygon points="20,36 24,20 20,23 16,20" fill="#8593AC" />
          <text x="20" y="12" fontSize="6" fill="#2F80ED" textAnchor="middle">N</text>
        </svg>
      </div>
    </div>
  );
}
