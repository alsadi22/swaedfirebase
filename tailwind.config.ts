import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background-warm-white)",
        foreground: "var(--text-primary-brown)",
        primary: {
          50: '#FEFDFB',
          100: '#FDFBF7',
          200: '#FAF5ED',
          300: '#F5EEDD',
          400: '#EADFC4',
          500: '#D2A04A',
          600: '#B8941F',
          700: '#8A6E17',
          800: '#5C490F',
          900: '#2E2508',
        },
        secondary: {
          50: '#FEFBFA',
          100: '#FDF7F5',
          200: '#FAEEE9',
          300: '#F5E2D6',
          400: '#EAC7B4',
          500: '#5C3A1F',
          600: '#4A2E18',
          700: '#382312',
          800: '#26170C',
          900: '#130C06',
        },
        accent: {
          gold: '#D2A04A',
          red: '#CE1126',
          green: '#00732F',
          black: '#000000',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      boxShadow: {
        'modern': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'modern-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'modern-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
