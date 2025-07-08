import { useState } from 'react';
import Layout from '@/components/Layout';
import HomePage from '@/components/HomePage';
import AzkarPage from '@/components/AzkarPage';
import TasbeehPage from '@/components/TasbeehPage';
import NamesPage from '@/components/NamesPage';
import QiblaPage from '@/components/QiblaPage';
import QuranPage from '@/components/QuranPage';
import DuasPage from '@/components/DuasPage';
import HadithPage from '@/components/HadithPage';
import PrayerTimesPage from '@/components/PrayerTimesPage';
import MorePage from '@/components/MorePage';
import SettingsPage from '@/components/SettingsPage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'quran':
        return <QuranPage onPageChange={setCurrentPage} />;
      case 'prayer-times':
        return <PrayerTimesPage onPageChange={setCurrentPage} />;
      case 'azkar':
        return <AzkarPage onPageChange={setCurrentPage} />;
      case 'more':
        return <MorePage onPageChange={setCurrentPage} />;
      case 'tasbeeh':
        return <TasbeehPage onPageChange={setCurrentPage} />;
      case 'names':
        return <NamesPage onPageChange={setCurrentPage} />;
      case 'qibla':
        return <QiblaPage onPageChange={setCurrentPage} />;
      case 'duas':
        return <DuasPage onPageChange={setCurrentPage} />;
      case 'hadith':
        return <HadithPage onPageChange={setCurrentPage} />;
      case 'settings':
        return <SettingsPage onPageChange={setCurrentPage} />;
      case 'hijri-calendar':
        return <MorePage onPageChange={setCurrentPage} />; // مؤقت
      case 'learning':
        return <MorePage onPageChange={setCurrentPage} />; // مؤقت
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default Index;
