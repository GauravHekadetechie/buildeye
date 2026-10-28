import React from "react";
import { motion } from "framer-motion";

export default function AuthSidePanel() {
  return (
    <div className="hidden lg:flex relative flex-col justify-between p-12 bg-ink-panel/40 border-r border-ink-line overflow-hidden">
      <div className="absolute inset-0 bg-blueprint bg-grid opacity-40" />

      <div className="relative">
        <span className="tag-label">SECURE ACCESS</span>
        <h2 className="mt-4 font-display text-3xl text-mist max-w-sm">
          Your projects, your risk data — encrypted end to end.
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <svg viewBox="0 0 300 220" className="w-full h-auto">
          <rect x="20" y="60" width="60" height="140" fill="#131F35" stroke="#1E2A3F" />
          <rect x="90" y="30" width="70" height="170" fill="#131F35" stroke="#2F80ED" strokeOpacity="0.4" />
          <rect x="170" y="80" width="55" height="120" fill="#131F35" stroke="#1E2A3F" />
          <motion.circle
            cx="150"
            cy="100"
            r="6"
            fill="#F2994A"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <path
            d="M20 200 H240"
            stroke="#1E2A3F"
            strokeWidth="1"
          />
        </svg>
      </motion.div>

      <p className="relative tag-label text-slate-soft/70 max-w-xs">
        PASSWORDS ARE HASHED WITH BCRYPT. SESSIONS USE SIGNED JWTS.
      </p>
    </div>
  );
}
