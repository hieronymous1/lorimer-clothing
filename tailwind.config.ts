import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f1efe9",
        ink: "#0b0b0a",
        fog: "#75736b",
        line: "#d9d6cc",
        acid: "#d7ff2f",
        coal: "#0c0c0b",
        "coal-2": "#161614",
        /* legacy aliases — old draft components reference these; retire in polish pass */
        shell: "#f1efe9",
        panel: "#e3e1d8"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Archivo", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"]
      },
      maxWidth: {
        shell: "1720px"
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.77, 0, 0.18, 1)"
      },
      letterSpacing: {
        meta: "0.18em"
      }
    }
  },
  plugins: []
};

export default config;
