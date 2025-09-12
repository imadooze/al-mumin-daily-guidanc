import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  Music,
  Radio,
  Settings
} from 'lucide-react';
import { MuezzinAudioService, type MuezzinVoice, type AudioSettings } from '@/lib/muezzin-audio-service';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerControlsProps {
  onSettingsChange?: (settings: AudioSettings) => void;
  className?: string;
}

export default function AudioPlayerControls({ onSettingsChange, className }: AudioPlayerControlsProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<MuezzinVoice | null>(null);
  const [settings, setSettings] = useState<AudioSettings>({
    volume: 0.8,
    selectedVoice: 'makkah-1',
    enabled: true,
    fadeIn: true,
    repeatCount: 1
  });
  const [availableVoices, setAvailableVoices] = useState<MuezzinVoice[]>([]);

  const audioService = MuezzinAudioService.getInstance();

  // تحميل البيانات عند بدء المكون
  useEffect(() => {
    loadAudioData();
    setupEventListeners();

    return () => {
      cleanupEventListeners();
    };
  }, []);

  const loadAudioData = () => {
    const voices = audioService.getAvailableVoices();
    const currentSettings = audioService.getSettings();
    
    setAvailableVoices(voices);
    setSettings(currentSettings);
    
    const voice = audioService.getVoiceById(currentSettings.selectedVoice);
    setCurrentVoice(voice || voices[0]);
  };

  const setupEventListeners = () => {
    window.addEventListener('adhanStarted', handleAdhanStarted);
    window.addEventListener('adhanEnded', handleAdhanEnded);
  };

  const cleanupEventListeners = () => {
    window.removeEventListener('adhanStarted', handleAdhanStarted);
    window.removeEventListener('adhanEnded', handleAdhanEnded);
  };

  const handleAdhanStarted = (event: any) => {
    setIsPlaying(true);
    toast({
      title: "🕌 بدأ الأذان",
      description: `${event.detail?.voice?.arabicName || 'مؤذن غير معروف'}`,
    });
  };

  const handleAdhanEnded = () => {
    setIsPlaying(false);
    toast({
      title: "✅ انتهى الأذان",
      description: "تم إنهاء تشغيل الأذان بنجاح",
    });
  };

  // تشغيل عينة من الصوت المختار
  const handlePlaySample = async () => {
    if (isPlaying) {
      audioService.stopCurrentAudio();
      setIsPlaying(false);
      return;
    }

    try {
      await audioService.playAdhan('تجريبي');
    } catch (error) {
      toast({
        title: "خطأ في التشغيل",
        description: "فشل في تشغيل الأذان",
        variant: "destructive"
      });
    }
  };

  // تغيير مستوى الصوت
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    const newSettings = { ...settings, volume: newVolume };
    
    setSettings(newSettings);
    audioService.saveSettings(newSettings);
    audioService.setVolume(newVolume);
    
    onSettingsChange?.(newSettings);
  };

  // تغيير صوت المؤذن
  const handleVoiceChange = (voiceId: string) => {
    const voice = audioService.getVoiceById(voiceId);
    if (!voice) return;

    const newSettings = { ...settings, selectedVoice: voiceId };
    
    setCurrentVoice(voice);
    setSettings(newSettings);
    audioService.saveSettings(newSettings);
    
    onSettingsChange?.(newSettings);
    
    toast({
      title: "تم تغيير الصوت",
      description: `تم اختيار: ${voice.arabicName}`,
    });
  };

  // تبديل حالة التفعيل
  const handleToggleEnabled = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    
    setSettings(newSettings);
    audioService.saveSettings(newSettings);
    
    onSettingsChange?.(newSettings);
    
    toast({
      title: settings.enabled ? "تم تعطيل الأذان" : "تم تفعيل الأذان",
      description: settings.enabled ? "لن يتم تشغيل الأذان الصوتي" : "سيتم تشغيل الأذان الصوتي",
    });
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6 space-y-6">
        {/* العنوان وحالة التفعيل */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-islamic-green to-islamic-blue rounded-full flex items-center justify-center">
              <Music className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold font-arabic">🎵 مشغل الأذان</h3>
              <p className="text-sm text-muted-foreground">أصوات المؤذنين الحقيقية</p>
            </div>
          </div>
          
          <Badge 
            variant={settings.enabled ? "default" : "secondary"}
            className={`cursor-pointer transition-all duration-300 ${
              settings.enabled ? 'audio-playing' : ''
            }`}
            onClick={handleToggleEnabled}
          >
            {settings.enabled ? '🟢 مُفعل' : '🔴 معطل'}
          </Badge>
        </div>

        {/* اختيار صوت المؤذن */}
        <div className="space-y-3">
          <label className="text-sm font-medium font-arabic">اختيار صوت المؤذن</label>
          <Select value={settings.selectedVoice} onValueChange={handleVoiceChange}>
            <SelectTrigger className="app-button">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableVoices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium font-arabic">{voice.arabicName}</span>
                    <span className="text-xs text-muted-foreground">{voice.location}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* معلومات الصوت الحالي */}
        {currentVoice && (
          <div className="p-4 bg-gradient-to-r from-islamic-green/10 to-islamic-blue/10 rounded-lg border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Radio className="h-4 w-4 text-primary" />
              <span className="font-semibold font-arabic">{currentVoice.arabicName}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{currentVoice.location}</p>
            <p className="text-xs text-muted-foreground">{currentVoice.description}</p>
          </div>
        )}

        {/* عناصر التحكم في التشغيل */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePlaySample}
            disabled={!settings.enabled}
            className={`app-button flex-1 ${isPlaying ? 'audio-visualizer' : ''}`}
            variant={isPlaying ? "destructive" : "default"}
          >
            {isPlaying ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                إيقاف التشغيل
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                تشغيل عينة
              </>
            )}
          </Button>
        </div>

        {/* التحكم في مستوى الصوت */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium font-arabic flex items-center gap-2">
              {settings.volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              مستوى الصوت
            </label>
            <span className="text-sm text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
          </div>
          
          <Slider
            value={[settings.volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={5}
            className="w-full"
            disabled={!settings.enabled}
          />
        </div>

        {/* معلومات إضافية */}
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground font-arabic">
            💡 يمكنك تجربة أصوات مختلفة والتحكم في مستوى الصوت
          </p>
        </div>
      </CardContent>
    </Card>
  );
}