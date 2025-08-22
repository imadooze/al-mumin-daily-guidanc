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

  // إعداد مستمع البوصلة
  private setupListener(): void {
    const handler = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        // حساب الاتجاه (تحويل من alpha إلى اتجاه حقيقي)
        this.currentHeading = event.alpha ? 360 - event.alpha : 0;
        
        // تحديد الدقة بناءً على وجود البيانات
        const accuracy = (event.alpha !== null && event.beta !== null && event.gamma !== null) ? 85 : 50;
        const isCalibrated = accuracy > 70;

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

  // حساب اتجاه القبلة
  calculateQibla(latitude: number, longitude: number): QiblaData {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    
    // تحويل إلى راديان
    const lat1 = latitude * Math.PI / 180;
    const lat2 = meccaLat * Math.PI / 180;
    const deltaLng = (meccaLng - longitude) * Math.PI / 180;
    
    // Great Circle Formula
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - 
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    let qiblaDirection = Math.atan2(y, x) * 180 / Math.PI;
    qiblaDirection = ((qiblaDirection % 360) + 360) % 360;
    
    // حساب الاتجاه النسبي
    let qiblaRelativeDirection = qiblaDirection - this.currentHeading;
    if (qiblaRelativeDirection < 0) qiblaRelativeDirection += 360;
    
    // حساب المسافة
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = (meccaLat - latitude) * Math.PI / 180;
    const dLng = deltaLng;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return {
      userHeading: this.currentHeading,
      qiblaDirection: Math.round(qiblaDirection * 10) / 10,
      qiblaRelativeDirection: Math.round(qiblaRelativeDirection),
      distance: Math.round(distance),
      accuracy: 85,
      isCalibrated: true
    };
  }

  // الحصول على الاتجاه الحالي
  getCurrentHeading(): number {
    return this.currentHeading;
  }
}

export default SimpleCompass;