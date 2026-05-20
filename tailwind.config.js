/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f8f9fc',
          100: '#eef0f6',
          200: '#dcdfeb',
          300: '#b9bed1',
          400: '#8d93ab',
          500: '#5d6481',
          600: '#3f4566',
          700: '#272c47',
          800: '#171a2e',
          900: '#0c0e1c',
        },
        brand: {
          50: '#f5efff',
          100: '#ebdfff',
          200: '#d6c0ff',
          300: '#bb9aff',
          400: '#9a6fff',
          500: '#7c44ff',
          600: '#6730ec',
          700: '#5121c2',
          800: '#3d1894',
          900: '#270f64',
        },
        accent: {
          peach: '#ffb38a',
          coral: '#ff6f91',
          aqua: '#5be1ff',
          lime: '#b8ff5b',
          sun: '#ffe27a',
        },
      },
      boxShadow: {
        soft: '0 10px 40px -20px rgba(60, 30, 140, 0.18)',
        glow: '0 0 0 1px rgba(124,68,255,0.18), 0 18px 48px -16px rgba(124,68,255,0.4)',
        card: '0 1px 2px rgba(15,17,40,0.04), 0 8px 28px -16px rgba(60,30,140,0.18)',
        ring: '0 0 0 6px rgba(124,68,255,0.12)',
      },
      backgroundImage: {
        'aurora':
          'radial-gradient(1100px 600px at 8% -10%, rgba(255,170,210,0.55), transparent 60%), radial-gradient(900px 500px at 95% 10%, rgba(122,255,200,0.42), transparent 60%), radial-gradient(1000px 700px at 50% 110%, rgba(155,110,255,0.45), transparent 60%)',
        'mesh':
          'radial-gradient(circle at 0% 0%, rgba(255,178,140,0.5), transparent 45%), radial-gradient(circle at 100% 0%, rgba(91,225,255,0.45), transparent 45%), radial-gradient(circle at 50% 100%, rgba(155,110,255,0.55), transparent 50%)',
        'sheen':
          'linear-gradient(110deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0) 70%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'aurora-pan': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(-2%, 2%, 0) scale(1.05)' },
        },
        'gradient-text': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'aurora-pan': 'aurora-pan 14s ease-in-out infinite',
        'gradient-text': 'gradient-text 8s ease infinite',
      },
    },
  },
  plugins: [],
}
