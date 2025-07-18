import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, BookOpen, Heart, Star, ArrowRight, Compass, ChevronRight, Sun, Moon, Sunrise, Cloud, Thermometer, RefreshCw, Settings } from 'lucide-react';
import { useTranslations } from '@/lib/translations';

interface HomePageProps {
  onPageChange?: (page: string) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string>('جاري تحديد الموقع...');
  const [weather, setWeather] = useState({ temp: '--', condition: 'جاري التحميل...' });
  const [hijriDate, setHijriDate] = useState<string>('');
  const [ayahIndex, setAyahIndex] = useState(0);
  const [hadithIndex, setHadithIndex] = useState(0);
  
  const t = useTranslations();
  const language = localStorage.getItem('app-language') || 'arabic';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // محدد الموقع
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          // هنا يمكن إضافة استدعاء API للطقس
          setWeather({ temp: '24°C', condition: 'مشمس جزئياً' });
        },
        () => setLocation('غير متاح')
      );
    }

    // التاريخ الهجري (تقريبي)
    const gregorianDate = new Date();
    const hijriYear = gregorianDate.getFullYear() - 579;
    const hijriMonth = [
      'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
      'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ][gregorianDate.getMonth()];
    setHijriDate(`${gregorianDate.getDate()} ${hijriMonth} ${hijriYear} هـ`);

    return () => clearInterval(timer);
  }, []);

  // ترحيب ديناميكي حسب الوقت
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { ar: t.goodMorning, en: 'Good Morning' };
    if (hour < 17) return { ar: t.goodAfternoon, en: 'Good Afternoon' };
    return { ar: t.goodEvening, en: 'Good Evening' };
  };

  // أوقات الصلاة المؤقتة - سيتم استبدالها بـ API
  const prayerTimes = [
    { name: language === 'english' ? t.fajr : 'الفجر', time: '05:24', nameEn: 'Fajr', passed: true },
    { name: language === 'english' ? t.sunrise : 'الشروق', time: '06:48', nameEn: 'Sunrise', passed: true },
    { name: language === 'english' ? t.dhuhr : 'الظهر', time: '12:15', nameEn: 'Dhuhr', passed: false, current: true },
    { name: language === 'english' ? t.asr : 'العصر', time: '15:42', nameEn: 'Asr', passed: false },
    { name: language === 'english' ? t.maghrib : 'المغرب', time: '18:33', nameEn: 'Maghrib', passed: false },
    { name: language === 'english' ? t.isha : 'العشاء', time: '20:05', nameEn: 'Isha', passed: false },
  ];

  const currentPrayer = prayerTimes.find(p => p.current);
  const nextPrayer = prayerTimes.find(p => !p.passed && !p.current);

  // آيات متعددة
  const verses = [
    {
      text: "وَاصْبِرْ نَفْسَكَ مَعَ الَّذِينَ يَدْعُونَ رَبَّهُم بِالْغَدَاةِ وَالْعَشِيِّ يُرِيدُونَ وَجْهَهُ",
      reference: "سورة الكهف - الآية 28",
      translation: "And keep yourself patient with those who call upon their Lord morning and evening, seeking His countenance.",
      tafsir: "تحث هذه الآية على الصبر والصحبة الصالحة مع الذين يذكرون الله في الصباح والمساء"
    },
    {
      text: "وَبَشِّرِ الصَّابِرِينَ * الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
      reference: "سورة البقرة - الآيتان 155-156",
      translation: "And give good tidings to the patient, Who, when disaster strikes them, say, 'Indeed we belong to Allah, and indeed to Him we will return.'",
      tafsir: "بشارة للصابرين الذين يسترجعون عند المصائب ويتذكرون أنهم ملك لله وإليه راجعون"
    },
    {
      text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
      reference: "سورة الطلاق - الآيتان 2-3",
      translation: "And whoever fears Allah - He will make for him a way out. And will provide for him from where he does not expect.",
      tafsir: "وعد من الله للمتقين بأن يجعل لهم مخرجاً من كل ضيق ويرزقهم من حيث لا يحتسبون"
    }
  ];

  // أحاديث متعددة
  const hadiths = [
    {
      text: "قال رسول الله صلى الله عليه وسلم: (إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى)",
      reference: "صحيح البخاري ومسلم",
      narrator: "عن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه",
      explanation: "هذا الحديث أصل عظيم في الإسلام، يبين أن صحة العمل وفساده بحسب النية"
    },
    {
      text: "قال رسول الله صلى الله عليه وسلم: (من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت)",
      reference: "صحيح البخاري ومسلم",
      narrator: "عن أبي هريرة رضي الله عنه",
      explanation: "يحث هذا الحديث على حفظ اللسان وعدم قول إلا الخير أو الصمت"
    },
    {
      text: "قال رسول الله صلى الله عليه وسلم: (المسلم من سلم المسلمون من لسانه ويده)",
      reference: "صحيح البخاري ومسلم",
      narrator: "عن عبد الله بن عمرو رضي الله عنهما",
      explanation: "تعريف المسلم الحقيقي بأنه من لا يؤذي المسلمين بقوله أو فعله"
    }
  ];

  const currentVerse = verses[ayahIndex];
  const currentHadith = hadiths[hadithIndex];

  const refreshContent = () => {
    setAyahIndex((prev) => (prev + 1) % verses.length);
    setHadithIndex((prev) => (prev + 1) % hadiths.length);
  };

  const handleSettingsClick = () => {
    onPageChange?.('settings');
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-islamic-cream/20 to-background">
      <div className="space-y-6 p-4 max-w-md mx-auto">
        {/* هيدر التطبيق مع الترحيب */}
        <div className="relative overflow-hidden rounded-3xl p-6 islamic-gradient text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* زر الإعدادات */}
          <Button 
            onClick={handleSettingsClick}
            className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 border-none p-2 h-auto"
            variant="ghost"
          >
            <Settings className="h-5 w-5 text-white" />
          </Button>

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
            
            {/* التاريخ الميلادي والهجري */}
            <div className="space-y-1">
              <p className="text-white/90 text-sm">
                {currentTime.toLocaleDateString('ar-SA', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long' 
                })}
              </p>
              <p className="text-white/80 text-xs">{hijriDate}</p>
            </div>
            
            <div className="text-xl font-mono bg-white/20 rounded-xl px-3 py-2 inline-block">
              {currentTime.toLocaleTimeString('ar-SA', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>

        {/* معلومات الموقع والطقس */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-islamic-green" />
              <h3 className="text-sm font-bold text-islamic-green">{t.location}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{location}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="h-4 w-4 text-islamic-blue" />
              <h3 className="text-sm font-bold text-islamic-blue">{t.weather}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{weather.temp}</p>
            <p className="text-xs text-muted-foreground">{weather.condition}</p>
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

        {/* زر تحديث المحتوى */}
        <div className="flex justify-center">
          <Button 
            onClick={refreshContent}
            className="bg-islamic-green hover:bg-islamic-green/90 text-white rounded-xl px-6 py-2 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="font-arabic">تحديث المحتوى</span>
          </Button>
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
              "{currentVerse.text}"
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-islamic-green">
                {currentVerse.reference}
              </p>
              <p className="text-xs text-muted-foreground italic mb-2">
                {currentVerse.translation}
              </p>
              <div className="bg-islamic-green/5 rounded-lg p-3">
                <p className="text-xs text-foreground font-arabic leading-relaxed">
                  <span className="font-bold text-islamic-green">التفسير: </span>
                  {currentVerse.tafsir}
                </p>
              </div>
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
              {currentHadith.text}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {currentHadith.narrator}
              </p>
              <p className="text-xs text-islamic-blue font-semibold mb-2">
                {currentHadith.reference}
              </p>
              <div className="bg-islamic-blue/5 rounded-lg p-3">
                <p className="text-xs text-foreground font-arabic leading-relaxed">
                  <span className="font-bold text-islamic-blue">الشرح: </span>
                  {currentHadith.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}