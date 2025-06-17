import { useTranslation } from "@/hooks/useTranslation";
import { Home, Heart, Settings } from "lucide-react";
import { Page } from "@/types";

export const useSidebarItems = (): { id: Page; icon: React.ElementType; label: string }[] => {
  const { t } = useTranslation();

  return [
    { id: 'home', icon: Home, label: t('home') },
    // { id: 'gallery', icon: Image, label: t('gallery') },
    // { id: 'generate', icon: Wand2, label: t('generate') },
    { id: 'favorites', icon: Heart, label: t('favorites') },
    { id: 'settings', icon: Settings, label: t('settings') },
    // { id: 'account', icon: User, label: t('account') },
  ];
};
