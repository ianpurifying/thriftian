/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F0",
        vintage: {
          brown: "#8B6F47",
          beige: "#D4A574",
          mustard: "#DAA520",
          teal: "#5F9EA0",
          olive: "#6B8E23",
          red: "#B8524D",
          orange: "#CC5500",
        },
      },
      fontFamily: {
        rye: ["Rye", "serif"],
        pacifico: ["Pacifico", "cursive"],
        nunito: ["Nunito", "sans-serif"],
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};
