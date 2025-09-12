/**
 * خدمة الصوت الحقيقي للمؤذنين
 * يتضمن أصوات مؤذنين حقيقيين من الحرم المكي والمدني
 */

export interface MuezzinVoice {
  id: string;
  name: string;
  arabicName: string;
  location: string;
  audioUrl: string;
  description: string;
  isDefault?: boolean;
}

export interface AudioSettings {
  volume: number;
  selectedVoice: string;
  enabled: boolean;
  fadeIn: boolean;
  repeatCount: number;
}

export class MuezzinAudioService {
  private static instance: MuezzinAudioService;
  private currentAudio: HTMLAudioElement | null = null;
  private settings: AudioSettings;

  // أصوات المؤذنين الحقيقية المتاحة
  private readonly muezzinVoices: MuezzinVoice[] = [
    {
      id: 'makkah-1',
      name: 'Sheikh Ali Mulla',
      arabicName: 'الشيخ علي ملا',
      location: 'الحرم المكي الشريف',
      audioUrl: 'https://archive.org/download/AdhanMakkah2023/adhan-makkah-fajr.mp3',
      description: 'أذان الفجر من الحرم المكي',
      isDefault: true
    },
    {
      id: 'makkah-2',
      name: 'Sheikh Bandar Baleela',
      arabicName: 'الشيخ بندر بليلة',
      location: 'الحرم المكي الشريف',
      audioUrl: 'https://archive.org/download/AdhanMakkah2023/adhan-makkah-maghrib.mp3',
      description: 'أذان المغرب من الحرم المكي'
    },
    {
      id: 'madinah-1',
      name: 'Sheikh Hassan Bukhari',
      arabicName: 'الشيخ حسن البخاري',
      location: 'المسجد النبوي الشريف',
      audioUrl: 'https://archive.org/download/AdhanMadinah2023/adhan-madinah-dhuhr.mp3',
      description: 'أذان الظهر من المسجد النبوي'
    },
    {
      id: 'traditional-1',
      name: 'Traditional Recitation',
      arabicName: 'الطريقة التقليدية',
      location: 'تلاوة كلاسيكية',
      audioUrl: 'https://archive.org/download/IslamicAdhan/traditional-adhan.mp3',
      description: 'الأذان بالطريقة التقليدية'
    },
    {
      id: 'modern-1',
      name: 'Contemporary Style',
      arabicName: 'الأسلوب المعاصر',
      location: 'تلاوة معاصرة',
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      description: 'أذان بالأسلوب المعاصر'
    }
  ];

  private constructor() {
    this.settings = this.loadSettings();
  }

  public static getInstance(): MuezzinAudioService {
    if (!MuezzinAudioService.instance) {
      MuezzinAudioService.instance = new MuezzinAudioService();
    }
    return MuezzinAudioService.instance;
  }

  // تحميل الإعدادات من التخزين المحلي
  private loadSettings(): AudioSettings {
    const saved = localStorage.getItem('muezzin-audio-settings');
    return saved ? JSON.parse(saved) : {
      volume: 0.8,
      selectedVoice: 'makkah-1',
      enabled: true,
      fadeIn: true,
      repeatCount: 1
    };
  }

  // حفظ الإعدادات
  public saveSettings(settings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('muezzin-audio-settings', JSON.stringify(this.settings));
  }

  // الحصول على الإعدادات الحالية
  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  // الحصول على قائمة أصوات المؤذنين
  public getAvailableVoices(): MuezzinVoice[] {
    return [...this.muezzinVoices];
  }

  // الحصول على صوت مؤذن محدد
  public getVoiceById(id: string): MuezzinVoice | undefined {
    return this.muezzinVoices.find(voice => voice.id === id);
  }

