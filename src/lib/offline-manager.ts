/**
 * مدير العمل أوفلاين وأونلاين
 * يدير التزامن والتحديث التلقائي للبيانات
 */

import OfflineStorage from './offline-storage';
import PrayerCalculator from './prayer-calculator';
import QuranStorage from './quran-storage';
import AzkarStorage from './azkar-storage';
import { getPrayerTimes, getCurrentLocation } from './prayer-api';

export interface OfflineData {
  location: any;
  prayerTimes: any;
  verses: any[];
  hadiths: any[];
  azkar: any[];
  lastUpdate: number;
  isOffline: boolean;
}

class OfflineManager {
  private static instance: OfflineManager;
  private offlineStorage: OfflineStorage;
  private prayerCalculator: PrayerCalculator;
  private quranStorage: QuranStorage;
  private azkarStorage: AzkarStorage;
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.offlineStorage = OfflineStorage.getInstance();
    this.prayerCalculator = PrayerCalculator.getInstance();
    this.quranStorage = QuranStorage.getInstance();
    this.azkarStorage = AzkarStorage.getInstance();
    
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  // إعداد مستمعي الأحداث
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.offlineStorage.setOnlineStatus(true);
      this.syncData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.offlineStorage.setOnlineStatus(false);
    });
  }

  // بدء المزامنة الدورية
  private startPeriodicSync(): void {
    // مزامنة كل 30 دقيقة عند وجود الإنترنت
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncData();
      }
    }, 30 * 60 * 1000);
  }

  // إيقاف المزامنة الدورية
  public stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // جلب جميع البيانات (أوفلاين أو أونلاين)
  public async getAllData(): Promise<OfflineData> {
    const isOnline = await this.offlineStorage.isOnline();
    
    if (isOnline) {
      // محاولة جلب البيانات من الإنترنت
      try {
        const onlineData = await this.fetchOnlineData();
        await this.saveDataOffline(onlineData);
        return {
          ...onlineData,
          isOffline: false,
          lastUpdate: Date.now()
        };
      } catch (error) {
        console.error('خطأ في جلب البيانات من الإنترنت:', error);
        // الرجوع للبيانات المحفوظة محلياً
        return this.getOfflineData();
      }
    } else {
      // استخدام البيانات المحفوظة محلياً
      return this.getOfflineData();
    }
  }

  // جلب البيانات من الإنترنت
  private async fetchOnlineData(): Promise<Omit<OfflineData, 'isOffline' | 'lastUpdate'>> {
    const location = await getCurrentLocation();
    const prayerData = await getPrayerTimes(location.latitude, location.longitude);
    
    // حساب اتجاه القبلة والمسافة
    const qiblaDirection = this.prayerCalculator.calculateQiblaDirection(
      location.latitude, 
      location.longitude
    );
    const distanceToMecca = this.prayerCalculator.calculateDistanceToMecca(
      location.latitude, 
      location.longitude
    );

    return {
      location,
      prayerTimes: {
        ...prayerData,
        qiblaDirection,
        distanceToMecca
      },
      verses: this.quranStorage.getDailyVerses(),
      hadiths: this.azkarStorage.getHadiths(),
      azkar: this.azkarStorage.getAllAzkar()
    };
  }

  // جلب البيانات المحفوظة محلياً
  private getOfflineData(): OfflineData {
    const storedLocation = this.offlineStorage.getStoredLocation();
    const storedPrayerData = this.offlineStorage.getStoredPrayerData();
    
    let prayerTimes;
    let location = storedLocation;

    if (storedLocation && storedPrayerData && 
        this.offlineStorage.isDataValid(storedLocation.timestamp)) {
      // استخدام البيانات المحفوظة إذا كانت صالحة
      prayerTimes = storedPrayerData;
    } else if (storedLocation) {
      // حساب أوقات الصلاة محلياً باستخدام الإحداثيات المحفوظة
      const calculatedTimes = this.prayerCalculator.calculatePrayerTimes(
        storedLocation.latitude,
        storedLocation.longitude
      );
      
      prayerTimes = {
        timings: {
          Fajr: calculatedTimes.fajr,
          Sunrise: calculatedTimes.sunrise,
          Dhuhr: calculatedTimes.dhuhr,
          Asr: calculatedTimes.asr,
          Maghrib: calculatedTimes.maghrib,
          Isha: calculatedTimes.isha
        },
        qiblaDirection: this.prayerCalculator.calculateQiblaDirection(
          storedLocation.latitude, 
          storedLocation.longitude
        ),
        distanceToMecca: this.prayerCalculator.calculateDistanceToMecca(
          storedLocation.latitude, 
          storedLocation.longitude
        ),
        date: new Date().toISOString().split('T')[0],
        hijriDate: this.getHijriDate()
      };
    } else {
      // استخدام بيانات افتراضية
      location = {
        latitude: 24.7136,
        longitude: 46.6753,
        city: 'الرياض',
        country: 'السعودية',
        timestamp: Date.now()
      };
      
      const calculatedTimes = this.prayerCalculator.calculatePrayerTimes(
        location.latitude,
        location.longitude
      );
      
      prayerTimes = {
        timings: {
          Fajr: calculatedTimes.fajr,
          Sunrise: calculatedTimes.sunrise,
          Dhuhr: calculatedTimes.dhuhr,
          Asr: calculatedTimes.asr,
          Maghrib: calculatedTimes.maghrib,
          Isha: calculatedTimes.isha
        },
        qiblaDirection: this.prayerCalculator.calculateQiblaDirection(
          location.latitude, 
          location.longitude
        ),
        distanceToMecca: this.prayerCalculator.calculateDistanceToMecca(
          location.latitude, 
          location.longitude
        ),
        date: new Date().toISOString().split('T')[0],
        hijriDate: this.getHijriDate()
      };
    }

    return {
      location,
      prayerTimes,
      verses: this.quranStorage.getDailyVerses(),
      hadiths: this.azkarStorage.getHadiths(),
      azkar: this.azkarStorage.getAllAzkar(),
      lastUpdate: storedLocation?.timestamp || 0,
      isOffline: true
    };
  }

  // حفظ البيانات محلياً
  private async saveDataOffline(data: Omit<OfflineData, 'isOffline' | 'lastUpdate'>): Promise<void> {
    // حفظ الموقع
    this.offlineStorage.saveLocation({
      ...data.location,
      timestamp: Date.now()
    });

    // حفظ أوقات الصلاة
    this.offlineStorage.savePrayerData({
      timings: data.prayerTimes.timings,
      qiblaDirection: data.prayerTimes.qiblaDirection,
      distanceToMecca: data.prayerTimes.distanceToMecca,
      date: data.prayerTimes.date?.readable || new Date().toISOString().split('T')[0],
      hijriDate: data.prayerTimes.date?.hijri ? 
        `${data.prayerTimes.date.hijri.date} ${data.prayerTimes.date.hijri.month.ar} ${data.prayerTimes.date.hijri.year} هـ` :
        this.getHijriDate()
    });
  }

  // مزامنة البيانات
  public async syncData(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const onlineData = await this.fetchOnlineData();
      await this.saveDataOffline(onlineData);
      console.log('تم تحديث البيانات بنجاح');
    } catch (error) {
      console.error('خطأ في مزامنة البيانات:', error);
    }
  }

  // حساب التاريخ الهجري التقريبي
  private getHijriDate(): string {
    const gregorianDate = new Date();
    const hijriYear = gregorianDate.getFullYear() - 579;
    const hijriMonths = [
      'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
      'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];
    const hijriMonth = hijriMonths[gregorianDate.getMonth()];
    return `${gregorianDate.getDate()} ${hijriMonth} ${hijriYear} هـ`;
  }

  // فرض التحديث
  public async forceUpdate(): Promise<OfflineData> {
    if (this.isOnline) {
      try {
        const onlineData = await this.fetchOnlineData();
        await this.saveDataOffline(onlineData);
        return {
          ...onlineData,
          isOffline: false,
          lastUpdate: Date.now()
        };
      } catch (error) {
        console.error('خطأ في التحديث القسري:', error);
        return this.getOfflineData();
      }
    } else {
      return this.getOfflineData();
    }
  }

  // جلب القرآن
  public getQuranData() {
    return {
      surahs: this.quranStorage.getSurahs(),
      verses: this.quranStorage.getDailyVerses(),
      randomVerse: this.quranStorage.getRandomVerse(),
      ayatAlKursi: this.quranStorage.getAyatAlKursi()
    };
  }

  // جلب الأذكار والأحاديث
  public getAzkarData() {
    return {
      morningAzkar: this.azkarStorage.getMorningAzkar(),
      eveningAzkar: this.azkarStorage.getEveningAzkar(),
      prayerAzkar: this.azkarStorage.getPrayerAzkar(),
      generalAzkar: this.azkarStorage.getGeneralAzkar(),
      hadiths: this.azkarStorage.getHadiths(),
      randomHadith: this.azkarStorage.getRandomHadith()
    };
  }

  // التحقق من حالة الإنترنت
  public async checkOnlineStatus(): Promise<boolean> {
    this.isOnline = await this.offlineStorage.isOnline();
    this.offlineStorage.setOnlineStatus(this.isOnline);
    return this.isOnline;
  }

  // الحصول على حالة الإنترنت
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }
}

export default OfflineManager;