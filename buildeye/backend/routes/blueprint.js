// routes/blueprint.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { requireAuth, requireRole } = require("../middleware/auth");
const blueprintStore = require("../store/blueprintStore");
const userStore = require("../store/userStore");
const { analyzeBlueprint } = require("../services/mockAnalyzer");
const { analyzeBlueprintWithAI } = require("../services/aiAnalyzer");
const { getImageDimensions } = require("../services/imageMeta");
const { getAnthropicConfig } = require("../services/aiConfig");
const { createRng } = require("../services/seededRandom");
const { buildSectionRooms, generateFutureLook } = require("../services/futureLook");
const { listLocations, getLocationByKey } = require("../data/locationRates");

const router = express.Router();
router.use(requireAuth);

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("ONLY_IMAGES"));
    }
    cb(null, true);
  },
});

function handleUpload(field) {
  const middleware = upload.single(field);
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        if (err.message === "ONLY_IMAGES") {
          return res.status(400).json({ error: "Please upload a valid image file (JPG, PNG, etc.)." });
        }
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "That image is too large. Please upload a file under 8MB." });
        }
        return res.status(400).json({ error: "Couldn't process that upload. Please try a different file." });
      }
      next();
    });
  };
}

// GET /api/blueprint/locations — list of Indian cities/regions the cost
// estimate can be adjusted for (used to populate the location dropdown).
router.get("/locations", (req, res) => {
  res.json({ locations: listLocations() });
});

// POST /api/blueprint/analyze — builders and admins create projects; a
// client's role is to review, not to create the project.
router.post("/analyze", requireRole("builder", "admin"), handleUpload("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a photo of your blueprint or plan." });
    }

    const northAngle = Number.isFinite(Number(req.body.northAngle)) ? Number(req.body.northAngle) : 0;
    const locationKey = req.body.city ? getLocationByKey(req.body.city).key : null;
    const imageUrl = `/uploads/${req.file.filename}`;
    const buffer = fs.readFileSync(req.file.path);

    // Seed the demo analyzer from the image's actual bytes, NOT the
    // generated filename (which is timestamp+random and therefore
    // different on every upload, even of the identical image — that was
    // the bug behind "random results": re-uploading the same blueprint
    // used to produce a completely different analysis every time).
    const contentHash = crypto.createHash("sha256").update(buffer).digest("hex");
    const dimensions = getImageDimensions(buffer); // real pixel size, or null if unrecognised

    const { apiKey } = getAnthropicConfig();

    let analysis;
    if (apiKey) {
      try {
        analysis = await analyzeBlueprintWithAI({
          base64Image: buffer.toString("base64"),
          mediaType: req.file.mimetype,
          northAngle,
          locationKey,
        });
      } catch (aiErr) {
        console.warn("[blueprint/analyze] AI analysis failed, falling back to demo analyzer:", aiErr.message);
        analysis = analyzeBlueprint({
          seed: contentHash,
          northAngle,
          imageWidth: dimensions?.width,
          imageHeight: dimensions?.height,
          locationKey,
        });
        analysis.aiFallbackReason = aiErr.message;
      }
    } else {
      analysis = analyzeBlueprint({
        seed: contentHash,
        northAngle,
        imageWidth: dimensions?.width,
        imageHeight: dimensions?.height,
        locationKey,
      });
    }

    const record = blueprintStore.create({
      builderId: req.user.id,
      name: req.body.name,
      imageFilename: req.file.filename,
      imageUrl,
      northAngle,
      analysis,
    });

    res.status(201).json({ blueprint: record });
  } catch (err) {
    console.error("[POST /api/blueprint/analyze]", err);
    res.status(500).json({ error: "Something went wrong analysing that image. Please try again." });
  }
});

// GET /api/blueprint — projects this user is allowed to see (admin: all,
// builder: their own, client: the ones assigned to them)
router.get("/", (req, res) => {
  try {
    res.json({ blueprints: blueprintStore.listForUser(req.user) });
  } catch (err) {
    console.error("[GET /api/blueprint]", err);
    res.status(500).json({ error: "Something went wrong loading your projects." });
  }
});

// GET /api/blueprint/:id
router.get("/:id", (req, res) => {
  try {
    const record = blueprintStore.findViewable(Number(req.params.id), req.user);
    if (!record) return res.status(404).json({ error: "Project not found." });
    res.json({ blueprint: record });
  } catch (err) {
    console.error("[GET /api/blueprint/:id]", err);
    res.status(500).json({ error: "Something went wrong loading that project." });
  }
});

