/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0e14',
          900: '#0f1620',
          800: '#151d2b',
          700: '#1c2636',
        },
        charcoal: {
          900: '#1a1a1a',
          800: '#242424',
          700: '#2e2e2e',
          600: '#3a3a3a',
        },
        beige: {
          200: '#e8dfc8',
          300: '#ddd0ae',
          400: '#c9b98f',
        },
        muted: {
          red: '#a13d3d',
          redDark: '#7a2c2c',
        },
        cork: {
          800: '#5c4433',
          700: '#6e5138',
          600: '#83603f',
          500: '#9c7248',
        },
        termGreen: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        serif: ['Georgia', 'serif'],
      },
      animation: {
        'flicker': 'flicker 3s infinite',
        'pin-drop': 'pinDrop 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
        },
        pinDrop: {
          '0%': { transform: 'scale(0) rotate(-20deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
