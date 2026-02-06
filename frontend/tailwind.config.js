/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          light: "#3b82f6",
          dark: "#1e40af",
        },
        secondary: {
          DEFAULT: "#9333ea",
        },
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
        background: "#f8fafc",
        foreground: "#020617",
        muted: "#64748b",
        border: "#e2e8f0",
      },
    },
  },
  plugins: [],
}