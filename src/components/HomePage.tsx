import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, BookOpen, Heart, Star, ArrowRight, Compass, ChevronRight, Sun, Moon, Sunrise, Cloud, Thermometer, RefreshCw, Settings, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { useTranslations } from '@/lib/translations';
import { getWeatherByCoordinates, getDemoWeatherData, WeatherData } from '@/lib/weather-api';
import { AdhanService } from '@/lib/adhan-service';
import AdhanSettingsModal from './AdhanSettingsModal';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePrayerMonitor } from '@/hooks/use-prayer-monitor';
import OfflineManager from '@/lib/offline-manager';
import CompassService from '@/lib/compass-service';

interface HomePageProps {
  onPageChange?: (page: string) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useLocalStorage<string>('user-location', 'جاري تحديد الموقع...');
  const [weather, setWeather] = useLocalStorage<WeatherData>('weather-data', {
    temp: 0,
    condition: 'Loading...',
    conditionAr: 'جاري التحميل...',
    humidity: 0,
    windSpeed: 0,
    icon: '',
    city: ''
  });
  const [hijriDate, setHijriDate] = useLocalStorage<string>('hijri-date', '');
  const [ayahIndex, setAyahIndex] = useLocalStorage<number>('current-ayah', 0);
  const [hadithIndex, setHadithIndex] = useLocalStorage<number>('current-hadith', 0);
  const [prayerData, setPrayerData] = useState<any>(null);
  const [locationInfo, setLocationInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adhanEnabled, setAdhanEnabled] = useLocalStorage<boolean>('adhan-enabled', true);
  const [showAdhanNotification, setShowAdhanNotification] = useState(false);
  const [currentAdhanPrayer, setCurrentAdhanPrayer] = useState('');
  const [showAdhanSettings, setShowAdhanSettings] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [offlineManager] = useState(() => OfflineManager.getInstance());
  
  const t = useTranslations();
  const language = localStorage.getItem('app-language') || 'arabic';

  // استخدام hook مراقبة الصلاة
  const nextPrayerInfo = usePrayerMonitor(prayerData);

