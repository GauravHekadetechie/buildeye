import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import RiskGauge from "./RiskGauge.jsx";

const inputs = [
  "Site photos & drone captures",
  "Daily progress reports (DPR)",
  "Schedule / WBS baseline",
  "Labour attendance logs",
  "Material delivery & BOQ data",
  "IMD rainfall & weather data",
];

const accuracyData = [
  { model: "Progress CNN", accuracy: 91.4 },
  { model: "Delay LSTM", accuracy: 87.2 },
  { model: "Cost XGBoost", accuracy: 89.6 },
  { model: "Safety CV", accuracy: 93.8 },
];

export default function HowAIWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
      <span className="tag-label">HOW THE AI MODEL WORKS</span>
      <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-mist max-w-2xl">
        Four models, one composite risk score per project.
      </h2>

      <div className="mt-16 grid lg:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="tag-label mb-3">INPUT FEATURES</p>
          <ul className="space-y-2">
            {inputs.map((f) => (
              <li key={f} className="flex items-center gap-3 text-slate-soft">
                <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                {f}
              </li>
            ))}
          </ul>

          <p className="tag-label mt-8 mb-3">MODEL ENSEMBLE</p>
          <p className="text-slate-soft">
            A CNN reads sequences of site photos to estimate physical progress
            and detect visual anomalies (cracks, incomplete fit-out). An
            LSTM/XGBoost ensemble combines that progress signal with
            schedule, weather and labour data to forecast delay and cost
            risk. A separate CV safety model scans photos for PPE and
            hazard-zone compliance.
          </p>

          <div className="mt-8 h-56">
            <p className="tag-label mb-2">ILLUSTRATIVE MODEL ACCURACY</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="#1E2A3F" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#8593AC" fontSize={11} />
                <YAxis type="category" dataKey="model" stroke="#8593AC" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{ background: "#101828", border: "1px solid #1E2A3F", fontSize: 12 }}
                  labelStyle={{ color: "#EDF1F7" }}
                />
                <Bar dataKey="accuracy" fill="#2F80ED" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="tag-label mb-3">TRY IT — DRAG THE SLIDERS</p>
          <RiskGauge />
        </motion.div>
      </div>
    </section>
  );
}
