/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Adjust to your project files
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
