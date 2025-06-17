import { useState } from 'react';
import {  Page } from '@/types';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import GeneratePage from './GeneratePage';
import FavoritesPage from './FavoritePage';
import SettingsPage from './SettingsPage';
import AccountPage from './AccountPage';
import BuyCreditsModal from '@/components/BuyCreditsModal';
import { useTheme } from '@/contexts/ThemeContext';
import GalleryPage from './GalleryPage';
import HomePage from './HomePage';

const WallpaperManagerApp = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [credits, setCredits] = useState(15);
    const [showBuyCredits, setShowBuyCredits] = useState(false);
    const { isDarkMode } = useTheme(); 
     
    const useCredit = () => {
        setCredits(prev => prev - 1);
    }
   
    const renderPage = () => {
        switch(currentPage) {
            case 'home': return <HomePage />;
            case 'generate': return <GeneratePage credits={credits} useCredit={useCredit} setShowBuyCredits={setShowBuyCredits} />;
            case 'favorites': return <FavoritesPage />;
            case 'settings': return <SettingsPage />;
            case 'account': return <AccountPage />;
            case 'gallery': return <GalleryPage />;
            default: return <HomePage />;
        }
    };


  return (
    <div className={`${isDarkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'} flex h-screen overflow-hidden`}>
      {/* Sidebar stays fixed */}
      <div className="flex-shrink-0">
        <Sidebar
          currentPage={currentPage}
          credits={credits}
          setCurrentPage={setCurrentPage}
          setShowBuyCredits={setShowBuyCredits}
        />
      </div>

      {/* Right content area scrolls */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentPage={currentPage}
          credits={credits}
          setShowBuyCredits={setShowBuyCredits}
        />

        {/* Scrollable main content */}
        <div className="flex-1 overflow-y-auto">
          {renderPage()}
        </div>
      </div>

      <BuyCreditsModal
        showBuyCredits={showBuyCredits}
        setShowBuyCredits={setShowBuyCredits}
        credits={credits}
        setCredits={setCredits}
      />
    </div>

  );
};

export default WallpaperManagerApp;