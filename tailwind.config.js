/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        health: {
          normal: '#10b981',
          elevated: '#f59e0b',
          stage1: '#f97316',
          stage2: '#ef4444',
          crisis: '#b91c1c'
        }
      }
    },
  },
  plugins: [],
}
