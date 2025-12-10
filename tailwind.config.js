// tailwind.config.js
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    // এখানে src/ যোগ করা হয়েছে
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'primary': '#7158e2',
        'light-bg': '#f4f7fe',
        'light-card': '#ffffff',
        'light-text-primary': '#2c3e50',
        'light-text-secondary': '#7f8c8d',
        'dark-bg': '#1e272e',
        'dark-card': '#485460',
        'dark-text-primary': '#d2dae2',
        'dark-text-secondary': '#808e9b',
        'accent-red': '#ff6b81',
        'accent-blue': '#54a0ff',
        'accent-cyan': '#48dbfb',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
});