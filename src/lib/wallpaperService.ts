import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from '@tauri-apps/api/window';
const appWindow = getCurrentWindow();
import toast from "react-hot-toast";

/**
 * Applies a wallpaper given its absolute path.
 */
export const applyWallpaper = async (imageUrl: string): Promise<void> => {
    const toastId = toast.loading("Applying wallpaper...");
  try {
      await invoke("apply_wallpaper", { imageUrl });
      toast.success("Wallpaper applied successfully!", { id: toastId });
  } catch (err) {
      console.error("Failed to apply wallpaper:", err);
      toast.error("Failed to apply wallpaper. Please try again.", { id: toastId });
    throw err;
  }
};

/**
 * Downloads a wallpaper from a URL and saves it with the given filename.
 * Returns the full path of the saved file.
 */
export const downloadWallpaper = async (
  url: string,
  filename: string
): Promise<string> => {
    const toastId = toast.loading("Downloading wallpaper...");
  try {
      const path = await invoke<string>("download_wallpaper", { url, filename });
      toast.success("Wallpaper downloaded to your Downloads folder!", { id: toastId });
    return path;
  } catch (err) {
      console.error("Failed to download wallpaper:", err);
      toast.error("Failed to download wallpaper.", { id: toastId });
    throw err;
  }
};

/**
 * Starts rotating wallpapers from a list of paths every X seconds.
 * Frontend will receive `wallpaper-rotated` events with the active path.
 */
export const startWallpaperRotation = async (
  paths: string[],
  intervalSec: number
): Promise<void> => {
    const toastId = toast.loading("Starting wallpaper rotation...");
  try {
    await invoke("start_wallpaper_rotation", {
      paths,
      intervalSec,
      window: appWindow,
    });
    toast.success("Wallpaper rotation started!", { id: toastId });
  } catch (err) {
      console.error("Failed to start wallpaper rotation:", err);
      toast.error("Could not start wallpaper rotation.", { id: toastId });
    throw err;
  }
};

/**
 * Stops wallpaper rotation.
 */
export const stopWallpaperRotation = async (): Promise<void> => {
    const toastId = toast.loading("Stopping wallpaper rotation...");
  try {
         await invoke("stop_wallpaper_rotation");
        toast.success("Wallpaper rotation stopped!", { id: toastId });
  } catch (err) {
      console.error("Failed to stop wallpaper rotation:", err);
      toast.error("Could not stop wallpaper rotation.", { id: toastId });
        throw err;
  }
};
