module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  important: true,
  theme: {
        extend: {
            colors: {
                dashboard: {
                    bg: "#1a1a1a",
                    card: "#2d2d2d",
                    button: "#454545",

                    text: "#e0e0e0",
                    accent: "#d4af37",

                    danger: "#e74c3c",
                    success: "#2ecc71",
                    warning: "#f1c40f",

                    border: "#444444",
                    item: "#363636",
                },
            },

            borderRadius: {
                dashboard: "8px",
            },
        },
    },
}