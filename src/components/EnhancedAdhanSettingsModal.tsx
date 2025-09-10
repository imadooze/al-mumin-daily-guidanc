/**
 * نافذة إعدادات الأذان المحسنة مع جميع الخيارات
 * Enhanced Adhan Settings Modal with all options
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Bell, 
  Vibrate, 
  Eye,
  Settings,
  Clock,
  Moon,
  Sun,
  Sunset,
  Star
} from 'lucide-react';
import { EnhancedAdhanService, type AdhanSettings, type AdhanVoice } from '@/lib/enhanced-adhan-service';
import { useToast } from '@/hooks/use-toast';

interface EnhancedAdhanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRAYER_ICONS = {
  fajr: Moon,
  dhuhr: Sun,
  asr: Sunset,
  maghrib: Sunset,
  isha: Star
};

const PRAYER_NAMES = {
  fajr: 'الفجر',
  dhuhr: 'الظهر', 
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء'
};

export default function EnhancedAdhanSettingsModal({ 
  isOpen, 
  onClose 
}: EnhancedAdhanSettingsModalProps) {
  
  const [settings, setSettings] = useState<AdhanSettings | null>(null);
  const [availableVoices, setAvailableVoices] = useState<AdhanVoice[]>([]);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const adhanService = EnhancedAdhanService.getInstance();

  // تحميل الإعدادات والأصوات
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = () => {
    try {
      const currentSettings = adhanService.getSettings();
      const voices = adhanService.getAvailableVoices();
      
      setSettings(currentSettings);
      setAvailableVoices(voices);
    } catch (error) {
      console.error('خطأ في تحميل إعدادات الأذان:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل إعدادات الأذان',
        variant: 'destructive'
      });
    }
  };

  // حفظ الإعدادات
  const saveSettings = async () => {
    if (!settings) return;

    try {
      setIsLoading(true);
      adhanService.saveSettings(settings);
      
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات الأذان بنجاح'
      });
      
      onClose();
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الإعدادات',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تغيير مستوى الصوت
  const handleVolumeChange = (value: number[]) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      volume: value[0] / 100
    });
  };

  // تبديل حالة الصلاة
  const handlePrayerToggle = (prayer: keyof AdhanSettings['enabledPrayers']) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      enabledPrayers: {
        ...settings.enabledPrayers,
        [prayer]: !settings.enabledPrayers[prayer]
      }
    });
  };

  // اختيار صوت
  const handleVoiceSelect = (voiceId: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      selectedVoice: voiceId
    });
  };

  // تشغيل معاينة الصوت
  const handlePlayPreview = async (voiceId: string) => {
    try {
      if (playingPreview === voiceId) {
        adhanService.stopAdhan();
        setPlayingPreview(null);
      } else {
        setPlayingPreview(voiceId);
        await adhanService.playPreview(voiceId);
        // إيقاف المعاينة تلقائياً بعد 10 ثواني
        setTimeout(() => setPlayingPreview(null), 10000);
      }
    } catch (error) {
      console.error('خطأ في تشغيل المعاينة:', error);
      setPlayingPreview(null);
    }
  };

  // تغيير التذكير قبل الصلاة
  const handleReminderChange = (value: number[]) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      reminderBeforeMinutes: value[0]
    });
  };

  if (!settings) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto islamic-card">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-islamic-green font-arabic">
            إعدادات الأذان
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            تخصيص أوقات وأصوات الأذان
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* التفعيل العام */}
          <Card className="islamic-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-islamic-green" />
                الإعدادات العامة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">تفعيل الأذان</span>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, enabled: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">الاهتزاز</span>
                <Switch
                  checked={settings.useVibration}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, useVibration: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">إشعار دائم</span>
                <Switch
                  checked={settings.persistentNotification}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, persistentNotification: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* مستوى الصوت */}
          <Card className="islamic-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-islamic-blue" />
                مستوى الصوت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[settings.volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-sm">
                  {Math.round(settings.volume * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* التذكير */}
          <Card className="islamic-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-islamic-gold" />
                التذكير قبل الصلاة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider
                value={[settings.reminderBeforeMinutes]}
                onValueChange={handleReminderChange}
                min={0}
                max={30}
                step={5}
                className="w-full"
              />
              <div className="text-center">
                <Badge variant="outline" className="text-sm">
                  {settings.reminderBeforeMinutes === 0 
                    ? 'بدون تذكير' 
                    : `${settings.reminderBeforeMinutes} دقيقة`}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* اختيار الأصوات */}
          <Card className="islamic-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-islamic-green" />
                صوت الأذان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableVoices.map((voice) => (
                <Card
                  key={voice.id}
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    settings.selectedVoice === voice.id
                      ? 'border-islamic-green bg-islamic-green/10 shadow-islamic'
                      : 'border-border hover:border-islamic-green/50'
                  }`}
                  onClick={() => handleVoiceSelect(voice.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{voice.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {voice.description}
                        </p>
                        <Badge variant="outline" className="text-xs mt-2">
                          {voice.duration}ث
                        </Badge>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(voice.id);
                        }}
                        className="mr-3"
                      >
                        {playingPreview === voice.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* اختيار الصلوات */}
          <Card className="islamic-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-islamic-blue" />
                الصلوات المفعلة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(settings.enabledPrayers).map(([prayer, enabled]) => {
                const Icon = PRAYER_ICONS[prayer as keyof typeof PRAYER_ICONS];
                const name = PRAYER_NAMES[prayer as keyof typeof PRAYER_NAMES];
                
                return (
                  <div key={prayer} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-islamic-green" />
                      <span className="font-medium">{name}</span>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => 
                        handlePrayerToggle(prayer as keyof AdhanSettings['enabledPrayers'])
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* أزرار التحكم */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button
              onClick={saveSettings}
              className="flex-1 bg-gradient-primary hover:shadow-islamic"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  حفظ...
                </>
              ) : (
                'حفظ الإعدادات'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}