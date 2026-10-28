// data/mockData.js
// NOTE: All figures below are ILLUSTRATIVE sample data generated for demo
// purposes. In production, /predict responses would come from the trained
// CV + time-series models described in the README, fed by real site photos,
// schedules, cost sheets and weather feeds.

const projects = [
  {
    id: "PRJ-101",
    name: "Aurora Heights Residential Tower",
    location: "Pune, Maharashtra",
    stage: "Structural Framing",
    plannedCompletion: "2027-03-15",
    aiPredictedCompletion: "2027-04-02",
    scheduleVariance: 18, // days behind, predicted
    physicalProgress: 46,
    budgetUtilised: 51,
    riskLevel: "Medium",
    riskScore: 58,
  },
  {
    id: "PRJ-102",
    name: "Vertex Logistics Park",
    location: "Nagpur, Maharashtra",
    stage: "Foundation & Earthwork",
    plannedCompletion: "2026-11-30",
    aiPredictedCompletion: "2026-11-22",
    scheduleVariance: -8,
    physicalProgress: 22,
    budgetUtilised: 19,
    riskLevel: "Low",
    riskScore: 24,
  },
  {
    id: "PRJ-103",
    name: "Kaveri Riverside Bridge",
    location: "Bengaluru, Karnataka",
    stage: "Pier & Girder Erection",
    plannedCompletion: "2026-12-20",
    aiPredictedCompletion: "2027-01-28",
    scheduleVariance: 39,
    physicalProgress: 33,
    budgetUtilised: 44,
    riskLevel: "Critical",
    riskScore: 86,
  },
  {
    id: "PRJ-104",
    name: "Sundeck IT Campus - Block C",
    location: "Hyderabad, Telangana",
    stage: "MEP & Interior Fit-out",
    plannedCompletion: "2026-10-10",
    aiPredictedCompletion: "2026-10-14",
    scheduleVariance: 4,
    physicalProgress: 78,
    budgetUtilised: 74,
    riskLevel: "Low",
    riskScore: 31,
  },
];

const alerts = [
  {
    id: "AL-2291",
    projectId: "PRJ-103",
    severity: "Critical",
    category: "Schedule Delay",
    message: "Girder erection rate has fallen 34% below the 4-week baseline pace. Predicted completion has slipped 39 days.",
    detectedBy: "LSTM schedule-risk model",
    timestamp: "2026-09-06T09:14:00+05:30",
  },
  {
    id: "AL-2288",
    projectId: "PRJ-103",
    severity: "High",
    category: "Safety",
    message: "Vision model flagged 3 site workers without visible PPE compliance near the pier 4 crane zone.",
    detectedBy: "CV safety-compliance model",
    timestamp: "2026-09-06T07:42:00+05:30",
  },
  {
    id: "AL-2274",
    projectId: "PRJ-101",
    severity: "Medium",
    category: "Cost Overrun",
    message: "Steel procurement cost trending 6.2% above the approved BOQ rate for the next billing cycle.",
    detectedBy: "XGBoost cost-forecast model",
    timestamp: "2026-09-05T18:05:00+05:30",
  },
  {
    id: "AL-2260",
    projectId: "PRJ-104",
    severity: "Low",
    category: "Progress Verification",
    message: "Weekly drone capture confirms MEP fit-out on floors 5-6 matches self-reported progress within 2%.",
    detectedBy: "CV progress-verification model",
    timestamp: "2026-09-05T11:30:00+05:30",
  },
  {
    id: "AL-2251",
    projectId: "PRJ-102",
    severity: "Medium",
    category: "Weather Risk",
    message: "IMD forecast shows sustained rainfall over the next 5 days; earthwork productivity may drop ~20%.",
    detectedBy: "Weather-adjusted schedule model",
    timestamp: "2026-09-04T20:00:00+05:30",
  },
];

// Weekly progress vs. AI-predicted progress, last 10 weeks (illustrative)
const progressTrend = Array.from({ length: 10 }).map((_, i) => {
  const week = i + 1;
  const planned = Math.min(100, 8 * week);
  const actual = Math.max(0, planned - (i > 5 ? (i - 5) * 4 : 0));
  const predicted = Math.max(0, actual + (Math.random() * 4 - 2));
  return {
    week: `W${week}`,
    planned,
    actual: Math.round(actual),
    aiPredicted: Math.round(predicted),
  };
});

// Cost variance over time, in lakhs INR (illustrative)
const costTrend = Array.from({ length: 10 }).map((_, i) => ({
  week: `W${i + 1}`,
  budgeted: 40 + i * 6,
  actual: 40 + i * 6.9,
}));

const featureImportance = [
  { feature: "Site photo progress delta (CV)", importance: 27 },
  { feature: "Labour attendance vs plan", importance: 21 },
  { feature: "Material delivery lag", importance: 17 },
  { feature: "Rainfall / weather index", importance: 14 },
  { feature: "Subcontractor task velocity", importance: 12 },
  { feature: "Equipment utilisation rate", importance: 9 },
];

const resourceAllocation = [
  { resource: "Mason crews", allocated: 42, required: 48 },
  { resource: "Steel fixers", allocated: 30, required: 30 },
  { resource: "Concrete pumps", allocated: 4, required: 5 },
  { resource: "Tower cranes", allocated: 3, required: 3 },
  { resource: "MEP technicians", allocated: 18, required: 24 },
];

const modelStats = {
  progressModel: { name: "Site-Progress CNN", accuracy: 91.4, metric: "Progress-stage classification accuracy" },
  scheduleModel: { name: "Delay-Risk LSTM", accuracy: 87.2, metric: "14-day delay-risk AUC-ROC (x100)" },
  costModel: { name: "Cost-Overrun XGBoost", accuracy: 89.6, metric: "Budget-variance prediction accuracy" },
  safetyModel: { name: "PPE / Hazard CV", accuracy: 93.8, metric: "Safety-violation detection precision" },
};

module.exports = {
  projects,
  alerts,
  progressTrend,
  costTrend,
  featureImportance,
  resourceAllocation,
  modelStats,
};
