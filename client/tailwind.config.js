export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mission: {
          bg: '#0D0F14',
          panel: '#1A1E2A',
          grid: '#2A3040',
          accent: '#F59E0B',
          cyan: '#38BDF8', // Kept for legacy compatibility if used, but we'll use accent for primary
          danger: '#EF4444',
          success: '#22C55E',
          text: '#E2E8F0',
          muted: '#64748B',
          warn: '#F59E0B', // Same as accent
        },
      },
      boxShadow: {
        panel: '0 8px 32px rgba(0, 0, 0, 0.5)',
        glow: '0 0 0 1px rgba(245, 158, 11, 0.1), 0 0 12px rgba(245, 158, 11, 0.2)',
        danger: '0 0 0 1px rgba(239, 68, 68, 0.2), 0 0 15px rgba(239, 68, 68, 0.3)',
      },
      fontFamily: {
        header: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-danger': 'pulseDanger 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseDanger: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '50%': { opacity: '.8', boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
        }
      }
    },
  },
  plugins: [],
};
