import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        panel2: "var(--panel-2)",
        line: "var(--line)",
        fg: "var(--fg)",
        mute: "var(--mute)",
        acc: "var(--acc)",
        cool: "var(--cool)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        disp: ["var(--font-disp)", "Didot", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
