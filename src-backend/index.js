const express = require("express");
const app = express();
const port = 3000;

// Mock wallpapers
const wallpapers = [
  {
    "id": "9c1fe23c-d0cd-4d70-a1e7-55b059d9b001",
    "mongo_id": "665fd801c234de001a51ab01",
    "title": "Mountain View",
    "url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "thumbnail": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    "width": 1920,
    "height": 1080,
    "tags": "mountain, snow, nature",
    "is_ai_generated": false
  },
  {
    "id": "adf02e5b-4242-48a3-85ec-c4b5efc8b9a3",
    "mongo_id": "665fd801c234de001a51ab02",
    "title": "City Lights",
    "url": "https://images.unsplash.com/photo-1494526585095-c41746248156",
    "thumbnail": "https://images.unsplash.com/photo-1494526585095-c41746248156?w=400",
    "width": 1920,
    "height": 1080,
    "tags": "city, night, lights",
    "is_ai_generated": false
  },
  {
    "id": "c1d703e4-b2f6-4418-9d7e-fc0a2f9e5e0a",
    "mongo_id": "665fd801c234de001a51ab03",
    "title": "Forest Path",
    "url": "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "thumbnail": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400",
    "width": 1920,
    "height": 1080,
    "tags": "forest, path, green",
    "is_ai_generated": false
  },
  {
    "id": "f3a5db64-43a4-4970-8185-989f7403289d",
    "mongo_id": "665fd801c234de001a51ab04",
    "title": "Space Nebula",
    "url": "https://images.unsplash.com/photo-1587613750860-1a4c1b9db84c",
    "thumbnail": "https://images.unsplash.com/photo-1587613750860-1a4c1b9db84c?w=400",
    "width": 2560,
    "height": 1440,
    "tags": "space, nebula, stars",
    "is_ai_generated": true
  },
  {
    "id": "3ab2df97-4076-4d86-98a7-4f5dca99a6b4",
    "mongo_id": "665fd801c234de001a51ab05",
    "title": "Desert Dunes",
    "url": "https://images.unsplash.com/photo-1600535277468-0805c1b14c7e",
    "thumbnail": "https://images.unsplash.com/photo-1600535277468-0805c1b14c7e?w=400",
    "width": 1920,
    "height": 1080,
    "tags": "desert, dunes, sand",
    "is_ai_generated": false
  },
  {
    "id": "709b7f12-6d42-4b8f-a693-2e98e3d6a38c",
    "mongo_id": "665fd801c234de001a51ab06",
    "title": "Ocean Horizon",
    "url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "thumbnail": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    "width": 1920,
    "height": 1080,
    "tags": "ocean, sea, waves",
    "is_ai_generated": false
  },
  {
    "id": "51d7d36e-3a62-49dc-9d5f-d9dfabcaaac2",
    "mongo_id": "665fd801c234de001a51ab07",
    "title": "Aurora Sky",
    "url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    "thumbnail": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400",
    "width": 1920,
    "height": 1080,
    "tags": "aurora, sky, night",
    "is_ai_generated": true
  },
  {
    "id": "d1b7186a-2b43-4aa3-a012-30a06ecfcaa2",
    "mongo_id": "665fd801c234de001a51ab08",
    "title": "Sunset Field",
    "url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    "thumbnail": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
    "width": 1920,
    "height": 1080,
    "tags": "sunset, field, grass",
    "is_ai_generated": false
  },
  {
    "id": "8c5de2b7-88a6-49e2-a67a-35ae96cc760f",
    "mongo_id": "665fd801c234de001a51ab09",
    "title": "Frozen Lake",
    "url": "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66",
    "thumbnail": "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=400",
    "width": 1920,
    "height": 1080,
    "tags": "lake, frozen, snow",
    "is_ai_generated": false
  },
  {
    "id": "f712313b-cb9f-49d5-8f46-446b1ad295f2",
    "mongo_id": "665fd801c234de001a51ab0a",
    "title": "Abstract Neon",
    "url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    "thumbnail": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
    "width": 1920,
    "height": 1080,
    "tags": "abstract, neon, glow",
    "is_ai_generated": true
  }
]

app.get("/api/wallpapers", (req, res) => {
  res.json(wallpapers); // Only send the wallpaper array
});

app.listen(port, () => {
  console.log(`✅ Wallpaper API running at http://localhost:${port}/api/wallpapers`);
});
