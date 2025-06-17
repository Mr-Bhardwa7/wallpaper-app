import { useMemo } from "react";
import { Category } from "@/types";
import { useTranslation } from "./useTranslation";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import {
  Image,
  Leaf,
  Rocket,
  Building,
  PawPrint,
  MonitorSmartphone,
} from "lucide-react";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const useCategories = (): Category[] => {
  const { t } = useTranslation();
  const { tags } = useWallpaperStore();

  const getIconForTag = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "nature":
        return Leaf;
      case "space":
        return Rocket;
      case "architecture":
        return Building;
      case "animals":
        return PawPrint;
      case "technology":
        return MonitorSmartphone;
      default:
        return Image;
    }
  };

  return useMemo(() => {
    const baseCategories: Category[] = [
      { id: "all", name: t("all"), icon: Image },
    ];

    const dynamicCategories: Category[] = tags.map((tag) => ({
      id: tag.toLowerCase().replace(/\s+/g, "-"),
      name: capitalize(tag),
      icon: getIconForTag(tag),
    }));

    return [...baseCategories, ...dynamicCategories];
  }, [t, tags, getIconForTag]);
};

export default useCategories;
