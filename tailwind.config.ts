import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        sand: "#f1f5f9",
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1"
        },
        accent: {
          500: "#14b8a6",
          600: "#0f766e"
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626"
        },
        warning: {
          500: "#f59e0b",
          600: "#d97706"
        },
        success: {
          500: "#22c55e",
          600: "#16a34a"
        }
      },
      boxShadow: {
        card: "0 3px 5px 30px rgba(0, 0, 0, 0.12)",
        soft: "0 20px 48px rgba(0, 0, 0, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      fontFamily: {
        sans: ["var(--app-font)"]
      }
    }
  },
  plugins: []
};

export default config;
