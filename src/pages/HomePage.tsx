import { useTheme } from "@/contexts/ThemeContext";
import useCategories from "@/hooks/useCategories";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import GoogleAd from "@/components/GoogleAd";
import { applyWallpaper, downloadWallpaper } from "@/lib/wallpaperService";
import { generateFilename } from "@/utils";
import CategoryScroll from "@/components/ui/CategoryScroll";
import WallpaperCard from "@/components/ui/WallpaperCard";
import WallpaperPreviewModal from "@/components/ui/WallpaperPreviewModal";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import Banner from "@/components/ui/Banner";

const ITEMS_PER_LOAD = 6;

const HomePage = () => {
  const { isDarkMode } = useTheme();
  const categories = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { wallpapers } = useWallpaperStore();
  const prevCategory = useRef<string | null>(null);

  const allWallpapers = useMemo(() => [...wallpapers], [wallpapers]);
  const filteredWallpapers = useMemo(() => {
    return selectedCategory === "all"
      ? allWallpapers
      : allWallpapers.filter(wp =>
          wp.tags.split(',').map(t => t.trim()).includes(selectedCategory)
        );
  }, [allWallpapers, selectedCategory]);

  const [visibleWallpapers, setVisibleWallpapers] = useState(filteredWallpapers.slice(0, ITEMS_PER_LOAD));
  const [hasMore, setHasMore] = useState(filteredWallpapers.length > ITEMS_PER_LOAD);

  useEffect(() => {
    if (
      prevCategory.current !== selectedCategory ||
      visibleWallpapers.length === 0
    ) {
      const initialItems = filteredWallpapers.slice(0, ITEMS_PER_LOAD);
      setVisibleWallpapers(initialItems);
      setHasMore(filteredWallpapers.length > initialItems.length);
      prevCategory.current = selectedCategory;
    }
  }, [filteredWallpapers, selectedCategory]);
  
  const fetchMoreData = () => {
    setTimeout(() => {
      const currentCount = visibleWallpapers.length;
      const nextItems = filteredWallpapers.slice(currentCount, currentCount + ITEMS_PER_LOAD);
      setVisibleWallpapers(prev => [...prev, ...nextItems]);
      setHasMore(currentCount + nextItems.length < filteredWallpapers.length);
    }, 500);
  };

  const handleApply = async (imagePath: string) => {
    await applyWallpaper(imagePath);
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    const localPath = await downloadWallpaper(imageUrl, generateFilename(filename));
    if (localPath) console.log("Wallpaper downloaded:", localPath);
  };

  const handleOpen = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const handleNavigate = (dir: "prev" | "next") => {
    const total = filteredWallpapers.length;
    const newIndex = dir === "prev"
      ? (currentIndex - 1 + total) % total
      : (currentIndex + 1) % total;
    setCurrentIndex(newIndex);
  };

  const renderWallpaperGrid = () => {
    const isCompact = visibleWallpapers.length <= 2;

    return (
      <div
        className={
          isCompact
            ? "flex flex-wrap justify-start gap-4 mt-6"
            : "grid gap-4 mt-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
        }
      >
        {visibleWallpapers.map((wallpaper, index) => {
          if (index === 2) {
            return (
              <div
                key="ad-1"
                className="rounded-2xl border p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full"
              >
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <img
                      key={i}
                      src={`https://picsum.photos/200/150?random=${i}`}
                      className="rounded-md h-24 w-full object-cover"
                    />
                  ))}
                </div>
                <div className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                  Get 20% off with code <strong>WALL20</strong>
                </div>
              </div>
            );
          }

          if (index === 5) {
            return (
              <div
                key="ad-2"
                className="rounded-2xl border p-4 bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-800 w-full"
              >
                <img
                  src="https://source.unsplash.com/featured/?design,app"
                  alt="Canva Ad"
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
                <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-200">
                  Try Canva Pro
                </h4>
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  Remove backgrounds in 1 click
                </p>
              </div>
            );
          }

          if (index === 9) {
            return (
              <div
                key="ad-3"
                className="rounded-2xl border p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full"
              >
                <div className="grid grid-cols-2 gap-2">
                  {[5, 6, 7, 8].map(i => (
                    <img
                      key={i}
                      src={`https://picsum.photos/200/150?random=${i}`}
                      className="rounded-md h-24 w-full object-cover"
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                  Animal collection — Explore more
                </div>
              </div>
            );
          }

          return (
            <div key={wallpaper.id} className={isCompact ? "w-[320px]" : "w-full"}>
              <WallpaperCard
                id={wallpaper.id}
                title={wallpaper.title}
                category={wallpaper.tags}
                imageUrl={wallpaper.url}
                thumbnailUrl={wallpaper.thumbnail}
                onDownload={() => handleDownload(wallpaper.url, wallpaper.title)}
                onApply={() => handleApply(wallpaper.url)}
                onClick={() => handleOpen(index)}
              />
            </div>
          );
        })}
      </div>
    );
  };

  if (!allWallpapers || allWallpapers.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-20 gap-4 transition-colors ${isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'
          }`}
      >
        <svg
          className="animate-spin h-8 w-8 text-yellow-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <div className="text-lg font-medium">Loading wallpapers...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 sm:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <Banner handleApply={handleApply} handleDownload={handleDownload} />

       <div className="mb-10">
          <div
            className={`w-full h-24 sm:h-28 flex items-center justify-center rounded-xl shadow-sm border border-dashed transition-colors ${
              isDarkMode
                ? 'bg-gray-900 border-gray-700'
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            <GoogleAd slotId="TOP_SLOT_ID" />
          </div>
        </div>

        <CategoryScroll
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          isDarkMode={isDarkMode}
        />

        <InfiniteScroll
          dataLength={visibleWallpapers.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div className="text-center my-6">
              <button
                onClick={fetchMoreData}
                className={`p-3 rounded-full transition-colors duration-200 shadow-sm ${
                  isDarkMode
                    ? 'bg-neutral-800 hover:bg-amber-500 text-white'
                    : 'bg-white hover:bg-yellow-400 text-gray-900 border border-gray-300'
                }`}
                aria-label="Load more wallpapers"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          }
          scrollThreshold={0.7}
        >
          <div className="max-w-screen-xl mx-auto">
            {renderWallpaperGrid()}
          </div>
        </InfiniteScroll>

        <WallpaperPreviewModal
          isOpen={modalOpen}
          currentIndex={currentIndex}
          currentWallpaperID={filteredWallpapers[currentIndex].id}
          onClose={() => setModalOpen(false)}
          onDownload={i => handleDownload(filteredWallpapers[i].url, filteredWallpapers[i].title)}
          onApply={i => handleApply(filteredWallpapers[i].url)}
          onNavigate={handleNavigate}
        />

        <section className="my-10">
          <div
            className={`w-full max-w-5xl mx-auto rounded-xl shadow-md border p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
              isDarkMode
                ? "bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700"
                : "bg-gradient-to-br from-white to-gray-50 border-zinc-200"
            }`}
          >
            <div className="text-center sm:text-left">
              <h4 className={`text-lg font-semibold tracking-tight ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                Elevate your workspace with premium wallpapers
              </h4>
              <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-neutral-500"}`}>
                Unlock exclusive collections and enjoy an ad-free experience.
              </p>
            </div>

            <div
              className={`w-full sm:w-64 h-24 rounded-lg border border-dashed flex items-center justify-center text-xs font-medium transition ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-400"
                  : "bg-white border-neutral-200 text-neutral-400 shadow-sm"
              }`}
            >
              Google Ad – Mid Content
            </div>
          </div>
        </section>


      </div>
    </div>
  );
};

export default HomePage;
