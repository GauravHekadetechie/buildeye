// services/seededRandom.js
// A tiny, dependency-free seeded PRNG (mulberry32) so the same uploaded
// image produces a consistent analysis instead of a different one on every
// re-analysis — closer to how a real model would behave on the same input.

function hashToSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(seedString) {
  const seedFn = hashToSeed(String(seedString));
  const rng = mulberry32(seedFn());
  return {
    next: () => rng(),
    int: (min, max) => Math.floor(rng() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(rng() * arr.length)],
    shuffle: (arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
  };
}

module.exports = { createRng };
