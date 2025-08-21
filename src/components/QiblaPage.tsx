import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, Navigation, MapPin, RefreshCw, AlertCircle, Settings, Target } from 'lucide-react';
import { useQiblaCompass } from '@/hooks/use-qibla-compass';
import { useToast } from '@/hooks/use-toast';

interface QiblaPageProps {
  onPageChange?: (page: string) => void;
}

export default function QiblaPage({ onPageChange }: QiblaPageProps) {
  const { toast } = useToast();
  const [showCalibration, setShowCalibration] = useState(false);
  
  const {
    qiblaData,
    getCurrentLocation,
    calibrateCompass,
    resetCompass,
    isSupported
  } = useQiblaCompass({
    updateInterval: 100,
    enableAutoLocation: true,
    enableOfflineMode: true
  });

  // معالجة معايرة البوصلة
  const handleCalibration = async () => {
    setShowCalibration(true);
    toast({
      title: "معايرة البوصلة",
      description: "حرك الهاتف في شكل 8 عدة مرات للحصول على أفضل دقة",
      duration: 3000,
    });

    const success = await calibrateCompass();
    setShowCalibration(false);
    
    if (success) {
      toast({
        title: "تمت المعايرة بنجاح ✅",
        description: "البوصلة جاهزة للاستخدام بدقة عالية",
        duration: 2000,
      });
    } else {
      toast({
        title: "فشلت المعايرة ❌",
        description: "تأكد من إبعاد الهاتف عن المعادن والمغناطيس",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // تحديث الموقع
  const handleLocationUpdate = async () => {
    try {
      await getCurrentLocation(true);
      toast({
        title: "تم تحديث الموقع ✅",
        description: "تم إعادة حساب اتجاه القبلة بدقة أعلى",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "فشل في تحديث الموقع ❌",
        description: "تأكد من تفعيل خدمات الموقع",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="islamic-card max-w-md">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">الجهاز غير مدعوم</h3>
            <p className="text-muted-foreground text-sm">
              هذا الجهاز لا يدعم حساس البوصلة أو تحديد الموقع المطلوب لميزة القبلة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* معلومات الموقع والحالة */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              معلومات الموقع
            </div>
            <div className="flex gap-2">
              <Badge variant={qiblaData.isCalibrated ? "default" : "secondary"}>
                {qiblaData.isCalibrated ? "معايرة ✓" : "غير معايرة"}
              </Badge>
              <Badge variant={qiblaData.accuracy > 70 ? "default" : qiblaData.accuracy > 40 ? "secondary" : "destructive"}>
                دقة {qiblaData.accuracy.toFixed(0)}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-islamic-green">
                {qiblaData.location ? qiblaData.location.lat.toFixed(4) + '°' : '---'}
              </div>
              <p className="text-sm text-muted-foreground">خط العرض</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-islamic-blue">
                {qiblaData.location ? qiblaData.location.lng.toFixed(4) + '°' : '---'}
              </div>
              <p className="text-sm text-muted-foreground">خط الطول</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-islamic-gold">
                {qiblaData.distance > 0 ? qiblaData.distance + ' كم' : '---'}
              </div>
              <p className="text-sm text-muted-foreground">المسافة إلى مكة</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {qiblaData.qiblaDirection ? qiblaData.qiblaDirection.toFixed(1) + '°' : '---'}
              </div>
              <p className="text-sm text-muted-foreground">اتجاه القبلة</p>
            </div>
          </div>
          
          {/* أزرار التحكم */}
          <div className="mt-4 flex gap-2 justify-center">
            <Button
              onClick={handleLocationUpdate}
              disabled={qiblaData.isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${qiblaData.isLoading ? 'animate-spin' : ''}`} />
              تحديث الموقع
            </Button>
            <Button
              onClick={handleCalibration}
              disabled={showCalibration}
              variant="outline"
              size="sm"
            >
              <Settings className={`h-4 w-4 mr-2 ${showCalibration ? 'animate-spin' : ''}`} />
              معايرة البوصلة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* البوصلة */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center">البوصلة الإلكترونية</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {qiblaData.error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg w-full">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{qiblaData.error}</span>
            </div>
          )}

          {qiblaData.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>جاري تحديد الموقع...</span>
            </div>
          ) : qiblaData.location ? (
            <>
              {/* البوصلة الرئيسية المحسنة */}
              <div className="relative">
                <div className="w-80 h-80 rounded-full border-8 border-muted bg-gradient-card relative shadow-islamic">
                  {/* خلفية البوصلة مع علامات متدرجة */}
                  <div 
                    className="absolute inset-2 rounded-full bg-gradient-hero transition-transform duration-300 ease-out"
                    style={{ transform: `rotate(${-qiblaData.userHeading}deg)` }}
                  >
                    {/* علامات الاتجاهات الرئيسية */}
                    {['N', 'E', 'S', 'W'].map((direction, index) => (
                      <div 
                        key={direction}
                        className="absolute"
                        style={{
                          top: index === 0 ? '4px' : index === 2 ? 'auto' : '50%',
                          bottom: index === 2 ? '4px' : 'auto',
                          left: index === 3 ? '4px' : index === 1 ? 'auto' : '50%',
                          right: index === 1 ? '4px' : 'auto',
                          transform: `translate(${index % 2 === 0 ? '-50%' : index === 1 ? '0' : '0'}, ${index % 2 === 1 ? '-50%' : index === 2 ? '0' : '0'})`
                        }}
                      >
                        <div className={`w-1 ${index === 0 ? 'h-10' : 'h-8'} bg-white/90 mx-auto`}></div>
                        <div className="text-white text-sm font-bold text-center mt-1">{direction}</div>
                      </div>
                    ))}

                    {/* علامات متدرجة كل 30 درجة */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const angle = i * 30;
                      if (angle % 90 === 0) return null; // تجاهل الاتجاهات الرئيسية
                      return (
                        <div
                          key={i}
                          className="absolute w-0.5 h-6 bg-white/60"
                          style={{
                            top: '8px',
                            left: '50%',
                            transformOrigin: '50% 144px',
                            transform: `translateX(-50%) rotate(${angle}deg)`
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* مؤشر القبلة المحسن */}
                  <div 
                    className="absolute inset-0 transition-transform duration-300 ease-out"
                    style={{ transform: `rotate(${qiblaData.qiblaRelativeDirection}deg)` }}
                  >
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                      {/* سهم القبلة الذهبي */}
                      <div className="relative">
                        <Target className="h-8 w-8 text-islamic-gold animate-pulse-islamic drop-shadow-lg" />
                        <div className="absolute -top-1 -left-1 w-10 h-10 border-2 border-islamic-gold rounded-full animate-ping opacity-30"></div>
                      </div>
                      <div className="text-xs font-bold text-islamic-gold text-center mt-1 bg-black/30 px-2 py-1 rounded">
                        الكعبة المشرفة
                      </div>
                    </div>
                  </div>

                  {/* المركز المحسن */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-white rounded-full shadow-lg border-2 border-islamic-gold"></div>
                    <div className="absolute inset-0 w-6 h-6 bg-islamic-gold rounded-full animate-ping opacity-30"></div>
                  </div>

                  {/* مؤشر دقة البوصلة */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-3 h-3 rounded-full ${
                      qiblaData.accuracy > 80 ? 'bg-green-500' :
                      qiblaData.accuracy > 60 ? 'bg-yellow-500' :
                      qiblaData.accuracy > 40 ? 'bg-orange-500' : 'bg-red-500'
                    } animate-pulse`}></div>
                  </div>

                  {/* قراءات البوصلة المحسنة */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(qiblaData.userHeading)}°
                    </div>
                    <div className="text-sm text-muted-foreground">
                      اتجاه الهاتف
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات دقيقة مفصلة */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="text-center p-4 bg-muted/50 rounded-lg border-2 border-islamic-green/20">
                  <Compass className="h-6 w-6 mx-auto mb-2 text-islamic-green" />
                  <div className="text-xl font-bold text-islamic-green">
                    {Math.round(qiblaData.qiblaRelativeDirection)}°
                  </div>
                  <div className="text-sm text-muted-foreground">الاتجاه النسبي للقبلة</div>
                  <div className="text-xs mt-1 font-medium">
                    {qiblaData.qiblaRelativeDirection < 5 || qiblaData.qiblaRelativeDirection > 355 ? 
                      '🎯 اتجاه صحيح' : 
                      `انحرف ${Math.min(qiblaData.qiblaRelativeDirection, 360 - qiblaData.qiblaRelativeDirection).toFixed(0)}° ${qiblaData.qiblaRelativeDirection > 180 ? 'يساراً' : 'يميناً'}`}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border-2 border-islamic-blue/20">
                  <Navigation className="h-6 w-6 mx-auto mb-2 text-islamic-blue" />
                  <div className="text-xl font-bold text-islamic-blue">
                    {qiblaData.qiblaDirection.toFixed(1)}°
                  </div>
                  <div className="text-sm text-muted-foreground">الاتجاه المطلق للقبلة</div>
                  <div className="text-xs mt-1 font-medium">
                    من موقعك الحالي
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border-2 border-islamic-gold/20">
                  <Settings className="h-6 w-6 mx-auto mb-2 text-islamic-gold" />
                  <div className="text-xl font-bold text-islamic-gold">
                    {qiblaData.accuracy.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">دقة البوصلة</div>
                  <div className="text-xs mt-1 font-medium">
                    {qiblaData.isCalibrated ? '✅ معايرة' : '⚠️ يحتاج معايرة'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لم يتم تحديد الموقع بعد</p>
              <Button
                onClick={handleLocationUpdate}
                className="mt-4"
              >
                <MapPin className="h-4 w-4 mr-2" />
                تحديد الموقع
              </Button>
            </div>
          )}
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