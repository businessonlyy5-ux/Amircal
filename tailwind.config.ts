import type { Config } from 'tailwindcss';

// Identité noir et blanc avec un accent doré (luxe).
// Le doré sert de fond ou de bordure, jamais de texte sur fond blanc (contraste insuffisant).
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#000000', paper: '#FFFFFF', soft: '#F5F5F5', graphite: '#222222', gold: '#C9A24B', 'gold-deep': '#A8832F' },
    },
  },
  plugins: [],
};
export default config;
