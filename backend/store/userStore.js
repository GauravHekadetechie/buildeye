// User accounts use MongoDB when MONGODB_URI is configured and retain the
// JSON-file store for local development when it is not.
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const DATA_FILE = path.join(__dirname, "..", "data", "users.json");

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    identifier: { type: String, required: true, unique: true },
    identifierType: { type: String, required: true },
    passwordHash: { type: String, required: true },
    company: { type: String, default: null },
    role: { type: String, required: true, default: "client" },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "users" }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

const counterSchema = new mongoose.Schema(
  { _id: String, seq: { type: Number, required: true } },
  { collection: "counters", versionKey: false }
);
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

const migrationSchema = new mongoose.Schema(
  { _id: String, completedAt: { type: Date, required: true } },
  { collection: "migrations", versionKey: false }
);
const Migration = mongoose.models.UserMigration || mongoose.model("UserMigration", migrationSchema);

let useMongoDB = false;

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

function toUser(record) {
  if (!record) return null;
  const { _id, __v, ...user } = record;
  if (user.createdAt instanceof Date) user.createdAt = user.createdAt.toISOString();
  return user;
}

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[userStore] MONGODB_URI is not set; using backend/data/users.json for accounts.");
    return;
  }

  await mongoose.connect(uri);
  await User.init();

  const migrationId = "users-json-import-v1";
  const migration = await Migration.findById(migrationId).lean();
  if (!migration) {
    const legacyUsers = readAll();
    if (legacyUsers.length) {
      await User.bulkWrite(
        legacyUsers.map((user) => ({
          updateOne: {
            filter: { id: user.id },
            update: { $setOnInsert: user },
            upsert: true,
          },
        })),
        { ordered: false }
      );
    }

    const highestUser = await User.findOne().sort({ id: -1 }).select({ id: 1 }).lean();
    if (highestUser) {
      await Counter.findOneAndUpdate(
        { _id: "users" },
        { $max: { seq: highestUser.id } },
        { upsert: true }
      );
    }
    await Migration.create({ _id: migrationId, completedAt: new Date() });
    if (legacyUsers.length) {
      console.log(`[userStore] Imported ${legacyUsers.length} legacy account(s) into MongoDB.`);
    }
  } else {
    const highestUser = await User.findOne().sort({ id: -1 }).select({ id: 1 }).lean();
    if (highestUser) {
      await Counter.findOneAndUpdate(
        { _id: "users" },
        { $max: { seq: highestUser.id } },
        { upsert: true }
      );
    }
  }

  useMongoDB = true;
  console.log("[userStore] Connected to MongoDB for user accounts.");
}

async function findByIdentifier(identifier) {
  if (useMongoDB) return toUser(await User.findOne({ identifier }).lean());
  return readAll().find((user) => user.identifier === identifier) || null;
}

async function findById(id) {
  if (useMongoDB) return toUser(await User.findOne({ id }).lean());
  return readAll().find((user) => user.id === id) || null;
}

async function createUser({ name, identifier, identifierType, passwordHash, company, role }) {
  if (useMongoDB) {
    const counter = await Counter.findOneAndUpdate(
      { _id: "users" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const user = await User.create({
      id: counter.seq,
      name,
      identifier,
      identifierType,
      passwordHash,
      company: company || null,
      role: role || "client",
      createdAt: new Date(),
    });
    return toUser(user.toObject());
  }

  const users = readAll();
  const nextId = users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
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

async function updatePassword(id, passwordHash) {
  if (useMongoDB) {
    const result = await User.updateOne({ id }, { $set: { passwordHash } });
    return result.matchedCount > 0;
  }
  const users = readAll();
  const user = users.find((entry) => entry.id === id);
  if (!user) return false;
  user.passwordHash = passwordHash;
  writeAll(users);
  return true;
}

async function updateRole(id, role) {
  if (useMongoDB) {
    const result = await User.updateOne({ id }, { $set: { role } });
    return result.matchedCount > 0;
  }
  const users = readAll();
  const user = users.find((entry) => entry.id === id);
  if (!user) return false;
  user.role = role;
  writeAll(users);
  return true;
}

async function listAllPublic() {
  const users = useMongoDB
    ? (await User.find().sort({ createdAt: -1 }).lean()).map(toUser)
    : readAll();
  return users.map(({ passwordHash, ...user }) => user);
}

async function findByIdentifierPublic(identifier) {
  const user = await findByIdentifier(identifier);
  if (!user) return null;
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

module.exports = {
  connect,
  findByIdentifier,
  findById,
  createUser,
  updatePassword,
  updateRole,
  listAllPublic,
  findByIdentifierPublic,
};
