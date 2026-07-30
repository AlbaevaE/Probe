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
        // light surfaces (chapter/experiment pages)
        bg: "#FFFDF8",
        surface: "#F3EDE2",
        border: "#E5DFD2",
        muted: "#8A8175",
        fg: "#241F1A",
        accent: "#E05C4A",
        done: "#2A7F8C",
        locked: "#F2B134",
        // dark landing ("observatory") palette
        night: "#14162B",
        cream: "#F5F3EC",
        coral: "#FF7A66",
        sun: "#FFC94D",
        sky: "#4FC1CE",
        lilac: "#A88BE0",
        // light-page chapter accents
        teal: "#2A7F8C",
        gold: "#F2B134",
        plum: "#7B5EA7",
      },
      fontFamily: {
        sans: ["var(--font-body)", "Rubik", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Unbounded", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
