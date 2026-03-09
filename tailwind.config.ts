import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: "#E8A317",
        coral: "#FF6B5A",
        ink: "#201A17",
        sand: "#F7F1E8",
        oat: "#EDE3D4",
        stone: "#8A7563",
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "sans-serif"],
        arabic: ["Geeza Pro", "Tahoma", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 60px rgba(32, 26, 23, 0.08)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top right, rgba(232,163,23,0.28), transparent 34%), radial-gradient(circle at bottom left, rgba(255,107,90,0.2), transparent 28%)",
      },
    },
  },
  plugins: [],
};

export default config;
