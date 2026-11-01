import type { Config } from 'tailwindcss';

// Identité strictement noir et blanc.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#000000', paper: '#FFFFFF', soft: '#F5F5F5', graphite: '#222222' },
    },
  },
  plugins: [],
};
export default config;
