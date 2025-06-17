import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useWallpaperStore } from "@/store/useWallpaperStore";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setIsDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useWallpaperStore();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Prioritize store settings, fallback to localStorage, then system preference
    if (settings?.appTheme) {
      return settings.appTheme === "dark";
    }
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Sync with store settings
  useEffect(() => {
    if (settings?.appTheme) {
      setIsDarkMode(settings.appTheme === "dark");
    }
  }, [settings?.appTheme]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
