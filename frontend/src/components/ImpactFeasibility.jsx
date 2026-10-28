import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const costData = [
  { setup: "Sensor / IoT monitoring", cost: 100 },
  { setup: "Buildeye (photos + logs only)", cost: 12 },
];

export default function ImpactFeasibility() {
  return (
    <section id="impact" className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
      <span className="tag-label">IMPACT & FEASIBILITY</span>
      <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-mist max-w-2xl">
        Built to scale across sites that can't afford sensor networks.
      </h2>

      <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="h-72"
        >
          <p className="tag-label mb-2">ILLUSTRATIVE SETUP COST INDEX (LOWER IS BETTER)</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid stroke="#1E2A3F" horizontal={false} />
              <XAxis type="number" stroke="#8593AC" fontSize={11} />
              <YAxis type="category" dataKey="setup" stroke="#8593AC" fontSize={11} width={170} />
              <Tooltip contentStyle={{ background: "#101828", border: "1px solid #1E2A3F", fontSize: 12 }} />
              <Bar dataKey="cost" radius={[0, 3, 3, 0]}>
                <Bar dataKey="cost" fill="#F2994A" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <FeaturePoint
            title="No capital expenditure on hardware"
            desc="Runs entirely on photos, schedules and logs already produced on any site."
          />
          <FeaturePoint
            title="Deploys per project in days, not months"
            desc="No cabling, no sensor calibration, no procurement cycle."
          />
          <FeaturePoint
            title="Aligned with Digital Mining / Digital India goals"
            desc="Fits national pushes for low-cost, data-driven infrastructure monitoring."
          />
        </motion.div>
      </div>
    </section>
  );
}

function FeaturePoint({ title, desc }) {
  return (
    <div className="border-l-2 border-signal pl-5">
      <p className="font-display text-mist">{title}</p>
      <p className="mt-1 text-sm text-slate-soft">{desc}</p>
    </div>
  );
}
