// services/imageMeta.js
//
// Reads pixel width/height directly from JPEG/PNG file bytes, with no
// external dependencies (avoiding a native image-processing library keeps
// `npm install` reliable everywhere — see the same reasoning in
// store/userStore.js). This isn't computer vision — it can't identify
// rooms — but it lets the demo analyzer ground its plot-size and layout
// guesses in the actual uploaded image's real aspect ratio, instead of
// being pure randomness disconnected from what was uploaded.

function readPNGDimensions(buffer) {
  // PNG signature (8 bytes) + IHDR chunk: 4-byte length, 4-byte "IHDR",
  // then 4-byte width, 4-byte height, big-endian.
  if (buffer.length < 24) return null;
  const isPng =
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  if (!isPng) return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function readJPEGDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length - 9) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    // SOF0..SOF15 markers (excluding DHT/JPG/DAC) carry the frame's
    // dimensions. This covers the vast majority of real-world JPEGs.
    const isSOF =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isSOF) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    offset += 2 + segmentLength;
  }
  return null;
}

// Returns { width, height } or null if the format isn't recognised /
// the file is malformed. Never throws — callers should treat null as
// "no extra grounding available" and fall back gracefully.
function getImageDimensions(buffer) {
  try {
    return readPNGDimensions(buffer) || readJPEGDimensions(buffer);
  } catch (err) {
    return null;
  }
}

module.exports = { getImageDimensions };
