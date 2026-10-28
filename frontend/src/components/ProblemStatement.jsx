import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "77%", label: "of large construction projects run behind schedule", note: "illustrative, industry-pattern figure" },
  { value: "₹1.2L Cr", label: "estimated annual cost overruns across Indian infrastructure", note: "illustrative" },
  { value: "48hrs+", label: "average delay before a site delay is reported up the chain", note: "illustrative" },
  { value: "1 in 9", label: "site safety incidents linked to missed early-warning signs", note: "illustrative" },
];

export default function ProblemStatement() {
  return (
    <section className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="tag-label">THE PROBLEM</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-mist">
            Construction runs on plans. Reality runs on its own schedule.
          </h2>
          <p className="mt-5 text-slate-soft max-w-md">
            Site managers track progress with spreadsheets and weekly walk-throughs.
            By the time a delay, cost overrun or safety lapse is visible in a
            report, it has usually already cost days and money. Sensor-based
            monitoring exists, but installing IoT hardware across every floor,
            crane and yard is expensive and rarely covers a whole site.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="blueprint-frame border border-ink-line bg-ink-panel/50 rounded-sm p-5"
            >
              <p className="font-display text-3xl text-signal">{s.value}</p>
              <p className="mt-2 text-sm text-mist">{s.label}</p>
              <p className="mt-3 tag-label text-slate-soft/70">{s.note}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
