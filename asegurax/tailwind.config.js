/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#292F2E', 2: '#323938', deep: '#1F2423' },
        surface: '#353C3B',
        ink: { DEFAULT: '#F5F6F5', muted: '#AEB7B4' },
        accent: { red: '#FF4B3E', orange: '#FF7A32', yellow: '#FFB43B' },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        brand: 'linear-gradient(135deg, #FF4B3E 0%, #FF7A32 50%, #FFB43B 100%)',
      },
      keyframes: {
        hotspot: {
          '0%': { transform: 'scale(0.6)', opacity: '0.9' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'loader-arc': {
          '0%': { strokeDasharray: '0 100', strokeDashoffset: '0' },
          '50%': { strokeDasharray: '100 100', strokeDashoffset: '0' },
          '100%': { strokeDasharray: '100 100', strokeDashoffset: '-100' },
        },
        nudge: {
          '0%, 100%': { transform: 'translateX(-3px)' },
          '50%': { transform: 'translateX(3px)' },
        },
      },
      animation: {
        hotspot: 'hotspot 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'loader-arc': 'loader-arc 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite',
        nudge: 'nudge 1.8s ease-in-out infinite',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(255, 122, 50, 0.45)',
        panel: '0 24px 60px -20px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
