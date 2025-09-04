/**
 * نظام GPS محسن عالي الدقة والسرعة
 * يدعم مصادر متعددة للموقع مع تصفية الدقة والتعامل مع الأخطاء
 */

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GPSOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  desiredAccuracy?: number;
  maxRetries?: number;
  fallbackToNetwork?: boolean;
}

export interface GPSStatus {
  isActive: boolean;
  lastUpdate: number;
  accuracy: number;
  source: 'gps' | 'network' | 'passive' | 'cached';
  error?: string;
}

class EnhancedGPS {
  private static instance: EnhancedGPS;
  private watchId: number | null = null;
  private lastKnownPosition: GPSPosition | null = null;
  private positionCache: Map<string, GPSPosition> = new Map();
  private listeners: Set<(position: GPSPosition) => void> = new Set();
  private errorListeners: Set<(error: string) => void> = new Set();
  private status: GPSStatus = {
    isActive: false,
    lastUpdate: 0,
    accuracy: 0,
    source: 'cached'
  };

  private readonly CACHE_DURATION = 60000; // دقيقة واحدة
  private readonly HIGH_ACCURACY_THRESHOLD = 10; // 10 متر
  private readonly MEDIUM_ACCURACY_THRESHOLD = 50; // 50 متر
  private readonly MAX_POSITION_AGE = 30000; // 30 ثانية

  private constructor() {
    this.loadCachedPosition();
  }

  static getInstance(): EnhancedGPS {
    if (!EnhancedGPS.instance) {
      EnhancedGPS.instance = new EnhancedGPS();
    }
    return EnhancedGPS.instance;
  }

  /**
   * تحقق من دعم GPS
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * الحصول على الموقع الحالي بدقة عالية
   */
  async getCurrentPosition(options: GPSOptions = {}): Promise<GPSPosition> {
    const {
      enableHighAccuracy = true,
      timeout = 15000,
      maximumAge = 30000,
      desiredAccuracy = 10,
      maxRetries = 3,
      fallbackToNetwork = true
    } = options;

    // التحقق من وجود موقع مخزن حديث
    const cached = this.getCachedPosition();
    if (cached && cached.accuracy <= desiredAccuracy) {
      this.notifyListeners(cached);
      return cached;
    }

    let lastError: string = '';
    
    // محاولات متعددة للحصول على موقع دقيق
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`GPS محاولة ${attempt}/${maxRetries} - دقة مطلوبة: ${desiredAccuracy}م`);
        
        // إعدادات الدقة العالية
        const gpsOptions: PositionOptions = {
          enableHighAccuracy: true,
          timeout: timeout / attempt, // تقليل timeout مع كل محاولة
          maximumAge: attempt === 1 ? 0 : maximumAge
        };

        const position = await this.getPositionWithTimeout(gpsOptions);
        const gpsPosition = this.parsePosition(position, 'gps');

        // تصفية الدقة
        if (gpsPosition.accuracy <= desiredAccuracy) {
          console.log(`✅ GPS عالي الدقة: ${gpsPosition.accuracy.toFixed(1)}م`);
          this.updatePosition(gpsPosition);
          return gpsPosition;
        } else if (gpsPosition.accuracy <= this.MEDIUM_ACCURACY_THRESHOLD) {
          console.log(`⚠️ GPS متوسط الدقة: ${gpsPosition.accuracy.toFixed(1)}م`);
          this.updatePosition(gpsPosition);
          // الاستمرار للمحاولة مرة أخرى للحصول على دقة أفضل
        } else {
          lastError = `دقة منخفضة: ${gpsPosition.accuracy.toFixed(1)}م`;
          console.warn(lastError);
        }

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'خطأ غير معروف';
        console.warn(`فشل المحاولة ${attempt}: ${lastError}`);
        
