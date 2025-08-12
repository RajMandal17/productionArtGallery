/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'dark-bg': '#121212',
        'dark-card': '#1e1e1e',
        'dark-border': '#333333',
        'dark-text': '#e0e0e0'
      }
    },
  },
  plugins: [],
};
