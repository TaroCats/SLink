/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        glass: {
          dark: "rgba(20, 20, 22, 0.4)",
          light: "rgba(255, 255, 255, 0.2)",
          border: "rgba(255, 255, 255, 0.15)",
          darkBorder: "rgba(255, 255, 255, 0.08)",
        },
        accent: {
          cyan: "#00f0ff",
          blue: "#007aff",
          purple: "#b026ff",
        }
      },
      transitionTimingFunction: {
        'liquid': 'cubic-bezier(0.25, 1, 0.3, 1)',
        'apple': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glow': '0 0 20px rgba(0, 240, 255, 0.3)',
      },
      animation: {
        rotateMesh: "rotateMesh 25s linear infinite",
      },
      keyframes: {
        rotateMesh: {
          "0%": {
            transform: "rotate(0deg) scale(1)",
          },
          "50%": {
            transform: "rotate(180deg) scale(1.1)",
          },
          "100%": {
            transform: "rotate(360deg) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};
