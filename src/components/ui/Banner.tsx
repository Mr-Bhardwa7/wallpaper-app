import { useEffect, useState, useRef } from "react";
import { Tag, Heart, Download, Play, Shuffle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/ThemeContext";
import OptimizedImage from "./OptimizedImage";
import { Wallpaper } from "@/types";
import { cn } from "@/utils";

const Banner = ({
  handleDownload,
  handleApply,
}: {
  handleDownload: (imageUrl: string, filename: string) => Promise<void>;
  handleApply: (imagePath: string) => Promise<void>;
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const { wallpapers, updateFavorite } = useWallpaperStore();

  const [bannerWallpapers, setBannerWallpapers] = useState<Wallpaper[]>([]);
  const [currentWallpaper, setCurrentWallpaper] = useState(0);
  const prevWallpaperIds = useRef<string>("");

  // Shuffle utility
  const shuffleWallpapers = () => {
    const wallpapersList = Object.values(wallpapers).flat();
    const shuffled = [...wallpapersList].sort(() => 0.5 - Math.random());
    setBannerWallpapers(shuffled.slice(0, 10));
    setCurrentWallpaper(0);
  };

  // 1. Intelligent shuffle on true wallpaper list change
  useEffect(() => {
    const allWallpapers = Object.values(wallpapers).flat();
    const currentIds = allWallpapers.map((wp) => wp.id).sort().join(",");

    if (currentIds !== prevWallpaperIds.current) {
      shuffleWallpapers();
      prevWallpaperIds.current = currentIds;
    }
  }, [wallpapers]);

  // 2. Sync banner favorite status without reshuffle
  useEffect(() => {
    setBannerWallpapers((prevBanners) => {
      const updatedAll = Object.values(wallpapers).flat();
      return prevBanners.map((banner) => {
        const updated = updatedAll.find((wp) => wp.id === banner.id);
        return updated ? { ...banner, is_favorite: updated.is_favorite } : banner;
      });
    });
  }, [wallpapers]);

  // Auto rotate every 30s
  useEffect(() => {
    if (bannerWallpapers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentWallpaper((prev) => (prev + 1) % bannerWallpapers.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [bannerWallpapers]);

  const wp = bannerWallpapers[currentWallpaper];
  if (!wp) return null;

  return (
    <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl">
      <div
        className={`group relative rounded-2xl overflow-hidden ${
          isDarkMode ? "bg-gray-800/50" : "bg-gray-100/50"
        } backdrop-blur-xl`}
      >
        <OptimizedImage
          id={wp.id}
          src={wp.url}
          thumbnail={wp.thumbnail}
          alt={wp.title || "Wallpaper"}
          lazy
          className="w-full h-96 transition-transform duration-300 group-hover:scale-105 rounded-lg"
          objectFit="cover"
          width={width}
          height={480}
          isDarkMode={isDarkMode}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {wp.tags?.split(",").map((tag) => (
              <span
                key={tag}
                className={"px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap backdrop-blur-sm bg-zinc-700/10 text-zinc-200 border border-zinc-600"}>
                #{tag.trim()}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {/* Favorite Button */}
            <button
              onClick={async () => {
                await updateFavorite(wp.id, !wp.is_favorite);
              }}
              className={cn(
                "p-2 rounded-full transition-all duration-300 border border-transparent backdrop-blur-sm",
                wp.is_favorite
                  ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-rose-500/30 hover:brightness-110"
                  : "bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-rose-600 hover:to-pink-500 hover:shadow-lg hover:shadow-indigo-500/30"
              )}
            >
              {wp.is_favorite ? (
                <Heart className="w-5 h-5 fill-white text-white" />
              ) : (
                <Heart className="w-5 h-5" />
              )}
            </button>
            {/* Download Button */}
            <button
              onClick={() => handleDownload(wp.url, wp.title)}
              className="px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-all duration-300 text-white bg-gray-800/60 backdrop-blur-sm hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:shadow-md hover:shadow-purple-500/30"
            >
              <Download className="w-4 h-4" /> {t("save")}
            </button>

            {/* Apply Button */}
            <button
              onClick={() => handleApply(wp.url)}
              className="px-5 py-2 rounded-full flex items-center gap-2 text-sm transition-all duration-300 text-gray-300 bg-gray-800/60 backdrop-blur-sm hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:shadow-md hover:shadow-indigo-500/30"
            >
              <Play className="w-4 h-4" /> {t("applyWallpaper")}
            </button>

          </div>
        </div>

        {/* Manual Shuffle Button */}
        <button
          onClick={shuffleWallpapers}
          className="absolute top-4 right-4 p-3 rounded-full border border-transparent text-gray-300 bg-gray-900/60 transition-all duration-300 backdrop-blur-sm hover:text-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/30 hover:border-cyan-500/60"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Banner;
