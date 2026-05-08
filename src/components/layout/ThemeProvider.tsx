"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  isLightMode: boolean;
  toggleLightMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    // Default to dark mode (which is lack of 'light-mode' class) as requested
    if (saved === "light") {
      setIsLightMode(true);
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }
  }, []);

  const toggleLightMode = () => {
    setIsLightMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("light-mode");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isLightMode, toggleLightMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
