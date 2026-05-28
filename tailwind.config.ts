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
        shell: "#f3eee6",
        ink: "#161512",
        fog: "#6b665d",
        line: "rgba(22, 21, 18, 0.14)",
        panel: "#ece5db"
      },
      maxWidth: {
        shell: "1720px"
      },
      letterSpacing: {
        editorial: "0.18em"
      },
      gridTemplateColumns: {
        hero: "minmax(0,4fr) minmax(0,8fr)",
        product: "minmax(0,7fr) minmax(320px,4fr)",
        shop: "240px minmax(0,1fr)"
      }
    }
  },
  plugins: []
};

export default config;
