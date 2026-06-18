/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // KAWAII LAB.系のサイトイメージに寄せたパステルカラー
        kawaii: {
          pink: "#FF8FC0",
          pinkLight: "#FFE3F0",
          purple: "#C49BFF",
          mint: "#9BF0D8",
          yellow: "#FFE27A",
        },
      },
      fontFamily: {
        sans: [
          "'Hiragino Sans'",
          "'Hiragino Kaku Gothic ProN'",
          "'Noto Sans JP'",
          "Meiryo",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
