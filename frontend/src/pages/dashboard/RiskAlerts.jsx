import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios.js";
import RiskBadge from "../../components/RiskBadge.jsx";

export default function RiskAlerts() {
  const [alerts, setAlerts] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.get("/dashboard/alerts").then((res) => setAlerts(res.data.alerts));
  }, []);

  const filtered = alerts?.filter((a) => filter === "All" || a.severity === filter) || [];

  return (
    <div>
      <header className="mb-8">
        <p className="tag-label">RISK & ALERTS</p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">Live alert feed</h1>
        <p className="text-sm text-slate-soft mt-1">Ranked by severity across schedule, cost and safety risk.</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Critical", "High", "Medium", "Low"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
              filter === f ? "border-signal text-signal bg-signal/5" : "border-ink-line text-slate-soft hover:text-mist"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {!alerts &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-sm border border-ink-line bg-ink-panel/30 animate-pulse" />
          ))}

        {filtered.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="border border-ink-line bg-ink-panel/30 rounded-sm p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <RiskBadge level={a.severity} />
                  <span className="tag-label">{a.category.toUpperCase()}</span>
                </div>
                <p className="text-sm text-mist">{a.message}</p>
                <p className="text-xs text-slate-soft mt-2">
                  {a.projectId} · detected by {a.detectedBy}
                </p>
              </div>
              <span className="text-xs text-slate-soft whitespace-nowrap">
                {new Date(a.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
