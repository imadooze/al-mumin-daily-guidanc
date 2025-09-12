import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const navigate = useNavigate();

  const handlePageChange = (page: string) => {
    if (page === 'qibla') {
      navigate('/qibla');
    } else {
      setCurrentPage(page);
    }
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
      {renderPage()}
    </Layout>
  );
};

export default Index;
