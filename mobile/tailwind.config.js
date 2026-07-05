/** @type {import('tailwindcss').Config} */

// Helper : token piloté par une variable CSS, avec support de l'opacité (`bg-x/10`).
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Surfaces (résolues depuis les variables CSS → clair/sombre)
        canvas: v('canvas'),
        background: v('background'),
        surface: v('surface'),
        'surface-2': v('surface-2'),
        'surface-3': v('surface-3'),
        border: v('border'),
        'border-soft': v('border-soft'),

        // Brand (émeraude)
        primary: {
          DEFAULT: v('primary'),
          dark: v('primary-dark'),
          soft: v('primary-soft'),
        },

        // Texte
        ink: v('ink'),
        muted: v('muted'),
        subtle: v('subtle'),

        // Échelle de grade (identique clair/sombre — sémantique)
        'grade-a': '#22C55E',
        'grade-b': '#4ADE80',
        'grade-c': '#F59E0B',
        'grade-d': '#EF4444',
        'grade-e': '#B91C1C',

        // Accents sémantiques
        danger: v('danger'),
        warning: v('warning'),
        info: v('info'),
        purple: v('purple'),
        pink: v('pink'),
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
