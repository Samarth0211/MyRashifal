/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#F9F7F2',
        'bg-secondary': '#F1EDE5',
        'bg-card': '#FFFFFF',
        'gold-primary': '#86622F',
        'gold-light': '#775624',
        'text-primary': '#292638',
        'text-secondary': '#716E79',
        'accent-red': '#ef4444',
        'accent-green': '#22c55e',
        'border-custom': '#E4DFD6',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'Lato', 'sans-serif'],
        hindi: ['Tiro Devanagari Hindi', 'serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9951a, #e8bf4b)',
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'twinkle-delayed': 'twinkle 3s ease-in-out 1s infinite',
        'twinkle-slow': 'twinkle 4s ease-in-out 0.5s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-up-delayed': 'slideUp 0.6s ease-out 0.15s both',
        'slide-up-delayed-2': 'slideUp 0.6s ease-out 0.3s both',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'text-shimmer': 'text-shimmer 4s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 149, 26, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 149, 26, 0.25), 0 0 80px rgba(201, 149, 26, 0.1)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
};
