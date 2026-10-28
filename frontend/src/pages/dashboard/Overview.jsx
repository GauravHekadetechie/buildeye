import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios.js";
import RiskBadge from "../../components/RiskBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/overview").then((res) => setData(res.data));
  }, []);

  return (
    <div>
      <header className="mb-8">
        <p className="tag-label">OVERVIEW</p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">
          Welcome back, {user?.name?.split(" ")[0] || "there"}.
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Last updated {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </header>

      {!data ? (
        <SkeletonGrid />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {data.projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="blueprint-frame border border-ink-line bg-ink-panel/40 rounded-sm p-5"
              >
                <div className="flex items-start justify-between">
                  <p className="tag-label">{p.id}</p>
                  <RiskBadge level={p.riskLevel} />
                </div>
                <p className="mt-3 font-display text-mist leading-snug">{p.name}</p>
                <p className="text-xs text-slate-soft mt-1">{p.location}</p>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-soft mb-1">
                    <span>Physical progress</span>
                    <span>{p.physicalProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-ink-line rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.physicalProgress}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-signal"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-soft mt-3">
                  {p.scheduleVariance > 0 ? (
                    <span className="text-risk-high">{p.scheduleVariance} days behind (predicted)</span>
                  ) : (
                    <span className="text-risk-low">{Math.abs(p.scheduleVariance)} days ahead (predicted)</span>
                  )}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10">
            <p className="tag-label mb-3">RECENT ALERTS</p>
            <div className="space-y-2">
              {data.alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between border border-ink-line bg-ink-panel/30 rounded-sm px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-mist">{a.message}</p>
                    <p className="text-xs text-slate-soft mt-1">
                      {a.projectId} · {a.category} · {new Date(a.timestamp).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <RiskBadge level={a.severity} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-40 rounded-sm border border-ink-line bg-ink-panel/30 animate-pulse" />
      ))}
    </div>
  );
}
