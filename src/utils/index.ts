type Wallpaper = {
  is_favorite: boolean;
  height: number;
  id: string;
  is_ai_generated: boolean;
  mongo_id: string;
  tags: string;
  thumbnail: string;
  title: string;
  url: string;
  width: number;
};

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export const generateFilename = (name?: string): string => {
  const safeName = name
    ? name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
    : `wallpaper`;

  const timestamp = Date.now();
  return `${safeName}_${timestamp}.jpg`;
};


/**
 * Simplifies wallpaper data grouped by tags.
 * @param {Object} data - The original data object (categories as keys, array of images as values)
 * @returns {Object} - Simplified data grouped by category (tags)
 */
export function flattenWallpapers(input: Record<string, Wallpaper[]>): Wallpaper[] {
  const flattened: Wallpaper[] = [];

  for (const category in input) {
    if (Array.isArray(input[category])) {
      for (const wallpaper of input[category]) {
        flattened.push(wallpaper);
      }
    }
  }

  return flattened;
}

