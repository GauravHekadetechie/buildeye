import React from "react";

const statusStyle = {
  "Well aligned": "text-risk-low border-risk-low/40 bg-risk-low/5",
  "Acceptable": "text-signal border-signal/40 bg-signal/5",
  "Neutral": "text-slate-soft border-ink-line",
  "Consider adjusting": "text-risk-high border-risk-high/40 bg-risk-high/5",
};

export default function VastuGuidance({ vastu }) {
  return (
    <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
      <p className="tag-label mb-1">VASTU-WISE DIRECTIONS</p>
      <p className="text-sm text-slate-soft mb-4 max-w-xl">
        Based on your detected room layout and the North direction you set.
        These reflect traditional Vastu Shastra conventions followed by
        choice — they're cultural design guidance, not structural or safety
        requirements.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {vastu.map((v) => (
          <div key={v.room} className={`border rounded-sm p-3 ${statusStyle[v.status] || statusStyle.Neutral}`}>
            <div className="flex items-center justify-between">
              <p className="text-mist text-sm font-medium">{v.room}</p>
              <span className="text-xs">{v.status}</span>
            </div>
            <p className="text-xs mt-1 opacity-80">
              Detected: {v.detectedDirection} · Ideal: {v.idealDirections.join(" / ")}
            </p>
            <p className="text-xs mt-2 text-slate-soft">{v.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
