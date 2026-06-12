import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const config = [
  {
    ignores: [
      ".next/**",
      ".playwright-mcp/**",
      ".vercel/**",
      "node_modules/**",
      "generated/**",
      "FINAL PICS WEBSITE/**",
      "cargo references/**",
      "images/**",
      "references/external-captures/**",
      "swisstransfer_*/**",
      "wetransfer_*/**"
    ]
  },
  ...compat.extends("next/core-web-vitals")
];

export default config;
