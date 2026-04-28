export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mission: {
          bg: '#060B14',
          panel: '#0C1322',
          grid: '#18263B',
          accent: '#00FF94',
          cyan: '#00D4FF',
          danger: '#FF3B55',
          text: '#D8E6FF',
          muted: '#7E94B8',
          warn: '#FFC857',
        },
      },
      boxShadow: {
        panel: '0 24px 45px rgba(3, 8, 19, 0.55)',
        glow: '0 0 0 1px rgba(0, 212, 255, 0.12), 0 0 18px rgba(0, 255, 148, 0.2)',
      },
      fontFamily: {
        header: ['Barlow Condensed', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