        // محاولة الحصول على موقع من الشبكة في المحاولة الأخيرة
        if (attempt === maxRetries && fallbackToNetwork) {
          try {
            const networkPosition = await this.getNetworkPosition();
            console.log(`📡 استخدام موقع الشبكة: ${networkPosition.accuracy.toFixed(1)}م`);
            this.updatePosition(networkPosition);
            return networkPosition;
          } catch (networkError) {
            console.warn('فشل في الحصول على موقع الشبكة:', networkError);
          }
        }
      }
    }

    // استخدام آخر موقع معروف كملجأ أخير
    if (this.lastKnownPosition) {
      console.log('📍 استخدام آخر موقع معروف');
      this.notifyListeners(this.lastKnownPosition);
      return this.lastKnownPosition;
    }

    throw new Error(`فشل في تحديد الموقع: ${lastError}`);
  }

  /**
   * بدء مراقبة الموقع المستمرة
   */
  startWatching(options: GPSOptions = {}): void {
    if (this.watchId !== null) {
      this.stopWatching();
    }

    const {
      enableHighAccuracy = true,
      timeout = 10000,
      maximumAge = 5000
    } = options;

    console.log('🎯 بدء مراقبة GPS مستمرة');

    const gpsOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const gpsPosition = this.parsePosition(position, 'gps');
        console.log(`📍 تحديث موقع: ${gpsPosition.accuracy.toFixed(1)}م`);
        this.updatePosition(gpsPosition);
      },
      (error) => {
        const errorMsg = this.parseError(error);
        console.error('خطأ GPS:', errorMsg);
        this.status.error = errorMsg;
        this.notifyErrorListeners(errorMsg);
      },
      gpsOptions
    );

    this.status.isActive = true;
  }

  /**
   * إيقاف مراقبة الموقع
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.status.isActive = false;
    console.log('⏹️ إيقاف مراقبة GPS');
  }

  /**
   * الحصول على موقع من الشبكة (دقة أقل لكن أسرع)
   */
  private async getNetworkPosition(): Promise<GPSPosition> {
    const position = await this.getPositionWithTimeout({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 60000
    });
    return this.parsePosition(position, 'network');
  }

  /**
   * الحصول على الموقع مع timeout
   */
  private getPositionWithTimeout(options: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('انتهى وقت الانتظار للحصول على الموقع'));
      }, options.timeout || 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve(position);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(new Error(this.parseError(error)));
        },
        options
      );
    });
  }

  /**
   * تحليل موقع GPS
   */
  private parsePosition(position: GeolocationPosition, source: GPSStatus['source']): GPSPosition {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
      timestamp: position.timestamp
    };
  }

  /**
   * تحديث الموقع الحالي
   */
  private updatePosition(position: GPSPosition): void {
    this.lastKnownPosition = position;
    this.status.lastUpdate = Date.now();
    this.status.accuracy = position.accuracy;
    this.status.error = undefined;

    // حفظ في الكاش
    this.cachePosition(position);
    
    // إشعار المستمعين
    this.notifyListeners(position);
  }

  /**
   * حفظ الموقع في الكاش
   */
  private cachePosition(position: GPSPosition): void {
    const key = `${Date.now()}`;
    this.positionCache.set(key, position);
    
    // حفظ محلي
    localStorage.setItem('enhanced-gps-cache', JSON.stringify({
      position,
      timestamp: Date.now()
    }));

    // تنظيف الكاش القديم
    this.cleanupCache();
  }

  /**
   * الحصول على موقع مخزن
   */
  private getCachedPosition(): GPSPosition | null {
    try {
      const cached = localStorage.getItem('enhanced-gps-cache');
      if (cached) {
        const data = JSON.parse(cached);
        const age = Date.now() - data.timestamp;
        
        if (age < this.CACHE_DURATION) {
          console.log(`📱 استخدام موقع مخزن (عمر: ${Math.round(age/1000)}ث)`);
          return data.position;
        }
      }
    } catch (error) {
      console.warn('خطأ في قراءة الكاش:', error);
    }
    return null;
  }

  /**
   * تحميل الموقع المخزن عند البدء
   */
  private loadCachedPosition(): void {
    const cached = this.getCachedPosition();
    if (cached) {
      this.lastKnownPosition = cached;
      this.status.accuracy = cached.accuracy;
      this.status.source = 'cached';
    }
  }

  /**
   * تنظيف الكاش القديم
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, position] of this.positionCache.entries()) {
      if (now - position.timestamp > this.CACHE_DURATION) {
        this.positionCache.delete(key);
      }
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
        return 'انتهى وقت الانتظار لتحديد الموقع';
      default:
        return error.message || 'خطأ غير معروف في تحديد الموقع';
    }
  }

  /**
   * إضافة مستمع للموقع
   */
  addListener(callback: (position: GPSPosition) => void): void {
    this.listeners.add(callback);
  }

  /**
   * إزالة مستمع الموقع
   */
  removeListener(callback: (position: GPSPosition) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * إضافة مستمع للأخطاء
   */
  addErrorListener(callback: (error: string) => void): void {
    this.errorListeners.add(callback);
  }

  /**
   * إزالة مستمع الأخطاء
   */
  removeErrorListener(callback: (error: string) => void): void {
    this.errorListeners.delete(callback);
  }

  /**
   * إشعار المستمعين
   */
  private notifyListeners(position: GPSPosition): void {
    this.listeners.forEach(callback => {
      try {
        callback(position);
      } catch (error) {
        console.error('خطأ في مستمع GPS:', error);
      }
    });
  }

  /**
   * إشعار مستمعي الأخطاء
   */
  private notifyErrorListeners(error: string): void {
    this.errorListeners.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('خطأ في مستمع أخطاء GPS:', err);
      }
    });
  }

  /**
   * الحصول على حالة GPS
   */
  getStatus(): GPSStatus {
    return { ...this.status };
  }

  /**
   * الحصول على آخر موقع معروف
   */
  getLastKnownPosition(): GPSPosition | null {
    return this.lastKnownPosition;
  }

  /**
   * تحديد مستوى الدقة
   */
  getAccuracyLevel(accuracy: number): 'high' | 'medium' | 'low' {
    if (accuracy <= this.HIGH_ACCURACY_THRESHOLD) return 'high';
    if (accuracy <= this.MEDIUM_ACCURACY_THRESHOLD) return 'medium';
    return 'low';
  }

  /**
   * تنظيف الموارد
   */
  cleanup(): void {
    this.stopWatching();
    this.listeners.clear();
    this.errorListeners.clear();
    this.positionCache.clear();
  }
}

export default EnhancedGPS;