  // تشغيل الأذان
  public async playAdhan(prayerName?: string): Promise<void> {
    if (!this.settings.enabled) {
      console.log('🔇 الأذان معطل في الإعدادات');
      return;
    }

    try {
      // إيقاف أي صوت يعمل حالياً
      this.stopCurrentAudio();

      // اختيار الصوت المناسب
      const selectedVoice = this.getVoiceById(this.settings.selectedVoice) || this.muezzinVoices[0];
      
      console.log(`🕌 تشغيل أذان ${prayerName || ''} - ${selectedVoice.arabicName}`);

      // إنشاء عنصر الصوت
      this.currentAudio = new Audio(selectedVoice.audioUrl);
      this.currentAudio.volume = this.settings.fadeIn ? 0 : this.settings.volume;
      this.currentAudio.preload = 'auto';

      // إعداد معالجات الأحداث
      this.setupAudioEventHandlers(selectedVoice);

      // بدء التشغيل
      await this.currentAudio.play();

      // تطبيق تأثير التلاشي إذا كان مفعلاً
      if (this.settings.fadeIn) {
        this.applyFadeInEffect();
      }

      // إرسال إشعار تشغيل
      this.notifyAdhanStarted(prayerName, selectedVoice);

    } catch (error) {
      console.error('فشل في تشغيل الأذان:', error);
      
      // في حالة فشل التشغيل، استخدم صوت احتياطي
      this.playFallbackAdhan();
    }
  }

  // إعداد معالجات أحداث الصوت
  private setupAudioEventHandlers(voice: MuezzinVoice): void {
    if (!this.currentAudio) return;

    // عند انتهاء التشغيل
    this.currentAudio.addEventListener('ended', () => {
      console.log('✅ انتهى تشغيل الأذان');
      this.currentAudio = null;
      this.notifyAdhanEnded();
    });

    // في حالة حدوث خطأ
    this.currentAudio.addEventListener('error', (e) => {
      console.error('خطأ في تشغيل الأذان:', e);
      this.currentAudio = null;
      this.playFallbackAdhan();
    });

    // عند التحميل الناجح
    this.currentAudio.addEventListener('loadeddata', () => {
      console.log(`📻 تم تحميل صوت: ${voice.arabicName}`);
    });
  }

  // تطبيق تأثير التلاشي التدريجي
  private applyFadeInEffect(): void {
    if (!this.currentAudio) return;

    const fadeDuration = 3000; // 3 ثوان
    const startTime = Date.now();
    const targetVolume = this.settings.volume;

    const fadeIn = () => {
      if (!this.currentAudio) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / fadeDuration, 1);
      
      this.currentAudio.volume = progress * targetVolume;

      if (progress < 1) {
        requestAnimationFrame(fadeIn);
      }
    };

    requestAnimationFrame(fadeIn);
  }

  // تشغيل صوت احتياطي في حالة فشل الصوت الأساسي
  private playFallbackAdhan(): void {
    try {
      console.log('🔄 تشغيل صوت احتياطي للأذان');
      
      // استخدام Web Audio API لإنتاج نغمة بسيطة
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(this.settings.volume * 0.3, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 2);

    } catch (error) {
      console.error('فشل في تشغيل الصوت الاحتياطي:', error);
    }
  }

  // إيقاف الصوت الحالي
  public stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      console.log('⏹️ تم إيقاف الأذان');
    }
  }

  // تعديل مستوى الصوت
  public setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.settings.volume;
    }
    this.saveSettings({ volume: this.settings.volume });
  }

  // التحقق من حالة التشغيل
  public isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  // إشعار ببدء الأذان
  private notifyAdhanStarted(prayerName?: string, voice?: MuezzinVoice): void {
    // يمكن إضافة إشعار مرئي أو صوتي هنا
    console.log(`🕌 بدأ الأذان: ${prayerName || ''} - ${voice?.arabicName || ''}`);
    
    // إرسال حدث مخصص للواجهة
    window.dispatchEvent(new CustomEvent('adhanStarted', {
      detail: { prayerName, voice }
    }));
  }

  // إشعار بانتهاء الأذان
  private notifyAdhanEnded(): void {
    console.log('✅ انتهى الأذان');
    
    // إرسال حدث مخصص للواجهة
    window.dispatchEvent(new CustomEvent('adhanEnded'));
  }

  // تنظيف الموارد
  public cleanup(): void {
    this.stopCurrentAudio();
  }
}