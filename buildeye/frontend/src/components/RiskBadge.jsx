import React from "react";

const colors = {
  Low: { bg: "bg-risk-low/10", text: "text-risk-low", dot: "bg-risk-low" },
  Medium: { bg: "bg-risk-medium/10", text: "text-risk-medium", dot: "bg-risk-medium" },
  High: { bg: "bg-risk-high/10", text: "text-risk-high", dot: "bg-risk-high" },
  Critical: { bg: "bg-risk-critical/10", text: "text-risk-critical", dot: "bg-risk-critical" },
};

export default function RiskBadge({ level }) {
  const c = colors[level] || colors.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-sm ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  );
}
