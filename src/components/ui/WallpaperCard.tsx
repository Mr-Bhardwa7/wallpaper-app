import { useTheme } from "@/contexts/ThemeContext";
  import { useTranslation } from "@/hooks/useTranslation";
  import { Heart, Download, Play } from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { cn } from "@/utils";

  interface WallpaperCardProps {
    id: string;
    title: string;
    category: string;
    imageUrl: string;
    thumbnailUrl: string;
    onDownload?: () => void;
    onApply?: () => void;
    onClick?: () => void;
  }

  export default function WallpaperCard({
    id,
    title,
    category,
    imageUrl,
    thumbnailUrl,
    onDownload,
    onApply,
    onClick,
  }: WallpaperCardProps) {
    const { t } = useTranslation();
    const { isDarkMode } = useTheme();
    const { updateFavorite, wallpapers } = useWallpaperStore();
    const wallpaper = wallpapers.find(w => w.id === id);
    const isFavorite = wallpaper?.is_favorite || false;

    const handleFavorite = async (e: React.MouseEvent) => {
      e.stopPropagation();
      await updateFavorite(id, !isFavorite);
    };

    return (
      <div
        key={`wc-${id}`}
        className={`relative w-full h-full rounded-2xl overflow-hidden shadow-md group cursor-zoom-in ${
          isDarkMode ? "bg-zinc-900" : "bg-white"
        }`}
        onClick={onClick}
      >
        {/* 📸 Image */}
       <div className="w-full h-64 overflow-hidden">
          <OptimizedImage
            id={id}
            src={imageUrl}
            thumbnail={thumbnailUrl}
            alt={title}
            lazy={true}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            objectFit="cover"
            width={440}
            height={260}
            isDarkMode={isDarkMode}
          />
        </div>
        {/* 🧾 Title & Category */}
        <div className="absolute bottom-4 left-4 z-10">
          <h4
            className="text-sm font-semibold text-white truncate max-w-[90%]"
          >
            {title}
          </h4>
          <span
            className={`text-xs text-zinc-300`}
          >
            {t(category as keyof typeof t)}
          </span>
        </div>

        {/* ❤️ ⬇️ Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {/* ❤️ Favorite Button */}
          <button
            onClick={handleFavorite}
           className={cn(
             "p-2 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 border border-transparent",
                isDarkMode
                  ? "bg-zinc-800/60 text-white"
                  : "bg-white/70 text-gray-800",
                isFavorite
                  ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-rose-500/30 hover:brightness-110"
                  : "bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-rose-600 hover:to-pink-500 hover:shadow-lg hover:shadow-indigo-500/30"
              )}
          >
            {isFavorite ? (
              <Heart className="w-5 h-5 fill-white text-white" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
          </button>

          {/* ⬇️ Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.();
            }}
            className={cn(
              "p-2 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 border border-transparent",
              isDarkMode
                ? "bg-zinc-800/60 text-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/30"
                : "bg-white/70 text-gray-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-400/30"
            )}
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* ▶️ Apply Button */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApply?.();
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm backdrop-blur cursor-pointer transition-all duration-300 border border-transparent ${
               isDarkMode
                ? "bg-zinc-800/60 text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white hover:shadow-md hover:shadow-purple-500/30"
                : "bg-white/70 text-gray-800 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white hover:shadow-md hover:shadow-purple-500/30"
            }`}
          >
            <Play className="w-4 h-4 shrink-0" />
            <span className="leading-none">{t("apply")}</span>
          </button>
        </div>


        {/* 💨 Overlay */}
        <div
          className={`absolute inset-0 z-[1] bg-gradient-to-t ${
            isDarkMode
              ? "from-black/60 via-black/20 to-transparent"
              : "from-black/30 via-black/10 to-transparent"
          }`}
        />
      </div>
    );
  }
