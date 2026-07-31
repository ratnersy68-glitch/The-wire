/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Black-and-white noir palette. Names are kept from the original
        // (navy/beige/cork/termGreen) so component classNames didn't need
        // touching — only the values moved to grayscale.
        navy: {
          950: '#080808',
          900: '#121212',
          800: '#191919',
          700: '#212121',
        },
        charcoal: {
          900: '#161616',
          800: '#202020',
          700: '#2b2b2b',
          600: '#3a3a3a',
        },
        beige: {
          200: '#efefec',
          300: '#cfcfca',
          400: '#a3a39c',
        },
        muted: {
          red: '#a13d3d',
          redDark: '#7a2c2c',
        },
        cork: {
          800: '#3a3a3a',
          700: '#474747',
          600: '#555555',
          500: '#6b6b6b',
        },
        termGreen: {
          400: '#f5f5f2',
          500: '#e2e2de',
          600: '#8f8f89',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        serif: ['Georgia', 'serif'],
        handwritten: [
          '"Caveat"',
          '"Segoe Print"',
          '"Bradley Hand"',
          '"Chalkboard SE"',
          '"Comic Sans MS"',
          '"Comic Sans"',
          'cursive',
        ],
      },
      animation: {
        'flicker': 'flicker 3s infinite',
        'pin-drop': 'pinDrop 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'stamp-slam': 'stampSlam 0.5s cubic-bezier(0.2, 1.6, 0.4, 1)',
        'draw-line': 'drawLine 0.6s ease-out forwards',
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
        stampSlam: {
          '0%': { transform: 'scale(2.8) rotate(-16deg)', opacity: '0' },
          '55%': { transform: 'scale(0.94) rotate(-8deg)', opacity: '1' },
          '75%': { transform: 'scale(1.08) rotate(-9deg)' },
          '100%': { transform: 'scale(1) rotate(-8deg)', opacity: '1' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
}
