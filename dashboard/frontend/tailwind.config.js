/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: "#2185E8",
        darkBlue: "#1070D0",
        green: {
          100: "#D1DEE0",
          400: "#476C74",
          500: "#0E5563",
          900: "#0E434E",
        },
        pink: "#F14181",
      },
      fontFamily: {
        sans: ["Epilogue"],
      },
    },
  },
  plugins: [],
};
