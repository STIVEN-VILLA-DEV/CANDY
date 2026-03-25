/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#020c08",
        surface: "#061410",
        "surface-2": "#0d2318",
        emerald: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
          glow: "#10b98140",
          "glow-strong": "#10b98180",
        },
        mint: { DEFAULT: "#6ee7b7", dim: "#6ee7b730" },
        jade: { DEFAULT: "#00c896", glow: "#00c89650" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "DM Sans", "sans-serif"],
        heading: ["var(--font-heading)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "laser-scan": "laserScan 2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        laserScan: {
          "0%, 100%": { top: "0%" },
          "50%": { top: "calc(100% - 2px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
