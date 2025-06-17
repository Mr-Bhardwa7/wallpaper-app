import { useWallpaperStore } from "@/store/useWallpaperStore";
import { useEffect, useState } from "react";
import WallpaperCard from "@/components/ui/WallpaperCard";
import { applyWallpaper, downloadWallpaper } from "@/lib/wallpaperService";
import { generateFilename } from "@/utils";
import WallpaperPreviewModal from "@/components/ui/WallpaperPreviewModal";
import InfiniteScroll from "react-infinite-scroll-component";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ITEMS_PER_LOAD = 6;

const FavoritesPage = () => {
  const { favorites, fetchFavoriteWallpapers } = useWallpaperStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { isDarkMode } = useTheme();

  const filteredWallpapers =
    selectedCategory === "all"
      ? favorites
      : favorites.filter((wp) =>
          wp.tags
            .split(",")
            .map((t) => t.trim())
            .includes(selectedCategory)
        );

  const [visibleWallpapers, setVisibleWallpapers] = useState(
    filteredWallpapers.slice(0, ITEMS_PER_LOAD)
  );
  const [hasMore, setHasMore] = useState(
    filteredWallpapers.length > ITEMS_PER_LOAD
  );

  useEffect(() => {
    setVisibleWallpapers(filteredWallpapers.slice(0, ITEMS_PER_LOAD));
    setHasMore(filteredWallpapers.length > ITEMS_PER_LOAD);
  }, [selectedCategory, favorites]);

  const fetchMoreData = () => {
    setTimeout(() => {
      const currentCount = visibleWallpapers.length;
      const nextItems = filteredWallpapers.slice(
        currentCount,
        currentCount + ITEMS_PER_LOAD
      );
      setVisibleWallpapers((prev) => [...prev, ...nextItems]);
      setHasMore(currentCount + nextItems.length < filteredWallpapers.length);
    }, 500);
  };

  useEffect(() => {
    if (favorites.length === 0) {
      fetchFavoriteWallpapers();
    }
  }, []);

  const handleApply = async (imagePath: string) => {
    await applyWallpaper(imagePath);
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    const localPath = await downloadWallpaper(
      imageUrl,
      generateFilename(filename)
    );
    if (localPath) console.log("Wallpaper downloaded:", localPath);
  };

  const handleOpen = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const handleNavigate = (dir: "prev" | "next") => {
    const total = visibleWallpapers.length;
    const newIndex =
      dir === "prev"
        ? (currentIndex - 1 + total) % total
        : (currentIndex + 1) % total;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        {favorites.length !== 0 && (
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Your Favorites
            </h2>
            <div className="flex items-center gap-4">
              <select
                className={`rounded-xl px-4 py-2 text-sm border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Types</option>
                {Array.from(
                  new Set(
                    favorites
                      .flatMap((wp) => wp.tags?.split(",") || [])
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  )
                )
                  .sort()
                  .map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

        {visibleWallpapers.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center py-32 text-center ${
              isDarkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <svg
              width="128"
              height="128"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                stroke="#999999"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                         2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                         4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                         19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                         6.86-8.55 11.18L12 21z" />
                <line x1="6" y1="6" x2="18" y2="18" stroke="#FF6B6B" />
              </g>
            </svg>
            <h3 className="text-lg font-semibold">No favorites yet</h3>
            <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Browse wallpapers and tap the heart to save your favorites.
            </p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={visibleWallpapers.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              <div className="text-center my-6">
                <button
                  onClick={fetchMoreData}
                  className={`p-3 rounded-full transition text-white ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-cyan-500"
                      : "bg-gray-800 hover:bg-cyan-500"
                  }`}
                  aria-label="Load more wallpapers"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            }
            scrollThreshold={0.9}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleWallpapers.map((wallpaper, index) => (
                <WallpaperCard
                  id={wallpaper.id}
                  key={wallpaper.id}
                  title={wallpaper.title}
                  category={wallpaper.tags}
                  imageUrl={wallpaper.url}
                  thumbnailUrl={wallpaper.thumbnail}
                  onDownload={() =>
                    handleDownload(wallpaper.url, wallpaper.title)
                  }
                  onApply={() => handleApply(wallpaper.url)}
                  onClick={() => handleOpen(index)}
                />
              ))}
              <WallpaperPreviewModal
                isOpen={modalOpen}
                currentIndex={currentIndex}
                currentWallpaperID={visibleWallpapers[currentIndex]?.id}
                onClose={() => setModalOpen(false)}
                onDownload={(i) =>
                  handleDownload(
                    visibleWallpapers[i].url,
                    visibleWallpapers[i].title
                  )
                }
                onApply={(i) => handleApply(visibleWallpapers[i].url)}
                onNavigate={handleNavigate}
              />
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
