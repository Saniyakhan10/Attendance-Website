/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-white/3', 'bg-white/8', 'border-white/8', 'hover:bg-white/8',
    'hover:bg-white/3', 'bg-purple-500/8',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0e7ff',
          100: '#d9c2ff',
          200: '#c19dff',
          300: '#a978ff',
          400: '#9153ff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3d1678',
        },
        accent: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        dark: {
          50: '#1e1b4b',
          100: '#1a1730',
          200: '#141228',
          300: '#0f0d1f',
          400: '#0a0916',
          500: '#06050f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #1a1730 0%, #0f0d1f 50%, #1a1730 100%)',
        'purple-blue': 'linear-gradient(135deg, #7c3aed, #3b82f6)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124,58,237,0.4)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.4)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      opacity: {
        '3': '0.03',
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
      },
    },
  },
  plugins: [],
}
