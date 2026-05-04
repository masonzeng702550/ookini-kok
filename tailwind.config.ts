import type { Config } from 'tailwindcss';

// Travel-map daytime palette (cream paper + dusty blue) with limited
// neon accents lifted from Stitch's Dotonbori Nights for branding only.
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paper / map base
        paper: '#faf3e3',
        'paper-soft': '#f4ebd4',
        'paper-warm': '#f0e3c4',
        sea: '#b9dde6',
        'sea-deep': '#a3cdd9',
        'sea-glow': '#5fb6c8',
        sage: '#cbdcb5',
        'sage-deep': '#a9c596',
        ink: '#3a2f24',
        'ink-soft': '#6b5a47',
        'ink-faint': '#a89683',
        line: '#d8c8a8',

        // Brand neon (sparingly used)
        'neon-pink': '#FF007A',
        'neon-pink-soft': '#ffb1c3',
        'neon-cyan': '#00b8d9',
        'neon-green': '#6fbe3f',
        'neon-orange': '#ff7a00',
        'neon-yellow': '#ffd93d',
        'tako-red': '#d23a3a',

        // City themes
        'city-osaka': '#e63946',
        'city-kyoto': '#b7295a',
        'city-kobe': '#2a7da3',
        'city-nara': '#6fbe3f',
        'city-kix': '#ff7a00',
      },
      fontFamily: {
        epilogue: ['Epilogue', 'system-ui', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        label: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        'neon-pink': '0 0 14px rgba(255,0,122,0.5), 0 0 28px rgba(255,0,122,0.2)',
        'neon-cyan': '0 0 14px rgba(0,184,217,0.5), 0 0 28px rgba(0,184,217,0.2)',
        'neon-green': '0 0 14px rgba(111,190,63,0.5), 0 0 28px rgba(111,190,63,0.2)',
        paper: '0 6px 18px rgba(122,92,56,0.12)',
        'paper-strong': '0 10px 28px rgba(122,92,56,0.2)',
      },
    },
  },
  plugins: [],
} satisfies Config;
