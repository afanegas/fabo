/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cabo: {
          dark: '#0a0a0f',
          darker: '#060609',
          card: '#1a1a2e',
          accent: '#d4af37',
          accentLight: '#f0d060',
          green: '#2ecc71',
          red: '#e74c3c',
          purple: '#6c3483',
          surface: '#16162a',
          surfaceLight: '#242445',
          text: '#e8e8f0',
          textDim: '#8888aa',
          border: '#2a2a4a',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'cabo-alert': 'caboAlert 1s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'card-deal': 'cardDeal 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212,175,55,0.3), 0 0 20px rgba(212,175,55,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(212,175,55,0.6), 0 0 40px rgba(212,175,55,0.3)' },
        },
        caboAlert: {
          '0%, 100%': { borderColor: 'rgba(231,76,60,0.2)' },
          '50%': { borderColor: 'rgba(231,76,60,0.8)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        cardDeal: {
          from: { opacity: '0', transform: 'translateY(-40px) scale(0.8)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'card-pattern': 'radial-gradient(circle at 20% 50%, rgba(212,175,55,0.05) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};
