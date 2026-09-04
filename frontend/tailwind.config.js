/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        heading: ['Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        brand: {
          sand: '#F0F6FF',
          cream: '#F8FAFC',
          terracotta: '#0066FF',
          coral: '#2563EB',
          blue: '#0066FF',
          darkblue: '#0052CC',
          indigo: '#0A1B39',
          navy: '#0A1B39',
          mitti: '#DBEAFE',
          border: '#E2E8F0',
          gold: '#3B82F6',
          leaf: '#10B981',
          charcoal: '#0F172A',
        },
        chart: {
          '1': '#0066FF',
          '2': '#0A1B39',
          '3': '#10B981',
          '4': '#38BDF8',
          '5': '#6366F1'
        }
      },
      boxShadow: {
        card: '0 4px 20px rgba(10,27,57,0.06)',
        'card-hover': '0 8px 30px rgba(0,102,255,0.12)',
        lift: '0 12px 40px rgba(10,27,57,0.12)',
        glow: '0 0 25px rgba(0,102,255,0.3)',
        nav: '0 -4px 20px rgba(10,27,57,0.05)',
        'inner-card': 'inset 0 2px 10px rgba(10,27,57,0.03)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-in-right': { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        'float': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'pulse-soft': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.8 } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.35s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'slide-in-right': 'slide-in-right 0.35s ease-out both',
        'scale-in': 'scale-in 0.3s ease-out both',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
