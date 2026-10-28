// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const requireAuth = require("../middleware/auth");
const userStore = require("../store/userStore");

const router = express.Router();

// Detect whether a login identifier is an email or a phone number
function classifyIdentifier(value) {
  const trimmed = String(value || "").trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\+?[0-9]{7,15}$/;

  if (emailPattern.test(trimmed)) return { type: "email", value: trimmed.toLowerCase() };
  if (phonePattern.test(trimmed.replace(/[\s-]/g, ""))) {
    return { type: "phone", value: trimmed.replace(/[\s-]/g, "") };
  }
  return null;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, identifier: user.identifier, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, identifier: user.identifier, company: user.company, role: user.role };
}

// Identifiers listed in ADMIN_IDENTIFIERS (backend/.env) always get the
// admin role, regardless of what the signup form sends — so "admin" can
// never be granted by just picking it in a dropdown.
function resolveRole(identifier, requestedRole) {
  const adminList = (process.env.ADMIN_IDENTIFIERS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (adminList.includes(identifier.toLowerCase())) return "admin";
  return requestedRole === "builder" ? "builder" : "client";
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, identifier, password, company, role } = req.body;

    if (!name || !identifier || !password) {
      return res.status(400).json({ error: "Name, email/phone and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const classified = classifyIdentifier(identifier);
    if (!classified) {
      return res.status(400).json({ error: "Enter a valid email address or phone number." });
    }

    const existing = userStore.findByIdentifier(classified.value);
    if (existing) {
      return res.status(409).json({ error: "An account already exists with that email or phone number." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const resolvedRole = resolveRole(classified.value, role);

    const user = userStore.createUser({
      name: name.trim(),
      identifier: classified.value,
      identifierType: classified.type,
      passwordHash,
      company: company || null,
      role: resolvedRole,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("[POST /api/auth/signup]", err);
    res.status(500).json({ error: "Something went wrong creating your account. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/phone and password are required." });
    }

    const classified = classifyIdentifier(identifier);
    const lookupValue = classified ? classified.value : String(identifier).trim();

    const user = userStore.findByIdentifier(lookupValue);
    if (!user) {
      return res.status(401).json({ error: "No account found with that email or phone number." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    // Re-resolve role on every login: if this identifier was added to
    // ADMIN_IDENTIFIERS after the account already existed, it gets
    // promoted automatically instead of requiring a fresh signup.
    const resolvedRole = resolveRole(user.identifier, user.role);
    if (resolvedRole !== user.role) {
      userStore.updateRole(user.id, resolvedRole);
      user.role = resolvedRole;
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    res.status(500).json({ error: "Something went wrong logging you in. Please try again." });
  }
});

// GET /api/auth/me — verify a token and return the current user
router.get("/me", requireAuth, (req, res) => {
  try {
    const user = userStore.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("[GET /api/auth/me]", err);
    res.status(500).json({ error: "Something went wrong fetching your account." });
  }
});

// PUT /api/auth/change-password — requires the current password to confirm
// identity before setting a new one.
router.put("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are both required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const user = userStore.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Your current password is incorrect." });
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
    if (sameAsOld) {
      return res.status(400).json({ error: "New password must be different from the current password." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    userStore.updatePassword(user.id, newHash);

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("[PUT /api/auth/change-password]", err);
    res.status(500).json({ error: "Something went wrong updating your password. Please try again." });
  }
});

module.exports = router;
