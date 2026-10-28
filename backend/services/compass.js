// services/compass.js
//
// A photo alone cannot tell you which way is North — that information
// simply isn't in the pixels. So Buildeye asks the user to set North with
// an on-screen compass control before analysis, and every direction-based
// recommendation (Vastu placement, ventilation) is computed from that
// user-supplied orientation, not invented by a model. This keeps the
// feature honest instead of pretending an AI can infer geography from an
// image.

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

// dx, dy: offset of a room's centre from the plan's centre, in normalized
// image coordinates where +x is right and +y is DOWN (image convention).
// northAngle: degrees clockwise from "up" in the image to true North, as
// set by the user on the compass control (0 = top of image is North).
function bearingFromOffset(dx, dy, northAngle = 0) {
  // Angle of the point measured clockwise from "up" in image space.
  const imageAngle = (Math.atan2(dx, -dy) * 180) / Math.PI; // -180..180, 0 = up
  const normalizedImageAngle = (imageAngle + 360) % 360;

  // Rotate into true compass bearing using the user-set North offset.
  const bearing = (normalizedImageAngle - northAngle + 360) % 360;
  return bearing;
}

function bearingToDirection(bearing) {
  const index = Math.round(bearing / 45) % 8;
  return DIRECTIONS[index];
}

function directionOfRoom(room, northAngle) {
  // room.box is {xPct, yPct, wPct, hPct} on a 0-100 grid representing the
  // whole plan; compare its centre against the plan's centre (50, 50).
  const centreX = room.box.xPct + room.box.wPct / 2;
  const centreY = room.box.yPct + room.box.hPct / 2;
  const dx = centreX - 50;
  const dy = centreY - 50;
  const bearing = bearingFromOffset(dx, dy, northAngle);
  return { bearing: Math.round(bearing), direction: bearingToDirection(bearing) };
}

module.exports = { DIRECTIONS, bearingFromOffset, bearingToDirection, directionOfRoom };
