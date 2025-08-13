/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#121212',
        'dark-card': '#1E1E1E',
        'dark-border': '#2D2D2D',
        'dark-text': '#E0E0E0',
        'dark-text-secondary': '#A0A0A0'
      }
    },
  },
  plugins: [],
};
