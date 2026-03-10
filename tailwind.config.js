/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Sora"', 'sans-serif'],
      },
      colors: {
        'gov-navy': '#0A3D6B',
        'gov-teal': '#00BCD4',
        'gov-bg': '#F7F9FB',
        'gov-card': '#FFFFFF',
        'gov-light-surface': '#E8F4FD',
        'gov-dark-navy': '#050E1A',
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'subtle-hover': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
