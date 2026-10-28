import React from "react";

export default function ExecutionTimeline({ executionPlan, totalWeeks }) {
  return (
    <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="tag-label">EXECUTION PLAN</p>
        <p className="tag-label text-signal">TOTAL: {totalWeeks} WEEKS</p>
      </div>

      <div className="space-y-3">
        {executionPlan.map((phase) => {
          const widthPct = (phase.durationWeeks / totalWeeks) * 100;
          const leftPct = (phase.startWeek / totalWeeks) * 100;
          return (
            <div key={phase.phase}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-mist">{phase.phase}</span>
                <span className="text-slate-soft tag-label">
                  WK {phase.startWeek}–{phase.endWeek}
                </span>
              </div>
              <div className="relative h-2 bg-ink-line rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-signal rounded-full"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-soft/70 mt-1">
                Tools: {phase.tools.join(", ")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
