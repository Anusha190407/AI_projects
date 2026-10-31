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
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0f172a',
          navy: '#0a1128',
          sidebar: '#0b132b',
        },
        status: {
          green: '#10b981',
          blue: '#3b82f6',
          grey: '#6b7280',
          orange: '#f97316',
          red: '#ef4444',
          recovery: '#0d9488',
          sim: '#8b5cf6',
          assumption: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

