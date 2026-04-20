import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#060606',
          surface: '#0e0e0e',
          elevated: '#161616',
        },
        accent: {
          DEFAULT: '#C9A84C',
          bright: '#E5C870',
          dim: '#9A7A30',
          muted: 'rgba(201,168,76,0.10)',
        },
        status: {
          increase: '#4ade80',
          keep: '#C9A84C',
          decrease: '#f87171',
        },
        gold: '#C9A84C',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.12em',
        wide: '0.06em',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(201,168,76,0.18)',
        'gold': '0 4px 24px rgba(201,168,76,0.22)',
        'gold-lg': '0 8px 40px rgba(201,168,76,0.28)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2.4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
