// services/analysisEngine.js
//
// Domain logic that turns a detected room list + plot size into an
// execution plan, material/labour estimate, cost breakdown, and
// Vastu/ventilation guidance. This part doesn't need computer vision — it's
// the same regardless of whether the room list came from the built-in demo
// detector (services/mockAnalyzer.js) or a real AI vision call
// (services/aiAnalyzer.js), so both share this one implementation.

const { directionOfRoom } = require("./compass");
const { VASTU_GUIDE } = require("../data/vastuGuidelines");
const { VENTILATION_GUIDE } = require("../data/ventilationGuidelines");
const { getLocationByKey } = require("../data/locationRates");

function buildExecutionPlan(plotSizeSqft, floors, rng) {
  const scale = Math.max(0.6, Math.min(2.2, plotSizeSqft / 1400)) * (0.85 + floors * 0.2);

  const phases = [
    { phase: "Site preparation & excavation", baseWeeks: 1.2, tools: ["Excavator/JCB", "Survey instruments", "Marking tools"] },
    { phase: "Foundation", baseWeeks: 2.5, tools: ["Concrete mixer", "Vibrator", "Shuttering plates", "Rebar cutter"] },
    { phase: "Structural framing (columns, beams, slab)", baseWeeks: 4, tools: ["Concrete mixer", "Scaffolding", "Shuttering plywood", "Vibrator"] },
    { phase: "Brickwork & wall construction", baseWeeks: 3.5, tools: ["Mason tools", "Scaffolding", "Spirit level"] },
    { phase: "Roofing / slab finishing", baseWeeks: 1.5, tools: ["Waterproofing kit", "Concrete mixer"] },
    { phase: "Electrical & plumbing rough-in", baseWeeks: 2, tools: ["Conduit pipes", "Wiring", "PVC/CPVC pipes", "Hand tools"] },
    { phase: "Plastering & flooring", baseWeeks: 3, tools: ["Plastering trowels", "Tile cutter", "Spirit level"] },
    { phase: "Doors, windows & fixtures", baseWeeks: 1.5, tools: ["Door/window frames", "Hardware fittings", "Drill machine"] },
    { phase: "Painting & finishing", baseWeeks: 2, tools: ["Paint sprayer/rollers", "Sandpaper", "Ladders"] },
    { phase: "Final inspection & handover", baseWeeks: 0.5, tools: ["Checklist & inspection tools"] },
  ];

  let cursor = 0;
  const plan = phases.map((p) => {
    const jitter = rng ? 0.9 + rng.next() * 0.2 : 1;
    const weeks = Math.round(p.baseWeeks * scale * jitter * 10) / 10;
    const startWeek = Math.round(cursor * 10) / 10;
    cursor += weeks;
    return { phase: p.phase, tools: p.tools, durationWeeks: weeks, startWeek, endWeek: Math.round(cursor * 10) / 10 };
  });

  return { plan, totalWeeks: Math.round(cursor * 10) / 10 };
}

function buildMaterialsAndLabor(plotSizeSqft, floors) {
  const area = plotSizeSqft * floors;

  // Illustrative consumption rates per sq.ft — commonly cited rough
  // planning figures, not a substitute for a quantity surveyor's estimate.
  const materials = [
    { item: "Cement (bags)", quantity: Math.round(area * 0.4) },
    { item: "Steel/TMT bars (kg)", quantity: Math.round(area * 3.5) },
    { item: "Bricks/blocks (units)", quantity: Math.round(area * 8) },
    { item: "Sand (cubic ft)", quantity: Math.round(area * 1.2) },
    { item: "Aggregate/gravel (cubic ft)", quantity: Math.round(area * 0.9) },
    { item: "Flooring tiles (sq.ft)", quantity: Math.round(area * 0.95) },
    { item: "Paint (litres)", quantity: Math.round(area * 0.12) },
  ];

  const labor = [
    { role: "Mason", count: Math.max(2, Math.round(area / 450)) },
    { role: "Helper / unskilled labour", count: Math.max(3, Math.round(area / 300)) },
    { role: "Electrician", count: Math.max(1, Math.round(area / 1800)) },
    { role: "Plumber", count: Math.max(1, Math.round(area / 2200)) },
    { role: "Carpenter", count: Math.max(1, Math.round(area / 1600)) },
    { role: "Painter", count: Math.max(1, Math.round(area / 1400)) },
  ];

  return { materials, labor };
}