// PUT /api/blueprint/:id/assign-client — builder (owner) or admin assigns
// a client account to this project by their email/phone. The client must
// already have a "client" role account.
router.put("/:id/assign-client", requireRole("builder", "admin"), (req, res) => {
  try {
    const id = Number(req.params.id);
    const record = blueprintStore.findManageable(id, req.user);
    if (!record) return res.status(404).json({ error: "Project not found." });

    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: "Enter the client's email or phone number." });
    }

    const client = userStore.findByIdentifierPublic(identifier.trim().toLowerCase()) ||
      userStore.findByIdentifierPublic(identifier.trim());
    if (!client) {
      return res.status(404).json({ error: "No account found with that email or phone number." });
    }
    if (client.role !== "client") {
      return res.status(400).json({ error: "That account isn't registered as a client." });
    }

    const updated = blueprintStore.assignClient(id, client.id, client.name);
    res.json({ blueprint: updated });
  } catch (err) {
    console.error("[PUT /api/blueprint/:id/assign-client]", err);
    res.status(500).json({ error: "Something went wrong assigning that client." });
  }
});

// POST /api/blueprint/:id/progress-photo — builder/admin only; clients
// view progress but don't upload site photos.
router.post("/:id/progress-photo", requireRole("builder", "admin"), handleUpload("image"), (req, res) => {
  try {
    const id = Number(req.params.id);
    const record = blueprintStore.findManageable(id, req.user);
    if (!record) return res.status(404).json({ error: "Project not found." });
    if (!req.file) return res.status(400).json({ error: "Please upload a site progress photo." });

    const buffer = fs.readFileSync(req.file.path);
    const contentHash = crypto.createHash("sha256").update(buffer).digest("hex");
    const rng = createRng(contentHash);
    const priorCount = record.progressPhotos.length;
    const baseline = Math.min(95, 12 + priorCount * 18);
    const estimatedProgress = Math.min(98, Math.max(baseline, baseline + rng.int(-4, 6)));

    const stageNotes = [
      "Foundation and plinth work visible.",
      "Structural framing progressing — columns and slab visible.",
      "Brickwork and wall construction underway.",
      "Roofing/slab work appears complete; interior work beginning.",
      "Plastering and flooring stage in progress.",
      "Finishing stage — paint and fixtures visible.",
    ];
    const aiNote = stageNotes[Math.min(stageNotes.length - 1, priorCount)];

    const photoEntry = {
      filename: req.file.filename,
      imageUrl: `/uploads/${req.file.filename}`,
      note: req.body.note || "",
      aiNote,
      estimatedProgress,
      uploadedAt: new Date().toISOString(),
    };

    const updated = blueprintStore.addProgressPhoto(id, photoEntry);
    res.status(201).json({ blueprint: updated });
  } catch (err) {
    console.error("[POST /api/blueprint/:id/progress-photo]", err);
    res.status(500).json({ error: "Something went wrong uploading that photo. Please try again." });
  }
});

// POST /api/blueprint/:id/future-look — anyone with view access (admin,
// owning builder, or assigned client) can explore the interactive 3D
// section illustrations; no need to restrict this to editors.
router.post("/:id/future-look", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const record = blueprintStore.findViewable(id, req.user);
    if (!record) return res.status(404).json({ error: "Project not found." });

    const { section, style, variant } = req.body;
    if (!["front", "middle", "rear"].includes(section)) {
      return res.status(400).json({ error: "Section must be one of: front, middle, rear." });
    }

    const sectionRooms = buildSectionRooms(record.analysis.rooms, section);
    const result = await generateFutureLook({
      sectionLabel: section,
      rooms: sectionRooms,
      style: style || "modern",
      variant: Number.isFinite(Number(variant)) ? Number(variant) : 0,
      projectType: record.analysis.projectType,
    });

    res.json(result);
  } catch (err) {
    console.error("[POST /api/blueprint/:id/future-look]", err);
    res.status(500).json({ error: "Something went wrong generating that illustration. Please try again." });
  }
});

// DELETE /api/blueprint/:id — builder (owner) or admin only
router.delete("/:id", requireRole("builder", "admin"), (req, res) => {
  try {
    const id = Number(req.params.id);
    const record = blueprintStore.findManageable(id, req.user);
    if (!record) return res.status(404).json({ error: "Project not found." });
    blueprintStore.remove(id);
    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/blueprint/:id]", err);
    res.status(500).json({ error: "Something went wrong deleting that project." });
  }
});

module.exports = router;
