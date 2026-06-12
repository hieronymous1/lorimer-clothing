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
        shell: "#f7f7f2",
        ink: "#050505",
        fog: "#5e5e58",
        line: "rgba(5, 5, 5, 0.16)",
        panel: "#e8e8df",
        acid: "#d7ff2f"
      },
      maxWidth: {
        shell: "1720px"
      },
      letterSpacing: {
        editorial: "0.18em"
      },
      gridTemplateColumns: {
        hero: "minmax(0,5fr) minmax(0,7fr)",
        product: "minmax(0,7fr) minmax(320px,4fr)",
        shop: "240px minmax(0,1fr)"
      }
    }
  },
  plugins: []
};

export default config;
