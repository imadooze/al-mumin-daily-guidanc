/**
 * حاسبة القبلة الدقيقة والموثوقة
 * تعتمد على خوارزميات عالمية معتمدة لحساب القبلة بدقة عالية
 */

export interface QiblaCalculationData {
  userHeading: number;
  qiblaDirection: number;
  qiblaRelativeDirection: number;
  distance: number;
  accuracy: number;
  isCalibrated: boolean;
  magneticDeclination: number;
  isAccurate: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export class PreciseQiblaCalculator {
  // إحداثيات الكعبة المشرفة بدقة عالية (مصدر: الهيئة السعودية للمساحة الجيولوجية)
  private static readonly MECCA_COORDINATES = {
    latitude: 21.42251,    // دقة GPS عالية
    longitude: 39.826184   // دقة GPS عالية
  };

  // خريطة الانحراف المغناطيسي للمناطق الرئيسية (2024)
  private static readonly MAGNETIC_DECLINATION_MAP = {
    // المملكة العربية السعودية
    saudi: { lat: [16, 33], lng: [34, 56], declination: 2.8 },
    // الإمارات العربية المتحدة
    uae: { lat: [22, 27], lng: [51, 57], declination: 1.2 },
    // مصر
    egypt: { lat: [22, 32], lng: [25, 36], declination: 4.1 },
    // العراق
    iraq: { lat: [29, 37], lng: [39, 49], declination: 3.5 },
    // الأردن
    jordan: { lat: [29, 34], lng: [34, 40], declination: 3.8 },
    // سوريا
    syria: { lat: [32, 38], lng: [35, 43], declination: 4.2 },
    // لبنان
    lebanon: { lat: [33, 35], lng: [35, 37], declination: 4.0 },
    // فلسطين
    palestine: { lat: [31, 34], lng: [34, 36], declination: 4.0 },
    // الكويت
    kuwait: { lat: [28, 31], lng: [46, 49], declination: 2.5 },
    // قطر
    qatar: { lat: [24, 27], lng: [50, 52], declination: 1.8 },
    // البحرين
    bahrain: { lat: [25, 27], lng: [50, 51], declination: 1.9 },
    // عمان
    oman: { lat: [16, 27], lng: [52, 60], declination: 0.8 },
    // اليمن
    yemen: { lat: [12, 19], lng: [42, 54], declination: 1.5 },
    // ليبيا
    libya: { lat: [20, 34], lng: [9, 26], declination: 2.8 },
    // تونس
    tunisia: { lat: [30, 38], lng: [7, 12], declination: 1.5 },
    // الجزائر
    algeria: { lat: [18, 38], lng: [-9, 12], declination: 0.5 },
    // المغرب
    morocco: { lat: [21, 36], lng: [-17, -1], declination: -2.1 },
    // السودان
    sudan: { lat: [8, 23], lng: [21, 39], declination: 2.2 },
    // تركيا
    turkey: { lat: [35, 43], lng: [25, 45], declination: 5.5 },
    // إيران
    iran: { lat: [25, 40], lng: [44, 64], declination: 4.8 },
    // أفغانستان
    afghanistan: { lat: [29, 39], lng: [60, 75], declination: 2.2 },
    // باكستان
    pakistan: { lat: [23, 38], lng: [60, 78], declination: 1.8 },
    // بنغلاديش
    bangladesh: { lat: [20, 27], lng: [88, 93], declination: -0.5 },
    // إندونيسيا
    indonesia: { lat: [-11, 6], lng: [95, 141], declination: 0.8 },
    // ماليزيا
    malaysia: { lat: [1, 7], lng: [99, 120], declination: 0.2 },
    // بروناي
    brunei: { lat: [4, 5], lng: [114, 115], declination: 0.1 },
    // قيم افتراضية للمناطق الأخرى
    default: { declination: 1.0 }
  };

  /**
   * حساب اتجاه القبلة بدقة عالية باستخدام خوارزمية Great Circle
   */
  static calculateQiblaDirection(userLat: number, userLng: number): number {
    const { latitude: meccaLat, longitude: meccaLng } = this.MECCA_COORDINATES;
    
    // تحويل إلى راديان
    const φ1 = this.toRadians(userLat);
    const φ2 = this.toRadians(meccaLat);
    const Δλ = this.toRadians(meccaLng - userLng);
    
    // استخدام خوارزمية Great Circle المحسنة
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    let bearing = Math.atan2(y, x);
    
    // تحويل من راديان إلى درجات وتطبيع (0-360)
    bearing = this.toDegrees(bearing);
    bearing = (bearing + 360) % 360;
    
    return bearing;
  }

  /**
   * حساب المسافة إلى مكة باستخدام خوارزمية Haversine
   */
  static calculateDistanceToMecca(userLat: number, userLng: number): number {
    const { latitude: meccaLat, longitude: meccaLng } = this.MECCA_COORDINATES;
    
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const φ1 = this.toRadians(userLat);
    const φ2 = this.toRadians(meccaLat);
    const Δφ = this.toRadians(meccaLat - userLat);
    const Δλ = this.toRadians(meccaLng - userLng);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c);
  }

