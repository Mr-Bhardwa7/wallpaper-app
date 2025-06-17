import { Wallpaper } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";
import { create } from "zustand";

type Settings = {
  autoUpdate: boolean;
  saveWallpaper: boolean;
  updateInterval: string;
  appTheme: "light" | "dark" | "system";
  notifications: boolean;
  autoStart: boolean;
  experimental: boolean;
  language: string;
  preferredResolution: string;
};

type SettingKey = keyof Settings;
type SettingCategory = "wallpaper" | "preferences" | "general";

interface WallpaperState {
  wallpapers: Wallpaper[];
  favorites: Wallpaper[];
  tags: string[];
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  settingsLoaded: boolean;

  fetchWallpapers: (limit?: number, offset?: number) => Promise<void>;
  loadMoreWallpapers: () => Promise<void>;
  setWallpapers: (items: Wallpaper[]) => void;
  clearWallpapers: () => void;

  updateFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  deleteFavoriteWallpaper: (id: string) => Promise<void>;
  fetchFavoriteWallpapers: () => Promise<void>;

  fetchSetting: () => Promise<void>;
  updateSetting: <K extends SettingKey>(key: K, value: Settings[K], category: SettingCategory) => Promise<void>;
  resetSettings: () => Promise<void>;

  persistState: () => Promise<void>;
  loadPersistedState: () => Promise<void>;
}

export const useWallpaperStore = create<WallpaperState>((set, get) => ({
  wallpapers: [],
  favorites: [],
  tags: [],
  settings: {
    autoUpdate: true,
    saveWallpaper: false,
    updateInterval: "Daily",
    appTheme: "system",
    notifications: true,
    autoStart: false,
    experimental: false,
    language: "en-US",
    preferredResolution: "1920x1080",
  },
  loading: false,
  error: null,
  page: 0,
  hasMore: true,
  settingsLoaded: false,

  fetchWallpapers: async (limit = 100, offset = 0) => {
    set({ loading: true, error: null });
    try {
      const result = await invoke<Wallpaper[]>("get_wallpapers", { limit, offset });

      const allTags = Array.from(
        new Set(
          result
            .flatMap((wp) => wp.tags?.split(",") || [])
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      ).sort();

      set({
        wallpapers: result,
        tags: allTags,
        loading: false,
        hasMore: result.length === limit,
        page: offset / limit + 1,
      });

      await get().persistState();
    } catch (e: any) {
      set({ error: e.message || "Failed to fetch wallpapers", loading: false });
    }
  },

  loadMoreWallpapers: async () => {
    const { page, hasMore } = get();
    if (!hasMore) return;

    const limit = 100;
    const offset = page * limit;
    await get().fetchWallpapers(limit, offset);
  },

  setWallpapers: (items) => {
    set({ wallpapers: items });
  },

  clearWallpapers: () => {
    set({ wallpapers: [], page: 0, hasMore: true });
  },

  updateFavorite: async (id, isFavorite) => {
    try {
      await invoke("update_favorite_command", { id, isFavorite });

      set((state) => ({
        wallpapers: state.wallpapers.map((wallpaper) =>
          wallpaper.id === id ? { ...wallpaper, is_favorite: isFavorite } : wallpaper
        ),
      }));

      await get().fetchFavoriteWallpapers();
    } catch (e: any) {
      set({ error: e.message || "Failed to update favorite" });
    }
  },

  deleteFavoriteWallpaper: async (id) => {
    try {
      await invoke("delete_favorite_wallpaper_command", { id });
      await get().fetchFavoriteWallpapers();
    } catch (e: any) {
      set({ error: e.message || "Failed to delete favorite wallpaper" });
    }
  },

  fetchFavoriteWallpapers: async () => {
    try {
      const result = await invoke<Wallpaper[]>("fetch_favorite_wallpapers");
      set({ favorites: result });
      await get().persistState();
    } catch (e: any) {
      set({ error: e.message || "Failed to fetch favorites" });
    }
  },

  fetchSetting: async () => {
    try {
    const normalizeBool = (v: string | boolean) => v === true || v === "true";
    const raw = await invoke<Settings>("get_app_settings");
    const settings = {
      ...raw,
      experimental: normalizeBool(raw.experimental),
      autoUpdate: normalizeBool(raw.autoUpdate),
      notifications: normalizeBool(raw.notifications),
      saveWallpaper: normalizeBool(raw.saveWallpaper),
      autoStart: normalizeBool(raw.autoStart),
    };
    set({ settings, settingsLoaded: true });
    await get().persistState();
  } catch (e: any) {
    set({ error: e.message || "Failed to fetch settings" });
  }
  },

  updateSetting: async (key, value, category) => {
    try {
      await invoke("update_app_setting_command", {
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
        category,
      });

      set((state) => ({
        settings: {
          ...(state.settings as Settings),
          [key]: value,
        },
      }));
    } catch (err) {
      console.error("Tauri update_app_setting_command failed", err);
    }
  },

  resetSettings: async () => {
    try {
      await invoke("reset_wallpaper_settings");
      await get().fetchSetting();
    } catch (e: any) {
      set({ error: e.message || "Failed to reset settings" });
    }
  },

  persistState: async () => {
    const { wallpapers, favorites, settings } = get();
    const store = await Store.load("wallpaper-store.dat");

    await store.set("wallpapers", wallpapers);
    await store.set("favorites", favorites);
    await store.set("settings", settings);
    await store.save();
  },

  loadPersistedState: async () => {
    const store = await Store.load("wallpaper-store.dat");

    const wallpapers = (await store.get<Wallpaper[]>("wallpapers")) || [];
    const favorites = (await store.get<Wallpaper[]>("favorites")) || [];
    const settings = (await store.get<Settings>("settings")) || null;

    set({ wallpapers, favorites, settings });
  },
}));
