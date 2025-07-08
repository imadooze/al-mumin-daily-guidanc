import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, BookOpen, Heart, Star } from 'lucide-react';

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
      description: 'اقرأ القرآن بالرسم العثماني',
      icon: BookOpen,
      color: 'bg-islamic-green'
    },
    {
      id: 'azkar',
      title: 'الأذكار',
      description: 'أذكار الصباح والمساء',
      icon: Heart,
      color: 'bg-islamic-blue'
    },
    {
      id: 'prayer-times',
      title: 'أوقات الصلاة',
      description: 'مواقيت الصلاة والقبلة',
      icon: Clock,
      color: 'bg-islamic-gold'
    }
  ];

  const handleCardClick = (pageId: string) => {
    if (onPageChange) {
      onPageChange(pageId);
    }
  };

  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* الترحيب الديناميكي */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground font-arabic-display">
          {greeting.ar}
        </h1>
        <p className="text-muted-foreground text-lg">
          {greeting.en} - دليلك اليومي للروح والإيمان
        </p>
        <div className="text-sm text-muted-foreground">
          {currentTime.toLocaleDateString('ar-SA', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* أوقات الصلاة */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Clock className="h-5 w-5" />
            أوقات الصلاة
          </CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            الرياض، المملكة العربية السعودية
          </div>
        </CardHeader>
        <CardContent>
          {/* عداد الصلاة القادمة */}
          {nextPrayer && (
            <div className="mb-6 p-4 rounded-lg bg-islamic-green/10 border border-islamic-green/20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">الصلاة القادمة</p>
                <p className="text-xl font-bold text-islamic-green">{nextPrayer.name}</p>
                <p className="text-2xl font-bold text-primary">{nextPrayer.time}</p>
                <Badge className="mt-2 bg-islamic-green hover:bg-islamic-green/90 text-white">
                  بعد ساعتين و 30 دقيقة
                </Badge>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {prayerTimes.map((prayer) => (
              <div
                key={prayer.name}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  prayer.current
                    ? 'border-islamic-green bg-islamic-green/5 shadow-islamic'
                    : prayer.passed
                    ? 'border-border bg-muted/50 opacity-60'
                    : 'border-border bg-card hover:bg-muted/50'
                }`}
              >
                <div className="text-center space-y-1">
                  <p className="font-medium font-arabic">{prayer.name}</p>
                  <p className="text-xl font-bold text-primary">{prayer.time}</p>
                  {prayer.current && (
                    <Badge className="bg-islamic-green hover:bg-islamic-green/90 text-white text-xs">
                      الآن
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الأقسام السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.id}
            className="islamic-card hover-lift cursor-pointer group"
            onClick={() => handleCardClick(action.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full islamic-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold font-arabic">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* آية اليوم */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center text-islamic-green">آية اليوم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-lg font-arabic-display leading-relaxed text-foreground">
              "{ayahOfDay.text}"
            </div>
            <p className="text-sm text-muted-foreground">
              {ayahOfDay.reference}
            </p>
            <p className="text-sm text-muted-foreground italic">
              {ayahOfDay.translation}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* حديث اليوم */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center text-islamic-blue">حديث اليوم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-base font-arabic-display leading-relaxed text-foreground">
              {hadithOfDay.text}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {hadithOfDay.narrator}
              </p>
              <p className="text-sm text-islamic-blue font-medium">
                {hadithOfDay.reference}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}