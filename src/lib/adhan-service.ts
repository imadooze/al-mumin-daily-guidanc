import { PrayerData } from './prayer-api';

export interface AdhanSettings {
  enabled: boolean;
  volume: number;
  selectedVoice: string;
  enabledPrayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

export interface AdhanVoice {
  id: string;
  name: string;
  url: string;
  duration: number;
}

export class AdhanService {
  private static instance: AdhanService;
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;
  private settings: AdhanSettings;
  private intervalId: NodeJS.Timeout | null = null;
  private onAdhanCallback?: (prayerName: string) => void;

  // أصوات الأذان المتاحة (5 أصوات مختلفة)
  private readonly availableVoices: AdhanVoice[] = [
    {
      id: 'mecca',
      name: 'الحرم المكي',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      duration: 180
    },
    {
      id: 'medina',
      name: 'الحرم المدني',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav', 
      duration: 165
    },
    {
      id: 'qari1',
      name: 'القارئ الأول',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav',
      duration: 150
    },
    {
      id: 'qari2', 
      name: 'القارئ الثاني',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-02.wav',
      duration: 155
    },
    {
      id: 'qari3',
      name: 'القارئ الثالث', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
      duration: 170
    }
  ];

  private constructor() {
    // إعدادات افتراضية
    this.settings = {
      enabled: true,
      volume: 0.7,
      selectedVoice: 'mecca',
      enabledPrayers: {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true
      }
    };
    
    // تحميل الإعدادات من localStorage
    this.loadSettings();
  }

  public static getInstance(): AdhanService {
    if (!AdhanService.instance) {
      AdhanService.instance = new AdhanService();
    }
    return AdhanService.instance;
  }

