import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, PlayCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <div className="absolute inset-0 bg-blueprint bg-grid [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto w-full px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="tag-label inline-block border border-ink-line rounded-sm px-3 py-1 mb-6">
            AI CONSTRUCTION INTELLIGENCE
          </span>

          <h1 className="font-display text-4xl md:text-6xl leading-[1.08] font-semibold text-mist">
            Every project, mapped, tracked and predicted before problems reach the site.
          </h1>

          <p className="mt-6 text-lg text-slate-soft max-w-lg">
            Buildeye turns your schedule, site photos and daily logs into a living AI
            roadmap — flagging delay, cost and safety risk weeks before they show up
            in a progress report.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 bg-signal hover:bg-signal-dim text-ink font-medium px-6 py-3 rounded-sm transition-colors"
            >
              View live dashboard
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-mist border border-ink-line hover:border-signal px-6 py-3 rounded-sm transition-colors"
            >
              <PlayCircle size={18} />
              See how it works
            </a>
          </div>

          <div className="mt-12 flex items-center gap-8 tag-label">
            <span>NO SITE HARDWARE REQUIRED</span>
            <span className="w-1 h-1 rounded-full bg-ink-line" />
            <span>WORKS FROM DAY-1 SITE PHOTOS</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <SiteVisionGraphic />
        </motion.div>
      </div>
    </section>
  );
}

function SiteVisionGraphic() {
  return (
    <div className="relative blueprint-frame border border-ink-line bg-ink-panel/60 rounded-sm p-6">
      <svg viewBox="0 0 400 340" className="w-full h-auto">
        {/* Skyline silhouette under construction */}
        <rect x="30" y="160" width="60" height="140" fill="#131F35" stroke="#1E2A3F" />
        <rect x="100" y="100" width="70" height="200" fill="#131F35" stroke="#1E2A3F" />
        <rect x="180" y="60" width="80" height="240" fill="#101828" stroke="#2F80ED" strokeOpacity="0.5" />
        <rect x="270" y="130" width="60" height="170" fill="#131F35" stroke="#1E2A3F" />

        {/* crane */}
        <line x1="220" y1="60" x2="220" y2="20" stroke="#F2994A" strokeWidth="2" />
        <line x1="220" y1="20" x2="300" y2="20" stroke="#F2994A" strokeWidth="2" />
        <line x1="220" y1="20" x2="180" y2="30" stroke="#F2994A" strokeWidth="2" />
        <line x1="270" y1="20" x2="270" y2="45" stroke="#F2994A" strokeWidth="2" />

        {/* scan line */}
        <motion.line
          x1="10"
          x2="390"
          stroke="#2F80ED"
          strokeWidth="1.5"
          initial={{ y1: 40, y2: 40, opacity: 0.9 }}
          animate={{ y1: [40, 320, 40], y2: [40, 320, 40] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* detection boxes - simulate AI progress-tracking overlay */}
        {[
          { x: 105, y: 130, w: 55, h: 45, label: "Framing 62%" },
          { x: 190, y: 90, w: 60, h: 50, label: "Facade 38%" },
          { x: 40, y: 210, w: 45, h: 40, label: "Interior 81%" },
        ].map((box, i) => (
          <g key={i}>
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              fill="none"
              stroke="#F2994A"
              strokeDasharray="4 3"
              strokeWidth="1.5"
            />
            <text x={box.x} y={box.y - 6} className="tag-label" fill="#8593AC" fontSize="9">
              {box.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute -bottom-5 -right-5 bg-ink-panel border border-ink-line rounded-sm px-4 py-3 tag-label">
        <p className="text-mist text-sm font-mono mb-1">Risk score</p>
        <p className="text-2xl font-display text-beam">58<span className="text-sm text-slate-soft">/100</span></p>
      </div>
    </div>
  );
}
