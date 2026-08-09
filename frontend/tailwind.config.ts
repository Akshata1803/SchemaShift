import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          mist: "#F4F7F1",       // Background
          green: "#6B8F71",      // Primary / Safe
          light: "#E1EADF",
          dark: "#4B6850",
        },
        forest: {
          ink: "#22301F",        // Primary text
          deep: "#152013",
          light: "#344830",
        },
        clay: {
          peach: "#E8A87C",      // Warning color
        },
        brick: {
          dusty: "#D9776A",      // Danger color
        },
        honey: {
          yellow: "#E8C36B",     // Caution color
        },
        glass: {
          surface: "rgba(255, 255, 255, 0.55)",
          border: "rgba(107, 143, 113, 0.25)",
          glow: "rgba(107, 143, 113, 0.35)",
        }
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Public Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
      },
      boxShadow: {
        terrarium: "0 12px 36px -8px rgba(34, 48, 31, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)",
        glass: "0 8px 32px 0 rgba(34, 48, 31, 0.06)",
        bloom: "0 0 28px rgba(107, 143, 113, 0.45)",
        wilt: "0 0 28px rgba(217, 119, 106, 0.45)",
      },
      backdropBlur: {
        glass: "16px",
      }
    },
  },
  plugins: [],
};
export default config;
