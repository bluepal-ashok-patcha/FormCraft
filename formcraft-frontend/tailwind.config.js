/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          500: '#7C3AED', // Vibrant Purple from image
          600: '#6D28D9',
          default: '#7C3AED',
        },
        accent: {
          orange: '#FF7D52', // Coral/Orange from cards
          yellow: '#FFC300', // Yellow from progress
          blue: '#52B1FF',   // Blue from acquisitions
        },
        slate: {
          50: '#F8F9FE', // Base background tint
          100: '#F0F2FD',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      borderRadius: {
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '6px',
        'xl': '6px',
        '2xl': '6px',
        '3xl': '6px',
        'enterprise': '6px',
      },
      animation: {
        'subtle-fade': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}