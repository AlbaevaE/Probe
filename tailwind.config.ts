import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f5f3f2",
        surface: "#fafaf9",
        border: "#d6d0c8",
        muted: "#6b5f54",
        fg: "#2c2523",
        accent: "#9b3e14",
        done: "#4d6a23",
        locked: "#b8a379",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          '"Playfair Display"',
          "Georgia",
          "serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
