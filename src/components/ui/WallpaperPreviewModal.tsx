import {
  X,
  Heart,
  Download,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import OptimizedImage from "./OptimizedImage";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { Wallpaper } from "@/types";

interface WallpaperPreviewModalProps {
  isOpen: boolean;
  currentIndex: number;
  currentWallpaperID: string;
  onClose: () => void;
  onDownload: (index: number) => void;
  onApply: (index: number) => void;
  onNavigate: (direction: "prev" | "next") => void;
}

export default function WallpaperPreviewModal({
  isOpen,
  currentIndex,
  currentWallpaperID,
  onClose,
  onDownload,
  onApply,
  onNavigate,
}: WallpaperPreviewModalProps) {
    const [isImageLoading, setImageLoading] = useState(true);
    const modalRef = useRef<HTMLDivElement>(null);
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();
    const { height } = useWindowDimensions();
    const { wallpapers, updateFavorite } = useWallpaperStore();
    const currentWallpaper = wallpapers.find(wp => wp.id === currentWallpaperID) as Wallpaper;
  

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate("prev");
      if (e.key === "ArrowRight") onNavigate("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center px-4",
        isDarkMode
          ? "bg-gradient-to-br from-zinc-900 via-gray-900 to-black"
          : "bg-gradient-to-br from-blue-200/50 via-pink-100/40 to-purple-200/50",
        "backdrop-blur-2xl transition-all duration-300"
      )}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl group animate-fadeIn flex flex-col",
          isDarkMode
            ? "bg-zinc-900 border border-zinc-700 ring-1 ring-violet-800/30"
            : "bg-white/30 border border-white/20 ring-1 ring-purple-100/30 backdrop-blur-xl"
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close preview"
          className={cn(
            "absolute top-4 right-4 z-20 p-2 rounded-full shadow transition opacity-0 group-hover:opacity-100 cursor-pointer",
            isDarkMode
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              : "bg-white/60 text-gray-700 hover:bg-white"
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation Buttons */}
        <button
          onClick={() => onNavigate("prev")}
          aria-label="Previous wallpaper"
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 cursor-pointer rounded-full shadow transition opacity-0 group-hover:opacity-100",
            isDarkMode
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              : "bg-white/60 text-gray-700 hover:bg-white"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => onNavigate("next")}
          aria-label="Next wallpaper"
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2  cursor-pointer rounded-full shadow transition opacity-0 group-hover:opacity-100",
            isDarkMode
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              : "bg-white/60 text-gray-700 hover:bg-white"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Wallpaper Image */}
        <div className="flex-1 flex items-center justify-center overflow-hidden bg-black/5">
          {isImageLoading && (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center z-10",
                isDarkMode ? "bg-black/70" : "bg-white/30"
              )}
            >
              <span className="loader border-t-4 border-purple-400 border-solid rounded-full w-10 h-10 animate-spin" />
            </div>
          )}
          <OptimizedImage
            src={currentWallpaper.url}
            thumbnail={currentWallpaper.thumbnail}
            alt={currentWallpaper.title}
            className="max-w-full max-h-full object-contain rounded-xl transition duration-300"
            objectFit="cover"
            lazy={false}
            onLoad={() => setImageLoading(false)}
            draggable={false}
            height={height * 0.8}
          />
        </div>

        {/* Footer */}
        <div
          className={cn(
            "flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-3",
            "backdrop-blur-lg border-t",
            isDarkMode
              ? "bg-zinc-800 border-zinc-700"
              : "bg-white/30 border-white/20"
          )}
        >
       <div className="text-center sm:text-left space-y-3">
  {/* Title */}
  <h4
    className={cn(
      "text-xl sm:text-2xl font-semibold tracking-tight",
      isDarkMode ? "text-white" : "text-gray-900"
    )}
  >
    {currentWallpaper.title}
  </h4>

  {/* Tags */}
  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
    {currentWallpaper.tags?.split(",").map((tag: string) => (
      <span
        key={tag}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap backdrop-blur-sm",
          isDarkMode
            ? "bg-zinc-700/60 text-zinc-200 border border-zinc-600"
            : "bg-gray-100 text-gray-700 border border-gray-300"
        )}
      >
        #{tag.trim()}
      </span>
    ))}
  </div>
</div>

 <div
  className={cn(
    "flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-3 sm:gap-4 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300",
    isDarkMode ? "bg-zinc-800/60 border border-zinc-700" : "bg-white/60 border border-gray-300"
  )}
>
  {/* Favorite Button */}
  {/* Favorite Button */}
<button
  onClick={() => updateFavorite(currentWallpaper.id, !currentWallpaper.is_favorite)}
  aria-label="Favorite"
  className={cn(
    "flex items-center gap-2 px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-all duration-200",
    currentWallpaper.is_favorite
        ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white hover:brightness-110 shadow-lg shadow-rose-500/30"
      : isDarkMode
        ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-600 hover:text-white"
        : "bg-white text-gray-700 hover:bg-gray-100 shadow"
  )}
>
  {currentWallpaper.is_favorite ? (
    <Heart className="w-5 h-5 fill-white text-white" />
  ) : (
    <Heart className="w-5 h-5" />
  )}
  <span className="hidden sm:inline">{t("favorites")}</span>
</button>

{/* Download Button */}
<button
  onClick={() => onDownload(currentIndex)}
  aria-label="Download"
  className={cn(
    "flex items-center gap-2 px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-all duration-200",
    "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/20 hover:brightness-110"
  )}
>
  <Download className="w-5 h-5" />
  <span className="hidden sm:inline">{t("save")}</span>
</button>

{/* Apply Button */}
<button
  onClick={() => onApply(currentIndex)}
  aria-label="Apply wallpaper"
  className={cn(
    "flex items-center gap-2 px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-all duration-200",
    "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 hover:brightness-110"
  )}
>
  <Play className="w-5 h-5" />
  <span className="hidden sm:inline">{t("applyWallpaper")}</span>
</button>

    </div>

        </div>
      </div>

      {/* Loader + animation */}
      <style>{`
        .loader {
          border-right-color: transparent;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-in-out;
        }
      `}</style>
    </div>
  );
}
