"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface ThemeContextValue {
  isLightMode: boolean;
  toggleLightMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isLightMode: false,
  toggleLightMode: () => {},
});

// Read the theme that the inline init script in the root layout already
// applied to <html>. Running this in a lazy initializer means we don't
// need a setState-in-useEffect dance — by the time React hydrates the
// provider, the DOM already reflects the saved preference, so we can
// initialize state from it in one shot.
function readInitial(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("light-mode");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isLightMode, setIsLightMode] = useState<boolean>(readInitial);

  const toggleLightMode = useCallback(() => {
    setIsLightMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        document.documentElement.classList.toggle("light-mode", next);
        try {
          localStorage.setItem("theme", next ? "light" : "dark");
        } catch {
          // Ignore quota / disabled-storage errors.
        }
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isLightMode, toggleLightMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
