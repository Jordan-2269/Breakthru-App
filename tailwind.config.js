/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D9BF0',
          light: '#E8F5FE',
          dark: '#0D7AC5',
        },
        surface: '#FFFFFF',
        background: '#F7F7F7',
        border: '#E7E7E7',
        success: '#00BA7C',
        warning: '#FF6B35',
        accent: '#FF0000',
        text: {
          primary: '#0F0F0F',
          secondary: '#606060',
          tertiary: '#909090',
        },
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
