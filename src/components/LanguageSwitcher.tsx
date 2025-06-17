import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useWallpaperStore } from "@/store/useWallpaperStore";

const LanguageSwitcher = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { updateSetting } = useWallpaperStore();
   const { isDarkMode } = useTheme(); 

  const handleLanguageChange = (value: string) => {
    const selected = availableLanguages.find(l => l.value === value);
    if (selected) setLanguage(selected);
    updateSetting("language", value, "preferences");
  };

  return (
    <select
          value={language.value}
          onChange={(e) => {
            handleLanguageChange(e.target.value);
          }}
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-300 text-gray-800"
          } border ${
            isDarkMode ? "border-gray-700/50" : "border-gray-200/50"
          } rounded-lg px-3 py-1 text-sm`}
        >
          {availableLanguages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
  );
};

export default LanguageSwitcher;