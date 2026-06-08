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
          DEFAULT: '#0A66C2',
          light: '#EAF0F9',
          dark: '#004182',
        },
        surface: '#FFFFFF',
        background: '#F3F2EE',
        border: '#E0DFDB',
        success: '#057642',
        warning: '#B24020',
        text: {
          primary: '#191919',
          secondary: '#666666',
          tertiary: '#999999',
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
