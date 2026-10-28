import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

// Pure front-end mock of the schedule-risk model's behaviour, so judges/users
// can play with the demo without a live backend call. The real /predict
// endpoint in the backend implements the same shape of logic server-side.
function computeRisk({ scheduleSlip, weather, laborShortfall }) {
  const raw = scheduleSlip * 1.4 + weather * 6 + laborShortfall * 0.9;
  return Math.max(2, Math.min(98, Math.round(raw)));
}

function riskMeta(score) {
  if (score >= 75) return { label: "Critical", color: "#EB5757" };
  if (score >= 50) return { label: "High", color: "#F2994A" };
  if (score >= 25) return { label: "Medium", color: "#F2C94C" };
  return { label: "Low", color: "#3CCB7F" };
}

export default function RiskGauge() {
  const [scheduleSlip, setScheduleSlip] = useState(10);
  const [weather, setWeather] = useState(3);
  const [laborShortfall, setLaborShortfall] = useState(15);

  const score = useMemo(
    () => computeRisk({ scheduleSlip, weather, laborShortfall }),
    [scheduleSlip, weather, laborShortfall]
  );
  const meta = riskMeta(score);
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="blueprint-frame border border-ink-line bg-ink-panel/50 rounded-sm p-6 grid md:grid-cols-2 gap-8 items-center">
      <div className="space-y-6">
        <Slider
          label="Schedule slip (days behind)"
          value={scheduleSlip}
          min={0}
          max={30}
          onChange={setScheduleSlip}
        />
        <Slider
          label="Weather severity index"
          value={weather}
          min={0}
          max={10}
          onChange={setWeather}
        />
        <Slider
          label="Labour shortfall (%)"
          value={laborShortfall}
          min={0}
          max={50}
          onChange={setLaborShortfall}
        />
        <p className="tag-label">MODEL: DELAY-RISK LSTM · LIVE FRONTEND SIMULATION</p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <svg viewBox="0 0 140 140" className="w-40 h-40">
          <circle cx="70" cy="70" r="54" fill="none" stroke="#1E2A3F" strokeWidth="10" />
          <motion.circle
            cx="70"
            cy="70"
            r="54"
            fill="none"
            stroke={meta.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
            transition={{ duration: 0.4 }}
            transform="rotate(-90 70 70)"
          />
          <text x="70" y="65" textAnchor="middle" className="font-display" fontSize="28" fill="#EDF1F7">
            {score}
          </text>
          <text x="70" y="85" textAnchor="middle" fontSize="10" fill="#8593AC">
            RISK SCORE
          </text>
        </svg>
        <p className="mt-3 font-medium" style={{ color: meta.color }}>
          {meta.label} risk
        </p>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-soft">{label}</span>
        <span className="text-mist font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-signal cursor-pointer"
      />
    </div>
  );
}
