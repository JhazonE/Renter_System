/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1132d4",
        "background-light": "#f6f6f8",
        "background-dark": "#101322",
      },
      fontFamily: {
        sans: ['PublicSans-Regular', 'sans-serif'],
        bold: ['PublicSans-Bold', 'sans-serif'],
        black: ['PublicSans-Black', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
