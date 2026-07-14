// Theme configuration
export const theme = {
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  sidebar: {
    width: {
      desktop: "16rem", // 256px
      mobile: "16rem",
    },
  },
  header: {
    height: "4rem", // 64px
  },
  animation: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
  },
} as const;
