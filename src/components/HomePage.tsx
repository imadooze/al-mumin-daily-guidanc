import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, BookOpen, Heart, Star, ArrowRight, Compass, ChevronRight, Sun, Moon, Sunrise } from 'lucide-react';

interface HomePageProps {
  onPageChange?: (page: string) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ترحيب ديناميكي حسب الوقت
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { ar: 'صباح الخير', en: 'Good Morning' };
    if (hour < 17) return { ar: 'مساء الخير', en: 'Good Afternoon' };
    return { ar: 'مساء النور', en: 'Good Evening' };
  };

  // أوقات الصلاة المؤقتة - سيتم استبدالها بـ API
  const prayerTimes = [
    { name: 'الفجر', time: '05:24', nameEn: 'Fajr', passed: true },
    { name: 'الشروق', time: '06:48', nameEn: 'Sunrise', passed: true },
    { name: 'الظهر', time: '12:15', nameEn: 'Dhuhr', passed: false, current: true },
    { name: 'العصر', time: '15:42', nameEn: 'Asr', passed: false },
    { name: 'المغرب', time: '18:33', nameEn: 'Maghrib', passed: false },
    { name: 'العشاء', time: '20:05', nameEn: 'Isha', passed: false },
  ];

  const currentPrayer = prayerTimes.find(p => p.current);
  const nextPrayer = prayerTimes.find(p => !p.passed && !p.current);

  // آية اليوم
  const ayahOfDay = {
    text: "وَاصْبِرْ نَفْسَكَ مَعَ الَّذِينَ يَدْعُونَ رَبَّهُم بِالْغَدَاةِ وَالْعَشِيِّ يُرِيدُونَ وَجْهَهُ",
    reference: "سورة الكهف - الآية 28",
    translation: "And keep yourself patient with those who call upon their Lord morning and evening, seeking His countenance."
  };

  // حديث اليوم
  const hadithOfDay = {
    text: "قال رسول الله صلى الله عليه وسلم: (إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله، ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها فهجرته إلى ما هاجر إليه)",
    reference: "صحيح البخاري ومسلم",
    narrator: "عن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه"
  };

  const quickActions = [
    {
      id: 'quran',
      title: 'القرآن الكريم',
      description: 'اقرأ القرآن الكريم كاملاً',
      icon: BookOpen,
      gradient: 'islamic-gradient',
      stats: '114 سورة'
    },
    {
      id: 'prayer-times',
      title: 'أوقات الصلاة',
      description: 'مواقيت الصلاة والقبلة',
      icon: Clock,
      gradient: 'islamic-gradient-secondary',
      stats: 'موقعك الحالي'
    },
    {
      id: 'azkar',
      title: 'الأذكار والأدعية',
      description: 'أذكار الصباح والمساء والأدعية',
      icon: Heart,
      gradient: 'islamic-gradient-accent',
      stats: 'صباح ومساء'
    },
    {
      id: 'qibla',
      title: 'اتجاه القبلة',
      description: 'تحديد اتجاه القبلة بدقة',
      icon: Compass,
      gradient: 'islamic-gradient',
      stats: 'GPS متقدم'
    },
    {
      id: 'names',
      title: 'أسماء الله الحسنى',
      description: 'الأسماء الحسنى مع المعاني',
      icon: Star,
      gradient: 'islamic-gradient-secondary',
      stats: '99 اسم'
    },
    {
      id: 'hadith',
      title: 'الأحاديث النبوية',
      description: 'أحاديث صحيحة مختارة',
      icon: BookOpen,
      gradient: 'islamic-gradient-accent',
      stats: 'أحاديث صحيحة'
    }
  ];

  const handleCardClick = (pageId: string) => {
    if (onPageChange) {
      onPageChange(pageId);
    }
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-islamic-cream/20 to-background">
      <div className="space-y-6 p-4 max-w-md mx-auto">
        {/* هيدر التطبيق مع الترحيب */}
        <div className="relative overflow-hidden rounded-3xl p-6 islamic-gradient text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center space-y-3">
            <div className="flex justify-center mb-2">
              {currentTime.getHours() < 12 ? (
                <Sunrise className="h-8 w-8 text-white/90" />
              ) : currentTime.getHours() < 18 ? (
                <Sun className="h-8 w-8 text-white/90" />
              ) : (
                <Moon className="h-8 w-8 text-white/90" />
              )}
            </div>
            <h1 className="text-2xl font-bold font-arabic-display">
              {greeting.ar}
            </h1>
            <p className="text-white/90 text-sm">
              {currentTime.toLocaleDateString('ar-SA', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long' 
              })}
            </p>
            <div className="text-xl font-mono bg-white/20 rounded-xl px-3 py-2 inline-block">
              {currentTime.toLocaleTimeString('ar-SA', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>

        {/* بطاقة الصلاة القادمة */}
        {nextPrayer && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white to-islamic-cream/30 border border-islamic-green/20 p-4 shadow-lg">
            <div className="absolute top-0 right-0 w-20 h-20 bg-islamic-green/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الصلاة القادمة</p>
                  <h3 className="text-xl font-bold text-islamic-green font-arabic">{nextPrayer.name}</h3>
                  <p className="text-lg font-mono text-foreground">{nextPrayer.time}</p>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-islamic-green mb-2 mx-auto" />
                  <Badge className="bg-islamic-green/10 text-islamic-green border-islamic-green/20 text-xs">
                    بعد ساعتين
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* شريط أوقات الصلاة السريع */}
        <div className="grid grid-cols-3 gap-2">
          {prayerTimes.slice(0, 6).map((prayer, index) => (
            <div
              key={prayer.name}
              className={`p-3 rounded-xl text-center transition-all duration-300 ${
                prayer.current
                  ? 'bg-islamic-green text-white shadow-lg'
                  : prayer.passed
                  ? 'bg-muted/50 text-muted-foreground'
                  : 'bg-white border border-border hover:border-islamic-green/30'
              }`}
            >
              <p className="text-xs font-arabic mb-1">{prayer.name}</p>
              <p className="text-sm font-mono font-semibold">{prayer.time}</p>
            </div>
          ))}
        </div>

        {/* الأقسام الرئيسية */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-center font-arabic">الأقسام الرئيسية</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <div
                key={action.id}
                className="relative overflow-hidden rounded-2xl bg-white border border-border/50 p-4 cursor-pointer group hover:shadow-lg transition-all duration-300"
                onClick={() => handleCardClick(action.id)}
              >
                <div className={`absolute inset-0 ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative z-10 text-center space-y-3">
                  <div className={`w-12 h-12 rounded-xl ${action.gradient} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-arabic text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    <p className="text-xs text-primary font-semibold mt-1">{action.stats}</p>
                  </div>
                </div>
                <ChevronRight className="absolute top-3 left-3 h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* آية اليوم */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-islamic-green/5 border border-islamic-green/20 p-6">
          <div className="absolute top-0 left-0 w-16 h-16 bg-islamic-green/10 rounded-full -ml-8 -mt-8"></div>
          <div className="relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-islamic-green" />
              <h3 className="text-lg font-bold text-islamic-green font-arabic">آية اليوم</h3>
            </div>
            <div className="text-base font-arabic-display leading-relaxed text-foreground bg-white/50 rounded-xl p-4">
              "{ayahOfDay.text}"
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-islamic-green">
                {ayahOfDay.reference}
              </p>
              <p className="text-xs text-muted-foreground italic">
                {ayahOfDay.translation}
              </p>
            </div>
          </div>
        </div>

        {/* حديث اليوم */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-islamic-blue/5 border border-islamic-blue/20 p-6">
          <div className="absolute top-0 right-0 w-16 h-16 bg-islamic-blue/10 rounded-full -mr-8 -mt-8"></div>
          <div className="relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-5 w-5 text-islamic-blue" />
              <h3 className="text-lg font-bold text-islamic-blue font-arabic">حديث اليوم</h3>
            </div>
            <div className="text-sm font-arabic-display leading-relaxed text-foreground bg-white/50 rounded-xl p-4 text-right">
              {hadithOfDay.text}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {hadithOfDay.narrator}
              </p>
              <p className="text-xs text-islamic-blue font-semibold">
                {hadithOfDay.reference}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}