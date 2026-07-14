import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/constants";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    return (stored as Theme) || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    root.classList.add(effectiveTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  return { theme, setTheme };
}
