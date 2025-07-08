import { useState } from 'react';
import Layout from '@/components/Layout';
import HomePage from '@/components/HomePage';
import AzkarPage from '@/components/AzkarPage';
import TasbeehPage from '@/components/TasbeehPage';
import NamesPage from '@/components/NamesPage';
import QiblaPage from '@/components/QiblaPage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'azkar':
        return <AzkarPage onPageChange={setCurrentPage} />;
      case 'tasbeeh':
        return <TasbeehPage onPageChange={setCurrentPage} />;
      case 'names':
        return <NamesPage onPageChange={setCurrentPage} />;
      case 'qibla':
        return <QiblaPage onPageChange={setCurrentPage} />;
      case 'prayer-times':
        return <HomePage onPageChange={setCurrentPage} />; // مؤقت
      case 'duas':
        return <HomePage onPageChange={setCurrentPage} />; // مؤقت
      case 'calendar':
        return <HomePage onPageChange={setCurrentPage} />; // مؤقت
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
