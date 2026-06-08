/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#0a0a0f',
        'cyber-dark': '#12121f',
        'cyber-border': '#1a1a2e',
        'cyber-white': '#e0e0e0',
        'cyber-gray': '#6b7280',
        'cyber-blue': '#00d4ff',
        'cyber-purple': '#8b5cf6',
        'cyber-red': '#ff0040',
        'cyber-glow': 'rgba(0, 212, 255, 0.1)',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
        'noto': ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'scan': 'scan 3s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'glitch-card': 'glitchCard 0.3s ease-in-out',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-1px, -1px)' },
          '80%': { transform: 'translate(1px, 1px)' },
        },
        glitchCard: {
          '0%': { transform: 'translate(0)', filter: 'none' },
          '30%': { transform: 'translate(-5px, 3px)', filter: 'hue-rotate(90deg)' },
          '60%': { transform: 'translate(5px, -3px)', filter: 'hue-rotate(-90deg)' },
          '100%': { transform: 'translate(0)', filter: 'none' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.4)' },
        },
      },
      boxShadow: {
        'cyber': '0 0 30px rgba(0, 212, 255, 0.15)',
        'cyber-hover': '0 0 50px rgba(0, 212, 255, 0.25)',
        'cyber-purple': '0 0 30px rgba(139, 92, 246, 0.2)',
        'cyber-red': '0 0 30px rgba(255, 0, 64, 0.2)',
      },
    },
  },
  plugins: [],
}
