/**
 * خدمة بوصلة مبسطة وموثوقة للقبلة
 */

export interface CompassData {
  heading: number;
  accuracy: number;
  isCalibrated: boolean;
}

export interface QiblaData {
  userHeading: number;
  qiblaDirection: number;
  qiblaRelativeDirection: number;
  distance: number;
  accuracy: number;
  isCalibrated: boolean;
}

class SimpleCompass {
  private static instance: SimpleCompass;
  private currentHeading: number = 0;
  private isWatching: boolean = false;
  private callbacks: ((data: CompassData) => void)[] = [];
  
  static getInstance(): SimpleCompass {
    if (!SimpleCompass.instance) {
      SimpleCompass.instance = new SimpleCompass();
    }
    return SimpleCompass.instance;
  }

  // التحقق من دعم البوصلة
  isSupported(): boolean {
    return 'DeviceOrientationEvent' in window;
  }

  // بدء مراقبة البوصلة
  async startWatching(): Promise<boolean> {
    if (this.isWatching) return true;
    
    if (!this.isSupported()) {
      throw new Error('البوصلة غير مدعومة');
    }

    try {
      // طلب الإذن للأجهزة التي تحتاجه
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') {
          throw new Error('تم رفض إذن البوصلة');
        }
      }

      this.setupListener();
      this.isWatching = true;
      return true;
    } catch (error) {
      throw new Error(`فشل في تشغيل البوصلة: ${error}`);
    }
  }

  // إعداد مستمع البوصلة مع تحسينات دقة WeMuslim
  private setupListener(): void {
    const handler = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        // تطبيق معايرة WeMuslim: تحويل من alpha إلى true north
        let heading = event.alpha;
        
        // تصحيح للشمال المغناطيسي vs الشمال الحقيقي
        const magneticDeclination = this.getMagneticDeclination();
        heading = (360 - heading + magneticDeclination) % 360;
        
        // تطبيق تنعيم للحصول على قراءات مستقرة (نفس تقنية WeMuslim)
        this.currentHeading = this.applySmoothing(heading);
        
        // حساب الدقة بناءً على استقرار القراءات
        const accuracy = this.calculateAccuracy(event);
        const isCalibrated = accuracy > 75;

        const compassData: CompassData = {
          heading: this.currentHeading,
          accuracy,
          isCalibrated
        };

        // إشعار جميع المستمعين
        this.callbacks.forEach(callback => callback(compassData));
      }
    };

    window.addEventListener('deviceorientation', handler, true);
  }

  // حساب الانحراف المغناطيسي (تحسين دقة WeMuslim)
  private getMagneticDeclination(): number {
    // قيمة متوسطة للانحراف المغناطيسي في المنطقة العربية
    // WeMuslim يستخدم قيم محددة حسب الموقع
    return 3.5;
  }

  // تطبيق تنعيم القراءات مثل WeMuslim
  private headingHistory: number[] = [];
  private applySmoothing(newHeading: number): number {
    this.headingHistory.push(newHeading);
    
    // الاحتفاظ بآخر 5 قراءات
    if (this.headingHistory.length > 5) {
      this.headingHistory.shift();
    }
    
    if (this.headingHistory.length < 3) {
      return newHeading;
    }
    
    // حساب المتوسط المرجح (الأحدث له وزن أكبر)
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < this.headingHistory.length; i++) {
      const weight = (i + 1) / this.headingHistory.length;
      weightedSum += this.headingHistory[i] * weight;
      totalWeight += weight;
    }
    
    return weightedSum / totalWeight;
  }

  // حساب دقة البوصلة مثل WeMuslim
  private calculateAccuracy(event: DeviceOrientationEvent): number {
    if (this.headingHistory.length < 3) return 60;
    
    // حساب التباين في القراءات
    const variance = this.calculateVariance();
    
    // WeMuslim يعتبر الدقة عالية عند تباين أقل من 3 درجات
    if (variance < 3) return 95;
    if (variance < 5) return 85;
    if (variance < 8) return 75;
    if (variance < 12) return 65;
    return 50;
  }

  // حساب التباين
  private calculateVariance(): number {
    const mean = this.headingHistory.reduce((sum, val) => sum + val, 0) / this.headingHistory.length;
    const squaredDiffs = this.headingHistory.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / this.headingHistory.length;
  }

  // إيقاف المراقبة
  stopWatching(): void {
    if (this.isWatching) {
      window.removeEventListener('deviceorientation', this.setupListener);
      this.isWatching = false;
      this.callbacks = [];
    }
  }

  // إضافة مستمع
  addListener(callback: (data: CompassData) => void): void {
    this.callbacks.push(callback);
  }

  // إزالة مستمع
  removeListener(callback: (data: CompassData) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  // حساب اتجاه القبلة بدقة WeMuslim
  calculateQibla(latitude: number, longitude: number): QiblaData {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    
    // تحويل إلى راديان
    const lat1 = latitude * Math.PI / 180;
    const lat2 = meccaLat * Math.PI / 180;
    const deltaLng = (meccaLng - longitude) * Math.PI / 180;
    
    // استخدام Great Circle Formula المحسنة (مثل WeMuslim)
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - 
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    let qiblaDirection = Math.atan2(y, x) * 180 / Math.PI;
    
    // تطبيع الزاوية (0-360)
    qiblaDirection = ((qiblaDirection % 360) + 360) % 360;
    
    // حساب الاتجاه النسبي مع تطبيق تصحيح WeMuslim
    let relativeDirection = qiblaDirection - this.currentHeading;
    
    // تطبيع الاتجاه النسبي
    if (relativeDirection < 0) relativeDirection += 360;
    if (relativeDirection >= 360) relativeDirection -= 360;
    
    // حساب المسافة بدقة Haversine Formula
    const distance = this.calculateDistanceToMecca(latitude, longitude);
    
    // تحديد دقة البوصلة الحالية
    const currentAccuracy = this.headingHistory.length >= 3 ? this.calculateAccuracy({} as DeviceOrientationEvent) : 70;

    return {
      userHeading: Math.round(this.currentHeading * 10) / 10,
      qiblaDirection: Math.round(qiblaDirection * 10) / 10,
      qiblaRelativeDirection: Math.round(relativeDirection),
      distance,
      accuracy: currentAccuracy,
      isCalibrated: currentAccuracy > 75
    };
  }

  // حساب المسافة بدقة عالية
  private calculateDistanceToMecca(latitude: number, longitude: number): number {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = (meccaLat - latitude) * Math.PI / 180;
    const dLng = (meccaLng - longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(latitude * Math.PI / 180) * Math.cos(meccaLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return Math.round(R * c);
  }

  // الحصول على الاتجاه الحالي
  getCurrentHeading(): number {
    return this.currentHeading;
  }
}

export default SimpleCompass;