/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sb: {
          bg: '#0a0a0a',
          surface: '#171717',
          elevated: '#1f1f1f',
          accent: '#3ecf8e',
          muted: '#8b8b8b',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'sb-glow': '0 0 40px rgba(62, 207, 142, 0.15)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
