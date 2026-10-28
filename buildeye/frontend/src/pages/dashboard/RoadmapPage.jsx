import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import RiskBadge from "../../components/RiskBadge.jsx";

export default function RoadmapPage() {
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    api.get("/dashboard/projects").then((res) => setProjects(res.data.projects));
  }, []);

  return (
    <div>
      <header className="mb-8">
        <p className="tag-label">PROJECT ROADMAP</p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">
          Planned vs. AI-predicted completion
        </h1>
        <p className="text-sm text-slate-soft mt-1 max-w-xl">
          The roadmap model re-forecasts each project's completion date weekly,
          using live progress and delay signals — not just the original baseline.
        </p>
      </header>

      <div className="space-y-6">
        {(projects || []).map((p) => (
          <div key={p.id} className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <p className="font-display text-mist">{p.name}</p>
                <p className="text-xs text-slate-soft">{p.id} · Current stage: {p.stage}</p>
              </div>
              <RiskBadge level={p.riskLevel} />
            </div>

            <TimelineBar planned={p.plannedCompletion} predicted={p.aiPredictedCompletion} variance={p.scheduleVariance} />

            <div className="flex flex-wrap gap-6 mt-4 text-xs text-slate-soft">
              <span>Planned: <span className="text-mist">{formatDate(p.plannedCompletion)}</span></span>
              <span>AI-predicted: <span className="text-signal">{formatDate(p.aiPredictedCompletion)}</span></span>
              <span>
                Variance:{" "}
                <span className={p.scheduleVariance > 0 ? "text-risk-high" : "text-risk-low"}>
                  {p.scheduleVariance > 0 ? `+${p.scheduleVariance}` : p.scheduleVariance} days
                </span>
              </span>
            </div>
          </div>
        ))}
        {!projects && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-sm border border-ink-line bg-ink-panel/30 animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function TimelineBar({ planned, predicted, variance }) {
  const plannedTime = new Date(planned).getTime();
  const predictedTime = new Date(predicted).getTime();
  const spread = Math.max(Math.abs(plannedTime - predictedTime), 1000 * 60 * 60 * 24 * 10);
  const start = Math.min(plannedTime, predictedTime) - spread * 0.3;
  const end = Math.max(plannedTime, predictedTime) + spread * 0.3;
  const pos = (t) => ((t - start) / (end - start)) * 100;

  return (
    <div className="relative h-8">
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-ink-line rounded-full" />
      <Marker leftPct={pos(plannedTime)} color="bg-mist" label="Planned" />
      <Marker leftPct={pos(predictedTime)} color={variance > 0 ? "bg-beam" : "bg-signal"} label="AI-predicted" />
    </div>
  );
}

function Marker({ leftPct, color, label }) {
  return (
    <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${leftPct}%` }}>
      <div className={`w-3 h-3 rounded-full ${color} -translate-x-1/2`} title={label} />
    </div>
  );
}
