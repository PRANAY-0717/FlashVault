import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090909",
        surface: "#111111",
        "surface-2": "#1a1a1a",
        border: "#222222",
        emerald: {
          DEFAULT: "#10b981",
          dark: "#059669",
          glow: "#34d399",
        },
        indigo: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
        },
        amber: {
          DEFAULT: "#f59e0b",
          dark: "#d97706",
        },
        danger: "#ef4444",
        muted: "#9ca3af",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "aurora": "aurora 8s ease-in-out infinite",
      },
      keyframes: {
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(16,185,129,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(16,185,129,0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        aurora: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid":
          "linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        emerald: "0 0 30px rgba(16,185,129,0.3)",
        "emerald-lg": "0 0 60px rgba(16,185,129,0.4)",
        indigo: "0 0 30px rgba(99,102,241,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;

