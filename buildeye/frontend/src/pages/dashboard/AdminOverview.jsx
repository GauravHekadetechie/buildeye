import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

function formatINR(n) {
  return n === null || n === undefined ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;
}

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/overview")
      .then((res) => setData(res.data))
      .catch(() => setError("Couldn't load the admin overview."));
  }, []);

  if (error) return <p className="text-risk-critical">{error}</p>;
  if (!data) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-sm border border-ink-line bg-ink-panel/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <p className="tag-label">ADMIN OVERVIEW</p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">Platform at a glance</h1>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Stat label="Total users" value={data.totalUsers} />
        <Stat label="Total projects" value={data.totalProjects} />
        <Stat label="Unassigned projects" value={data.unassignedProjects} accent="text-risk-medium" />
        <Stat label="Total budgeted" value={formatINR(data.totalBudgeted)} accent="text-signal" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {Object.entries(data.usersByRole).map(([role, count]) => (
          <div key={role} className="border border-ink-line bg-ink-panel/30 rounded-sm p-4">
            <p className="tag-label capitalize">{role}S</p>
            <p className="font-display text-2xl text-mist mt-1">{count}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
          <p className="tag-label mb-3">RECENT USERS</p>
          <div className="space-y-2">
            {data.recentUsers.map((u) => (
              <div key={u.id} className="flex justify-between text-sm border-b border-ink-line/60 pb-2">
                <div>
                  <p className="text-mist">{u.name}</p>
                  <p className="text-xs text-slate-soft">{u.identifier}</p>
                </div>
                <span className="tag-label capitalize self-center">{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
          <p className="tag-label mb-3">RECENT PROJECTS</p>
          <div className="space-y-2">
            {data.recentProjects.map((p) => (
              <Link
                key={p.id}
                to={`/dashboard/blueprint/${p.id}`}
                className="flex justify-between items-center text-sm border-b border-ink-line/60 pb-2 hover:text-signal"
              >
                <div>
                  <p className="text-mist">{p.name}</p>
                  <p className="text-xs text-slate-soft">
                    {p.projectType} · {p.clientName ? `Client: ${p.clientName}` : "Unassigned"}
                  </p>
                </div>
                <span className="text-xs font-mono">{formatINR(p.totalEstimate)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "text-mist" }) {
  return (
    <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-4">
      <p className="tag-label mb-1">{label}</p>
      <p className={`font-display text-2xl ${accent}`}>{value}</p>
    </div>
  );
}