// Construction cost scales with a region multiplier (metros cost more per
// sq.ft to build than smaller towns — labour, transport and material
// costs are themselves higher there). Land value is estimated separately
// from the plot's footprint (not the total built-up area across floors,
// since land is bought by footprint, not by floor) using the same
// location's illustrative land rate — kept as a distinct figure from the
// construction estimate rather than folded into one number, since they
// answer different questions ("what will it cost to build" vs. "roughly
// what is this land worth").
function buildCostEstimate(plotSizeSqft, floors, rng, location) {
  const area = plotSizeSqft * floors;
  const baseRate = rng ? rng.int(1800, 2600) : 2200; // illustrative baseline INR/sqft construction rate
  const multiplier = location?.constructionMultiplier ?? 1;
  const ratePerSqft = Math.round(baseRate * multiplier);

  const total = Math.round(area * ratePerSqft);

  const allocation = [
    { phase: "Foundation", pct: 12 },
    { phase: "Structural framing", pct: 28 },
    { phase: "Brickwork & walls", pct: 15 },
    { phase: "Roofing", pct: 8 },
    { phase: "Electrical & plumbing", pct: 12 },
    { phase: "Finishing (flooring, painting, fixtures)", pct: 20 },
    { phase: "Contingency & miscellaneous", pct: 5 },
  ];

  const breakdown = allocation.map((a) => ({
    phase: a.phase,
    amount: Math.round((total * a.pct) / 100),
    pct: a.pct,
  }));

  const result = { ratePerSqft, totalEstimate: total, breakdown, areaUsed: area };

  if (location) {
    const landRatePerSqft = location.landRatePerSqft;
    result.location = { key: location.key, city: location.city, state: location.state, tier: location.tier };
    result.land = {
      ratePerSqft: landRatePerSqft,
      footprintSqft: plotSizeSqft,
      estimate: Math.round(landRatePerSqft * plotSizeSqft),
    };
  }

  return result;
}

function buildVastuGuidance(rooms, northAngle) {
  return rooms
    .filter((r) => VASTU_GUIDE[r.name])
    .map((r) => {
      const { direction, bearing } = directionOfRoom(r, northAngle);
      const guide = VASTU_GUIDE[r.name];
      let status = "Neutral";
      if (guide.ideal.includes(direction)) status = "Well aligned";
      else if (guide.avoid.includes(direction)) status = "Consider adjusting";
      else if (guide.acceptable.includes(direction)) status = "Acceptable";

      return {
        room: r.name,
        detectedDirection: direction,
        bearing,
        status,
        idealDirections: guide.ideal,
        rationale: guide.rationale,
      };
    });
}

function buildVentilationGuidance(rooms, northAngle) {
  return rooms
    .filter((r) => VENTILATION_GUIDE[r.name])
    .map((r) => {
      const { direction } = directionOfRoom(r, northAngle);
      const guide = VENTILATION_GUIDE[r.name];
      return {
        room: r.name,
        detectedDirection: direction,
        recommendation: guide.windowAdvice,
        preferredWindowDirections: guide.preferred,
        matchesPreferred: guide.preferred.includes(direction),
      };
    });
}

// Ties everything together into the final analysis object returned by the
// API, given a detected room list + plot size + floor count (from either
// detector), the user-set North angle, and an optional Indian city/region
// key used to make the cost estimate location-aware.
function composeAnalysis({ source, rooms, plotSizeSqft, floors, northAngle = 0, projectType, rng, locationKey }) {
  const location = locationKey ? getLocationByKey(locationKey) : null;

  const { plan: executionPlan, totalWeeks } = buildExecutionPlan(plotSizeSqft, floors, rng);
  const { materials, labor } = buildMaterialsAndLabor(plotSizeSqft, floors);
  const cost = buildCostEstimate(plotSizeSqft, floors, rng, location);
  const vastu = buildVastuGuidance(rooms, northAngle);
  const ventilation = buildVentilationGuidance(rooms, northAngle);

  const resolvedProjectType =
    projectType ||
    (plotSizeSqft > 3000 ? "Independent house / villa" : plotSizeSqft > 1500 ? "Family home" : "Compact residential unit");

  const locationPhrase = location ? ` in ${location.city}` : "";

  return {
    source,
    projectType: resolvedProjectType,
    plotSizeSqft,
    floors,
    rooms,
    northAngle,
    executionPlan,
    totalTimelineWeeks: totalWeeks,
    materials,
    labor,
    cost,
    vastu,
    ventilation,
    summary: `Detected a ${floors}-floor ${resolvedProjectType.toLowerCase()}${locationPhrase} of roughly ${plotSizeSqft} sq.ft with ${rooms.length} identifiable rooms. Estimated construction timeline is ${totalWeeks} weeks at an illustrative rate of \u20b9${cost.ratePerSqft}/sq.ft${location ? ` (adjusted for ${location.city})` : ""}.`,
  };
}

module.exports = {
  buildExecutionPlan,
  buildMaterialsAndLabor,
  buildCostEstimate,
  buildVastuGuidance,
  buildVentilationGuidance,
  composeAnalysis,
};
