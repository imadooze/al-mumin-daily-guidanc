import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Moon, Sun, Globe, Bell, Volume2, Smartphone, HelpCircle, Instagram, Star } from 'lucide-react';

interface SettingsPageProps {
  onPageChange?: (page: string) => void;
}

export default function SettingsPage({ onPageChange }: SettingsPageProps) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'arabic';
  });
  const [notifications, setNotifications] = useState({
    prayerAlerts: true,
    azkarReminders: true,
    dailyVerses: true,
    sound: true
  });

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // حفظ الحالة في التخزين المحلي
    localStorage.setItem('dark-mode', JSON.stringify(newDarkMode));
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    
    // تطبيق تغيير اللغة على العناصر
    if (lang === 'english') {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
      // حفظ اللغة في التخزين المحلي
      localStorage.setItem('app-language', 'english');
      // يمكن إضافة ترجمة النصوص هنا
    } else {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      localStorage.setItem('app-language', 'arabic');
    }
  };

  const handleNotificationToggle = (type: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // تطبيق الإعدادات المحفوظة عند تحميل الصفحة
  useEffect(() => {
    // تطبيق الوضع المظلم
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // تطبيق إعدادات اللغة
    if (language === 'english') {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    } else {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* العنوان الرئيسي */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange?.('home')}
          className="rounded-full"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground font-arabic-display">
            الإعدادات
          </h1>
          <p className="text-muted-foreground">Settings</p>
        </div>

        <div className="w-10"></div>
      </div>

      {/* إعدادات المظهر */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            المظهر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">الوضع المظلم</p>
              <p className="text-sm text-muted-foreground">تفعيل المظهر الليلي للتطبيق</p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* إعدادات اللغة */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            اللغة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Button
              variant={language === 'arabic' ? 'default' : 'outline'}
              className={`w-full justify-start ${
                language === 'arabic' ? 'bg-gradient-primary text-white' : ''
              }`}
              onClick={() => handleLanguageChange('arabic')}
            >
              العربية
            </Button>
            <Button
              variant={language === 'english' ? 'default' : 'outline'}
              className={`w-full justify-start ${
                language === 'english' ? 'bg-gradient-primary text-white' : ''
              }`}
              onClick={() => handleLanguageChange('english')}
            >
              English
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* إعدادات التنبيهات */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            التنبيهات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">تنبيهات الصلاة</p>
              <p className="text-sm text-muted-foreground">تذكير بأوقات الصلاة</p>
            </div>
            <Switch
              checked={notifications.prayerAlerts}
              onCheckedChange={() => handleNotificationToggle('prayerAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">تذكير الأذكار</p>
              <p className="text-sm text-muted-foreground">تذكير بأذكار الصباح والمساء</p>
            </div>
            <Switch
              checked={notifications.azkarReminders}
              onCheckedChange={() => handleNotificationToggle('azkarReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">آية اليوم</p>
              <p className="text-sm text-muted-foreground">آية يومية مع الإشعارات</p>
            </div>
            <Switch
              checked={notifications.dailyVerses}
              onCheckedChange={() => handleNotificationToggle('dailyVerses')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">الأصوات</p>
              <p className="text-sm text-muted-foreground">تشغيل أصوات التنبيهات</p>
            </div>
            <Switch
              checked={notifications.sound}
              onCheckedChange={() => handleNotificationToggle('sound')}
            />
          </div>
        </CardContent>
      </Card>

      {/* إعدادات الصلاة */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            إعدادات الصلاة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => alert('سيتم إضافة خيارات طرق الحساب قريباً')}
          >
            طريقة حساب أوقات الصلاة
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => alert('سيتم إضافة مكتبة الأصوات قريباً')}
          >
            اختيار صوت الأذان
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    alert(`تم تحديد الموقع: ${position.coords.latitude}, ${position.coords.longitude}`);
                  },
                  () => alert('فشل في تحديد الموقع')
                );
              } else {
                alert('المتصفح لا يدعم تحديد الموقع');
              }
            }}
          >
            تعديل الموقع الجغرافي
          </Button>
        </CardContent>
      </Card>

      {/* إعدادات إضافية */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            إعدادات أخرى
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => alert('سيتم إضافة خيارات حجم الخط قريباً')}
          >
            حجم الخط في القرآن
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              const data = {
                settings: { darkMode, language, notifications },
                timestamp: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'al-mumin-backup.json';
              a.click();
              URL.revokeObjectURL(url);
              alert('تم إنشاء النسخة الاحتياطية');
            }}
          >
            نسخ احتياطي للبيانات
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              if (confirm('هل أنت متأكد من حذف جميع البيانات؟')) {
                localStorage.clear();
                alert('تم مسح البيانات المحفوظة');
                window.location.reload();
              }
            }}
          >
            مسح البيانات المحفوظة
          </Button>
        </CardContent>
      </Card>

      {/* المساعدة والدعم */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            المساعدة والدعم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => window.open('https://www.instagram.com/bot_.en?igsh=dGY1dTl2azhtdTI0', '_blank')}
          >
            <Instagram className="h-4 w-4" />
            تابعنا على إنستغرام
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => alert('الأسئلة الشائعة:\n\n1. كيف أغير أوقات الصلاة؟ - من إعدادات الصلاة\n2. كيف أضيف تذكير؟ - من إعدادات التنبيهات\n3. كيف أحفظ المفضلة؟ - اضغط على أيقونة القلب')}
          >
            الأسئلة الشائعة
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              if (confirm('شكراً لك! هل تريد تقييم التطبيق الآن؟')) {
                window.open('https://lovable.dev', '_blank');
              }
            }}
          >
            تقييم التطبيق
          </Button>
        </CardContent>
      </Card>

      {/* معلومات التطبيق */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center">عن التطبيق</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-16 h-16 islamic-gradient rounded-full flex items-center justify-center mx-auto">
            <Star className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-arabic-display">الـمُؤمِن</h3>
            <p className="text-muted-foreground">Al-Mumin</p>
            <p className="text-sm text-muted-foreground mt-2">
              دليلك اليومي للروح والإيمان
            </p>
          </div>
        </CardContent>
      </Card>

      {/* معلومات النسخة */}
      <Card className="islamic-card">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">نسخة التطبيق</p>
            <p className="font-bold">1.0.0</p>
            <p className="text-xs text-muted-foreground">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}