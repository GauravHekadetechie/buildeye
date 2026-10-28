import React, { useState } from "react";
import { motion } from "framer-motion";

const zones = [
  { id: "Z1", label: "Tower A - Podium", stage: "Structural framing", progress: 62, confidence: 94 },
  { id: "Z2", label: "Tower A - Facade", stage: "Facade cladding", progress: 38, confidence: 88 },
  { id: "Z3", label: "Tower B - Interiors", stage: "MEP rough-in", progress: 81, confidence: 91 },
  { id: "Z4", label: "Site - Earthwork", stage: "Compaction & grading", progress: 95, confidence: 97 },
  { id: "Z5", label: "Tower B - Terrace", stage: "Waterproofing", progress: 20, confidence: 76 },
  { id: "Z6", label: "Boundary Wall", stage: "Not yet started", progress: 4, confidence: 99 },
];

export default function ProgressTracking() {
  const [active, setActive] = useState(zones[0]);

  return (
    <div>
      <header className="mb-8">
        <p className="tag-label">AI PROGRESS TRACKING</p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">
          Progress read directly from site photos
        </h1>
        <p className="text-sm text-slate-soft mt-1 max-w-xl">
          Each zone below is scored by the site-progress CNN against the
          latest uploaded photo set. Click a zone to see the model's read-out.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {zones.map((z, i) => (
            <motion.button
              key={z.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              onClick={() => setActive(z)}
              className={`text-left border rounded-sm p-4 transition-colors ${
                active.id === z.id ? "border-signal bg-signal/5" : "border-ink-line bg-ink-panel/30 hover:border-ink-line/80"
              }`}
            >
              <p className="tag-label">{z.id}</p>
              <p className="mt-1 font-display text-mist text-sm">{z.label}</p>
              <p className="text-xs text-slate-soft mt-1">{z.stage}</p>
              <div className="mt-3 h-1.5 bg-ink-line rounded-full overflow-hidden">
                <div className="h-full bg-signal" style={{ width: `${z.progress}%` }} />
              </div>
              <p className="text-xs text-slate-soft mt-1">{z.progress}% complete</p>
            </motion.button>
          ))}
        </div>

        <div className="blueprint-frame border border-ink-line bg-ink-panel/40 rounded-sm p-5 h-fit">
          <p className="tag-label mb-3">VISION MODEL READ-OUT</p>
          <div className="aspect-video bg-ink rounded-sm border border-dashed border-ink-line flex items-center justify-center relative overflow-hidden mb-4">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <rect x="0" y="0" width="200" height="120" fill="#0A0F1C" />
              <rect x="20" y="20" width="160" height="80" fill="none" stroke="#F2994A" strokeDasharray="3 3" />
              <text x="24" y="34" fontSize="8" fill="#F2994A">
                {active.stage}
              </text>
            </svg>
          </div>
          <dl className="space-y-3 text-sm">
            <Row label="Zone" value={active.label} />
            <Row label="Detected stage" value={active.stage} />
            <Row label="Estimated progress" value={`${active.progress}%`} />
            <Row label="Model confidence" value={`${active.confidence}%`} />
            <Row label="Source" value="Weekly drone capture (mock)" />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-ink-line/60 pb-2">
      <dt className="text-slate-soft">{label}</dt>
      <dd className="text-mist text-right">{value}</dd>
    </div>
  );
}
