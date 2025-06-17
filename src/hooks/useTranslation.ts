import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/constants";
import type { TranslationKey, LanguageValue } from "@/types";

export const useTranslation = () => {
  const { language } = useLanguage();
  const fallbackLang: LanguageValue = 'en-US';

  // Ensure we have a valid language value
  const selectedLang = language?.value || fallbackLang;
  
  const t = (key: TranslationKey): string => {
    // Check if the selected language exists in translations
    if (selectedLang in translations && key in translations[selectedLang]) {
      return translations[selectedLang][key];
    }
    // Fallback to en-US
    return translations[fallbackLang][key] || key;
  };

  return { t };
};
