/**
 * بوصلة محسنة ومستقرة مع تنعيم متقدم وتقليل الاهتزاز
 */

export interface CompassReading {
  heading: number;
  accuracy: number;
  isCalibrated: boolean;
  timestamp: number;
}

export interface SmoothingConfig {
  historySize: number;
  stabilityThreshold: number;
  calibrationThreshold: number;
  updateInterval: number;
}

export class EnhancedCompass {
  private static instance: EnhancedCompass;
  private isActive: boolean = false;
  private currentHeading: number = 0;
  private headingHistory: number[] = [];
  private listeners: ((reading: CompassReading) => void)[] = [];
  private lastUpdateTime: number = 0;
  private orientationListener: ((event: DeviceOrientationEvent) => void) | null = null;

  // إعدادات التنعيم المحسنة
  private config: SmoothingConfig = {
    historySize: 8,           // عدد القراءات المحفوظة
    stabilityThreshold: 2,     // عتبة الاستقرار (درجات)
    calibrationThreshold: 80,  // عتبة المعايرة (نسبة مئوية)
    updateInterval: 100        // فترة التحديث (ميللي ثانية)
  };

  static getInstance(): EnhancedCompass {
    if (!EnhancedCompass.instance) {
      EnhancedCompass.instance = new EnhancedCompass();
    }
    return EnhancedCompass.instance;
  }

  /**
   * التحقق من دعم البوصلة في الجهاز
   */
  isSupported(): boolean {
    return 'DeviceOrientationEvent' in window;
  }

  /**
   * بدء تشغيل البوصلة
   */
  async startWatching(): Promise<void> {
    if (this.isActive) return;

    if (!this.isSupported()) {
      throw new Error('البوصلة غير مدعومة في هذا الجهاز');
    }

    try {
      // طلب الإذن للأجهزة التي تحتاجه (iOS 13+)
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') {
          throw new Error('تم رفض إذن استخدام البوصلة');
        }
      }

