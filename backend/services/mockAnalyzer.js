// services/mockAnalyzer.js
//
// The "detector" half of the demo analysis path: given an uploaded image,
// invents a plausible room list and plot size without actually reading the
// floor plan (a real read requires computer vision — see aiAnalyzer.js).
// Two things keep this honest and useful as a fallback:
//   1. It's seeded from the image's actual byte content (a hash passed in
//      by the caller), so the SAME uploaded image always produces the SAME
//      analysis. Re-uploading a blueprint twice used to give two unrelated
//      results because the old seed was a freshly-generated filename
//      (timestamp + random string) rather than anything about the image —
//      that was the bug behind "random results" and is now fixed upstream
//      in routes/blueprint.js.
//   2. Where possible it's grounded in the image's real pixel dimensions
//      (aspect ratio, resolution) rather than being pure invention, so a
//      portrait-oriented plan and a landscape one produce differently
//      shaped layouts instead of an identical generic grid.

const { createRng } = require("./seededRandom");
const { composeAnalysis } = require("./analysisEngine");

const ROOM_POOL = [
  "Living Room",
  "Master Bedroom",
  "Bedroom 2",
  "Bedroom 3",
  "Kitchen",
  "Dining Area",
  "Bathroom 1",
  "Bathroom 2",
  "Pooja Room",
  "Study/Home Office",
  "Balcony",
  "Utility Area",
  "Garage",
];

const CORE_ROOMS = ["Living Room", "Master Bedroom", "Kitchen", "Bathroom 1"];

// Packs a list of rooms into a simple non-overlapping grid so the frontend
// can draw labelled boxes over the uploaded image. Not a real floor-plan
// vectorisation — a plausible illustrative layout for demo purposes. The
// grid's row/column split follows the uploaded image's own aspect ratio
// where known, so a tall portrait photo doesn't get a wide landscape grid.
function layoutRooms(roomNames, imageAspect) {
  const n = roomNames.length;
  let cols;
  if (imageAspect && imageAspect > 1.15) {
    // landscape image → favour more columns than rows
    cols = Math.min(n, Math.max(2, Math.round(Math.sqrt(n * imageAspect))));
  } else if (imageAspect && imageAspect < 0.87) {
    // portrait image → favour more rows than columns
    cols = Math.min(n, Math.max(1, Math.round(Math.sqrt(n / (1 / imageAspect)))));
  } else {
    cols = n <= 4 ? 2 : n <= 9 ? 3 : 4;
  }
  cols = Math.max(1, Math.min(n, cols));
  const rows = Math.ceil(n / cols);
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  return roomNames.map((name, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const pad = 1.5;
    return {
      name,
      box: {
        xPct: Math.round((col * cellW + pad) * 10) / 10,
        yPct: Math.round((row * cellH + pad) * 10) / 10,
        wPct: Math.round((cellW - pad * 2) * 10) / 10,
        hPct: Math.round((cellH - pad * 2) * 10) / 10,
      },
    };
  });
}

function analyzeBlueprint({ seed, northAngle = 0, hintProjectType, imageWidth, imageHeight, locationKey }) {
  const rng = createRng(seed);
  const imageAspect = imageWidth && imageHeight ? imageWidth / imageHeight : null;

  // Weakly ground the plot-size baseline in the image's actual resolution
  // (a higher-resolution scan is treated as "more detail was captured",
  // nudging the estimate up slightly) — combined with, not replacing, the
  // seeded random range, so it stays a heuristic rather than a claim of
  // measurement.
  const resolutionNudge = imageWidth && imageHeight ? Math.min(1.15, Math.max(0.9, (imageWidth * imageHeight) / (1600 * 1200))) : 1;
  const plotSizeSqft = Math.round(rng.int(650, 4200) * resolutionNudge);
  const floors = plotSizeSqft > 2200 ? rng.int(2, 3) : rng.int(1, 2);

  const extraRoomPool = ROOM_POOL.filter((r) => !CORE_ROOMS.includes(r));
  const extraCount = Math.min(extraRoomPool.length, Math.round(plotSizeSqft / 500));
  const chosenExtras = rng.shuffle(extraRoomPool).slice(0, extraCount);
  const roomNames = [...CORE_ROOMS, ...chosenExtras];
  const rooms = layoutRooms(roomNames, imageAspect);

  return composeAnalysis({
    source: "demo-analyzer",
    rooms,
    plotSizeSqft,
    floors,
    northAngle,
    projectType: hintProjectType,
    rng,
    locationKey,
  });
}

module.exports = { analyzeBlueprint, ROOM_POOL };
