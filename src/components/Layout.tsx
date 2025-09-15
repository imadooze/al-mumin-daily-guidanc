import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Home, BookOpen, Clock, Compass, Heart, Menu } from 'lucide-react';
import { useTranslations } from '@/lib/translations';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export default function Layout({ children, currentPage = 'home', onPageChange }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'arabic';
  });
  
  const t = useTranslations();

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dark-mode', JSON.stringify(newDarkMode));
  };

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'quran', label: t.quran, icon: BookOpen },
    { id: 'prayer-times', label: t.prayer, icon: Clock },
    { id: 'qibla', label: t.qibla, icon: Compass },
    { id: 'azkar', label: t.azkar, icon: Heart },
    { id: 'more', label: t.more, icon: Menu },
  ];

  // تطبيق الإعدادات عند تحميل المكون
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    if (language === 'english') {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    } else {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    }
  }, [darkMode, language]);

  // الاستماع لتغييرات اللغة
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLanguage = localStorage.getItem('app-language') || 'arabic';
      setLanguage(newLanguage);
    };
    
    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);

  const handleNavClick = (pageId: string) => {
    if (pageId === 'qibla') {
      navigate('/qibla');
    } else if (pageId === 'home') {
      navigate('/');
    } else if (onPageChange) {
      onPageChange(pageId);
    }
  };

  // تحديد الصفحة الحالية بناءً على المسار
  const getCurrentPage = () => {
    if (location.pathname === '/qibla') return 'qibla';
    return currentPage;
  };

  return (
    <div className="min-h-screen bg-background font-arabic language-transition">
      {/* الشريط العلوي المحسن */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 shadow-islamic-soft language-transition">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 islamic-gradient rounded-full flex items-center justify-center shadow-islamic-soft">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-arabic-display">{t.appName}</h1>
              <p className="text-sm text-muted-foreground font-arabic">{t.appSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="button" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="app-button rounded-full hover:bg-muted/50 transition-all duration-300 hover:scale-105"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-primary animate-fade-in" />
              ) : (
                <Moon className="h-5 w-5 text-primary animate-fade-in" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 pb-20">
        <div className="container py-6">
          {children}
        </div>
      </main>

      {/* شريط التنقل السفلي المحسن */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav safe-area-bottom language-transition">
        <div className="container max-w-md mx-auto">
          <div className="flex items-center justify-around py-3 px-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`nav-button language-transition hover:scale-105 active:scale-95 ${
                  getCurrentPage() === item.id ? 'active' : ''
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon className={`h-5 w-5 mb-1 transition-all duration-300 ${
                  getCurrentPage() === item.id ? 'scale-110 text-white' : 'text-primary'
                }`} />
                <span className={`text-xs font-medium font-arabic transition-all duration-300 block ${
                  getCurrentPage() === item.id ? 'font-bold text-white' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}