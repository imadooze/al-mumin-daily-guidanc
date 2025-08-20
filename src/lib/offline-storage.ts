/**
 * نظام التخزين المحلي للعمل أوفلاين
 * يدعم حفظ جميع البيانات المطلوبة بدون الحاجة للإنترنت
 */

export interface StoredLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timestamp: number;
}

export interface StoredPrayerData {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  qiblaDirection: number;
  distanceToMecca: number;
  date: string;
  hijriDate: string;
}

export interface StoredVerse {
  arabic: string;
  translation: string;
  reference: string;
  tafsir: string;
}

export interface StoredHadith {
  arabic: string;
  translation: string;
  reference: string;
  narrator: string;
  explanation: string;
}

class OfflineStorage {
  private static instance: OfflineStorage;

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  // حفظ الموقع
  saveLocation(location: StoredLocation): void {
    try {
      localStorage.setItem('offline_location', JSON.stringify(location));
    } catch (error) {
      console.error('خطأ في حفظ الموقع:', error);
    }
  }

  // جلب الموقع المحفوظ
  getStoredLocation(): StoredLocation | null {
    try {
      const stored = localStorage.getItem('offline_location');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('خطأ في جلب الموقع المحفوظ:', error);
      return null;
    }
  }

  // حفظ أوقات الصلاة
  savePrayerData(data: StoredPrayerData): void {
    try {
      localStorage.setItem('offline_prayer_data', JSON.stringify(data));
    } catch (error) {
      console.error('خطأ في حفظ أوقات الصلاة:', error);
    }
  }

  // جلب أوقات الصلاة المحفوظة
  getStoredPrayerData(): StoredPrayerData | null {
    try {
      const stored = localStorage.getItem('offline_prayer_data');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('خطأ في جلب أوقات الصلاة المحفوظة:', error);
      return null;
    }
  }

  // التحقق من صحة البيانات المحفوظة
  isDataValid(timestamp: number): boolean {
    const now = Date.now();
    const hoursSinceUpdate = (now - timestamp) / (1000 * 60 * 60);
    return hoursSinceUpdate < 24; // البيانات صالحة لمدة 24 ساعة
  }

  // التحقق من وجود الإنترنت
  async isOnline(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // محاولة الوصول إلى خدمة بسيطة للتأكد من الاتصال
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // حفظ حالة الاتصال
  setOnlineStatus(isOnline: boolean): void {
    localStorage.setItem('last_online_status', isOnline.toString());
    localStorage.setItem('last_online_check', Date.now().toString());
  }

  // جلب آخر حالة اتصال
  getLastOnlineStatus(): { isOnline: boolean; lastCheck: number } {
    const isOnline = localStorage.getItem('last_online_status') === 'true';
    const lastCheck = parseInt(localStorage.getItem('last_online_check') || '0');
    return { isOnline, lastCheck };
  }
}

export default OfflineStorage;