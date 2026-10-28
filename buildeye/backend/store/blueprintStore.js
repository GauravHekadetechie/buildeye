// store/blueprintStore.js
// Same dependency-free JSON-file pattern as store/userStore.js.
//
// Ownership model: every project has a builderId (the contractor who
// uploaded and manages it) and an optional clientId (the homeowner it's
// assigned to, once the builder or admin assigns one). Admins can see and
// touch everything.

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "blueprints.json");

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
    console.error(`[blueprintStore] ${DATA_FILE} was corrupted and has been reset:`, err.message);
    writeAll([]);
    return [];
  }
}

function writeAll(records) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf-8");
}

// Returns the raw record with no permission check — only for internal use
// by route handlers that have already decided access is OK, or that are
// about to run their own check with the result.
function findByIdRaw(id) {
  return readAll().find((b) => b.id === id) || null;
}

// The list a given user is allowed to see, based on role.
function listForUser(user) {
  const all = readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (user.role === "admin") return all;
  if (user.role === "builder") return all.filter((b) => b.builderId === user.id);
  if (user.role === "client") return all.filter((b) => b.clientId === user.id);
  return [];
}

// Whether a given user is allowed to view a specific record.
function canView(record, user) {
  if (!record) return false;
  if (user.role === "admin") return true;
  if (user.role === "builder") return record.builderId === user.id;
  if (user.role === "client") return record.clientId === user.id;
  return false;
}

// Whether a given user is allowed to modify a specific record (upload
// progress photos, add expenses, assign a client, delete it).
function canManage(record, user) {
  if (!record) return false;
  if (user.role === "admin") return true;
  if (user.role === "builder") return record.builderId === user.id;
  return false;
}

// Fetches a record only if the requesting user may view it; otherwise null
// (routes treat null the same whether the id doesn't exist or access is
// denied, so as not to leak which projects exist to unauthorized users).
function findViewable(id, user) {
  const record = findByIdRaw(id);
  return canView(record, user) ? record : null;
}

function findManageable(id, user) {
  const record = findByIdRaw(id);
  return canManage(record, user) ? record : null;
}

function create({ builderId, name, imageFilename, imageUrl, northAngle, analysis }) {
  const records = readAll();
  const nextId = records.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const record = {
    id: nextId,
    builderId,
    clientId: null,
    clientName: null,
    name: name || `Project ${nextId}`,
    imageFilename,
    imageUrl,
    northAngle,
    analysis,
    progressPhotos: [],
    createdAt: new Date().toISOString(),
  };
  records.push(record);
  writeAll(records);
  return record;
}

function assignClient(id, clientId, clientName) {
  const records = readAll();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  records[idx].clientId = clientId;
  records[idx].clientName = clientName;
  writeAll(records);
  return records[idx];
}

function addProgressPhoto(id, photoEntry) {
  const records = readAll();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  records[idx].progressPhotos.push(photoEntry);
  writeAll(records);
  return records[idx];
}

function remove(id) {
  const records = readAll();
  const next = records.filter((r) => r.id !== id);
  const removed = next.length !== records.length;
  if (removed) writeAll(next);
  return removed;
}

function countAll() {
  return readAll().length;
}

module.exports = {
  findByIdRaw,
  listForUser,
  canView,
  canManage,
  findViewable,
  findManageable,
  create,
  assignClient,
  addProgressPhoto,
  remove,
  countAll,
  readAll,
};
