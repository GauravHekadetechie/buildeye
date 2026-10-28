// routes/dashboard.js
// All endpoints here are protected and return mock/illustrative AI-model
// output. Replace the static imports with real calls to the Python ML
// microservice (see README -> "Connecting a real model") when ready.

const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  projects,
  alerts,
  progressTrend,
  costTrend,
  featureImportance,
  resourceAllocation,
  modelStats,
} = require("../data/mockData");

const router = express.Router();

router.use(requireAuth);

router.get("/overview", (req, res) => {
  res.json({ projects, alerts: alerts.slice(0, 4), modelStats });
});

router.get("/projects", (req, res) => {
  res.json({ projects });
});

router.get("/alerts", (req, res) => {
  res.json({ alerts });
});

router.get("/trends", (req, res) => {
  res.json({ progressTrend, costTrend });
});

router.get("/insights", (req, res) => {
  res.json({ featureImportance, modelStats });
});

router.get("/resources", (req, res) => {
  res.json({ resourceAllocation });
});

// A lightweight stand-in for a real /predict call to the ML microservice.
// Accepts a few project inputs and returns a deterministic-but-realistic
// mock risk score so the frontend's interactive demo has something live to hit.
router.post("/predict", (req, res) => {
  const { scheduleSlipDays = 0, weatherSeverity = 1, laborShortfallPct = 0 } = req.body;

  const raw =
    scheduleSlipDays * 1.4 +
    weatherSeverity * 6 +
    laborShortfallPct * 0.9;

  const riskScore = Math.max(2, Math.min(98, Math.round(raw)));
  const level =
    riskScore >= 75 ? "Critical" : riskScore >= 50 ? "High" : riskScore >= 25 ? "Medium" : "Low";

  res.json({ riskScore, level, model: "Delay-Risk LSTM (mock inference)" });
});

module.exports = router;
