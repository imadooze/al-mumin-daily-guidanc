import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, MapPin, Compass, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { getPrayerTimes, getCurrentLocation, calculateQiblaDirection, calculateDistanceToMecca, type PrayerData, type LocationInfo } from '@/lib/prayer-api';
import { useToast } from '@/hooks/use-toast';

interface PrayerTimesPageProps {
  onPageChange?: (page: string) => void;
}

export default function PrayerTimesPage({ onPageChange }: PrayerTimesPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [distanceToMecca, setDistanceToMecca] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // طلب تحديد الموقع عند تحميل الصفحة
    requestLocation();

    return () => clearInterval(timer);
  }, []);

  const requestLocation = async () => {
    try {
      setLoading(true);
      setLocationError(null);
      
      const locationData = await getCurrentLocation();
      setLocation(locationData);
      
      // حساب اتجاه القبلة والمسافة
      const qibla = calculateQiblaDirection(locationData.latitude, locationData.longitude);
      const distance = calculateDistanceToMecca(locationData.latitude, locationData.longitude);
      setQiblaDirection(qibla);
      setDistanceToMecca(distance);
      
      // جلب أوقات الصلاة
      const prayerTimesData = await getPrayerTimes(locationData.latitude, locationData.longitude);
      setPrayerData(prayerTimesData);
      
      toast({
        title: 'تم تحديد الموقع',
        description: `${locationData.city}, ${locationData.country}`,
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في تحديد الموقع';
      setLocationError(errorMessage);
      toast({
        title: 'خطأ في تحديد الموقع',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // تحويل أوقات الصلاة إلى تنسيق قابل للاستخدام
  const getPrayerTimesArray = () => {
    if (!prayerData) return [];
    
    const timings = prayerData.timings;
    const now = new Date();
    
    return [
      { name: 'الفجر', time: timings.Fajr, nameEn: 'Fajr', key: 'Fajr' },
      { name: 'الشروق', time: timings.Sunrise, nameEn: 'Sunrise', key: 'Sunrise' },
      { name: 'الظهر', time: timings.Dhuhr, nameEn: 'Dhuhr', key: 'Dhuhr' },
      { name: 'العصر', time: timings.Asr, nameEn: 'Asr', key: 'Asr' },
      { name: 'المغرب', time: timings.Maghrib, nameEn: 'Maghrib', key: 'Maghrib' },
      { name: 'العشاء', time: timings.Isha, nameEn: 'Isha', key: 'Isha' },
    ].map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);
      
      return {
        ...prayer,
        passed: prayerTime < now,
        current: false, // سيتم حسابها لاحقاً
        timeUntil: prayerTime > now ? Math.floor((prayerTime.getTime() - now.getTime()) / (1000 * 60)) : null
      };
    });
  };

  const prayerTimes = getPrayerTimesArray();
  const nextPrayer = prayerTimes.find(p => !p.passed && p.timeUntil !== null);

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
            أوقات الصلاة
          </h1>
          <p className="text-muted-foreground">Prayer Times</p>
        </div>

        <div className="w-10"></div>
      </div>

      {/* الموقع الحالي والوقت */}
      {loading ? (
        <Card className="islamic-card">
          <CardContent className="p-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span>جاري تحديد الموقع...</span>
          </CardContent>
        </Card>
      ) : locationError ? (
        <Card className="islamic-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{locationError}</p>
            </div>
            <Button onClick={requestLocation} className="mt-3" size="sm">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : location && (
        <Card className="islamic-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-islamic-green" />
                <div>
                  <p className="font-medium">{location.city}</p>
                  <p className="text-sm text-muted-foreground">{location.country}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold">
                  {currentTime.toLocaleTimeString('ar-SA', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentTime.toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* الصلاة القادمة */}
      {nextPrayer && nextPrayer.timeUntil && (
        <Card className="islamic-card">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-islamic-green" />
                <span className="text-sm text-muted-foreground">الصلاة القادمة</span>
              </div>
              <h2 className="text-2xl font-bold text-islamic-green">{nextPrayer.name}</h2>
              <p className="text-3xl font-bold text-primary">{nextPrayer.time}</p>
              <Badge className="bg-islamic-green hover:bg-islamic-green/90 text-white">
                بعد {Math.floor(nextPrayer.timeUntil / 60)} ساعة و {nextPrayer.timeUntil % 60} دقيقة
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* جميع أوقات الصلاة */}
      {prayerTimes.length > 0 && (
        <Card className="islamic-card">
          <CardHeader>
            <CardTitle className="text-center">مواقيت الصلاة اليوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prayerTimes.map((prayer) => (
                <div
                  key={prayer.name}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                    prayer.current
                      ? 'border-islamic-green bg-islamic-green/5 shadow-islamic'
                      : prayer.passed
                      ? 'border-border bg-muted/50 opacity-60'
                      : 'border-border bg-card hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      prayer.current 
                        ? 'bg-islamic-green animate-pulse' 
                        : prayer.passed 
                        ? 'bg-muted-foreground/50' 
                        : 'bg-primary/50'
                    }`}></div>
                    <div>
                      <p className="font-medium font-arabic text-lg">{prayer.name}</p>
                      <p className="text-sm text-muted-foreground">{prayer.nameEn}</p>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <p className="text-xl font-bold text-primary">{prayer.time}</p>
                    {prayer.current && (
                      <Badge className="bg-islamic-green hover:bg-islamic-green/90 text-white text-xs">
                        الآن
                      </Badge>
                    )}
                    {prayer.timeUntil && !prayer.current && (
                      <p className="text-xs text-muted-foreground">
                        بعد {Math.floor(prayer.timeUntil / 60)}:{prayer.timeUntil % 60}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* بوصلة القبلة */}
      {location && (
        <Card className="islamic-card">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Compass className="h-5 w-5 text-islamic-green" />
              اتجاه القبلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="relative w-40 h-40 mx-auto">
                <div className="w-full h-full border-4 border-islamic-green/30 rounded-full flex items-center justify-center relative">
                  <div className="w-32 h-32 border-2 border-islamic-green/50 rounded-full flex items-center justify-center relative">
                    <Navigation 
                      className="h-8 w-8 text-islamic-green" 
                      style={{ transform: `rotate(${qiblaDirection}deg)` }}
                    />
                    <div className="absolute top-2 text-xs font-bold text-islamic-green">ش</div>
                    <div className="absolute bottom-2 text-xs font-bold text-muted-foreground">ج</div>
                    <div className="absolute left-2 text-xs font-bold text-muted-foreground">غ</div>
                    <div className="absolute right-2 text-xs font-bold text-muted-foreground">ق</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-bold text-islamic-green">
                  {qiblaDirection}° 
                </p>
                <p className="text-sm text-muted-foreground">
                  المسافة إلى الكعبة: {distanceToMecca} كم
                </p>
                <Button 
                  onClick={() => onPageChange?.('qibla')}
                  className="bg-gradient-primary hover:shadow-islamic"
                >
                  فتح البوصلة المفصلة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* إعدادات سريعة */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center">الإعدادات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="h-4 w-4 ml-2" />
              تغيير الموقع
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="h-4 w-4 ml-2" />
              طريقة حساب الأوقات
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Navigation className="h-4 w-4 ml-2" />
              تنبيهات الصلاة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}