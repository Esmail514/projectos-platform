import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          darker: "#0B0F17",
          dark: "#0F172A",
          card: "#1E293B",
          border: "#334155",
          accent: "#0284C7",
          glow: "#38BDF8",
          emerald: "#10B981",
          rose: "#F43F5E",
          amber: "#F59E0B"
        }
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "var(--font-inter)", "sans-serif"]
      }
    },
  },
  plugins: [],
};

export default config;
