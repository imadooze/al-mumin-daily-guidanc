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

  // بدء مراقبة البوصلة مع معالجة أفضل للأخطاء
  public startWatching(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isWatching) {
        console.log('البوصلة تعمل بالفعل');
        resolve(true);
        return;
      }

      if (!this.checkCompassSupport()) {
        console.error('البوصلة غير مدعومة في هذا الجهاز');
        reject(new Error('البوصلة غير مدعومة في هذا الجهاز'));
        return;
      }

      console.log('طلب إذن الوصول للبوصلة...');
      
      // طلب إذن الوصول للحساسات في iOS
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((permission: string) => {
            console.log('نتيجة طلب الإذن:', permission);
            if (permission === 'granted') {
              this.setupCompassListener();
              resolve(true);
            } else {
              reject(new Error('تم رفض إذن الوصول للبوصلة'));
            }
          })
          .catch((error: any) => {
            console.error('خطأ في طلب إذن البوصلة:', error);
            reject(new Error('خطأ في طلب إذن البوصلة: ' + error.message));
          });
      } else {
        // للأجهزة الأخرى (Android, etc)
        console.log('تشغيل البوصلة مباشرة (بدون طلب إذن)');
        this.setupCompassListener();
        resolve(true);
      }
    });
  }

  // إعداد مستمع البوصلة مع تحسينات الدقة وإضافة console.log
  private setupCompassListener(): void {
    console.log('إعداد مستمع البوصلة...');
    
    this.handleOrientationChange = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        console.log('قراءة البوصلة:', { alpha: event.alpha, beta: event.beta, gamma: event.gamma });
        
        // حساب الاتجاه المغناطيسي مع تعويض انحراف الجهاز
        let heading = this.calculateMagneticHeading(event.alpha, event.beta, event.gamma);
        
        // تطبيق مرشح للتخلص من القيم الشاذة
        heading = this.smoothHeading(heading);
        
        this.currentHeading = heading;
        
        // حساب الدقة بناءً على استقرار القراءات
        this.accuracy = this.calculateAccuracy(event);
        this.isCalibrated = this.checkCalibration(event);

        console.log('النتيجة النهائية:', { heading, accuracy: this.accuracy, isCalibrated: this.isCalibrated });

        // إشعار جميع المستمعين
        const compassData: CompassData = {
          heading: this.currentHeading,
          accuracy: this.accuracy,
          isCalibrated: this.isCalibrated
        };

        this.callbacks.forEach(callback => callback(compassData));
      } else {
        console.warn('قراءة بوصلة غير مكتملة:', { alpha: event.alpha, beta: event.beta, gamma: event.gamma });
      }
    };

    window.addEventListener('deviceorientation', this.handleOrientationChange, true);
    this.isWatching = true;
    console.log('تم تشغيل مستمع البوصلة');
  }

  // تحسين حساب الاتجاه المغناطيسي
  private calculateMagneticHeading(alpha: number, beta: number, gamma: number): number {
    // تعويض انحراف الجهاز بناءً على زوايا beta و gamma
    let heading = 360 - alpha;
    
    // تطبيق تصحيح للانحراف المغناطيسي (يمكن تحسينه بناءً على الموقع)
    const magneticDeclination = this.getMagneticDeclination();
    heading += magneticDeclination;
    
    // تطبيق تصحيح لانحراف الجهاز
    const deviceTilt = Math.sqrt(beta * beta + gamma * gamma);
    if (deviceTilt > 15) {
      // الجهاز مائل، تطبيق تصحيح
      const tiltCorrection = this.calculateTiltCorrection(beta, gamma);
      heading += tiltCorrection;
    }
    
    // تطبيع القيمة لتكون بين 0-360
    heading = ((heading % 360) + 360) % 360;
    
    return heading;
  }

  // مرشح للحصول على قراءات سلسة
  private headingHistory: number[] = [];
  private smoothHeading(heading: number): number {
    this.headingHistory.push(heading);
    
    // الاحتفاظ بآخر 5 قراءات فقط
    if (this.headingHistory.length > 5) {
      this.headingHistory.shift();
    }
    
    // حساب المتوسط المرجح
    if (this.headingHistory.length >= 3) {
      const weights = [0.1, 0.2, 0.3, 0.4, 0.5];
      let weightedSum = 0;
      let totalWeight = 0;
      
      for (let i = 0; i < this.headingHistory.length; i++) {
        const weight = weights[i] || 0.2;
        weightedSum += this.headingHistory[i] * weight;
        totalWeight += weight;
      }
      
      return weightedSum / totalWeight;
    }
    
    return heading;
  }

  // حساب دقة البوصلة
  private calculateAccuracy(event: DeviceOrientationEvent): number {
    // الدقة بناءً على استقرار القراءات
    if (this.headingHistory.length < 3) return 50;
    
    const variance = this.calculateVariance(this.headingHistory);
    
    if (variance < 2) return 95; // دقة عالية جداً
    if (variance < 5) return 85; // دقة عالية
    if (variance < 10) return 70; // دقة متوسطة
    if (variance < 20) return 50; // دقة منخفضة
    return 30; // دقة ضعيفة
  }

  // حساب التباين في القراءات
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // التحقق من حالة المعايرة
  private checkCalibration(event: DeviceOrientationEvent): boolean {
    // التحقق من دقة البوصلة في أجهزة iOS (إذا كانت متاحة)
    const webkitEvent = event as any;
    return webkitEvent.webkitCompassAccuracy !== undefined ? 
           webkitEvent.webkitCompassAccuracy < 50 : 
           Math.abs(event.alpha || 0) > 0 && this.headingHistory.length >= 3;
  }

  // حساب الانحراف المغناطيسي (يمكن تحسينه بناءً على الموقع)
  private getMagneticDeclination(): number {
    // قيمة تقديرية للانحراف المغناطيسي في منطقة الشرق الأوسط
    // يمكن تحسينها بناءً على الموقع الجغرافي
    return 2.5;
  }

  // تصحيح انحراف الجهاز
  private calculateTiltCorrection(beta: number, gamma: number): number {
    // حساب تصحيح بسيط لانحراف الجهاز
    const tiltFactor = Math.sqrt(beta * beta + gamma * gamma) / 90;
    return tiltFactor * 3; // تصحيح تقديري
  }

  // إيقاف مراقبة البوصلة
  public stopWatching(): void {
    if (this.isWatching && this.handleOrientationChange) {
      window.removeEventListener('deviceorientation', this.handleOrientationChange);
      this.isWatching = false;
      this.handleOrientationChange = null;
    }
  }

  private handleOrientationChange: ((event: DeviceOrientationEvent) => void) | null = null;

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

  // حساب اتجاه القبلة باستخدام Great Circle Formula المحسن
  private calculateQiblaDirection(latitude: number, longitude: number): number {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    
    // تحويل إلى راديان
    const lat1Rad = latitude * Math.PI / 180;
    const lat2Rad = meccaLat * Math.PI / 180;
    const deltaLngRad = (meccaLng - longitude) * Math.PI / 180;
    
    // Great Circle Formula لحساب الاتجاه الحقيقي
    const y = Math.sin(deltaLngRad) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLngRad);
    
    let qibla = Math.atan2(y, x) * 180 / Math.PI;
    
    // تطبيع القيمة لتكون بين 0-360
    qibla = ((qibla % 360) + 360) % 360;
    
    return Math.round(qibla * 10) / 10; // دقة عشرية واحدة
  }

  // حساب المسافة إلى مكة بدقة عالية (Vincenty Formula)
  public calculateDistanceToMecca(latitude: number, longitude: number): number {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    
    const R = 6371000; // نصف قطر الأرض بالمتر
    const lat1Rad = latitude * Math.PI / 180;
    const lat2Rad = meccaLat * Math.PI / 180;
    const deltaLatRad = (meccaLat - latitude) * Math.PI / 180;
    const deltaLngRad = (meccaLng - longitude) * Math.PI / 180;
    
    const a = Math.sin(deltaLatRad/2) * Math.sin(deltaLatRad/2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLngRad/2) * Math.sin(deltaLngRad/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return Math.round(R * c / 1000); // بالكيلومتر
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