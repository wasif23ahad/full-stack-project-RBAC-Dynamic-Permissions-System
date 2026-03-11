import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: "#FD6D3F",
          50:  "#FFF3EE",
          100: "#FFE4D6",
          200: "#FFC9AD",
          300: "#FFAB84",
          400: "#FE8C61",
          500: "#FD6D3F",
          600: "#FD5E2B",
          700: "#E04A15",
          800: "#B03910",
          900: "#7E290C",
        },
        "dark-text":    "#1F232A",
        "mid-text":     "#404857",
        "muted-text":   "#666C79",
        "placeholder":  "#A1A6B0",
        "subtle-text":  "#9BA0AB",
      },
      fontFamily: {
        onest: ["Onest", "sans-serif"],
        inter:  ["Inter",  "sans-serif"],
      },
      boxShadow: {
        brand: "0px 4px 10px 0px rgba(242, 61, 3, 0.1), 0px 17px 17px 0px rgba(242, 61, 3, 0.09)",
        card:  "0px 16px 34px 0px rgba(194,194,194,0.1), 0px 62px 62px 0px rgba(194,194,194,0.09)",
      },
    },
  },
  plugins: [],
};
export default config;
