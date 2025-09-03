import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, Navigation, MapPin, RefreshCw, AlertCircle, Play, Square } from 'lucide-react';
import { useSimpleQibla } from '@/hooks/use-simple-qibla';
import { useToast } from '@/hooks/use-toast';
import QiblaMapView from './QiblaMapView';
import QiblaCompass from './QiblaCompass';

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
              className="px-3 py-1 text-xs"
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
              className="px-3 py-1 text-xs"
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

      {/* عرض الخريطة */}
      {location && qiblaData && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <QiblaMapView 
              location={location ? { 
                lat: location.latitude, 
                lng: location.longitude 
              } : null}
              qiblaDirection={qiblaData.qiblaDirection}
              distance={qiblaData.distance}
            />
          </CardContent>
        </Card>
      )}

      {/* البوصلة المدمجة */}
      {isCompassActive && qiblaData && (
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <QiblaCompass qiblaData={qiblaData} />
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