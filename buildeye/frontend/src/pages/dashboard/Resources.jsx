import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import api from "../../api/axios.js";

export default function Resources() {
  const [resources, setResources] = useState(null);

  useEffect(() => {
    api.get("/dashboard/resources").then((res) => setResources(res.data.resourceAllocation));
  }, []);

  return (
    <div>
      <header className="mb-8">
        <p className="tag-label">RESOURCE MANAGEMENT</p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">Labour & equipment vs. plan</h1>
        <p className="text-sm text-slate-soft mt-1 max-w-xl">
          Allocated crews and equipment compared against what the current
          schedule requires to stay on pace.
        </p>
      </header>

      <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5 h-96">
        {resources ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resources}>
              <CartesianGrid stroke="#1E2A3F" vertical={false} />
              <XAxis dataKey="resource" stroke="#8593AC" fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#8593AC" fontSize={11} />
              <Tooltip contentStyle={{ background: "#101828", border: "1px solid #1E2A3F", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="allocated" fill="#2F80ED" name="Allocated" radius={[3, 3, 0, 0]} />
              <Bar dataKey="required" fill="#F2994A" name="Required by schedule" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full animate-pulse bg-ink-line/30 rounded-sm" />
        )}
      </div>

      {resources && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources
            .filter((r) => r.allocated < r.required)
            .map((r) => (
              <div key={r.resource} className="border border-risk-high/40 bg-risk-high/5 rounded-sm p-4">
                <p className="text-sm text-mist">{r.resource}</p>
                <p className="text-xs text-risk-high mt-1">
                  Short by {r.required - r.allocated} to hold current schedule pace
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
