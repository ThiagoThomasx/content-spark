/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0a0f1a',
        panel: '#111827',
        line: '#263244',
        ember: '#f97316',
        mint: '#34d399',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(249,115,22,0.22), 0 24px 80px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
