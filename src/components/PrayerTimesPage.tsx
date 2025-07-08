import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, MapPin, Compass, Navigation } from 'lucide-react';

interface PrayerTimesPageProps {
  onPageChange?: (page: string) => void;
}

export default function PrayerTimesPage({ onPageChange }: PrayerTimesPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState({ city: 'الرياض', country: 'المملكة العربية السعودية' });
  const [qiblaDirection, setQiblaDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // محاولة الحصول على الموقع الجغرافي
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // حساب اتجاه القبلة
          const qibla = calculateQiblaDirection(latitude, longitude);
          setQiblaDirection(qibla);
          // يمكن هنا إضافة API للحصول على اسم المدينة
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }

    return () => clearInterval(timer);
  }, []);

  // حساب اتجاه القبلة (الكعبة في مكة المكرمة)
  const calculateQiblaDirection = (lat: number, lng: number) => {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    
    const dLng = meccaLng - lng;
    const y = Math.sin(dLng * Math.PI / 180);
    const x = Math.cos(lat * Math.PI / 180) * Math.tan(meccaLat * Math.PI / 180) - 
              Math.sin(lat * Math.PI / 180) * Math.cos(dLng * Math.PI / 180);
    
    let qibla = Math.atan2(y, x) * 180 / Math.PI;
    return (qibla + 360) % 360;
  };

  // أوقات الصلاة (سيتم استبدالها بـ API حقيقي)
  const prayerTimes = [
    { name: 'الفجر', time: '05:24', nameEn: 'Fajr', passed: true, nextIn: null },
    { name: 'الشروق', time: '06:48', nameEn: 'Sunrise', passed: true, nextIn: null },
    { name: 'الظهر', time: '12:15', nameEn: 'Dhuhr', passed: false, current: false, nextIn: '2:30' },
    { name: 'العصر', time: '15:42', nameEn: 'Asr', passed: false, current: true, nextIn: null },
    { name: 'المغرب', time: '18:33', nameEn: 'Maghrib', passed: false, current: false, nextIn: '5:45' },
    { name: 'العشاء', time: '20:05', nameEn: 'Isha', passed: false, current: false, nextIn: '7:17' },
  ];

  const nextPrayer = prayerTimes.find(p => !p.passed && p.nextIn);
  const currentPrayer = prayerTimes.find(p => p.current);

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

      {/* الصلاة القادمة */}
      {nextPrayer && (
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
                بعد {nextPrayer.nextIn} ساعة
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* جميع أوقات الصلاة */}
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
                  {prayer.nextIn && !prayer.current && (
                    <p className="text-xs text-muted-foreground">
                      بعد {prayer.nextIn}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* بوصلة القبلة */}
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
                {Math.round(qiblaDirection)}° شمال شرقي
              </p>
              <p className="text-sm text-muted-foreground">
                المسافة إلى الكعبة: ~1,250 كم
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