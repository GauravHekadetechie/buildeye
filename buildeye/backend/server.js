// server.js
require("dotenv").config();
const crypto = require("crypto");
const path = require("path");
const express = require("express");
const cors = require("cors");

// If there's no .env file (a common setup step to miss), generate a
// throwaway secret for this run rather than letting every login attempt
// fail with a cryptic 500 error. Sessions won't survive a server restart
// in that case, but the app will actually work.
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
  console.warn(
    "\n⚠️  No JWT_SECRET found (looks like backend/.env is missing).\n" +
      "   Using a temporary secret for this run — logins will be cleared\n" +
      "   every time you restart the server.\n" +
      "   Fix: in the backend folder, run `cp .env.example .env`.\n"
  );
}

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const blueprintRoutes = require("./routes/blueprint");
const expenseRoutes = require("./routes/expenses");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());

// Uploaded blueprint/progress photos are served statically so the frontend
// can display them directly by URL. In a real deployment these should sit
// behind signed/expiring URLs or an authenticated proxy route instead.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "buildeye-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/blueprint", blueprintRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Buildeye API running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n❌ Port ${PORT} is already in use.\n` +
        `   Another process (maybe an earlier copy of this server) is already running.\n` +
        `   Either stop that process, or set a different PORT in backend/.env.\n`
    );
    process.exit(1);
  }
  throw err;
});
