import React from "react";
import { motion } from "framer-motion";

const levels = [
  { name: "Low", color: "#3CCB7F", desc: "Within tolerance. Logged for the weekly report." },
  { name: "Medium", color: "#F2C94C", desc: "Trending off-plan. Flagged to the site engineer." },
  { name: "High", color: "#F2994A", desc: "Action needed within 24 hours. PMO notified." },
  { name: "Critical", color: "#EB5757", desc: "Immediate escalation to project lead and client." },
];

export default function AlertSystem() {
  return (
    <section className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="tag-label">ALERT SYSTEM</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-mist">
            Alerts reach people, not just dashboards.
          </h2>
          <p className="mt-5 text-slate-soft">
            When a risk score crosses a threshold, Buildeye fires an alert
            through SMS, email or in-app push — routed by severity so a
            critical safety flag doesn't sit in the same queue as a minor
            schedule drift. Escalation levels below are illustrative
            defaults; thresholds are configurable per project.
          </p>
        </motion.div>

        <div className="space-y-3">
          {levels.map((l, i) => (
            <motion.div
              key={l.name}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center gap-4 border border-ink-line bg-ink-panel/40 rounded-sm p-4"
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
              <div>
                <p className="font-display text-mist">{l.name}</p>
                <p className="text-sm text-slate-soft">{l.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
