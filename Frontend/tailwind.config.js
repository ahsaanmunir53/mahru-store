/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF7F1',
        paper: '#FFFFFF',
        ink: '#1A1814',
        muted: '#7A7062',
        line: '#E9E3D7',
        gold: '#9C7C46',
        henna: '#7E3B2C',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { label: '0.18em' },
      aspectRatio: { product: '3 / 4' },
    },
  },
  plugins: [],
};
