export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#0A0F1E', 800: '#0D1426', 700: '#111827' },
        cyan:  { DEFAULT: '#00D4FF', 400: '#22D3EE', 600: '#0891B2' },
        slate: { 400: '#94A3B8', 600: '#475569' },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};