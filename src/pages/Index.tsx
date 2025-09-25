import { useEffect } from 'react';
import Layout from '@/components/Layout';
import HomePage from '@/components/HomePage';
import AzkarPage from '@/components/AzkarPage';
import TasbeehPage from '@/components/TasbeehPage';
import NamesPage from '@/components/NamesPage';
import QuranPage from '@/components/QuranPage';
import DuasPage from '@/components/DuasPage';
import HadithPage from '@/components/HadithPage';
import PrayerTimesPage from '@/components/PrayerTimesPage';
import MorePage from '@/components/MorePage';
import SettingsPage from '@/components/SettingsPage';
import IslamicEducationPage from '@/components/IslamicEducationPage';
import { useNavigation, PageId } from '@/hooks/use-navigation';

const Index = () => {
  const { currentPage, navigateToPage } = useNavigation();

  const handlePageChange = (page: PageId) => {
    console.log('Page change requested:', page);
    navigateToPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={handlePageChange} />;
      case 'quran':
        return <QuranPage onPageChange={handlePageChange} />;
      case 'prayer-times':
        return <PrayerTimesPage onPageChange={handlePageChange} />;
      case 'azkar':
        return <AzkarPage onPageChange={handlePageChange} />;
      case 'more':
        return <MorePage onPageChange={handlePageChange} />;
      case 'tasbeeh':
        return <TasbeehPage onPageChange={handlePageChange} />;
      case 'names':
        return <NamesPage onPageChange={handlePageChange} />;
      case 'duas':
        return <DuasPage onPageChange={handlePageChange} />;
      case 'hadith':
        return <HadithPage onPageChange={handlePageChange} />;
      case 'settings':
        return <SettingsPage onPageChange={handlePageChange} />;
      case 'hijri-calendar':
        return <IslamicEducationPage onPageChange={handlePageChange} />;
      case 'learning':
        return <IslamicEducationPage onPageChange={handlePageChange} />;
      default:
        return <HomePage onPageChange={handlePageChange} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange}>
      <div key={currentPage} className="animate-fade-in">
        {renderPage()}
      </div>
    </Layout>
  );
};

export default Index;
