import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Category } from "@/types";

export default function CategoryScroll({ categories, selectedCategory, setSelectedCategory, isDarkMode }: {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  isDarkMode: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (el) {
      el.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  return (
    <div className="relative mb-10">
      {canScrollLeft && (
        <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-gray-700 
                        ring-1 ring-gray-300 dark:ring-gray-600 shadow-md hover:ring-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
            <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar px-8 scroll-smooth"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all 
              ${
                selectedCategory === cat.id
                  ? "bg-yellow-500 text-black"
                  : isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {canScrollRight && (
       <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-gray-700 
                        ring-1 ring-gray-300 dark:ring-gray-600 shadow-md hover:ring-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
            <ChevronRight className="w-5 h-5 text-black dark:text-white" />
        </button>
      )}
    </div>
  );
}
