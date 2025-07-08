import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, Navigation, MapPin, RefreshCw, AlertCircle } from 'lucide-react';

interface QiblaPageProps {
  onPageChange?: (page: string) => void;
}

export default function QiblaPage({ onPageChange }: QiblaPageProps) {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [compass, setCompass] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // إحداثيات الكعبة المشرفة
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  // حساب اتجاه القبلة
  const calculateQibla = (lat: number, lng: number) => {
    const dLng = (KAABA_LNG - lng) * Math.PI / 180;
    const lat1 = lat * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;

    const y = Math.sin(dLng);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;

    return bearing;
  };

  // حساب المسافة إلى مكة
  const calculateDistance = (lat: number, lng: number) => {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = (KAABA_LAT - lat) * Math.PI / 180;
    const dLng = (KAABA_LNG - lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat * Math.PI / 180) * Math.cos(KAABA_LAT * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // الحصول على الموقع الحالي
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('متصفحك لا يدعم تحديد الموقع');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;

        setLocation({ lat, lng });
        setAccuracy(acc);
        setQiblaDirection(calculateQibla(lat, lng));
        setLoading(false);
      },
      (error) => {
        setError('فشل في تحديد الموقع. تأكد من السماح للتطبيق بالوصول للموقع.');
        setLoading(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 دقائق
      }
    );
  };

  // مراقبة البوصلة
  useEffect(() => {
    let watchId: number;

    if (window.DeviceOrientationEvent) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setCompass(360 - event.alpha);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // تحديد الموقع عند تحميل الصفحة
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const distance = location ? calculateDistance(location.lat, location.lng) : null;
  const adjustedQibla = qiblaDirection !== null ? (qiblaDirection - compass + 360) % 360 : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground font-arabic-display">
          اتجاه القبلة
        </h1>
        <p className="text-muted-foreground">
          بوصلة لتحديد اتجاه الكعبة المشرفة
        </p>
        <div className="text-lg font-arabic-display text-islamic-green">
          "فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ"
        </div>
      </div>

      {/* معلومات الموقع */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            معلومات الموقع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-islamic-green">
                {location ? location.lat.toFixed(4) + '°' : '---'}
              </div>
              <p className="text-sm text-muted-foreground">خط العرض</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-islamic-blue">
                {location ? location.lng.toFixed(4) + '°' : '---'}
              </div>
              <p className="text-sm text-muted-foreground">خط الطول</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-islamic-gold">
                {distance ? distance.toFixed(0) + ' كم' : '---'}
              </div>
              <p className="text-sm text-muted-foreground">المسافة إلى مكة</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {qiblaDirection ? qiblaDirection.toFixed(0) + '°' : '---'}
              </div>
              <p className="text-sm text-muted-foreground">اتجاه القبلة</p>
            </div>
          </div>
          
          {accuracy && (
            <div className="mt-4 text-center">
              <Badge variant={accuracy < 50 ? "default" : accuracy < 100 ? "secondary" : "destructive"}>
                دقة الموقع: {accuracy.toFixed(0)} متر
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* البوصلة */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center">البوصلة الإلكترونية</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>جاري تحديد الموقع...</span>
            </div>
          ) : (
            <>
              {/* البوصلة الرئيسية */}
              <div className="relative">
                <div className="w-72 h-72 rounded-full border-8 border-muted bg-gradient-card relative shadow-islamic">
                  {/* خلفية البوصلة */}
                  <div 
                    className="absolute inset-2 rounded-full bg-gradient-hero transition-transform duration-500"
                    style={{ transform: `rotate(${compass}deg)` }}
                  >
                    {/* علامات الاتجاهات */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-8 bg-white"></div>
                      <div className="text-white text-xs font-bold text-center mt-1">N</div>
                    </div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90">
                      <div className="w-1 h-6 bg-white/70"></div>
                      <div className="text-white text-xs font-bold text-center mt-1 -rotate-90">E</div>
                    </div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 rotate-180">
                      <div className="w-1 h-6 bg-white/70"></div>
                      <div className="text-white text-xs font-bold text-center mt-1 -rotate-180">S</div>
                    </div>
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90">
                      <div className="w-1 h-6 bg-white/70"></div>
                      <div className="text-white text-xs font-bold text-center mt-1 rotate-90">W</div>
                    </div>
                  </div>

                  {/* مؤشر القبلة */}
                  {adjustedQibla !== null && (
                    <div 
                      className="absolute inset-0 transition-transform duration-500"
                      style={{ transform: `rotate(${adjustedQibla}deg)` }}
                    >
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-islamic-gold animate-pulse-islamic"></div>
                        <div className="text-xs font-bold text-islamic-gold text-center mt-1">قبلة</div>
                      </div>
                    </div>
                  )}

                  {/* المركز */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                  </div>

                  {/* قراءات البوصلة */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(compass)}°
                    </div>
                    <div className="text-sm text-muted-foreground">
                      اتجاه البوصلة
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Compass className="h-6 w-6 mx-auto mb-2 text-islamic-green" />
                  <div className="text-lg font-bold">
                    {adjustedQibla !== null ? Math.round(adjustedQibla) + '°' : '---'}
                  </div>
                  <div className="text-sm text-muted-foreground">الاتجاه النسبي للقبلة</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Navigation className="h-6 w-6 mx-auto mb-2 text-islamic-blue" />
                  <div className="text-lg font-bold">
                    {qiblaDirection !== null ? Math.round(qiblaDirection) + '°' : '---'}
                  </div>
                  <div className="text-sm text-muted-foreground">الاتجاه المطلق للقبلة</div>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={getCurrentLocation}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'جاري تحديد الموقع...' : 'تحديث الموقع'}
          </Button>
        </CardContent>
      </Card>

      {/* تعليمات الاستخدام */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center text-islamic-green">تعليمات الاستخدام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-bold text-islamic-green mb-2">للحصول على أفضل دقة:</h4>
                <ul className="space-y-1 text-right">
                  <li>• امسك الهاتف بشكل مسطح</li>
                  <li>• ابتعد عن المغناطيس والمعادن</li>
                  <li>• السماح للتطبيق بالوصول للموقع</li>
                  <li>• تأكد من اتصال الإنترنت</li>
                </ul>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-bold text-islamic-blue mb-2">كيفية القراءة:</h4>
                <ul className="space-y-1 text-right">
                  <li>• السهم الذهبي يشير للقبلة</li>
                  <li>• اتجه نحو السهم للصلاة</li>
                  <li>• الأرقام تشير لدرجات البوصلة</li>
                  <li>• N = شمال، E = شرق</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <div className="text-lg font-arabic-display text-islamic-green">
                "وَمِنْ حَيْثُ خَرَجْتَ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ"
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                سورة البقرة - الآية 149
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}