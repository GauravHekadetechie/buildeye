// routes/admin.js
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const userStore = require("../store/userStore");
const blueprintStore = require("../store/blueprintStore");
const expenseStore = require("../store/expenseStore");
const settingsStore = require("../store/settingsStore");
const { getAnthropicConfig } = require("../services/aiConfig");

const router = express.Router();
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/users — every account, minus password hashes
router.get("/users", (req, res) => {
  try {
    res.json({ users: userStore.listAllPublic() });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    res.status(500).json({ error: "Something went wrong loading users." });
  }
});

// GET /api/admin/overview — platform-wide stats across every project
router.get("/overview", (req, res) => {
  try {
    const users = userStore.listAllPublic();
    const projects = blueprintStore.readAll();

    const usersByRole = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    const totalBudgeted = projects.reduce((sum, p) => sum + (p.analysis?.cost?.totalEstimate || 0), 0);
    const totalSpent = expenseStore.totalSpentAcrossAll();
    const unassigned = projects.filter((p) => !p.clientId).length;

    res.json({
      totalUsers: users.length,
      usersByRole,
      totalProjects: projects.length,
      unassignedProjects: unassigned,
      totalBudgeted,
      totalSpent,
      recentUsers: [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
      recentProjects: [...projects]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8)
        .map((p) => ({
          id: p.id,
          name: p.name,
          builderId: p.builderId,
          clientId: p.clientId,
          clientName: p.clientName,
          projectType: p.analysis?.projectType,
          totalEstimate: p.analysis?.cost?.totalEstimate,
          createdAt: p.createdAt,
        })),
    });
  } catch (err) {
    console.error("[GET /api/admin/overview]", err);
    res.status(500).json({ error: "Something went wrong loading the admin overview." });
  }
});

// GET /api/admin/ai-settings — status of the AI vision key (never returns
// the raw key itself, only whether one is set and where it came from).
router.get("/ai-settings", (req, res) => {
  try {
    const { apiKey, model, source } = getAnthropicConfig();
    res.json({
      configured: Boolean(apiKey),
      source, // "admin-settings" | "env" | "none"
      model,
      maskedKey: apiKey ? `${apiKey.slice(0, 7)}${"•".repeat(Math.max(0, apiKey.length - 11))}${apiKey.slice(-4)}` : null,
    });
  } catch (err) {
    console.error("[GET /api/admin/ai-settings]", err);
    res.status(500).json({ error: "Something went wrong loading AI settings." });
  }
});

// PUT /api/admin/ai-settings — save (or clear) the Anthropic API key from
// inside the app, no .env editing required. This is stored server-side in
// backend/data/settings.json and takes priority over the environment
// variable. Note: Buildeye can't supply its own key — this must be a key
// from your own Anthropic account (console.anthropic.com), billed to you.
router.put("/ai-settings", (req, res) => {
  try {
    const { apiKey, model } = req.body;

    if (apiKey === "") {
      settingsStore.clearAnthropicKey();
      return res.json({ success: true, configured: false });
    }

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return res.status(400).json({ error: "Enter a valid API key, or leave it blank to remove the saved one." });
    }

    settingsStore.setAnthropicKey(apiKey.trim(), model);
    res.json({ success: true, configured: true });
  } catch (err) {
    console.error("[PUT /api/admin/ai-settings]", err);
    res.status(500).json({ error: "Something went wrong saving the API key." });
  }
});

// POST /api/admin/ai-settings/test — makes one minimal real call to the
// Anthropic API to confirm the configured key actually works, rather than
// just checking that something was typed in.
router.post("/ai-settings/test", async (req, res) => {
  try {
    const { apiKey, model } = getAnthropicConfig();
    if (!apiKey) {
      return res.status(400).json({ error: "No API key is configured yet." });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 10,
        messages: [{ role: "user", content: "Reply with the single word: OK" }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      let message = `Anthropic API returned ${response.status}.`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.message) message = parsed.error.message;
      } catch {
        // ignore parse failure, use the generic message above
      }
      return res.status(400).json({ success: false, error: message });
    }

    res.json({ success: true, message: `Connected successfully using model "${model}".` });
  } catch (err) {
    console.error("[POST /api/admin/ai-settings/test]", err);
    res.status(500).json({ success: false, error: "Couldn't reach the Anthropic API. Check your network connection." });
  }
});

module.exports = router;
