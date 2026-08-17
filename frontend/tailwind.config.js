/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F172A',
          navyDark: '#0B1120',
          blue: '#2563EB',
          blueHover: '#1D4ED8',
          cyan: '#06B6D4',
          teal: '#0D9488',
          emerald: '#10B981',
          amber: '#F59E0B',
          bgLight: '#F8FAFC',
          bgDark: '#0B1120',
          cardLight: '#FFFFFF',
          cardDark: '#1E293B',
          textPrimaryLight: '#0F172A',
          textSecondaryLight: '#64748B',
          textPrimaryDark: '#F8FAFC',
          textSecondaryDark: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card-glow': '0 10px 30px -5px rgba(37, 99, 235, 0.12)',
        'premium': '0 20px 50px rgba(15, 23, 42, 0.06)',
        'premium-dark': '0 20px 50px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
