import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MapPin } from "lucide-react";

function formatINR(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function CostBreakdown({ cost }) {
  return (
    <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="tag-label">CONSTRUCTION COST ESTIMATE (ILLUSTRATIVE)</p>
        <p className="tag-label text-slate-soft/60">₹{cost.ratePerSqft}/SQ.FT</p>
      </div>
      <p className="font-display text-2xl text-signal mb-1">{formatINR(cost.totalEstimate)}</p>
      {cost.location ? (
        <p className="text-xs text-slate-soft flex items-center gap-1 mb-4">
          <MapPin size={12} className="text-signal" />
          Adjusted for {cost.location.city}
          {cost.location.state ? `, ${cost.location.state}` : ""} (Tier {cost.location.tier})
        </p>
      ) : (
        <p className="text-xs text-slate-soft/70 mb-4">Using national average rate — set a project location for a city-adjusted estimate.</p>
      )}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cost.breakdown} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid stroke="#1E2A3F" horizontal={false} />
            <XAxis type="number" stroke="#8593AC" fontSize={11} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
            <YAxis type="category" dataKey="phase" stroke="#8593AC" fontSize={10} width={170} />
            <Tooltip
              formatter={(value) => formatINR(value)}
              contentStyle={{ background: "#101828", border: "1px solid #1E2A3F", fontSize: 12 }}
            />
            <Bar dataKey="amount" fill="#F2994A" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {cost.land && (
        <div className="mt-5 pt-4 border-t border-ink-line">
          <p className="tag-label mb-1">ILLUSTRATIVE LAND VALUE</p>
          <p className="font-display text-xl text-beam mb-1">{formatINR(cost.land.estimate)}</p>
          <p className="text-xs text-slate-soft">
            Based on a rough planning rate of ₹{cost.land.ratePerSqft.toLocaleString("en-IN")}/sq.ft for this area
            and your plan's {cost.land.footprintSqft} sq.ft footprint. Land value varies enormously by exact
            locality — treat this as a starting point, not a valuation. Get a local quote before making financial
            decisions.
          </p>
        </div>
      )}
    </div>
  );
}