      this.setupOrientationListener();
      this.isActive = true;
    } catch (error) {
      throw new Error(`فشل في تشغيل البوصلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  /**
   * إيقاف البوصلة
   */
  stopWatching(): void {
    if (!this.isActive) return;

    if (this.orientationListener) {
      window.removeEventListener('deviceorientation', this.orientationListener);
      this.orientationListener = null;
    }

    this.isActive = false;
    this.headingHistory = [];
    this.listeners = [];
  }

  /**
   * إعداد مستمع اتجاه الجهاز
   */
  private setupOrientationListener(): void {
    this.orientationListener = (event: DeviceOrientationEvent) => {
      const now = Date.now();
      
      // تحديد معدل التحديث لتجنب الإرهاق
      if (now - this.lastUpdateTime < this.config.updateInterval) {
        return;
      }

      this.lastUpdateTime = now;

      if (event.alpha !== null) {
        let rawHeading = event.alpha;

        // تصحيح الاتجاه حسب نوع الجهاز
        if (this.isIOS()) {
          // على iOS، alpha يمثل الاتجاه من الشمال المغناطيسي
          rawHeading = 360 - rawHeading;
        }

        // تطبيق التنعيم المتقدم
        const smoothedHeading = this.applySophisticatedSmoothing(rawHeading);
        this.currentHeading = smoothedHeading;

        // حساب الدقة والمعايرة
        const accuracy = this.calculateAccuracy();
        const isCalibrated = accuracy >= this.config.calibrationThreshold;

        const reading: CompassReading = {
          heading: smoothedHeading,
          accuracy,
          isCalibrated,
          timestamp: now
        };

        // إشعار جميع المستمعين
        this.notifyListeners(reading);
      }
    };

    window.addEventListener('deviceorientation', this.orientationListener, true);
  }

  /**
   * تطبيق تنعيم متطور ومتقدم
   */
  private applySophisticatedSmoothing(newHeading: number): number {
    // إضافة القراءة الجديدة
    this.headingHistory.push(newHeading);

    // الحفاظ على حجم محدد للتاريخ
    if (this.headingHistory.length > this.config.historySize) {
      this.headingHistory.shift();
    }

    if (this.headingHistory.length < 3) {
      return newHeading;
    }

    // تطبيق تنعيم متقدم مع معالجة انتقال 360/0
    return this.calculateWeightedCircularMean();
  }

  /**
   * حساب المتوسط الدائري المرجح (لمعالجة انتقال 360/0)
   */
  private calculateWeightedCircularMean(): number {
    let sumSin = 0;
    let sumCos = 0;
    let totalWeight = 0;

    for (let i = 0; i < this.headingHistory.length; i++) {
      // الأوزان المتزايدة للقراءات الأحدث
      const weight = (i + 1) / this.headingHistory.length;
      const radians = (this.headingHistory[i] * Math.PI) / 180;
      
      sumSin += Math.sin(radians) * weight;
      sumCos += Math.cos(radians) * weight;
      totalWeight += weight;
    }

    const avgSin = sumSin / totalWeight;
    const avgCos = sumCos / totalWeight;
    
    let result = Math.atan2(avgSin, avgCos) * 180 / Math.PI;
    
    // تطبيع النتيجة (0-360)
    if (result < 0) result += 360;
    
    return result;
  }

  /**
   * حساب دقة البوصلة بناءً على استقرار القراءات
   */
  private calculateAccuracy(): number {
    if (this.headingHistory.length < 3) return 50;

    // حساب الانحراف المعياري الدائري
    const variance = this.calculateCircularVariance();
    const standardDeviation = Math.sqrt(variance);

    // تحويل الانحراف المعياري إلى نسبة دقة
    if (standardDeviation <= this.config.stabilityThreshold) return 95;
    if (standardDeviation <= 3) return 90;
    if (standardDeviation <= 5) return 80;
    if (standardDeviation <= 8) return 70;
    if (standardDeviation <= 12) return 60;
    
    return Math.max(40, 100 - (standardDeviation * 5));
  }

  /**
   * حساب التباين الدائري للقراءات
   */
  private calculateCircularVariance(): number {
    let sumSin = 0;
    let sumCos = 0;

    for (const heading of this.headingHistory) {
      const radians = (heading * Math.PI) / 180;
      sumSin += Math.sin(radians);
      sumCos += Math.cos(radians);
    }

    const n = this.headingHistory.length;
    const meanSin = sumSin / n;
    const meanCos = sumCos / n;
    const R = Math.sqrt(meanSin * meanSin + meanCos * meanCos);

    // التباين الدائري = 1 - R
    return (1 - R) * 180; // تحويل إلى درجات
  }

  /**
   * إضافة مستمع
   */
  addListener(callback: (reading: CompassReading) => void): void {
    this.listeners.push(callback);
  }

  /**
   * إزالة مستمع
   */
  removeListener(callback: (reading: CompassReading) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * إشعار جميع المستمعين
   */
  private notifyListeners(reading: CompassReading): void {
    this.listeners.forEach(listener => {
      try {
        listener(reading);
      } catch (error) {
        console.error('خطأ في مستمع البوصلة:', error);
      }
    });
  }

  /**
   * الحصول على الاتجاه الحالي
   */
  getCurrentHeading(): number {
    return this.currentHeading;
  }

  /**
   * الحصول على آخر قراءة دقة
   */
  getCurrentAccuracy(): number {
    return this.calculateAccuracy();
  }

  /**
   * التحقق من نوع الجهاز
   */
  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * إعادة معايرة البوصلة
   */
  recalibrate(): void {
    this.headingHistory = [];
    this.currentHeading = 0;
  }

  /**
   * تحديث إعدادات التنعيم
   */
  updateConfig(newConfig: Partial<SmoothingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * الحصول على معلومات حالة البوصلة
   */
  getStatus(): { isActive: boolean; accuracy: number; isCalibrated: boolean; readingCount: number } {
    const accuracy = this.calculateAccuracy();
    return {
      isActive: this.isActive,
      accuracy,
      isCalibrated: accuracy >= this.config.calibrationThreshold,
      readingCount: this.headingHistory.length
    };
  }
}