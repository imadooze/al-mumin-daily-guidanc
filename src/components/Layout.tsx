import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, X, Home, BookOpen, Clock, Compass, Heart, MessageCircle, Calendar, Star } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export default function Layout({ children, currentPage = 'home', onPageChange }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home, labelEn: 'Home' },
    { id: 'azkar', label: 'الأذكار', icon: BookOpen, labelEn: 'Azkar' },
    { id: 'prayer-times', label: 'أوقات الصلاة', icon: Clock, labelEn: 'Prayer Times' },
    { id: 'qibla', label: 'القبلة', icon: Compass, labelEn: 'Qibla' },
    { id: 'tasbeeh', label: 'المسبحة', icon: Heart, labelEn: 'Tasbeeh' },
    { id: 'duas', label: 'الأدعية', icon: MessageCircle, labelEn: 'Duas' },
    { id: 'names', label: 'أسماء الله الحسنى', icon: Star, labelEn: 'Names of Allah' },
    { id: 'calendar', label: 'التقويم', icon: Calendar, labelEn: 'Calendar' },
  ];

  const handleNavClick = (pageId: string) => {
    if (onPageChange) {
      onPageChange(pageId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-arabic">
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">الـمُؤمِن</h1>
                <p className="text-sm text-muted-foreground">Al-Mumin</p>
              </div>
            </div>
          </div>

          <div className="flex-1" />

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

      <div className="flex">
        {/* التنقل الجانبي - Desktop */}
        <nav className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16 md:bg-card md:border-r md:border-border">
          <div className="flex-1 flex flex-col py-4 px-3 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-12 text-right ${
                  currentPage === item.id 
                    ? 'bg-gradient-primary text-white shadow-islamic' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* التنقل الجانبي - Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <nav className="fixed right-0 top-16 h-full w-64 bg-card border-l border-border shadow-lg">
              <div className="flex flex-col py-4 px-3 space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 h-12 text-right ${
                      currentPage === item.id 
                        ? 'bg-gradient-primary text-white shadow-islamic' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                ))}
              </div>
            </nav>
          </div>
        )}

        {/* المحتوى الرئيسي */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)]">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}