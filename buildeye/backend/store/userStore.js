// store/userStore.js
//
// A minimal, dependency-free user store backed by a JSON file on disk.
//
// Why not a real database driver? better-sqlite3 (used in an earlier
// version of this project) is a *native* module — it needs a C++ compiler
// toolchain to install (Python + Visual Studio Build Tools on Windows,
// Xcode Command Line Tools on Mac). On machines without that toolchain,
// `npm install` silently fails to build it, the backend never starts, and
// nothing — including login — works. This store has zero native
// dependencies, so `npm install` always succeeds.
//
// For a real production deployment, swap this module for Postgres/MongoDB
// (see README, section "Swapping in real data"). Every other file only
// calls the functions exported below, so that's the only file to replace.

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "users.json");

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
    console.error(`[userStore] ${DATA_FILE} was corrupted and has been reset:`, err.message);
    writeAll([]);
    return [];
  }
}

function writeAll(users) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function findByIdentifier(identifier) {
  return readAll().find((u) => u.identifier === identifier) || null;
}

function findById(id) {
  return readAll().find((u) => u.id === id) || null;
}

function createUser({ name, identifier, identifierType, passwordHash, company, role }) {
  const users = readAll();
  const nextId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const user = {
    id: nextId,
    name,
    identifier,
    identifierType,
    passwordHash,
    company: company || null,
    role: role || "client",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeAll(users);
  return user;
}

function updatePassword(id, passwordHash) {
  const users = readAll();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users[idx].passwordHash = passwordHash;
  writeAll(users);
  return true;
}

function updateRole(id, role) {
  const users = readAll();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users[idx].role = role;
  writeAll(users);
  return true;
}

// Every user except password hashes — for admin user-management screens
// and for looking up a builder/client by identifier when assigning them
// to a project.
function listAllPublic() {
  return readAll().map(({ passwordHash, ...rest }) => rest);
}

function findByIdentifierPublic(identifier) {
  const user = findByIdentifier(identifier);
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

module.exports = {
  findByIdentifier,
  findById,
  createUser,
  updatePassword,
  updateRole,
  listAllPublic,
  findByIdentifierPublic,
};
