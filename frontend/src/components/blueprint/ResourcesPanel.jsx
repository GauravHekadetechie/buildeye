import React from "react";

export default function ResourcesPanel({ materials, labor }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
        <p className="tag-label mb-3">MATERIALS REQUIRED (ILLUSTRATIVE)</p>
        <div className="space-y-2">
          {materials.map((m) => (
            <div key={m.item} className="flex justify-between text-sm border-b border-ink-line/60 pb-2">
              <span className="text-slate-soft">{m.item}</span>
              <span className="text-mist font-mono">{m.quantity.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
        <p className="tag-label mb-3">LABOUR REQUIRED (ILLUSTRATIVE)</p>
        <div className="space-y-2">
          {labor.map((l) => (
            <div key={l.role} className="flex justify-between text-sm border-b border-ink-line/60 pb-2">
              <span className="text-slate-soft">{l.role}</span>
              <span className="text-mist font-mono">{l.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
