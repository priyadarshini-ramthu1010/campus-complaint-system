/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A', // Dark Blue (Navy)
          dark: '#172554',    // Very Dark Blue
          light: '#3B82F6'    // Lighter Blue
        },
        success: {
          DEFAULT: '#EC4899', // Pink (Vibrant Rose)
          dark: '#BE185D',
          light: '#F472B6'
        },
        warning: {
          DEFAULT: '#EAB308', // Yellow (Gold)
          dark: '#CA8A04',
          light: '#FEF08A'
        },
        danger: {
          DEFAULT: '#EF4444', // Red
          dark: '#DC2626',
          light: '#FCA5A5'
        },
        customBg: '#F8FAFC'
      }
    },
  },
  plugins: [],
}