  /**
   * تحديد الانحراف المغناطيسي بدقة حسب الموقع
   */
  static getMagneticDeclination(latitude: number, longitude: number): number {
    for (const [region, data] of Object.entries(this.MAGNETIC_DECLINATION_MAP)) {
      if (region === 'default') continue;
      
      const regionData = data as any;
      if (regionData.lat && regionData.lng) {
        if (latitude >= regionData.lat[0] && latitude <= regionData.lat[1] &&
            longitude >= regionData.lng[0] && longitude <= regionData.lng[1]) {
          return regionData.declination;
        }
      }
    }
    
    // استخدام القيمة الافتراضية
    return this.MAGNETIC_DECLINATION_MAP.default.declination;
  }

  /**
   * حساب اتجاه القبلة النسبي مع تطبيق تصحيح البوصلة
   */
  static calculateRelativeQiblaDirection(
    qiblaDirection: number, 
    deviceHeading: number, 
    magneticDeclination: number
  ): number {
    // تطبيق تصحيح الانحراف المغناطيسي
    const correctedDeviceHeading = (deviceHeading + magneticDeclination) % 360;
    
    // حساب الاتجاه النسبي
    let relativeDirection = qiblaDirection - correctedDeviceHeading;
    
    // تطبيع النتيجة إلى نطاق 0-360
    if (relativeDirection < 0) relativeDirection += 360;
    if (relativeDirection >= 360) relativeDirection -= 360;
    
    return relativeDirection;
  }

  /**
   * التحقق من دقة اتجاه القبلة
   */
  static isQiblaDirectionAccurate(relativeDirection: number, tolerance: number = 15): boolean {
    // التحقق من أن الاتجاه ضمن النطاق المقبول (±15 درجة)
    const minAngle = Math.min(relativeDirection, 360 - relativeDirection);
    return minAngle <= tolerance;
  }

  /**
   * حساب بيانات القبلة الكاملة
   */
  static calculateFullQiblaData(
    userLocation: LocationData,
    deviceHeading: number,
    compassAccuracy: number,
    isCompassCalibrated: boolean
  ): QiblaCalculationData {
    const { latitude, longitude } = userLocation;
    
    // حساب اتجاه القبلة الحقيقي
    const qiblaDirection = this.calculateQiblaDirection(latitude, longitude);
    
    // حساب المسافة
    const distance = this.calculateDistanceToMecca(latitude, longitude);
    
    // تحديد الانحراف المغناطيسي
    const magneticDeclination = this.getMagneticDeclination(latitude, longitude);
    
    // حساب الاتجاه النسبي
    const qiblaRelativeDirection = this.calculateRelativeQiblaDirection(
      qiblaDirection, 
      deviceHeading, 
      magneticDeclination
    );
    
    // التحقق من الدقة
    const isAccurate = this.isQiblaDirectionAccurate(qiblaRelativeDirection) && 
                      compassAccuracy > 70 && 
                      isCompassCalibrated;

    return {
      userHeading: Math.round(deviceHeading * 10) / 10,
      qiblaDirection: Math.round(qiblaDirection * 10) / 10,
      qiblaRelativeDirection: Math.round(qiblaRelativeDirection),
      distance,
      accuracy: compassAccuracy,
      isCalibrated: isCompassCalibrated,
      magneticDeclination: Math.round(magneticDeclination * 10) / 10,
      isAccurate
    };
  }

  /**
   * وظائف مساعدة للتحويلات
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * التحقق من صحة الإحداثيات
   */
  static validateCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && 
           longitude >= -180 && longitude <= 180;
  }
}