import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import api from "../../api/axios.js";

export default function Analytics() {
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    api.get("/dashboard/trends").then((res) => setTrends(res.data));
    api.get("/dashboard/insights").then((res) => setInsights(res.data));
  }, []);

  return (
    <div>
      <header className="mb-8">
        <p className="tag-label">MODEL INSIGHTS</p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">Historical trends & model behaviour</h1>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Planned vs. actual vs. AI-predicted progress">
          {trends && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.progressTrend}>
                <CartesianGrid stroke="#1E2A3F" />
                <XAxis dataKey="week" stroke="#8593AC" fontSize={11} />
                <YAxis stroke="#8593AC" fontSize={11} />
                <Tooltip contentStyle={{ background: "#101828", border: "1px solid #1E2A3F", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="planned" stroke="#8593AC" strokeDasharray="4 3" dot={false} name="Planned" />
                <Line type="monotone" dataKey="actual" stroke="#F2994A" strokeWidth={2} name="Actual" />
                <Line type="monotone" dataKey="aiPredicted" stroke="#2F80ED" strokeWidth={2} name="AI-predicted" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Budgeted vs. actual cost (₹ lakh)">
          {trends && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.costTrend}>
                <CartesianGrid stroke="#1E2A3F" />
                <XAxis dataKey="week" stroke="#8593AC" fontSize={11} />
                <YAxis stroke="#8593AC" fontSize={11} />
                <Tooltip contentStyle={{ background: "#101828", border: "1px solid #1E2A3F", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="budgeted" stroke="#8593AC" strokeDasharray="4 3" dot={false} name="Budgeted" />
                <Line type="monotone" dataKey="actual" stroke="#EB5757" strokeWidth={2} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Feature importance — delay risk model" full>
          {insights && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.featureImportance} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="#1E2A3F" horizontal={false} />
                <XAxis type="number" stroke="#8593AC" fontSize={11} />
                <YAxis type="category" dataKey="feature" stroke="#8593AC" fontSize={11} width={210} />
                <Tooltip contentStyle={{ background: "#101828", border: "1px solid #1E2A3F", fontSize: 12 }} />
                <Bar dataKey="importance" fill="#2F80ED" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {insights && (
          <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(insights.modelStats).map((m) => (
              <div key={m.name} className="border border-ink-line bg-ink-panel/30 rounded-sm p-4">
                <p className="tag-label">{m.metric}</p>
                <p className="font-display text-2xl text-signal mt-2">{m.accuracy}%</p>
                <p className="text-sm text-mist mt-1">{m.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children, full }) {
  return (
    <div className={`border border-ink-line bg-ink-panel/30 rounded-sm p-5 h-80 ${full ? "lg:col-span-2" : ""}`}>
      <p className="tag-label mb-3">{title}</p>
      <div className="h-[calc(100%-1.5rem)]">
        {children || <div className="w-full h-full animate-pulse bg-ink-line/30 rounded-sm" />}
      </div>
    </div>
  );
}
