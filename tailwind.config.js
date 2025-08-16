/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./*.vue"
  ],
  theme: {
    extend: {
      colors: {
        'dark-player': {
          DEFAULT: '#1a2332',
          light: '#243041',
          dark: '#141b27',
          border: '#2a3544',
        }
      }
    },
  },
  plugins: [],
}

