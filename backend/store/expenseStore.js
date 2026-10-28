// store/expenseStore.js
// Same dependency-free JSON-file pattern as store/userStore.js.
//
// Expenses don't carry their own permission info — access is governed by
// the parent blueprint's builder/client assignment (see routes/expenses.js,
// which checks blueprintStore.canView/canManage before touching this file).

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "expenses.json");

function ensureFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

function readAll() {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8").trim();
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[expenseStore] ${DATA_FILE} was corrupted and has been reset:`, err.message);
    writeAll([]);
    return [];
  }
}

function writeAll(records) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf-8");
}

function listForBlueprint(blueprintId) {
  return readAll()
    .filter((e) => e.blueprintId === blueprintId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function create({ blueprintId, category, amount, date, note, loggedBy }) {
  const records = readAll();
  const nextId = records.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const record = {
    id: nextId,
    blueprintId,
    category,
    amount,
    date: date || new Date().toISOString(),
    note: note || "",
    loggedBy: loggedBy || null,
    createdAt: new Date().toISOString(),
  };
  records.push(record);
  writeAll(records);
  return record;
}

function remove(id, blueprintId) {
  const records = readAll();
  const next = records.filter((r) => !(r.id === id && r.blueprintId === blueprintId));
  const removed = next.length !== records.length;
  if (removed) writeAll(next);
  return removed;
}

function totalSpentAcrossAll() {
  return readAll().reduce((sum, e) => sum + Number(e.amount), 0);
}

module.exports = { listForBlueprint, create, remove, totalSpentAcrossAll };
