import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#FFFFFF',
          'bg-secondary': '#F5F5F5',
          'bg-dark': '#111111',
          text: '#111111',
          'text-secondary': '#757575',
          'text-on-dark': '#FFFFFF',
          border: '#E5E5E5',
          accent: '#000000',
        },
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '48px',
      },
    },
  },
  plugins: [],
};

export default config;
