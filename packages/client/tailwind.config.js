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
        zixie: {
          bg: '#0A0D14',
          card: '#111726',
          border: '#1E293B',
          cyan: '#00F5D4',
          violet: '#7928CA',
          pink: '#FF007A',
        }
      }
    },
  },
  plugins: [],
}
