import React from "react";
import { motion } from "framer-motion";

const nodes = [
  { title: "React frontend", detail: "Vite + Tailwind + Framer Motion" },
  { title: "Express API", detail: "Auth, JWT, REST endpoints" },
  { title: "ML microservice", detail: "Python · scikit-learn / TensorFlow /predict" },
  { title: "Database", detail: "Users, projects, predictions" },
  { title: "Alerts", detail: "SMS / Email / in-app push" },
];

export default function Architecture() {
  return (
    <section className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
      <span className="tag-label">SYSTEM ARCHITECTURE</span>
      <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-mist max-w-2xl">
        A straightforward stack, built to swap the mock model for a real one.
      </h2>

      <div className="mt-16 overflow-x-auto">
        <div className="flex items-stretch gap-3 min-w-[860px] md:min-w-0">
          {nodes.map((n, i) => (
            <React.Fragment key={n.title}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="blueprint-frame flex-1 border border-ink-line bg-ink-panel/50 rounded-sm p-5"
              >
                <p className="tag-label">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 font-display text-mist">{n.title}</p>
                <p className="mt-1 text-sm text-slate-soft">{n.detail}</p>
              </motion.div>
              {i < nodes.length - 1 && (
                <div className="flex items-center text-signal/60 text-xl">›</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-soft max-w-2xl">
        The frontend and Express API in this repo are fully working. The ML
        microservice is stubbed with realistic mock JSON at{" "}
        <code className="text-signal">/api/dashboard/predict</code> — see the
        README for how to point it at a real Python model.
      </p>
    </section>
  );
}
