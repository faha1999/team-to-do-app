import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/styles/**/*.{css,scss}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
