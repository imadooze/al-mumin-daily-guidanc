import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Home, BookOpen, Clock, Compass, Heart, Menu } from 'lucide-react';
import { useTranslations } from '@/lib/translations';
import { useNavigation, PageId } from '@/hooks/use-navigation';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: PageId;
  onPageChange?: (page: PageId) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { navigateToPage, currentPage: navCurrentPage, isNavigating } = useNavigation();
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
    { id: 'home' as PageId, label: t.home, icon: Home },
    { id: 'quran' as PageId, label: t.quran, icon: BookOpen },
    { id: 'prayer-times' as PageId, label: t.prayer, icon: Clock },
    { id: 'qibla' as PageId, label: t.qibla, icon: Compass },
    { id: 'azkar' as PageId, label: t.azkar, icon: Heart },
    { id: 'more' as PageId, label: t.more, icon: Menu },
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

  // معالجة النقر على التنقل - تبسيط كامل
  const handleNavClick = (pageId: PageId) => {
    if (isNavigating) {
      console.log('Navigation blocked - already navigating');
      return;
    }
    
    console.log('Nav button clicked:', pageId);
    navigateToPage(pageId);
    onPageChange?.(pageId);
  };

  // تحديد الصفحة النشطة - استخدام قيمة واحدة موثوقة
  const activePageId = currentPage || navCurrentPage;

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

      {/* شريط التنقل السفلي الاحترافي */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav language-transition">
        <div className="container max-w-md mx-auto px-2">
          <div className="flex items-center justify-around py-2 gap-1">
            {navItems.map((item) => {
              const isActive = activePageId === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  disabled={isNavigating}
                  className={`nav-button ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={`nav-icon ${isActive ? 'active' : ''}`} />
                  <span className={`nav-label ${isActive ? 'active' : ''}`}>
                    {item.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}