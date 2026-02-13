import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noon: {
          yellow: "#feee00",
          blue: "#3e4453",
          light: "#f7f7fa",
        },
      },
    },
  },
  plugins: [],
};
export default config;
