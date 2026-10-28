// store/settingsStore.js
// Same dependency-free JSON-file pattern as store/userStore.js.
//
// Lets an admin paste in their own Anthropic API key from inside the app
// (Admin → AI Settings) instead of having to edit backend/.env by hand.
// A key set here takes priority over the ANTHROPIC_API_KEY environment
// variable — see services/aiConfig.js, which is what actually resolves
// which key/model to use at call time.

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "settings.json");

function ensureFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, "{}", "utf-8");
  }
}

function readAll() {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[settingsStore] ${DATA_FILE} was corrupted and has been reset:`, err.message);
    writeAll({});
    return {};
  }
}

function writeAll(settings) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

function getSettings() {
  return readAll();
}

function setAnthropicKey(apiKey, model) {
  const settings = readAll();
  settings.anthropicApiKey = apiKey || null;
  if (model) settings.anthropicModel = model;
  writeAll(settings);
  return settings;
}

function clearAnthropicKey() {
  const settings = readAll();
  delete settings.anthropicApiKey;
  writeAll(settings);
  return settings;
}

module.exports = { getSettings, setAnthropicKey, clearAnthropicKey };
