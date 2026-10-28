import React from "react";
import { Wind } from "lucide-react";

export default function VentilationGuidance({ ventilation }) {
  return (
    <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
      <p className="tag-label mb-1 flex items-center gap-2">
        <Wind size={12} /> VENTILATION & WINDOW PLACEMENT
      </p>
      <p className="text-sm text-slate-soft mb-4 max-w-xl">
        General passive-design guidance for natural light and airflow, based
        on each room's detected orientation — illustrative, not a
        site-specific ventilation study.
      </p>

      <div className="space-y-3">
        {ventilation.map((v) => (
          <div key={v.room} className="flex items-start justify-between gap-4 border-b border-ink-line/60 pb-3">
            <div>
              <p className="text-sm text-mist">{v.room}</p>
              <p className="text-xs text-slate-soft mt-1">{v.recommendation}</p>
            </div>
            <span className={`tag-label whitespace-nowrap ${v.matchesPreferred ? "text-risk-low" : "text-risk-medium"}`}>
              {v.detectedDirection} {v.matchesPreferred ? "· GOOD FIT" : "· SUB-OPTIMAL"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
