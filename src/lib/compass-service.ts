/**
 * خدمة البوصلة للعمل مع حساس الاتجاه
 * لتحديد اتجاه القبلة بدقة
 */

export interface CompassData {
  heading: number;
  accuracy: number;
  isCalibrated: boolean;
}

export interface QiblaCompassData {
  userHeading: number;
  qiblaDirection: number;
  qiblaRelativeDirection: number;
  accuracy: number;
  isCalibrated: boolean;
}

class CompassService {
  private static instance: CompassService;
  private currentHeading: number = 0;
  private accuracy: number = 0;
  private isCalibrated: boolean = false;
  private callbacks: ((data: CompassData) => void)[] = [];
  private isWatching: boolean = false;
  private watchId: number | null = null;

  private constructor() {
    this.checkCompassSupport();
  }

  static getInstance(): CompassService {
    if (!CompassService.instance) {
      CompassService.instance = new CompassService();
    }
    return CompassService.instance;
  }

  // التحقق من دعم البوصلة
  private checkCompassSupport(): boolean {
    return 'DeviceOrientationEvent' in window;
  }

  // بدء مراقبة البوصلة
  public startWatching(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isWatching) {
        resolve(true);
        return;
      }

      if (!this.checkCompassSupport()) {
        reject(new Error('البوصلة غير مدعومة في هذا الجهاز'));
        return;
      }

      // طلب إذن الوصول للحساسات في iOS
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((permission: string) => {
            if (permission === 'granted') {
              this.setupCompassListener();
              resolve(true);
            } else {
              reject(new Error('تم رفض إذن الوصول للبوصلة'));
            }
          })
          .catch((error: any) => {
            reject(new Error('خطأ في طلب إذن البوصلة: ' + error.message));
          });
      } else {
        // للأجهزة الأخرى
        this.setupCompassListener();
        resolve(true);
      }
    });
  }

  // إعداد مستمع البوصلة
  private setupCompassListener(): void {
    const handleOrientationChange = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        // تحويل الزاوية لتكون بين 0-360
        let heading = 360 - event.alpha;
        if (heading < 0) heading += 360;
        if (heading >= 360) heading -= 360;

        this.currentHeading = heading;
        this.accuracy = event.alpha ? 10 : 0; // دقة تقديرية
        this.isCalibrated = Math.abs(event.alpha) > 0;

        // إشعار جميع المستمعين
        const compassData: CompassData = {
          heading: this.currentHeading,
          accuracy: this.accuracy,
          isCalibrated: this.isCalibrated
        };

        this.callbacks.forEach(callback => callback(compassData));
      }
    };

    window.addEventListener('deviceorientation', handleOrientationChange);
    this.isWatching = true;
  }

  // إيقاف مراقبة البوصلة
  public stopWatching(): void {
    if (this.isWatching) {
      window.removeEventListener('deviceorientation', this.setupCompassListener);
      this.isWatching = false;
    }
  }

  // إضافة مستمع للتغييرات
  public addCompassListener(callback: (data: CompassData) => void): void {
    this.callbacks.push(callback);
  }

  // إزالة مستمع
  public removeCompassListener(callback: (data: CompassData) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  // حساب اتجاه القبلة النسبي
  public calculateQiblaCompass(
    latitude: number, 
    longitude: number
  ): QiblaCompassData {
    // حساب اتجاه القبلة الجغرافي
    const qiblaDirection = this.calculateQiblaDirection(latitude, longitude);
    
    // حساب الاتجاه النسبي للقبلة بالنسبة لاتجاه المستخدم
    let qiblaRelativeDirection = qiblaDirection - this.currentHeading;
    if (qiblaRelativeDirection < 0) qiblaRelativeDirection += 360;
    if (qiblaRelativeDirection >= 360) qiblaRelativeDirection -= 360;

    return {
      userHeading: this.currentHeading,
      qiblaDirection,
      qiblaRelativeDirection,
      accuracy: this.accuracy,
      isCalibrated: this.isCalibrated
    };
  }

  // حساب اتجاه القبلة (نفس الحساب من prayer-calculator)
  private calculateQiblaDirection(latitude: number, longitude: number): number {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    
    const lat1 = latitude * Math.PI / 180;
    const lat2 = meccaLat * Math.PI / 180;
    const deltaLng = (meccaLng - longitude) * Math.PI / 180;
    
    const y = Math.sin(deltaLng);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltaLng);
    
    let qibla = Math.atan2(y, x) * 180 / Math.PI;
    qibla = (qibla + 360) % 360;
    
    return Math.round(qibla);
  }

  // الحصول على القراءة الحالية
  public getCurrentHeading(): number {
    return this.currentHeading;
  }

  // التحقق من حالة المعايرة
  public isCompassCalibrated(): boolean {
    return this.isCalibrated;
  }

  // الحصول على دقة البوصلة
  public getAccuracy(): number {
    return this.accuracy;
  }

  // معايرة البوصلة
  public calibrateCompass(): Promise<boolean> {
    return new Promise((resolve) => {
      // محاولة الحصول على قراءة دقيقة
      let calibrationCount = 0;
      const maxCalibrationTries = 10;
      
      const calibrationInterval = setInterval(() => {
        calibrationCount++;
        
        if (this.isCalibrated || calibrationCount >= maxCalibrationTries) {
          clearInterval(calibrationInterval);
          resolve(this.isCalibrated);
        }
      }, 500);
    });
  }

  // إعادة تعيين البوصلة
  public resetCompass(): void {
    this.currentHeading = 0;
    this.accuracy = 0;
    this.isCalibrated = false;
  }
}

export default CompassService;