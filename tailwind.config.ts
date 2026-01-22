import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ChatGPT-style dark theme colors
        'navy-950': '#0d0d0d',  // Sidebar background (very dark)
        'navy-900': '#212121',  // Main background (dark gray)
        'navy-800': '#2f2f2f',  // Message backgrounds (lighter gray)
        'navy-700': '#3f3f3f',  // Borders (medium gray)
        
        // Accent colors - Gray theme
        'blue-accent': '#6b7280',  // Gray accent
        'blue-accent-hover': '#4b5563',  // Darker gray for hover
        
        // Text colors
        'text-primary': '#000000ff',  // Primary text (light gray)
        'text-secondary': '#c5c5c5',  // Secondary text (medium gray)
        'text-muted': '#8e8e8e',  // Muted text (darker gray)
      },
      fontFamily: {
        'open-sans': ['var(--font-open-sans)', 'sans-serif'],
        'sans': ['var(--font-open-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // ChatGPT-like font sizes
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }], // 13px
        'base': ['0.875rem', { lineHeight: '1.5rem' }], // 14px - main text
        'md': ['0.9375rem', { lineHeight: '1.5rem' }],  // 15px - user messages
        'lg': ['1rem', { lineHeight: '1.75rem' }],      // 16px - headings
        'xl': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        '2xl': ['1.25rem', { lineHeight: '2rem' }],     // 20px
        '3xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
      },
      spacing: {
        // Custom spacing values
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 250ms ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
