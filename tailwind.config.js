/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin');
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./app/src/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Exo 2"', ...defaultTheme.fontFamily.sans]
      }
    },
  },
  plugins: [
  ],
}
