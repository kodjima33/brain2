import type { Config } from "tailwindcss";

import baseConfig from "@brain2/tailwind-config";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
