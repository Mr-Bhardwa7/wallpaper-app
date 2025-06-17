import { Language } from "@/types";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { availableLanguages } from "@/constants";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useWallpaperStore();

  const findLanguage = (value: string | null): Language =>
    availableLanguages.find((l) => l.value === value) || availableLanguages[0];

  const [language, setLanguageState] = useState<Language>(() =>
    findLanguage(settings?.language || localStorage.getItem("lang"))
  );

  // Sync from store
  useEffect(() => {
    if (settings?.language && settings.language !== language.value) {
      const matched = findLanguage(settings.language);
      setLanguageState(matched);
    }
  }, [settings?.language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang.value);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
