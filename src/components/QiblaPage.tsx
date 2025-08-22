import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, Navigation, MapPin, RefreshCw, AlertCircle, Play, Square, Target } from 'lucide-react';
import { useSimpleQibla } from '@/hooks/use-simple-qibla';
import { useToast } from '@/hooks/use-toast';

interface QiblaPageProps {
  onPageChange?: (page: string) => void;
}

export default function QiblaPage({ onPageChange }: QiblaPageProps) {
  const { toast } = useToast();
  const {
    qiblaData,
    location,
    isLoading,
    error,
    isCompassActive,
    startCompass,
    stopCompass,
    updateLocation,
    isSupported
  } = useSimpleQibla();

  // بدء/إيقاف البوصلة
  const handleToggleCompass = async () => {
    if (isCompassActive) {
      stopCompass();
      toast({
        title: "تم إيقاف البوصلة",
        description: "البوصلة متوقفة الآن"
      });
    } else {
      try {
        await startCompass();
        toast({
          title: "تم تشغيل البوصلة ✅",
          description: "البوصلة تعمل الآن بنجاح"
        });
      } catch (error) {
        toast({
          title: "فشل في تشغيل البوصلة ❌",
          description: "تأكد من السماح للتطبيق بالوصول للحساسات",
          variant: "destructive"
        });
      }
    }
  };

  // تحديث الموقع
  const handleUpdateLocation = async () => {
    try {
      await updateLocation();
      toast({
        title: "تم تحديث الموقع ✅",
        description: "تم إعادة حساب اتجاه القبلة"
      });
    } catch (error) {
      toast({
        title: "فشل في تحديث الموقع ❌",
        description: "تأكد من تفعيل خدمات الموقع",
        variant: "destructive"
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">الجهاز غير مدعوم</h3>
            <p className="text-muted-foreground text-sm">
              هذا الجهاز لا يدعم حساس البوصلة المطلوب لميزة القبلة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* العنوان */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          🧭 اتجاه القبلة
        </h1>
        <p className="text-muted-foreground">
          بوصلة لتحديد اتجاه الكعبة المشرفة
        </p>
        <div className="text-lg text-primary">
          "فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ"
        </div>
      </div>

      {/* التحكم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>التحكم في البوصلة</span>
            <Badge variant={isCompassActive ? "default" : "secondary"}>
              {isCompassActive ? "🟢 يعمل" : "🔴 متوقف"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleToggleCompass}
              disabled={isLoading}
              size="sm"
              variant={isCompassActive ? "destructive" : "default"}
            >
              {isCompassActive ? (
                <>
                  <Square className="h-3 w-3 mr-1" />
                  إيقاف
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  تشغيل
                </>
              )}
            </Button>
            
            <Button
              onClick={handleUpdateLocation}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* معلومات الموقع */}
      {location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              معلومات الموقع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">
                  {location.lat.toFixed(4)}°
                </div>
                <p className="text-sm text-muted-foreground">خط العرض</p>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">
                  {location.lng.toFixed(4)}°
                </div>
                <p className="text-sm text-muted-foreground">خط الطول</p>
              </div>
              {qiblaData && (
                <>
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {qiblaData.distance} كم
                    </div>
                    <p className="text-sm text-muted-foreground">المسافة إلى مكة</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {qiblaData.qiblaDirection}°
                    </div>
                    <p className="text-sm text-muted-foreground">اتجاه القبلة</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* البوصلة */}
      {isCompassActive && qiblaData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">البوصلة الإلكترونية</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {/* البوصلة الرئيسية */}
            <div className="relative">
              <div className="w-80 h-80 rounded-full border-8 border-border bg-background relative shadow-lg">
                {/* خلفية البوصلة */}
                <div 
                  className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 transition-transform duration-300"
                  style={{ transform: `rotate(${-qiblaData.userHeading}deg)` }}
                >
                  {/* علامات الاتجاهات */}
                  {['N', 'E', 'S', 'W'].map((direction, index) => (
                    <div 
                      key={direction}
                      className="absolute text-foreground font-bold"
                      style={{
                        top: index === 0 ? '8px' : index === 2 ? 'auto' : '50%',
                        bottom: index === 2 ? '8px' : 'auto',
                        left: index === 3 ? '8px' : index === 1 ? 'auto' : '50%',
                        right: index === 1 ? '8px' : 'auto',
                        transform: `translate(${index % 2 === 0 ? '-50%' : index === 1 ? '0' : '0'}, ${index % 2 === 1 ? '-50%' : index === 2 ? '0' : '0'})`
                      }}
                    >
                      <div className={`w-1 ${index === 0 ? 'h-8' : 'h-6'} bg-foreground mx-auto mb-1`}></div>
                      <div className="text-sm">{direction}</div>
                    </div>
                  ))}
                  
                  {/* علامات درجات */}
                  {Array.from({ length: 36 }).map((_, i) => {
                    const angle = i * 10;
                    if (angle % 90 === 0) return null;
                    return (
                      <div
                        key={i}
                        className="absolute w-0.5 h-4 bg-foreground/60"
                        style={{
                          top: '12px',
                          left: '50%',
                          transformOrigin: '50% 140px',
                          transform: `translateX(-50%) rotate(${angle}deg)`
                        }}
                      />
                    );
                  })}
                </div>

                {/* مؤشر القبلة */}
                <div 
                  className="absolute inset-0 transition-transform duration-300"
                  style={{ transform: `rotate(${qiblaData.qiblaRelativeDirection}deg)` }}
                >
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    <Target className="h-8 w-8 text-primary animate-pulse" />
                    <div className="text-xs font-bold text-primary mt-1">
                      الكعبة
                    </div>
                  </div>
                </div>

                {/* المركز */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                </div>

                {/* قراءة الاتجاه */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(qiblaData.userHeading)}°
                  </div>
                  <div className="text-sm text-muted-foreground">
                    اتجاه الهاتف
                  </div>
                </div>
              </div>
            </div>

            {/* معلومات مفصلة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Compass className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold text-primary">
                  {qiblaData.qiblaRelativeDirection}°
                </div>
                <div className="text-sm text-muted-foreground">الاتجاه النسبي</div>
                <div className="text-xs mt-1">
                  {Math.abs(qiblaData.qiblaRelativeDirection - 0) < 10 || 
                   Math.abs(qiblaData.qiblaRelativeDirection - 360) < 10 ? 
                    '🎯 اتجاه صحيح' : 
                    `↻ ${Math.min(qiblaData.qiblaRelativeDirection, 360 - qiblaData.qiblaRelativeDirection).toFixed(0)}°`}
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Navigation className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold text-primary">
                  {qiblaData.qiblaDirection}°
                </div>
                <div className="text-sm text-muted-foreground">الاتجاه المطلق</div>
                <div className="text-xs mt-1">من موقعك</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {qiblaData.accuracy}%
                </div>
                <div className="text-sm text-muted-foreground">دقة البوصلة</div>
                <div className="text-xs mt-1">
                  {qiblaData.isCalibrated ? '✅ معايرة' : '⚠️ يحتاج معايرة'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* تعليمات */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">📋 تعليمات الاستخدام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-bold text-primary mb-2">للحصول على أفضل دقة:</h4>
              <ul className="space-y-1 text-sm">
                <li>• امسك الهاتف بشكل مسطح</li>
                <li>• ابتعد عن المغناطيس والمعادن</li>
                <li>• السماح للتطبيق بالوصول للموقع</li>
                <li>• تأكد من تفعيل خدمات الموقع</li>
              </ul>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-bold text-primary mb-2">كيفية القراءة:</h4>
              <ul className="space-y-1 text-sm">
                <li>• السهم يشير إلى اتجاه القبلة</li>
                <li>• اتجه نحو السهم للصلاة</li>
                <li>• الأرقام تشير لدرجات البوصلة</li>
                <li>• عندما يكون الرقم 0° تكون في الاتجاه الصحيح</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-6 p-4 bg-primary/10 rounded-lg">
            <div className="text-lg text-primary mb-2">
              "وَمِنْ حَيْثُ خَرَجْتَ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ"
            </div>
            <p className="text-xs text-muted-foreground">
              سورة البقرة - الآية 149
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}