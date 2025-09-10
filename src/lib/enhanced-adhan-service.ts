/**
 * خدمة الأذان المحسنة مع دعم الإشعارات والعمل في الخلفية
 * Enhanced Adhan Service with notifications and background support
 */

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
  reminderBeforeMinutes: number;
  useVibration: boolean;
  persistentNotification: boolean;
}

export interface AdhanVoice {
  id: string;
  name: string;
  url: string;
  duration: number;
  description: string;
}

export interface PrayerSchedule {
  name: string;
  nameEn: string;
  time: string;
  timestamp: number;
  enabled: boolean;
}

// أصوات الأذان المتاحة
const ADHAN_VOICES: AdhanVoice[] = [
  {
    id: 'makkah',
    name: 'أذان الحرم المكي',
    url: '/audio/adhan-makkah.mp3',
    duration: 180,
    description: 'الأذان من الحرم المكي الشريف'
  },
  {
    id: 'madinah',
    name: 'أذان الحرم المدني',
    url: '/audio/adhan-madinah.mp3',
    duration: 170,
    description: 'الأذان من المسجد النبوي الشريف'
  },
  {
    id: 'traditional',
    name: 'أذان تقليدي',
    url: '/audio/adhan-traditional.mp3',
    duration: 165,
    description: 'أذان بصوت تقليدي جميل'
  },
  {
    id: 'simple',
    name: 'أذان بسيط',
    url: '/audio/adhan-simple.mp3',
    duration: 120,
    description: 'أذان بسيط وهادئ'
  }
];

export class EnhancedAdhanService {
  private static instance: EnhancedAdhanService;
  private settings: AdhanSettings;
  private currentAudio: HTMLAudioElement | null = null;
  private prayerMonitorInterval: NodeJS.Timeout | null = null;
  private nextPrayerTimeout: NodeJS.Timeout | null = null;
  private reminderTimeout: NodeJS.Timeout | null = null;
  private isPlaying = false;
  private hasPermission = false;
  private wakeLock: any = null;

  private constructor() {
    this.settings = this.loadSettings();
    this.requestNotificationPermission();
    this.initializeWakeLock();
  }

  static getInstance(): EnhancedAdhanService {
    if (!EnhancedAdhanService.instance) {
      EnhancedAdhanService.instance = new EnhancedAdhanService();
    }
    return EnhancedAdhanService.instance;
  }

