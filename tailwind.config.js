/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bench: {
          bg: '#07090D',
          panel: '#10141A',
          raised: '#151A22',
          border: '#252B36',
          muted: '#8B93A1',
          text: '#F5F7FA',
          orange: '#FF6A00',
          orangeSoft: '#3A1F0D',
          green: '#22C55E',
          yellow: '#F59E0B',
          red: '#EF4444',
          blue: '#3B82F6',
          purple: '#8B5CF6',
        },
      },
      boxShadow: {
        glow: '0 0 34px rgba(255, 106, 0, 0.18)',
        panel: '0 20px 80px rgba(0, 0, 0, 0.28)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
