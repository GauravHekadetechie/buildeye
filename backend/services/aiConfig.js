// services/aiConfig.js
//
// Single source of truth for "do we have an AI vision key, and what is
// it". An admin can paste a key into the app (Admin → AI Settings), which
// is stored via store/settingsStore.js and takes priority; otherwise this
// falls back to ANTHROPIC_API_KEY in backend/.env. Both aiAnalyzer.js and
// futureLook.js call this instead of reading process.env directly, so
// there's exactly one place that decides which key wins.

const settingsStore = require("../store/settingsStore");

function getAnthropicConfig() {
  const settings = settingsStore.getSettings();
  const apiKey = settings.anthropicApiKey || process.env.ANTHROPIC_API_KEY || null;
  const model = settings.anthropicModel || process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  const source = settings.anthropicApiKey ? "admin-settings" : process.env.ANTHROPIC_API_KEY ? "env" : "none";
  return { apiKey, model, source };
}

module.exports = { getAnthropicConfig };
