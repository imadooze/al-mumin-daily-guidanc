import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, BookOpen, Heart, Star, ArrowRight, Compass, ChevronRight, Sun, Moon, Sunrise, Cloud, Thermometer, RefreshCw, Settings, Volume2, VolumeX } from 'lucide-react';
import { useTranslations } from '@/lib/translations';
import { getPrayerTimes, getCurrentLocation, PrayerData, LocationInfo } from '@/lib/prayer-api';
import { getWeatherByCoordinates, getDemoWeatherData, WeatherData } from '@/lib/weather-api';
import { AdhanService } from '@/lib/adhan-service';

interface HomePageProps {
  onPageChange?: (page: string) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string>('جاري تحديد الموقع...');
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    condition: 'Loading...',
    conditionAr: 'جاري التحميل...',
    humidity: 0,
    windSpeed: 0,
    icon: '',
    city: ''
  });
  const [hijriDate, setHijriDate] = useState<string>('');
  const [ayahIndex, setAyahIndex] = useState(0);
  const [hadithIndex, setHadithIndex] = useState(0);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [adhanEnabled, setAdhanEnabled] = useState(true);
  const [showAdhanNotification, setShowAdhanNotification] = useState(false);
  const [currentAdhanPrayer, setCurrentAdhanPrayer] = useState('');
  
  const t = useTranslations();
  const language = localStorage.getItem('app-language') || 'arabic';

  // جلب الموقع وأوقات الصلاة
  const loadLocationAndPrayers = async () => {
    try {
      setLoading(true);
      const locationData = await getCurrentLocation();
      setLocationInfo(locationData);
      setLocation(`${locationData.city}, ${locationData.country}`);
      
      // جلب أوقات الصلاة
      const prayers = await getPrayerTimes(locationData.latitude, locationData.longitude);
      if (prayers) {
        setPrayerData(prayers);
        // تحديث التاريخ الهجري من API
        setHijriDate(`${prayers.date.hijri.date} ${prayers.date.hijri.month.ar} ${prayers.date.hijri.year} هـ`);
      }

      // جلب بيانات الطقس
      try {
        const weatherData = await getWeatherByCoordinates(locationData.latitude, locationData.longitude);
        if (weatherData) {
          setWeather(weatherData);
        } else {
          // في حالة فشل API الطقس، استخدم بيانات تجريبية
          setWeather(getDemoWeatherData());
        }
      } catch (weatherError) {
        console.error('خطأ في جلب بيانات الطقس:', weatherError);
        setWeather(getDemoWeatherData());
      }

    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      setLocation('غير متاح');
      setWeather(getDemoWeatherData());
      // استخدام التاريخ الهجري التقريبي كـ fallback
      const gregorianDate = new Date();
      const hijriYear = gregorianDate.getFullYear() - 579;
      const hijriMonth = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
        'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
      ][gregorianDate.getMonth()];
      setHijriDate(`${gregorianDate.getDate()} ${hijriMonth} ${hijriYear} هـ`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocationAndPrayers();
  }, []);

  // تهيئة نظام الأذان
  useEffect(() => {
    const adhanService = AdhanService.getInstance();
    
    // طلب إذن الإشعارات
    adhanService.requestNotificationPermission();
    
    // تعيين callback للأذان
    adhanService.setAdhanCallback((prayerName) => {
      setCurrentAdhanPrayer(prayerName);
      setShowAdhanNotification(true);
      
      // إخفاء الإشعار بعد 10 ثوانٍ
      setTimeout(() => {
        setShowAdhanNotification(false);
      }, 10000);
    });

    // بدء مراقبة أوقات الصلاة عندما تكون البيانات متاحة
    if (prayerData) {
      adhanService.startPrayerMonitoring(prayerData);
    }

    return () => {
      adhanService.stopPrayerMonitoring();
    };
  }, [prayerData]);

  // تحديث الوقت كل ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ترحيب ديناميكي حسب الوقت
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { ar: t.goodMorning, en: 'Good Morning' };
    if (hour < 17) return { ar: t.goodAfternoon, en: 'Good Afternoon' };
    return { ar: t.goodEvening, en: 'Good Evening' };
  };

  // تحويل أوقات الصلاة من API إلى تنسيق قابل للاستخدام
  const getPrayerTimesArray = () => {
    if (!prayerData) {
      // أوقات افتراضية في حالة عدم توفر البيانات
      return [
        { name: language === 'english' ? t.fajr : 'الفجر', time: '05:30', nameEn: 'Fajr', passed: false, current: false },
        { name: language === 'english' ? t.sunrise : 'الشروق', time: '06:50', nameEn: 'Sunrise', passed: false, current: false },
        { name: language === 'english' ? t.dhuhr : 'الظهر', time: '12:15', nameEn: 'Dhuhr', passed: false, current: false },
        { name: language === 'english' ? t.asr : 'العصر', time: '15:30', nameEn: 'Asr', passed: false, current: false },
        { name: language === 'english' ? t.maghrib : 'المغرب', time: '18:00', nameEn: 'Maghrib', passed: false, current: false },
        { name: language === 'english' ? t.isha : 'العشاء', time: '19:30', nameEn: 'Isha', passed: false, current: false },
      ];
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const prayers = [
      { 
        name: language === 'english' ? t.fajr : 'الفجر', 
        time: prayerData.timings.Fajr.substring(0, 5), 
        nameEn: 'Fajr',
        rawTime: prayerData.timings.Fajr
      },
      { 
        name: language === 'english' ? t.sunrise : 'الشروق', 
        time: prayerData.timings.Sunrise.substring(0, 5), 
        nameEn: 'Sunrise',
        rawTime: prayerData.timings.Sunrise
      },
      { 
        name: language === 'english' ? t.dhuhr : 'الظهر', 
        time: prayerData.timings.Dhuhr.substring(0, 5), 
        nameEn: 'Dhuhr',
        rawTime: prayerData.timings.Dhuhr
      },
      { 
        name: language === 'english' ? t.asr : 'العصر', 
        time: prayerData.timings.Asr.substring(0, 5), 
        nameEn: 'Asr',
        rawTime: prayerData.timings.Asr
      },
      { 
        name: language === 'english' ? t.maghrib : 'المغرب', 
        time: prayerData.timings.Maghrib.substring(0, 5), 
        nameEn: 'Maghrib',
        rawTime: prayerData.timings.Maghrib
      },
      { 
        name: language === 'english' ? t.isha : 'العشاء', 
        time: prayerData.timings.Isha.substring(0, 5), 
        nameEn: 'Isha',
        rawTime: prayerData.timings.Isha
      },
    ];

    // تحديد حالة كل صلاة (مرت، حالية، قادمة)
    return prayers.map((prayer, index) => {
      const [hour, minute] = prayer.time.split(':').map(Number);
      const prayerTime = hour * 60 + minute;
      const currentTime = currentHour * 60 + currentMinute;
      
      let passed = false;
      let current = false;
      
      // تحديد إذا كانت الصلاة قد مرت
      passed = currentTime > prayerTime;
      
      // تحديد الصلاة الحالية (القادمة التالية)
      if (!passed && index > 0) {
        const prevPrayer = prayers[index - 1];
        const [prevHour, prevMinute] = prevPrayer.time.split(':').map(Number);
        const prevPrayerTime = prevHour * 60 + prevMinute;
        current = currentTime > prevPrayerTime;
      } else if (index === 0) {
        // للفجر، نتحقق إذا كان الوقت الحالي بعد صلاة العشاء
        const ishaTime = prayers[5];
        const [ishaHour, ishaMinute] = ishaTime.time.split(':').map(Number);
        const ishaPrayerTime = ishaHour * 60 + ishaMinute;
        current = currentTime > ishaPrayerTime || currentTime < prayerTime;
      }
      
      return {
        ...prayer,
        passed,
        current
      };
    });
  };

  const prayerTimes = getPrayerTimesArray();
  const currentPrayer = prayerTimes.find(p => p.current);
  const nextPrayer = prayerTimes.find(p => !p.passed && !p.current) || prayerTimes[0]; // إذا لم توجد صلاة قادمة، فالفجر هو التالي

  // حساب الوقت المتبقي للصلاة القادمة
  const getTimeUntilNextPrayer = () => {
    if (!nextPrayer) return 'غير محدد';
    
    const now = new Date();
    const [hour, minute] = nextPrayer.time.split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hour, minute, 0, 0);
    
    // إذا كانت الصلاة في اليوم التالي (مثل الفجر)
    if (prayerTime <= now) {
      prayerTime.setDate(prayerTime.getDate() + 1);
    }
    
    const timeDiff = prayerTime.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    } else if (minutes > 0) {
      return `${minutes} دقيقة`;
    } else {
      return 'الآن';
    }
  };

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

  const refreshAllData = async () => {
    setLoading(true);
    await loadLocationAndPrayers();
  };

  const handleSettingsClick = () => {
    onPageChange?.('settings');
  };

  const toggleAdhan = () => {
    const adhanService = AdhanService.getInstance();
    const newSettings = adhanService.getSettings();
    newSettings.enabled = !newSettings.enabled;
    adhanService.updateSettings(newSettings);
    setAdhanEnabled(newSettings.enabled);
  };

  const dismissAdhanNotification = () => {
    setShowAdhanNotification(false);
  };

  const greeting = getGreeting();

  // إذا كانت البيانات لا تزال تُحمل
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-islamic-cream/20 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 text-islamic-green animate-spin mx-auto" />
          <p className="text-lg font-arabic text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-islamic-cream/20 to-background">
      {/* إشعار الأذان */}
      {showAdhanNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4">
          <div className="bg-islamic-green text-white rounded-2xl p-4 shadow-2xl border border-white/20 animate-pulse">
            <div className="text-center space-y-2">
              <Volume2 className="h-8 w-8 mx-auto mb-2" />
              <h3 className="text-lg font-bold font-arabic">حان موعد الأذان</h3>
              <p className="text-sm">
                {currentAdhanPrayer === 'fajr' && 'صلاة الفجر'}
                {currentAdhanPrayer === 'dhuhr' && 'صلاة الظهر'}
                {currentAdhanPrayer === 'asr' && 'صلاة العصر'}
                {currentAdhanPrayer === 'maghrib' && 'صلاة المغرب'}
                {currentAdhanPrayer === 'isha' && 'صلاة العشاء'}
              </p>
              <Button 
                onClick={dismissAdhanNotification}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 mt-2"
                size="sm"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

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

          {/* زر التحكم في الأذان */}
          <Button 
            onClick={toggleAdhan}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-none p-2 h-auto"
            variant="ghost"
          >
            {adhanEnabled ? (
              <Volume2 className="h-5 w-5 text-white" />
            ) : (
              <VolumeX className="h-5 w-5 text-white" />
            )}
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
            <p className="text-xs text-muted-foreground">
              {weather.temp > 0 ? `${weather.temp}°` : '--°'}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'english' ? weather.condition : weather.conditionAr}
            </p>
          </div>
        </div>

        {/* بطاقة الصلاة القادمة */}
        {nextPrayer && (
          <div className="relative overflow-hidden rounded-3xl islamic-gradient text-white p-6 shadow-xl">
            {/* زخارف إسلامية */}
            <div className="absolute inset-0">
              <div className="absolute top-2 right-2 w-16 h-16 border border-white/20 rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-12 h-12 border border-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/10 rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              {/* رأس البطاقة */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-6 w-6 text-white" />
                  <p className="text-sm text-white/90 font-arabic">الصلاة القادمة</p>
                </div>
                <h2 className="text-3xl font-bold font-arabic-display mb-1">{nextPrayer.name}</h2>
                <div className="text-2xl font-mono bg-white/20 rounded-xl px-4 py-2 inline-block">
                  {nextPrayer.time}
                </div>
              </div>

              {/* الوقت المتبقي */}
              <div className="text-center mb-4">
                <div className="bg-white/20 rounded-2xl p-4">
                  <p className="text-sm text-white/80 mb-1">باقي على الأذان</p>
                  <div className="text-xl font-bold font-arabic">
                    {getTimeUntilNextPrayer()}
                  </div>
                </div>
              </div>

              {/* شريط التقدم */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/70">
                  <span>الآن</span>
                  <span>{nextPrayer.name}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(90, Math.max(10, 
                        ((new Date().getHours() * 60 + new Date().getMinutes()) / 
                        (parseInt(nextPrayer.time.split(':')[0]) * 60 + parseInt(nextPrayer.time.split(':')[1]))) * 100
                      ))}%`
                    }}
                  ></div>
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

        {/* أزرار التحديث */}
        <div className="flex justify-center gap-3">
          <Button 
            onClick={refreshContent}
            className="bg-islamic-green hover:bg-islamic-green/90 text-white rounded-xl px-4 py-2 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="font-arabic">تحديث المحتوى</span>
          </Button>
          
          <Button 
            onClick={refreshAllData}
            className="bg-islamic-blue hover:bg-islamic-blue/90 text-white rounded-xl px-4 py-2 flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-arabic">تحديث البيانات</span>
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