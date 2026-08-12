/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          bg: '#060b16',
          surface: '#0e1a30',
          border: '#1f3252',
        },
        brand: {
          light: '#cfe6f8',
          DEFAULT: '#7fb8e8',
          dark: '#3d6fa8',
          deep: '#152a4a',
        },
        sky: {
          good: '#3ddc84',
          okay: '#f5b642',
          bad: '#f14c4c',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0.15, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.15)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.35, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.12)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        dash: {
          '0%': { strokeDashoffset: 'var(--circumference)' },
          '100%': { strokeDashoffset: 'var(--offset)' },
        },
        driftCloud: {
          '0%': { transform: 'translateX(-30vw)' },
          '100%': { transform: 'translateX(130vw)' },
        },
      },
      animation: {
        twinkle: 'twinkle linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'score-dash': 'dash 1.2s ease-out forwards',
        'drift-cloud': 'driftCloud linear infinite',
      },
    },
  },
  plugins: [],
}
