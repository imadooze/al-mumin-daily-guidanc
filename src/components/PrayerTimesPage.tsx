import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, MapPin, Compass, Navigation, Loader2, AlertCircle, Settings, Bell, Volume2, VolumeX } from 'lucide-react';
import { getCurrentLocation, calculateQiblaDirection, calculateDistanceToMecca, type LocationInfo } from '@/lib/prayer-api';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedPrayerMonitor } from '@/hooks/use-enhanced-prayer-monitor';
import EnhancedAdhanSettingsModal from '@/components/EnhancedAdhanSettingsModal';
import AudioPlayerControls from '@/components/AudioPlayerControls';
import { MuezzinAudioService } from '@/lib/muezzin-audio-service';

interface PrayerTimesPageProps {
  onPageChange?: (page: string) => void;
}

export default function PrayerTimesPage({ onPageChange }: PrayerTimesPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [distanceToMecca, setDistanceToMecca] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showAdhanSettings, setShowAdhanSettings] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [audioService] = useState(() => MuezzinAudioService.getInstance());
  const { toast } = useToast();

  // استخدام Hook محسن لمراقبة أوقات الصلاة مع الأذان
  const {
    currentPrayer,
    nextPrayer,
    allPrayers,
    prayerData,
    refreshPrayerTimes,
    timeUntilNext,
    adhanStatus
  } = useEnhancedPrayerMonitor(
    location?.latitude,
    location?.longitude,
    !!location
  );

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
      
      // تحديث أوقات الصلاة باستخدام Hook المحسن
      await refreshPrayerTimes();
      
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

  // معلومات حالة الأذان
  const getAdhanStatusText = () => {
    if (!adhanStatus.isEnabled) return 'معطل';
    if (adhanStatus.isPlaying) return 'يتم التشغيل...';
    if (adhanStatus.isMonitoring) return 'مفعل ومراقب';
    return 'مفعل';
  };

  const getAdhanStatusColor = () => {
    if (!adhanStatus.isEnabled) return 'text-muted-foreground';
    if (adhanStatus.isPlaying) return 'text-islamic-gold';
    if (adhanStatus.isMonitoring) return 'text-islamic-green';
    return 'text-islamic-blue';
  };

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

      {/* الصلاة الحالية والقادمة */}
      {currentPrayer && (
        <Card className="islamic-card border-islamic-green shadow-islamic">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Bell className="h-5 w-5 text-islamic-green animate-pulse" />
                <span className="text-sm text-muted-foreground">الصلاة الحالية</span>
              </div>
              <h2 className="text-2xl font-bold text-islamic-green">{currentPrayer.name}</h2>
              <p className="text-3xl font-bold text-primary">{currentPrayer.time}</p>
              <Badge className="bg-islamic-green hover:bg-islamic-green/90 text-white animate-pulse">
                حان الآن وقت الصلاة
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {!currentPrayer && nextPrayer && timeUntilNext && (
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
                بعد {timeUntilNext.hours} ساعة و {timeUntilNext.minutes} دقيقة و {timeUntilNext.seconds} ثانية
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* حالة الأذان */}
      <Card className="islamic-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className={`h-5 w-5 ${getAdhanStatusColor()}`} />
              <div>
                <p className="font-medium">حالة الأذان</p>
                <p className={`text-sm ${getAdhanStatusColor()}`}>
                  {getAdhanStatusText()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {adhanStatus.hasPermission ? (
                <Badge className="bg-islamic-green text-white">
                  مصرح
                </Badge>
              ) : (
                <Badge variant="outline" className="text-destructive">
                  غير مصرح
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdhanSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جميع أوقات الصلاة */}
      {allPrayers.length > 0 && (
        <Card className="islamic-card">
          <CardHeader>
            <CardTitle className="text-center">مواقيت الصلاة اليوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allPrayers.map((prayer) => (
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
                    {prayer.enabled && (
                      <Bell className="h-4 w-4 text-islamic-green" />
                    )}
                  </div>
                  
                  <div className="text-left">
                    <p className="text-xl font-bold text-primary">{prayer.time}</p>
                    {prayer.current && (
                      <Badge className="bg-islamic-green hover:bg-islamic-green/90 text-white text-xs animate-pulse">
                        الآن
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
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
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={requestLocation}
            >
              <MapPin className="h-4 w-4 ml-2" />
              تحديث الموقع
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start app-button"
              onClick={() => setShowAdhanSettings(true)}
            >
              <Settings className="h-4 w-4 ml-2" />
              إعدادات الأذان
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start app-button"
              onClick={() => setShowAudioControls(true)}
            >
              {audioService.getSettings().enabled ? (
                <Volume2 className="h-4 w-4 ml-2" />
              ) : (
                <VolumeX className="h-4 w-4 ml-2" />
              )}
              التحكم بالصوت
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* نافذة إعدادات الأذان */}
      <EnhancedAdhanSettingsModal 
        isOpen={showAdhanSettings}
        onClose={() => setShowAdhanSettings(false)}
      />

      {/* نافذة التحكم بالصوت */}
      {showAudioControls && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <AudioPlayerControls 
              onSettingsChange={(settings) => {
                toast({
                  title: "تم تحديث إعدادات الصوت",
                  description: "تم حفظ التغييرات بنجاح"
                });
              }}
            />
            <Button 
              onClick={() => setShowAudioControls(false)}
              className="w-full mt-4"
              variant="outline"
            >
              إغلاق
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}