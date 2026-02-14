/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enables manual dark mode via .dark class
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF4FF",
          100: "#D9E6FF",
          200: "#B3CCFF",
          300: "#80A9FF",
          400: "#4D85FF",
          500: "#2563EB",
          600: "#1E4ED8",
          700: "#1B3FAF",
          800: "#162F85",
          900: "#0F1F5C",
        },
        academic: {
          DEFAULT: "#0EA5E9",
        },
        success: {
          DEFAULT: "#16A34A",
        },
        warning: {
          DEFAULT: "#F59E0B",
        },
        danger: {
          DEFAULT: "#DC2626",
        },
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        DEFAULT: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        md: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
