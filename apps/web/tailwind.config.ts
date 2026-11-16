import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',

  content: [
    './src/**/*.{ts,tsx,mdx}',
    '../../content/**/*.{md,mdx}',
  ],

  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1200px',
      },
    },

    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',

        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },

        border: 'var(--color-border)',

        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        lg: '0.75rem',
      },

      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,0.05)',
      },
    },
  },

  plugins: [typography],
};

export default config;
