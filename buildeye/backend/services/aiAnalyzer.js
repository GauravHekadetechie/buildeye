// services/aiAnalyzer.js
//
// The real computer-vision path: sends the uploaded blueprint/plan image to
// the Anthropic API and asks it to identify rooms and a rough layout. This
// only runs if ANTHROPIC_API_KEY is set in backend/.env — otherwise
// routes/blueprint.js falls back to services/mockAnalyzer.js so the feature
// still works with zero setup.
//
// The room-detection JSON returned here is fed into the same
// services/analysisEngine.js used by the mock path, so execution plan,
// cost, Vastu and ventilation logic is identical either way — only "what
// rooms are actually in this image" differs.

const { composeAnalysis } = require("./analysisEngine");
const { getAnthropicConfig } = require("./aiConfig");

const KNOWN_ROOM_TYPES = [
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

function buildPrompt() {
  return `You are analysing an uploaded construction blueprint, architectural floor plan, or a hand-drawn house layout sketch.

Identify the rooms/spaces visible in the plan and estimate the overall plot size.

Respond with ONLY valid JSON (no markdown fences, no commentary, no explanation) matching exactly this shape:

{
  "projectType": "short description, e.g. 'Family home' or 'Independent house / villa'",
  "plotSizeSqft": <integer, your best estimate of total built-up area in square feet across all floors>,
  "floors": <integer, number of floors/storeys shown or implied>,
  "rooms": [
    { "name": "<one of: ${KNOWN_ROOM_TYPES.join(", ")}>", "box": { "xPct": <0-100>, "yPct": <0-100>, "wPct": <0-100>, "hPct": <0-100> } }
  ]
}

Rules:
- "box" values are a normalized 0-100 grid over the whole image (xPct/yPct = top-left corner, wPct/hPct = width/height), approximating where that room sits in the image.
- Use only room names from the provided list — pick the closest match (e.g. a "Drawing Room" should be reported as "Living Room").
- List every distinct room/space you can identify, even roughly. If the plan is a hand-drawn sketch, do your best with approximate room labels.
- Do not include any rooms not visibly present.
- Return ONLY the JSON object, nothing else.`;
}

function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

async function analyzeBlueprintWithAI({ base64Image, mediaType, northAngle = 0, locationKey }) {
  const { apiKey, model } = getAnthropicConfig();
  if (!apiKey) {
    throw new Error("No Anthropic API key configured (add one in Admin → AI Settings, or set ANTHROPIC_API_KEY).");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
            { type: "text", text: buildPrompt() },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Anthropic API request failed (${response.status}): ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((c) => c.type === "text");
  if (!textBlock) {
    throw new Error("AI response contained no text content to parse.");
  }

  let parsed;
  try {
    parsed = JSON.parse(stripCodeFences(textBlock.text));
  } catch (err) {
    throw new Error(`Could not parse AI response as JSON: ${err.message}`);
  }

  if (!Array.isArray(parsed.rooms) || parsed.rooms.length === 0) {
    throw new Error("AI response did not include a usable room list.");
  }

  const rooms = parsed.rooms
    .filter((r) => r && r.name && r.box)
    .map((r) => ({
      name: KNOWN_ROOM_TYPES.includes(r.name) ? r.name : "Living Room",
      box: {
        xPct: clampPct(r.box.xPct),
        yPct: clampPct(r.box.yPct),
        wPct: clampPct(r.box.wPct, 5),
        hPct: clampPct(r.box.hPct, 5),
      },
    }));

  const plotSizeSqft = Number.isFinite(parsed.plotSizeSqft) ? Math.round(parsed.plotSizeSqft) : 1500;
  const floors = Number.isFinite(parsed.floors) && parsed.floors > 0 ? Math.round(parsed.floors) : 1;

  return composeAnalysis({
    source: "ai-vision",
    rooms,
    plotSizeSqft,
    floors,
    northAngle,
    projectType: typeof parsed.projectType === "string" ? parsed.projectType : undefined,
    rng: null,
    locationKey,
  });
}

function clampPct(value, min = 0) {
  const n = Number.isFinite(value) ? value : min;
  return Math.max(min, Math.min(100, n));
}

module.exports = { analyzeBlueprintWithAI };
