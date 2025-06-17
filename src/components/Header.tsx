import { Sun, Moon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "@/contexts/ThemeContext";
import {  Page } from "@/types";
import { useWallpaperStore } from "@/store/useWallpaperStore"; 
import LanguageSwitcher from "./LanguageSwitcher";

const Header = ({
  currentPage,
}: {
  currentPage: Page;
}) => {
  const { t } = useTranslation();
  const { isDarkMode, setIsDarkMode } = useTheme(); 
  const { updateSetting } = useWallpaperStore();

  const handleThemeToggle = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    updateSetting("appTheme", newTheme, "preferences"); 
  };

  return (
    <div
      className={`h-16 ${
        isDarkMode ? "bg-gray-900/30" : "bg-white/30"
      } backdrop-blur-xl border-b ${
        isDarkMode ? "border-gray-700/50" : "border-gray-200/50"
      } flex items-center justify-between px-6`}
    >
      <div className="flex items-center gap-4">
        <h2
          className={`text-lg font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          } capitalize`}
        >
          {currentPage === "generate" ? t("generateAI") : t(currentPage)}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <button
          onClick={handleThemeToggle}
          className={`p-2 rounded-full ${
            isDarkMode
              ? "bg-gray-800/50 text-gray-400 hover:text-white"
              : "bg-gray-100/50 text-gray-600 hover:text-gray-900"
          } transition-colors`}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default Header;
