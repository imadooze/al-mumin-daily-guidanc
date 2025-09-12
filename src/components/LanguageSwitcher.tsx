import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'button' | 'select';
}

export default function LanguageSwitcher({ className, variant = 'select' }: LanguageSwitcherProps) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'arabic';
  });

  const languages = [
    { value: 'arabic', label: 'العربية', flag: '🇸🇦' },
    { value: 'english', label: 'English', flag: '🇺🇸' }
  ];

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('app-language', newLanguage);
    
    // تطبيق التغييرات على DOM
    if (newLanguage === 'english') {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
      document.body.classList.add('language-transition');
    } else {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      document.body.classList.add('language-transition');
    }
    
    // إرسال حدث لتحديث المكونات الأخرى
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'app-language',
      newValue: newLanguage
    }));

    // إزالة تأثير الانتقال بعد انتهائه
    setTimeout(() => {
      document.body.classList.remove('language-transition');
    }, 500);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'arabic' ? 'english' : 'arabic';
    handleLanguageChange(newLanguage);
  };

  const currentLanguage = languages.find(lang => lang.value === language);

  if (variant === 'button') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className={`app-button gap-2 ${className}`}
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage?.flag} {currentLanguage?.label}</span>
      </Button>
    );
  }

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`app-button w-auto min-w-[120px] ${className}`}>
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}