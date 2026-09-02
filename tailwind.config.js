/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F172A', // Navy
          light: '#1E293B',
          dark: '#020617',
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber / Gold
          hover: '#D97706',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#EF4444', // Red
          hover: '#DC2626',
        },
        success: {
          DEFAULT: '#10B981', // Emerald
          hover: '#059669',
        },
        pending: {
          DEFAULT: '#78716C', // Warm gray
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Cairo', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};