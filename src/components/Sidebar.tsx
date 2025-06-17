import { useTheme } from "@/contexts/ThemeContext";
import { useSidebarItems } from "@/hooks/useSidebarItems";
import { startWallpaperRotation, stopWallpaperRotation } from "@/lib/wallpaperService";
import { Page } from "@/types";
import { Wand2 } from "lucide-react";

const Sidebar = ({
  currentPage,
  setCurrentPage,
}: {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  credits: number;
  setShowBuyCredits: (show: boolean) => void;
}) => {
  const sidebarItems = useSidebarItems();
  const { isDarkMode } = useTheme();

  // const user = {
  //   name: "Animesh Bhardwaj",
  //   email: "animesh@example.com",
  //   avatar: "https://i.pravatar.cc/100?img=12", // fallback avatar URL
  // };

  return (
    <div
      className={`w-64 h-screen flex flex-col justify-between transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-b from-gray-900 via-gray-950 to-black border-gray-800/60"
          : "bg-gradient-to-b from-white via-gray-50 to-gray-100 border-gray-200/60"
      } backdrop-blur-xl border-r`}
    >
      {/* Header */}
      <div>
        <div
          className={`p-4 border-b ${
            isDarkMode ? "border-gray-700/50" : "border-gray-200/50"
          }`}
        >
          <h1
            className={`text-xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } flex items-center gap-2`}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            WallAI
          </h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isSelected = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                      : isDarkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-800/50"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={async () => {
            await startWallpaperRotation(
              [
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop",
              ],
              10
            );
          }}
          className={`flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-xl transition-all ${
            isDarkMode
              ? "text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/5"
              : "text-cyan-600 hover:text-cyan-700 bg-cyan-100 hover:bg-cyan-50"
          }`}
        >
          Start Wallpaper Rotation
        </button>

        <button
          onClick={async () => {
            await stopWallpaperRotation();
          }}
          className={`mt-4 flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-xl transition-all ${
            isDarkMode
              ? "text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/5"
              : "text-red-600 hover:text-red-700 bg-red-100 hover:bg-red-50"
          }`}
        >
          Stop Wallpaper Rotation
        </button>
      </div>

      {/* Footer: Profile & Logout */}
      {/* <div
        className={`p-4 border-t ${
          isDarkMode ? "border-gray-700/50" : "border-gray-200/50"
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user.avatar}
            alt="User avatar"
            className="w-10 h-10 rounded-full border border-cyan-400"
          />
          <div className="flex flex-col text-sm">
            <span
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {user.name}
            </span>
            <span
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {user.email}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            // 🔒 Replace this with actual logout logic
            console.log("Logout clicked");
          }}
          className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-500 bg-red-500/20 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          {t("logout")}
        </button>
      </div> */}
    </div>
  );
};

export default Sidebar;
