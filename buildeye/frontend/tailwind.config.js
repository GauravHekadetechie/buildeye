/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0F1C", // primary background - near-black blue
          panel: "#101828",   // card / panel surface
          line: "#1E2A3F",    // hairline borders, blueprint grid
        },
        slate: {
          soft: "#8593AC", // muted body text
        },
        signal: {
          DEFAULT: "#2F80ED", // electric blue - the "eye" / AI-vision accent
          dim: "#1F5FBF",
        },
        beam: {
          DEFAULT: "#F2994A", // construction orange - the "building" accent
          dim: "#C9772F",
        },
        mist: "#EDF1F7", // off-white text on dark backgrounds
        risk: {
          low: "#3CCB7F",
          medium: "#F2C94C",
          high: "#F2994A",
          critical: "#EB5757",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(rgba(47,128,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(47,128,237,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [],
};
