/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {

        primary: { DEFAULT: '#0F766E', hover: '#14B8A6' },
        teal: { DEFAULT: '#0F766E', bright: '#14B8A6' },
        coral: { DEFAULT: '#FF6B4A' },
        golden: { DEFAULT: '#F4B942' },
        green: { DEFAULT: '#4F8A5B' },
        charcoal: { DEFAULT: '#172B2F' },
        bg: { DEFAULT: '#F8FAF9' },
        white: { DEFAULT: '#FFFFFF' },
        muted: { DEFAULT: '#66777A' },
        danger: { DEFAULT: '#DC5C5C' },

        // Keeping these aliases temporarily if existing files strictly need them, 
        // but pointing them to the new palette.
        secondary: '#66777A',
        ocean: '#172B2F',
        sunset: '#FF6B4A',
        dune: '#F8FAF9',
        sand: '#F8FAF9',
        grayblue: '#66777A',
        success: '#4F8A5B',
        warning: '#F4B942',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },

      fontSize: {
        'display-xl': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['4rem', { lineHeight: '1.07', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },

      borderRadius: {
        '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem',
      },

      boxShadow: {
        'travel': '0 4px 24px rgba(7,59,76,0.08)',
        'travel-md': '0 8px 32px rgba(7,59,76,0.10)',
        'travel-lg': '0 16px 48px rgba(7,59,76,0.13)',
        'teal': '0 8px 24px rgba(22,166,160,0.30)',
        'sunset': '0 8px 24px rgba(231,111,81,0.30)',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },

      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },

      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.25,0.1,0.25,1)',
        'spring': 'cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  plugins: [],
}
