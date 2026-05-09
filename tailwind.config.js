module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-lora)', 'serif'],
      },
      colors: {
        tribu: {
          terracotta: 'var(--tribu-terracotta)',
          ochre: 'var(--tribu-ochre)',
          earth: 'var(--tribu-earth)',
          sand: 'var(--tribu-sand)',
          'sand-light': 'var(--tribu-sand-light)',
          'burnt-sienna': 'var(--tribu-burnt-sienna)',
          'terracotta-light': 'var(--tribu-terracotta-light)',
          'ochre-dark': 'var(--tribu-ochre-dark)',
          'earth-light': 'var(--tribu-earth-light)',
          dark: 'var(--tribu-dark)',
          gray: 'var(--tribu-gray)',
          light: 'var(--tribu-light)',
        },
      },
      animation: {
        aurora: 'aurora 20s ease infinite',
        'aurora-variant': 'aurora 25s ease infinite',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-slower': 'float-slower 10s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-left': 'fadeInLeft 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-right': 'fadeInRight 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        pulse: 'pulse 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-up': 'slideInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        shimmer: 'shimmer 2s infinite',
        glow: 'glow 2s ease-in-out infinite',
        'rotate': 'rotate 20s linear infinite',
        'particle-1': 'particle-1 8s ease-in-out infinite',
        'particle-2': 'particle-2 10s ease-in-out infinite',
        'particle-3': 'particle-3 12s ease-in-out infinite',
      },
      keyframes: {
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(1deg)' },
        },
        'float-slower': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(-1deg)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          'from': { opacity: '0', transform: 'translateX(-30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          'from': { opacity: '0', transform: 'translateX(30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateX(-15px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(217, 93, 57, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(217, 93, 57, 0.6)' },
        },
        rotate: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'particle-1': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(30px, -50px)' },
          '50%': { transform: 'translate(-20px, -100px)' },
          '75%': { transform: 'translate(50px, -30px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        'particle-2': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-40px, 40px)' },
          '50%': { transform: 'translate(30px, -60px)' },
          '75%': { transform: 'translate(-60px, 20px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        'particle-3': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(50px, -30px)' },
          '50%': { transform: 'translate(-30px, 60px)' },
          '75%': { transform: 'translate(40px, -40px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-terracotta': '0 0 20px rgba(217, 93, 57, 0.3)',
        'glow-ochre': '0 0 20px rgba(236, 164, 0, 0.3)',
        'glass': '0 8px 32px 0 rgba(91, 65, 54, 0.05)',
        'glass-lg': '0 16px 48px 0 rgba(91, 65, 54, 0.12)',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
}