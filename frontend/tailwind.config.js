/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", 
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          dark: "#3B82F6",
        },
        accent: {
          DEFAULT: "#FACC15",
          dark: "#FDE047",
        },
        secondary: {
          DEFAULT: "#22C55E",
          dark: "#4ADE80",
        },
        background: {
          light: "#F8FAFC",
          dark: "#020617",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#020617",
        },
        text: {
          light: "#0F172A",
          dark: "#E5E7EB",
          muted: "#475569",
          mutedDark: "#94A3B8",
        },
        border: {
          light: "#E2E8F0",
          dark: "#1E293B",
        },
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
}