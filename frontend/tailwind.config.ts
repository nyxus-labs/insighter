import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        onyx: {
          50: '#f6f6f7',
          100: '#e3e3e5',
          200: '#c8c8cc',
          300: '#a3a3a8',
          400: '#75757e',
          500: '#56565f',
          600: '#424249',
          700: '#35353b',
          800: '#1a1a1f', // Dark panel background
          900: '#12121a', // Darker gradient end
          950: '#0a0a0f', // Deepest black-charcoal for background start
        },
        electric: {
          400: '#00f7ff', // Cyber Cyan
          500: '#00d0e0',
          600: '#0066ff', // Electric Blue
        },
        neon: {
          blue: '#0066ff',
          violet: '#8a2be2',
          emerald: '#00ffaa',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 10px rgba(0, 247, 255, 0.3), 0 0 20px rgba(0, 247, 255, 0.1)',
        'glow-cyan-lg': '0 0 20px rgba(0, 247, 255, 0.4), 0 0 40px rgba(0, 247, 255, 0.2)',
        'glow-blue': '0 0 10px rgba(0, 102, 255, 0.3), 0 0 20px rgba(0, 102, 255, 0.1)',
        'glow-violet': '0 0 10px rgba(138, 43, 226, 0.3), 0 0 20px rgba(138, 43, 226, 0.1)',
        'glow-emerald': '0 0 10px rgba(0, 255, 170, 0.3), 0 0 20px rgba(0, 255, 170, 0.1)',
        'cyber-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'cyber-panel-hover': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(0, 247, 255, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      backgroundImage: {
        'cyber-grid': "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        'cyber-gradient': "linear-gradient(to bottom right, #0a0a0f, #12121a)",
      }
    },
  },
  plugins: [],
};
export default config;
