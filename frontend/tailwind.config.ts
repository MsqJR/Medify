import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--pharmacy-primary, #1B76FF)',
          dark: 'var(--pharmacy-secondary, #0C4EB7)',
          light: 'var(--pharmacy-primary-light, #E7F2FF)',
        },
        neutral: {
          white: '#FFFFFF',
          light: '#F7F9FC',
          border: '#DCE3EC',
          gray: '#556575',
          dark: '#1A1A1A',
        },
        success: {
          DEFAULT: '#28C76F',
          light: 'var(--success-light, #ECFDF5)',
          border: 'var(--success-border, #A7F3D0)',
        },
        warning: {
          DEFAULT: '#FFB020',
          light: 'var(--warning-light, #FFF7ED)',
          border: 'var(--warning-border, #FED7AA)',
        },
        error: {
          DEFAULT: '#FF4C4C',
          light: 'var(--error-light, #FEF2F2)',
          border: 'var(--error-border, #FECACA)',
        },
        ai: '#7C3AED',
      },
      fontFamily: {
        sans: ['var(--pharmacy-font-stack, Inter)', 'Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

