/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        "html, body": {
          margin: 0,
          padding: 0,
          width: "100%",
          height: "100%",
        },
      });
    },
  ],
};
