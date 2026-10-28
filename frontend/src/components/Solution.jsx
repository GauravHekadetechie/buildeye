import React from "react";
import { motion } from "framer-motion";
import { Camera, Cpu, LineChart, BellRing, Database } from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Data ingestion",
    desc: "Daily site photos, DPR entries, BOQ & schedule sheets, weather feeds and vendor delivery logs — no new hardware needed.",
  },
  {
    icon: Cpu,
    title: "Preprocessing",
    desc: "Photos are aligned to floor/zone plans; text logs are parsed and normalised against the project's WBS.",
  },
  {
    icon: Camera,
    title: "AI models",
    desc: "A vision model reads physical progress from photos; time-series models forecast schedule, cost and safety risk.",
  },
  {
    icon: LineChart,
    title: "Risk scoring",
    desc: "Every zone and task gets a live 0–100 risk score across delay, cost and safety, refreshed as new data lands.",
  },
  {
    icon: BellRing,
    title: "Alerts",
    desc: "Threshold breaches push alerts to the site team and PMO instantly, ranked by severity.",
  },
];

export default function Solution() {
  return (
    <section id="solution" className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="max-w-2xl">
        <span className="tag-label">OUR SOLUTION</span>
        <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-mist">
          One pipeline, zero site hardware.
        </h2>
        <p className="mt-5 text-slate-soft">
          Buildeye replaces expensive sensor networks with computer vision and
          time-series models trained on the data every project already
          generates — photos, logs and schedules. That is the whole
          differentiator: intelligence without infrastructure.
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-5 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative"
          >
            <div className="blueprint-frame border border-ink-line bg-ink-panel/50 rounded-sm p-5 h-full">
              <step.icon size={22} className="text-signal" />
              <p className="mt-4 font-display text-lg text-mist">{step.title}</p>
              <p className="mt-2 text-sm text-slate-soft">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-3 w-4 h-px bg-ink-line" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
