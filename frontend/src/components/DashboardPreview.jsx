import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
      <span className="tag-label">LIVE DASHBOARD</span>
      <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-mist max-w-2xl">
        Every zone, every risk, on one screen.
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative mt-12 blueprint-frame border border-ink-line rounded-sm overflow-hidden"
      >
        <div className="pointer-events-none select-none blur-sm opacity-60 grid grid-cols-4 gap-3 p-8 bg-ink-panel/40">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 border border-ink-line rounded-sm bg-ink" />
          ))}
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/70">
          <div className="w-12 h-12 rounded-full border border-signal/50 flex items-center justify-center">
            <Lock size={18} className="text-signal" />
          </div>
          <p className="text-mist font-display">Log in to view live predictions</p>
          <Link
            to="/login"
            className="bg-signal hover:bg-signal-dim text-ink font-medium px-6 py-2.5 rounded-sm transition-colors"
          >
            Access dashboard
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
