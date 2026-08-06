/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sonic: {
          bg: '#0B0F19',
          card: '#151D2A',
          border: '#2A364F',
          accent: '#3B82F6',
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          pink: '#EC4899',
          gold: '#F59E0B',
          green: '#10B981'
        }
      }
    },
  },
  plugins: [],
}
