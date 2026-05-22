import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette extraite du fichier Excel — exposée via CSS variables
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface-2) / <alpha-value>)",
        surface3: "rgb(var(--surface-3) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        accentLight: "rgb(var(--accent-light) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accentStrong: "rgb(var(--accent-strong) / <alpha-value>)",
        text1: "rgb(var(--text-1) / <alpha-value>)",
        text2: "rgb(var(--text-2) / <alpha-value>)",
        text3: "rgb(var(--text-3) / <alpha-value>)",
        text4: "rgb(var(--text-4) / <alpha-value>)",
        inputText: "rgb(var(--input-text) / <alpha-value>)",
        border1: "rgb(var(--border) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(196 116 107 / 0.04), 0 4px 16px -4px rgb(196 116 107 / 0.08)",
        cardLg: "0 2px 4px 0 rgb(196 116 107 / 0.05), 0 12px 32px -8px rgb(196 116 107 / 0.14)",
        glow: "0 0 0 1px rgb(196 116 107 / 0.12), 0 8px 32px -4px rgb(196 116 107 / 0.18)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
