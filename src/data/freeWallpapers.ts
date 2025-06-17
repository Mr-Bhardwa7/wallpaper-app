import { Wallpaper } from "@/types";

export  const freeWallpapers: Record<string, Wallpaper[]> = {
    nature: [
      { id: 1, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', title: 'Mountain Landscape', category: 'nature' },
      { id: 2, url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop', title: 'Ocean Sunset', category: 'nature' },
      { id: 3, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', title: 'Forest Path', category: 'nature' },
      { id: 4, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop', title: 'Desert Dunes', category: 'nature' }
    ],
    abstract: [
      { id: 5, url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1080&fit=crop', title: 'Digital Art', category: 'abstract' },
      { id: 6, url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop', title: 'Color Waves', category: 'abstract' },
      { id: 7, url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1920&h=1080&fit=crop', title: 'Geometric Pattern', category: 'abstract' },
      { id: 8, url: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=1920&h=1080&fit=crop', title: 'Light Reflection', category: 'abstract' }
    ],
    space: [
      { id: 9, url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=1920&h=1080&fit=crop', title: 'Galaxy Stars', category: 'space' },
      { id: 10, url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop', title: 'Nebula', category: 'space' },
      { id: 11, url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1920&h=1080&fit=crop', title: 'Planet Earth', category: 'space' },
      { id: 12, url: 'https://images.unsplash.com/photo-1517039488-7aa46c05b7b1?w=1920&h=1080&fit=crop', title: 'Moon Surface', category: 'space' }
    ],
    architecture: [
      { id: 13, url: 'https://images.unsplash.com/photo-1545224181-b45e8c5b6bb1?w=1920&h=1080&fit=crop', title: 'Modern Building', category: 'architecture' },
      { id: 14, url: 'https://images.unsplash.com/photo-1517672651691-24622d4d4419?w=1920&h=1080&fit=crop', title: 'Glass Facade', category: 'architecture' },
      { id: 15, url: 'https://images.unsplash.com/photo-1551434832-88b1cc2ff2b8?w=1920&h=1080&fit=crop', title: 'Cathedral Interior', category: 'architecture' },
      { id: 16, url: 'https://images.unsplash.com/photo-1518291344630-4857135fb581?w=1920&h=1080&fit=crop', title: 'Bridge Architecture', category: 'architecture' }
    ],
    animals: [
      { id: 17, url: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=1920&h=1080&fit=crop', title: 'Lion Portrait', category: 'animals' },
      { id: 18, url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1920&h=1080&fit=crop', title: 'Eagle Flight', category: 'animals' },
      { id: 19, url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1920&h=1080&fit=crop', title: 'Wolf Pack', category: 'animals' },
      { id: 20, url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=1920&h=1080&fit=crop', title: 'Butterfly Garden', category: 'animals' }
    ],
    technology: [
      { id: 21, url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop', title: 'Circuit Board', category: 'technology' },
      { id: 22, url: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=1920&h=1080&fit=crop', title: 'Data Visualization', category: 'technology' },
      { id: 23, url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=1920&h=1080&fit=crop', title: 'AI Neural Network', category: 'technology' },
      { id: 24, url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop', title: 'Quantum Computing', category: 'technology' }
    ]
};