  private loadSettings(): void {
    const savedSettings = localStorage.getItem('adhan-settings');
    if (savedSettings) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.error('خطأ في تحميل إعدادات الأذان:', error);
      }
    }
  }

  private saveSettings(): void {
    localStorage.setItem('adhan-settings', JSON.stringify(this.settings));
  }

  public updateSettings(newSettings: Partial<AdhanSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public getSettings(): AdhanSettings {
    return { ...this.settings };
  }

  // تشغيل أذان صوتي حقيقي
  private async playRealAdhan(): Promise<void> {
    const selectedVoice = this.availableVoices.find(v => v.id === this.settings.selectedVoice) 
      || this.availableVoices[0];

    try {
      // إيقاف أي صوت حالي
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      // إنشاء عنصر صوتي جديد
      this.currentAudio = new Audio(selectedVoice.url);
      this.currentAudio.volume = this.settings.volume;
      this.currentAudio.preload = 'auto';

      // تشغيل الصوت
      await this.currentAudio.play();

      // مراقبة انتهاء التشغيل
      this.currentAudio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.currentAudio = null;
      });

      this.currentAudio.addEventListener('error', (e) => {
        console.error('خطأ في تشغيل الأذان:', e);
        this.isPlaying = false;
        this.currentAudio = null;
        // تشغيل نغمة بديلة في حالة فشل الصوت
        this.generateAdhanTones();
      });

    } catch (error) {
      console.error('فشل في تشغيل الأذان الصوتي:', error);
      // تشغيل نغمة بديلة
      this.generateAdhanTones();
    }
  }

  // تشغيل الأذان باستخدام Web Audio API للتردد (نسخة احتياطية)
  private generateAdhanTones(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // ترددات أساسية للأذان (تقريبية)
    const frequencies = [
      { freq: 440, duration: 0.8 }, // لا
      { freq: 494, duration: 0.8 }, // سي
      { freq: 523, duration: 1.2 }, // دو
      { freq: 494, duration: 0.8 }, // سي
      { freq: 440, duration: 1.0 }, // لا
      { freq: 392, duration: 0.8 }, // صول
      { freq: 349, duration: 1.2 }, // فا
    ];

    let currentTime = this.audioContext.currentTime;

    frequencies.forEach(({ freq, duration }) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.frequency.setValueAtTime(freq, currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.3, currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.3, currentTime + duration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
      
      currentTime += duration + 0.2;
    });
  }

  // تشغيل الأذان الصوتي الحقيقي
  public async playAdhan(prayerName: string): Promise<void> {
    if (!this.settings.enabled || this.isPlaying) {
      return;
    }

    // التحقق من أن هذه الصلاة مُفعلة
    const prayerKey = prayerName.toLowerCase() as keyof typeof this.settings.enabledPrayers;
    if (!this.settings.enabledPrayers[prayerKey]) {
      return;
    }

    try {
      this.isPlaying = true;
      
      // عرض إشعار
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`حان موعد صلاة ${this.getPrayerNameArabic(prayerName)}`, {
          body: 'حان الآن موعد الصلاة',
          icon: '/favicon.ico'
        });
      }

      // تشغيل الأذان الصوتي الحقيقي
      await this.playRealAdhan();
      
      // استدعاء callback إذا كان متاحاً
      if (this.onAdhanCallback) {
        this.onAdhanCallback(prayerName);
      }

    } catch (error) {
      console.error('خطأ في تشغيل الأذان:', error);
      this.isPlaying = false;
    }
  }

  private getPrayerNameArabic(prayerName: string): string {
    const names: Record<string, string> = {
      'fajr': 'الفجر',
      'dhuhr': 'الظهر',
      'asr': 'العصر',
      'maghrib': 'المغرب',
      'isha': 'العشاء'
    };
    return names[prayerName.toLowerCase()] || prayerName;
  }

  // بدء مراقبة أوقات الصلاة
  public startPrayerMonitoring(prayerData: PrayerData): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // فحص كل دقيقة
    this.intervalId = setInterval(() => {
      this.checkPrayerTime(prayerData);
    }, 60000); // فحص كل دقيقة

    // فحص فوري
    this.checkPrayerTime(prayerData);
  }

  private checkPrayerTime(prayerData: PrayerData): void {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const prayers = [
      { name: 'fajr', time: prayerData.timings.Fajr.substring(0, 5) },
      { name: 'dhuhr', time: prayerData.timings.Dhuhr.substring(0, 5) },
      { name: 'asr', time: prayerData.timings.Asr.substring(0, 5) },
      { name: 'maghrib', time: prayerData.timings.Maghrib.substring(0, 5) },
      { name: 'isha', time: prayerData.timings.Isha.substring(0, 5) }
    ];

    // التحقق من مطابقة الوقت الحالي مع أي من أوقات الصلاة
    const currentPrayer = prayers.find(prayer => prayer.time === currentTime);
    if (currentPrayer) {
      this.playAdhan(currentPrayer.name);
    }
  }

  // إيقاف مراقبة أوقات الصلاة
  public stopPrayerMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // تعيين callback للأذان
  public setAdhanCallback(callback: (prayerName: string) => void): void {
    this.onAdhanCallback = callback;
  }

  // طلب إذن الإشعارات
  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // إيقاف الأذان الحالي
  public stopAdhan(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  // الحصول على قائمة الأصوات المتاحة
  public getAvailableVoices(): AdhanVoice[] {
    return [...this.availableVoices];
  }

  // تحديث صوت الأذان المختار
  public updateSelectedVoice(voiceId: string): void {
    this.settings.selectedVoice = voiceId;
    this.saveSettings();
  }

  // تشغيل عينة من الصوت المختار
  public async playVoicePreview(voiceId: string): Promise<void> {
    const voice = this.availableVoices.find(v => v.id === voiceId);
    if (!voice || this.isPlaying) return;

    try {
      const audio = new Audio(voice.url);
      audio.volume = this.settings.volume;
      audio.currentTime = 0;
      
      // تشغيل لمدة 10 ثوانٍ فقط كعينة
      await audio.play();
      setTimeout(() => {
        audio.pause();
      }, 10000);
      
    } catch (error) {
      console.error('فشل في تشغيل العينة:', error);
    }
  }
}