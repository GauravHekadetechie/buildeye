import React from "react";

export default function Logo({ className = "h-8 w-auto", withWordmark = true }) {
  return (
    <div className={`flex items-center gap-2 ${withWordmark ? "" : ""}`}>
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        {/* Eye outline */}
        <path
          d="M4 32C12 18 24 12 32 12C40 12 52 18 60 32C52 46 40 52 32 52C24 52 12 46 4 32Z"
          fill="none"
          stroke="#2F80ED"
          strokeWidth="4"
        />
        {/* Iris */}
        <circle cx="32" cy="32" r="11" fill="#2F80ED" />
        <circle cx="32" cy="32" r="4.5" fill="#0A0F1C" />
        {/* Skyline accent sitting on the brow line, echoing the construction mark */}
        <rect x="20" y="6" width="4" height="10" fill="#F2994A" />
        <rect x="27" y="2" width="4" height="14" fill="#F2994A" />
        <rect x="34" y="7" width="4" height="9" fill="#F2994A" />
      </svg>
      {withWordmark && (
        <span className="font-display text-xl font-semibold tracking-tight">
          <span className="text-mist">Build</span>
          <span className="text-beam">eye</span>
        </span>
      )}
    </div>
  );
}
