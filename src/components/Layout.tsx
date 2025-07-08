import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Home, BookOpen, Clock, Compass, Heart, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export default function Layout({ children, currentPage = 'home', onPageChange }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home, labelEn: 'Home' },
    { id: 'quran', label: 'القرآن', icon: BookOpen, labelEn: 'Quran' },
    { id: 'prayer-times', label: 'الصلاة', icon: Clock, labelEn: 'Prayer' },
    { id: 'azkar', label: 'الأذكار', icon: Heart, labelEn: 'Azkar' },
    { id: 'more', label: 'المزيد', icon: Menu, labelEn: 'More' },
  ];

  const handleNavClick = (pageId: string) => {
    if (onPageChange) {
      onPageChange(pageId);
    }
  };

  return (
    <div className="min-h-screen bg-background font-arabic">
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">الـمُؤمِن</h1>
              <p className="text-sm text-muted-foreground">Al-Mumin</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 pb-20">
        <div className="container py-6">
          {children}
        </div>
      </main>

      {/* شريط التنقل السفلي */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border supports-[backdrop-filter]:bg-background/80">
        <div className="container">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  currentPage === item.id 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon className={`h-5 w-5 ${currentPage === item.id ? 'text-primary' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}