  // تحميل الإعدادات من التخزين المحلي
  private loadSettings(): AdhanSettings {
    try {
      const saved = localStorage.getItem('adhan-settings');
      if (saved) {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('خطأ في تحميل إعدادات الأذان:', error);
    }
    return this.getDefaultSettings();
  }

  private getDefaultSettings(): AdhanSettings {
    return {
      enabled: true,
      volume: 0.8,
      selectedVoice: 'makkah',
      enabledPrayers: {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true
      },
      reminderBeforeMinutes: 5,
      useVibration: true,
      persistentNotification: true
    };
  }

  // حفظ الإعدادات
  saveSettings(newSettings: Partial<AdhanSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('adhan-settings', JSON.stringify(this.settings));
    console.log('✅ تم حفظ إعدادات الأذان');
  }

  getSettings(): AdhanSettings {
    return { ...this.settings };
  }

  getAvailableVoices(): AdhanVoice[] {
    return [...ADHAN_VOICES];
  }

  // طلب إذن الإشعارات
  private async requestNotificationPermission(): Promise<void> {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === 'granted';
        
        if (this.hasPermission) {
          console.log('✅ تم منح إذن الإشعارات');
        } else {
          console.warn('⚠️ لم يتم منح إذن الإشعارات');
        }
      }
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error);
    }
  }

  // تفعيل الحفاظ على اليقظة
  private async initializeWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        console.log('✅ Wake Lock API متوفر');
      }
    } catch (error) {
      console.warn('⚠️ Wake Lock غير متوفر:', error);
    }
  }

  // تشغيل الأذان
  async playAdhan(prayerName: string): Promise<void> {
    if (!this.settings.enabled || this.isPlaying) {
      return;
    }

    const prayerKey = this.getPrayerKey(prayerName);
    if (!prayerKey || !this.settings.enabledPrayers[prayerKey]) {
      console.log(`🔇 الأذان معطل للصلاة: ${prayerName}`);
      return;
    }

    try {
      this.isPlaying = true;
      
      // تفعيل الحفاظ على اليقظة
      await this.acquireWakeLock();
      
      // إظهار إشعار
      this.showPrayerNotification(prayerName);
      
      // تشغيل الاهتزاز
      this.triggerVibration();
      
      // تشغيل الصوت
      await this.playAudio();
      
      console.log(`🕌 تم تشغيل الأذان للصلاة: ${prayerName}`);
      
    } catch (error) {
      console.error('خطأ في تشغيل الأذان:', error);
      // تشغيل نغمة بديلة
      await this.playFallbackTone();
    } finally {
      this.isPlaying = false;
      this.releaseWakeLock();
    }
  }

  // تشغيل الصوت
  private async playAudio(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const voice = ADHAN_VOICES.find(v => v.id === this.settings.selectedVoice);
        if (!voice) {
          throw new Error('صوت الأذان غير موجود');
        }

        this.currentAudio = new Audio(voice.url);
        this.currentAudio.volume = this.settings.volume;
        this.currentAudio.preload = 'auto';
        
        this.currentAudio.onended = () => resolve();
        this.currentAudio.onerror = () => reject(new Error('فشل في تشغيل الصوت'));
        
        this.currentAudio.play().catch(reject);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // تشغيل نغمة بديلة باستخدام Web Audio API
  private async playFallbackTone(): Promise<void> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(this.settings.volume, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 2);
      
      console.log('🔔 تم تشغيل النغمة البديلة');
    } catch (error) {
      console.error('فشل في تشغيل النغمة البديلة:', error);
    }
  }

  // إظهار إشعار الصلاة
  private showPrayerNotification(prayerName: string): void {
    if (!this.hasPermission) return;

    try {
      const notification = new Notification(`حان وقت صلاة ${prayerName}`, {
        body: `حان الآن وقت صلاة ${prayerName}. توجه للصلاة.`,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'prayer-time',
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // إغلاق الإشعار تلقائياً بعد 30 ثانية
      setTimeout(() => notification.close(), 30000);

    } catch (error) {
      console.error('خطأ في إظهار الإشعار:', error);
    }
  }

  // تشغيل الاهتزاز
  private triggerVibration(): void {
    if (!this.settings.useVibration || !navigator.vibrate) return;

    try {
      // نمط اهتزاز للأذان
      navigator.vibrate([500, 200, 500, 200, 1000]);
      console.log('📳 تم تشغيل الاهتزاز');
    } catch (error) {
      console.error('خطأ في تشغيل الاهتزاز:', error);
    }
  }

  // بدء مراقبة أوقات الصلاة
  startPrayerMonitoring(prayerSchedule: PrayerSchedule[]): void {
    this.stopPrayerMonitoring();
    
    if (!this.settings.enabled || prayerSchedule.length === 0) {
      return;
    }

    console.log('🕌 بدء مراقبة أوقات الصلاة');
    
    // تحديث كل دقيقة
    this.prayerMonitorInterval = setInterval(() => {
      this.checkPrayerTimes(prayerSchedule);
    }, 60000);

    // فحص فوري
    this.checkPrayerTimes(prayerSchedule);
  }

  // فحص أوقات الصلاة
  private checkPrayerTimes(prayerSchedule: PrayerSchedule[]): void {
    const now = Date.now();
    
    for (const prayer of prayerSchedule) {
      if (!prayer.enabled) continue;
      
      const timeDiff = prayer.timestamp - now;
      
      // إذا حان وقت الصلاة (خلال الدقيقة الحالية)
      if (timeDiff >= 0 && timeDiff <= 60000) {
        this.playAdhan(prayer.name);
      }
      
      // تذكير قبل الصلاة
      const reminderTime = this.settings.reminderBeforeMinutes * 60 * 1000;
      if (timeDiff >= reminderTime - 30000 && timeDiff <= reminderTime + 30000) {
        this.showReminderNotification(prayer.name, this.settings.reminderBeforeMinutes);
      }
    }
  }

  // إشعار التذكير
  private showReminderNotification(prayerName: string, minutes: number): void {
    if (!this.hasPermission) return;

    try {
      new Notification(`تذكير: صلاة ${prayerName}`, {
        body: `صلاة ${prayerName} بعد ${minutes} دقائق`,
        icon: '/icon-192x192.png',
        tag: 'prayer-reminder',
        silent: true
      });
    } catch (error) {
      console.error('خطأ في إشعار التذكير:', error);
    }
  }

  // إيقاف مراقبة الأوقات
  stopPrayerMonitoring(): void {
    if (this.prayerMonitorInterval) {
      clearInterval(this.prayerMonitorInterval);
      this.prayerMonitorInterval = null;
      console.log('⏹️ تم إيقاف مراقبة أوقات الصلاة');
    }
  }

  // إيقاف الأذان
  stopAdhan(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    this.isPlaying = false;
    this.releaseWakeLock();
    console.log('⏹️ تم إيقاف الأذان');
  }

  // تشغيل معاينة صوت
  async playPreview(voiceId: string): Promise<void> {
    try {
      this.stopAdhan(); // إيقاف أي صوت حالي
      
      const voice = ADHAN_VOICES.find(v => v.id === voiceId);
      if (!voice) return;

      const audio = new Audio(voice.url);
      audio.volume = this.settings.volume;
      audio.currentTime = 0;
      
      // تشغيل 10 ثواني فقط للمعاينة
      audio.play();
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 10000);
      
    } catch (error) {
      console.error('خطأ في تشغيل المعاينة:', error);
    }
  }

  // الحصول على مفتاح الصلاة
  private getPrayerKey(prayerName: string): keyof AdhanSettings['enabledPrayers'] | null {
    const mapping: { [key: string]: keyof AdhanSettings['enabledPrayers'] } = {
      'الفجر': 'fajr',
      'Fajr': 'fajr',
      'الظهر': 'dhuhr', 
      'Dhuhr': 'dhuhr',
      'العصر': 'asr',
      'Asr': 'asr',
      'المغرب': 'maghrib',
      'Maghrib': 'maghrib',
      'العشاء': 'isha',
      'Isha': 'isha'
    };
    
    return mapping[prayerName] || null;
  }

  // الحفاظ على اليقظة
  private async acquireWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator && !this.wakeLock) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('🔆 تم تفعيل الحفاظ على اليقظة');
      }
    } catch (error) {
      console.warn('⚠️ فشل في تفعيل الحفاظ على اليقظة:', error);
    }
  }

  private releaseWakeLock(): void {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
      console.log('🔅 تم إلغاء الحفاظ على اليقظة');
    }
  }

  // تنظيف الموارد
  cleanup(): void {
    this.stopPrayerMonitoring();
    this.stopAdhan();
    this.releaseWakeLock();
  }

  // حالة الخدمة
  getStatus(): {
    isEnabled: boolean;
    isPlaying: boolean;
    hasPermission: boolean;
    isMonitoring: boolean;
  } {
    return {
      isEnabled: this.settings.enabled,
      isPlaying: this.isPlaying,
      hasPermission: this.hasPermission,
      isMonitoring: this.prayerMonitorInterval !== null
    };
  }
}