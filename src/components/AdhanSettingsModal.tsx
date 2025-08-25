import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Volume2, Play, Pause, Check } from 'lucide-react';
import { AdhanService, AdhanVoice } from '@/lib/adhan-service';

interface AdhanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdhanSettingsModal({ isOpen, onClose }: AdhanSettingsModalProps) {
  const adhanService = AdhanService.getInstance();
  const [settings, setSettings] = useState(adhanService.getSettings());
  const [voices] = useState<AdhanVoice[]>(adhanService.getAvailableVoices());
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const handleVolumeChange = (value: number[]) => {
    const newSettings = { ...settings, volume: value[0] };
    setSettings(newSettings);
    adhanService.updateSettings(newSettings);
  };

  const handlePrayerToggle = (prayer: keyof typeof settings.enabledPrayers) => {
    const newSettings = {
      ...settings,
      enabledPrayers: {
        ...settings.enabledPrayers,
        [prayer]: !settings.enabledPrayers[prayer]
      }
    };
    setSettings(newSettings);
    adhanService.updateSettings(newSettings);
  };

  const handleVoiceSelect = (voiceId: string) => {
    const newSettings = { ...settings, selectedVoice: voiceId };
    setSettings(newSettings);
    adhanService.updateSelectedVoice(voiceId);
  };

  const handlePlayPreview = async (voiceId: string) => {
    if (playingPreview === voiceId) {
      setPlayingPreview(null);
      adhanService.stopAdhan();
    } else {
      setPlayingPreview(voiceId);
      try {
        await adhanService.playVoicePreview(voiceId);
        setTimeout(() => setPlayingPreview(null), 10000);
      } catch (error) {
        setPlayingPreview(null);
      }
    }
  };

  const prayerNames = {
    fajr: 'الفجر',
    dhuhr: 'الظهر', 
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center font-arabic-display">
            🕌 إعدادات الأذان
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* مستوى الصوت */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="font-medium">مستوى الصوت</span>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={handleVolumeChange}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground text-center">
              {Math.round(settings.volume * 100)}%
            </div>
          </div>

          {/* اختيار صوت الأذان */}
          <div className="space-y-3">
            <h3 className="font-medium">اختيار صوت الأذان</h3>
            <div className="space-y-2">
              {voices.map((voice) => (
                <Card 
                  key={voice.id}
                  className={`cursor-pointer transition-colors ${
                    settings.selectedVoice === voice.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleVoiceSelect(voice.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {settings.selectedVoice === voice.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        <span className="font-medium">{voice.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(voice.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        {playingPreview === voice.id ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* تفعيل الصلوات */}
          <div className="space-y-3">
            <h3 className="font-medium">الصلوات المُفعلة</h3>
            <div className="space-y-2">
              {Object.entries(prayerNames).map(([key, name]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{name}</span>
                  <Switch
                    checked={settings.enabledPrayers[key as keyof typeof settings.enabledPrayers]}
                    onCheckedChange={() => handlePrayerToggle(key as keyof typeof settings.enabledPrayers)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} className="flex-1">
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}