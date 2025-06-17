export interface Wallpaper {
  id: string;
  mongo_id: string;
  title: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  tags: string;
  is_ai_generated: boolean;
  is_favorite?: boolean;
}