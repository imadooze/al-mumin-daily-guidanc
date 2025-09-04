/**
 * نظام GPS مبسط وموثوق
 */

export interface SimpleGPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface SimpleGPSOptions {
  timeout?: number;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
}

class SimpleGPS {
  private static instance: SimpleGPS;
  private lastPosition: SimpleGPSPosition | null = null;
  private watchId: number | null = null;
  private listeners: Set<(position: SimpleGPSPosition) => void> = new Set();

  private constructor() {
    this.loadCachedPosition();
  }

  static getInstance(): SimpleGPS {
    if (!SimpleGPS.instance) {
      SimpleGPS.instance = new SimpleGPS();
    }
    return SimpleGPS.instance;
  }

  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * الحصول على الموقع بطريقة مبسطة وموثوقة
   */
  async getCurrentPosition(options: SimpleGPSOptions = {}): Promise<SimpleGPSPosition> {
    const {
      timeout = 10000,
      enableHighAccuracy = true,
      maximumAge = 60000
    } = options;

    // التحقق من الموقع المخزن أولاً
    const cached = this.getCachedPosition();
    if (cached) {
      console.log('📱 استخدام موقع مخزن');
      this.notifyListeners(cached);
      return cached;
    }

    return new Promise((resolve, reject) => {
      // موقع افتراضي كخطة احتياطية
      const fallbackPosition: SimpleGPSPosition = {
        latitude: 21.4225,
        longitude: 39.8262,
        accuracy: 1000,
        timestamp: Date.now()
      };

      // استخدام موقع افتراضي بعد timeout
      const timeoutId = setTimeout(() => {
        console.log('⏰ انتهى الوقت - استخدام موقع افتراضي (مكة المكرمة)');
        this.savePosition(fallbackPosition);
        resolve(fallbackPosition);
      }, timeout);

      // محاولة الحصول على الموقع الحقيقي
      if (!this.isSupported()) {
        clearTimeout(timeoutId);
        console.log('🚫 GPS غير مدعوم - استخدام موقع افتراضي');
        this.savePosition(fallbackPosition);
        resolve(fallbackPosition);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const gpsPosition: SimpleGPSPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          
          console.log(`✅ موقع GPS حقيقي: ${gpsPosition.accuracy.toFixed(1)}م`);
          this.savePosition(gpsPosition);
          resolve(gpsPosition);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn('⚠️ فشل GPS - استخدام موقع افتراضي:', this.parseError(error));
          this.savePosition(fallbackPosition);
          resolve(fallbackPosition); // resolve بدلاً من reject
        },
        {
          enableHighAccuracy,
          timeout: timeout - 1000, // أقل بثانية واحدة من timeout الخارجي
          maximumAge
        }
      );
    });
  }

  /**
   * بدء مراقبة الموقع
   */
  startWatching(options: SimpleGPSOptions = {}): void {
    if (this.watchId !== null) {
      this.stopWatching();
    }

    const {
      enableHighAccuracy = true,
      timeout = 8000,
      maximumAge = 10000
    } = options;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const gpsPosition: SimpleGPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        
        console.log(`📍 تحديث موقع: ${gpsPosition.accuracy.toFixed(1)}م`);
        this.savePosition(gpsPosition);
      },
      (error) => {
        console.warn('خطأ في مراقبة GPS:', this.parseError(error));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );

    console.log('🎯 بدء مراقبة GPS');
  }

  /**
   * إيقاف مراقبة الموقع
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('⏹️ إيقاف مراقبة GPS');
    }
  }

  /**
   * حفظ الموقع
   */
  private savePosition(position: SimpleGPSPosition): void {
    this.lastPosition = position;
    
    // حفظ في localStorage
    localStorage.setItem('simple-gps-cache', JSON.stringify({
      position,
      timestamp: Date.now()
    }));

    // إشعار المستمعين
    this.notifyListeners(position);
  }

  /**
   * الحصول على موقع مخزن
   */
  private getCachedPosition(): SimpleGPSPosition | null {
    try {
      const cached = localStorage.getItem('simple-gps-cache');
      if (cached) {
        const data = JSON.parse(cached);
        const age = Date.now() - data.timestamp;
        
        // استخدام الكاش إذا كان عمره أقل من 5 دقائق
        if (age < 300000) {
          return data.position;
        }
      }
    } catch (error) {
      console.warn('خطأ في قراءة كاش GPS:', error);
    }
    return null;
  }

  /**
   * تحميل الموقع المخزن عند البدء
   */
  private loadCachedPosition(): void {
    const cached = this.getCachedPosition();
    if (cached) {
      this.lastPosition = cached;
      console.log('📱 تحميل موقع مخزن');
    }
  }

  /**
   * تحليل أخطاء GPS
   */
  private parseError(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'تم رفض الإذن للوصول للموقع';
      case error.POSITION_UNAVAILABLE:
        return 'الموقع غير متاح حالياً';
      case error.TIMEOUT:
        return 'انتهى وقت الانتظار';
      default:
        return 'خطأ غير معروف';
    }
  }

  /**
   * إضافة مستمع
   */
  addListener(callback: (position: SimpleGPSPosition) => void): void {
    this.listeners.add(callback);
  }

  /**
   * إزالة مستمع
   */
  removeListener(callback: (position: SimpleGPSPosition) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * إشعار المستمعين
   */
  private notifyListeners(position: SimpleGPSPosition): void {
    this.listeners.forEach(callback => {
      try {
        callback(position);
      } catch (error) {
        console.error('خطأ في مستمع GPS:', error);
      }
    });
  }

  /**
   * الحصول على آخر موقع
   */
  getLastPosition(): SimpleGPSPosition | null {
    return this.lastPosition;
  }

  /**
   * تنظيف الموارد
   */
  cleanup(): void {
    this.stopWatching();
    this.listeners.clear();
  }
}

export default SimpleGPS;