  // جلب البيانات باستخدام مدير أوفلاين
  const loadAllData = async () => {
    try {
      if (!prayerData) {
        setLoading(true);
      }
      
      const data = await offlineManager.getAllData();
      
      // تحديث حالة التطبيق
      setLocationInfo(data.location);
      setLocation(`${data.location.city}, ${data.location.country}`);
      setPrayerData(data.prayerTimes);
      setHijriDate(data.prayerTimes.hijriDate || '');
      setIsOnline(!data.isOffline);
      setLastSyncTime(data.lastUpdate);
      
      // جلب بيانات الطقس فقط عند الاتصال بالإنترنت
      if (!data.isOffline && weather.temp === 0) {
        try {
          const weatherData = await getWeatherByCoordinates(data.location.latitude, data.location.longitude);
          if (weatherData) {
            setWeather(weatherData);
          } else {
            setWeather(getDemoWeatherData());
          }
        } catch (weatherError) {
          console.error('خطأ في جلب بيانات الطقس:', weatherError);
          setWeather(getDemoWeatherData());
        }
      }

    } catch (error) {
      console.error('خطأ في جلب البيانات من الإنترنت:', error);
      setLocation('غير متاح');
      setIsOnline(false);
      
      if (weather.temp === 0) {
        setWeather(getDemoWeatherData());
      }
      
      // استخدام التاريخ الهجري التقريبي
      if (!hijriDate) {
        const gregorianDate = new Date();
        const hijriYear = gregorianDate.getFullYear() - 579;
        const hijriMonths = [
          'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
          'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
        ];
        const hijriMonth = hijriMonths[gregorianDate.getMonth()];
        setHijriDate(`${gregorianDate.getDate()} ${hijriMonth} ${hijriYear} هـ`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // تحميل البيانات عند بدء التطبيق
    loadAllData();
    
    // مراقبة حالة الاتصال
    const handleOnline = () => {
      setIsOnline(true);
      offlineManager.syncData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // تحديث دوري كل دقيقة
    const interval = setInterval(() => {
      // تحديث الوقت الحالي فقط، البيانات تتحدث تلقائياً
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
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
      
      return {
        ...prayer,
        passed,
        current
      };
    });
  };

  const prayerTimes = getPrayerTimesArray();
  
  // تحديد الصلاة القادمة بشكل أكثر دقة
  const getNextPrayer = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // البحث عن أول صلاة لم تمر بعد
    for (let i = 0; i < prayerTimes.length; i++) {
      const prayer = prayerTimes[i];
      const [hour, minute] = prayer.time.split(':').map(Number);
      const prayerTime = hour * 60 + minute;
      
      if (currentTime < prayerTime) {
        return prayer;
      }
    }
    
    // إذا مرت جميع الصلوات، فالصلاة القادمة هي فجر اليوم التالي
    return prayerTimes[0];
  };
  
  const nextPrayer = getNextPrayer();

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
    await offlineManager.forceUpdate().then(data => {
      setLocationInfo(data.location);
      setLocation(`${data.location.city}, ${data.location.country}`);
      setPrayerData(data.prayerTimes);
      setHijriDate(data.prayerTimes.hijriDate || '');
      setIsOnline(!data.isOffline);
      setLastSyncTime(data.lastUpdate);
      setLoading(false);
    });
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

  // إذا كانت البيانات لا تزال تُحمل لأول مرة
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-islamic-cream/20 to-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto animate-pulse-islamic">
            <Compass className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-arabic text-foreground">جاري تحميل البيانات...</p>
            <p className="text-sm text-muted-foreground">الرجاء الانتظار قليلاً</p>
          </div>
        </div>

        {/* مودال إعدادات الأذان */}
        <AdhanSettingsModal 
          isOpen={showAdhanSettings}
          onClose={() => setShowAdhanSettings(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-islamic-cream/20 to-background overflow-hidden">
      {/* إشعار الأذان المحسن */}
      {showAdhanNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4 animate-scale-in">
          <div className="bg-gradient-primary text-white rounded-2xl p-6 shadow-islamic border border-white/20 animate-glow-pulse">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Volume2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold font-arabic-display">حان موعد الأذان</h3>
              <p className="text-sm text-white/90 font-arabic">
                {currentAdhanPrayer === 'fajr' && 'صلاة الفجر'}
                {currentAdhanPrayer === 'dhuhr' && 'صلاة الظهر'}
                {currentAdhanPrayer === 'asr' && 'صلاة العصر'}
                {currentAdhanPrayer === 'maghrib' && 'صلاة المغرب'}
                {currentAdhanPrayer === 'isha' && 'صلاة العشاء'}
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={dismissAdhanNotification}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary-glow/5 to-transparent"></div>
        <div className="relative container mx-auto px-4 py-8">
          
          {/* Header Section */}
          <div className="text-center mb-8 space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 islamic-gradient rounded-full flex items-center justify-center shadow-islamic-soft animate-pulse-islamic">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-arabic-display">
                  {language === 'english' ? greeting.en : greeting.ar}
                </h1>
                <p className="text-sm text-muted-foreground font-arabic">
                  {language === 'english' ? 'Welcome to your Islamic companion' : 'مرحباً بك في رفيقك الإسلامي'}
                </p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span className="text-muted-foreground">
                  {isOnline ? 'متصل' : 'غير متصل'}
                </span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">
                  {currentTime.toLocaleString('ar-SA', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Prayer Times Hero Card */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Card className="bg-gradient-primary text-white border-none shadow-islamic-glow overflow-hidden relative">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-white animate-spin-slow" />
                    <h2 className="text-lg font-bold font-arabic-display">الصلاة القادمة</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={refreshAllData}
                    disabled={loading}
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold font-arabic-display">{nextPrayer?.name}</h3>
                  <p className="text-3xl font-mono font-bold tracking-wider">{nextPrayer?.time}</p>
                  <p className="text-sm text-white/80 font-arabic">
                    متبقي: {getTimeUntilNextPrayer()}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange?.('prayer-times')}
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <Clock className="h-4 w-4 ml-2" />
                    جميع المواقيت
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAdhan}
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    {adhanEnabled ? <Volume2 className="h-4 w-4 ml-2" /> : <VolumeX className="h-4 w-4 ml-2" />}
                    {adhanEnabled ? 'الأذان مفعل' : 'الأذان مُعطل'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: BookOpen, label: 'القرآن الكريم', page: 'quran', gradient: 'from-emerald-500 to-teal-600' },
              { icon: Heart, label: 'الأذكار', page: 'azkar', gradient: 'from-pink-500 to-rose-600' },
              { icon: Compass, label: 'القبلة', page: 'qibla', gradient: 'from-blue-500 to-indigo-600' },
              { icon: Star, label: 'المزيد', page: 'more', gradient: 'from-purple-500 to-violet-600' }
            ].map((action, index) => (
              <Card 
                key={action.page}
                className="group cursor-pointer border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in overflow-hidden"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                onClick={() => onPageChange?.(action.page)}
              >
                <CardContent className="p-4 text-center relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                      <action.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <p className="text-sm font-medium font-arabic text-foreground group-hover:text-primary transition-colors duration-300">
                      {action.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            
            {/* Weather & Location Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 animate-fade-in border-border/50" style={{ animationDelay: '0.7s' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-arabic-display flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-600 rounded-lg flex items-center justify-center">
                      <Cloud className="h-4 w-4 text-white" />
                    </div>
                    الطقس والموقع
                  </CardTitle>
                  <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center">
                    <Thermometer className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{Math.round(weather.temp)}°</p>
                    <p className="text-sm text-muted-foreground font-arabic">
                      {language === 'english' ? weather.condition : weather.conditionAr}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" />
                      {location}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">الرطوبة</p>
                    <p className="text-sm font-semibold text-foreground">{weather.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">الرياح</p>
                    <p className="text-sm font-semibold text-foreground">{Math.round(weather.windSpeed)} م/ث</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hijri Date Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 animate-fade-in border-border/50" style={{ animationDelay: '0.8s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-arabic-display flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Moon className="h-4 w-4 text-white" />
                  </div>
                  التاريخ الهجري
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold text-foreground font-arabic-display">{hijriDate}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentTime.toLocaleDateString('ar-SA', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Islamic Content Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Verse of the Day */}
            <Card className="group hover:shadow-lg transition-all duration-300 animate-fade-in border-border/50" style={{ animationDelay: '0.9s' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-arabic-display flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    آية اليوم
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={refreshContent}
                    className="hover:bg-muted/50 rounded-full"
                  >
                    <RefreshCw className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 text-4xl text-primary/20 font-arabic-display">"</div>
                  <p className="text-right leading-loose font-arabic text-foreground text-lg">
                    {currentVerse.text}
                  </p>
                  <div className="absolute -bottom-2 -left-2 text-4xl text-primary/20 font-arabic-display rotate-180">"</div>
                </div>
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <p className="text-sm font-semibold text-primary font-arabic">{currentVerse.reference}</p>
                  {language === 'english' && (
                    <p className="text-sm text-muted-foreground italic">{currentVerse.translation}</p>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onPageChange?.('quran')}
                    className="w-full justify-center hover:bg-muted/50"
                  >
                    اقرأ المزيد من القرآن
                    <ArrowRight className="h-4 w-4 mr-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hadith of the Day */}
            <Card className="group hover:shadow-lg transition-all duration-300 animate-fade-in border-border/50" style={{ animationDelay: '1s' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-arabic-display flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    حديث اليوم
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={refreshContent}
                    className="hover:bg-muted/50 rounded-full"
                  >
                    <RefreshCw className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 text-3xl text-primary/20">💫</div>
                  <p className="text-right leading-relaxed font-arabic text-foreground">
                    {currentHadith.text}
                  </p>
                </div>
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-arabic">{currentHadith.narrator}</p>
                  <p className="text-sm font-semibold text-primary font-arabic">{currentHadith.reference}</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onPageChange?.('hadith')}
                    className="w-full justify-center hover:bg-muted/50"
                  >
                    اقرأ المزيد من الأحاديث
                    <ArrowRight className="h-4 w-4 mr-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Quick Access */}
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '1.1s' }}>
            <Button 
              variant="outline" 
              onClick={handleSettingsClick}
              className="rounded-full px-6 hover:bg-muted/50 transition-all duration-300 hover:scale-105"
            >
              <Settings className="h-4 w-4 ml-2" />
              الإعدادات
            </Button>
          </div>
        </div>
      </div>

      {/* مودال إعدادات الأذان */}
      <AdhanSettingsModal 
        isOpen={showAdhanSettings}
        onClose={() => setShowAdhanSettings(false)}
      />
    </div>
  );
}