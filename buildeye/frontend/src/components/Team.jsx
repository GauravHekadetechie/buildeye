import React from "react";
import { motion } from "framer-motion";

const team = [
  { name: "[Team Member 1]", role: "Team Lead / Full-Stack", expertise: "React, Node.js, system design" },
  { name: "[Team Member 2]", role: "ML Engineer", expertise: "Computer vision, CNNs" },
  { name: "[Team Member 3]", role: "ML Engineer", expertise: "Time-series forecasting, XGBoost" },
  { name: "[Team Member 4]", role: "Backend Engineer", expertise: "APIs, auth, databases" },
  { name: "[Team Member 5]", role: "UI/UX & Frontend", expertise: "Design systems, motion" },
  { name: "[Team Member 6]", role: "Research & Domain", expertise: "Construction workflows, data sourcing" },
];

export default function Team() {
  return (
    <section className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
      <span className="tag-label">TEAM</span>
      <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-mist max-w-2xl">
        [Team Name]
      </h2>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {team.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="border border-ink-line bg-ink-panel/40 rounded-sm p-5"
          >
            <div className="w-12 h-12 rounded-full bg-ink-line flex items-center justify-center font-display text-signal">
              {m.name.replace(/[\[\]]/g, "").charAt(0)}
            </div>
            <p className="mt-4 font-display text-mist">{m.name}</p>
            <p className="text-sm text-beam">{m.role}</p>
            <p className="mt-2 text-sm text-slate-soft">{m.expertise}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
