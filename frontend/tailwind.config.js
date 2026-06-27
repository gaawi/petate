/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Escala de azul "system blue" de iOS
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#b6d4ff',
          300: '#83b4ff',
          400: '#4d90ff',
          500: '#0a84ff',
          600: '#007aff',
          700: '#0062cc',
          800: '#004fa3',
          900: '#003e80',
        },
      },
    },
  },
  plugins: [],
}
