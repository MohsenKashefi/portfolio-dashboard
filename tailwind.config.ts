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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#00ff87",
          dark: "#0a0e27",
        },
        accent: {
          cyan: "#60efff",
          purple: "#a78bfa",
          pink: "#f472b6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
