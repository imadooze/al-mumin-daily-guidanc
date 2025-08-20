/**
 * حاسبة أوقات الصلاة الفلكية للعمل أوفلاين
 * تستخدم المعادلات الفلكية لحساب أوقات الصلاة بدون الحاجة للإنترنت
 */

export interface CalculatedPrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface CalculationMethod {
  name: string;
  fajrAngle: number;
  ishaAngle: number;
  maghribAngle: number;
  asrRatio: number;
}

// طرق الحساب المختلفة
export const CALCULATION_METHODS: { [key: string]: CalculationMethod } = {
  MWL: {
    name: 'Muslim World League',
    fajrAngle: 18,
    ishaAngle: 17,
    maghribAngle: 0,
    asrRatio: 1
  },
  ISNA: {
    name: 'Islamic Society of North America',
    fajrAngle: 15,
    ishaAngle: 15,
    maghribAngle: 0,
    asrRatio: 1
  },
  EGYPT: {
    name: 'Egyptian General Authority of Survey',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    maghribAngle: 0,
    asrRatio: 1
  },
  MAKKAH: {
    name: 'Umm Al-Qura University, Makkah',
    fajrAngle: 18.5,
    ishaAngle: 0, // 90 minutes after Maghrib
    maghribAngle: 0,
    asrRatio: 1
  },
  KARACHI: {
    name: 'University of Islamic Sciences, Karachi',
    fajrAngle: 18,
    ishaAngle: 18,
    maghribAngle: 0,
    asrRatio: 1
  }
};

class PrayerCalculator {
  private static instance: PrayerCalculator;

  static getInstance(): PrayerCalculator {
    if (!PrayerCalculator.instance) {
      PrayerCalculator.instance = new PrayerCalculator();
    }
    return PrayerCalculator.instance;
  }

  // حساب أوقات الصلاة
  calculatePrayerTimes(
    latitude: number,
    longitude: number,
    date: Date = new Date(),
    method: string = 'MAKKAH'
  ): CalculatedPrayerTimes {
    const calculationMethod = CALCULATION_METHODS[method];
    
    // إعدادات التوقيت
    const timezone = this.getTimezone(longitude);
    const julianDate = this.getJulianDate(date);
    
    // حساب زاوية الميل والمعادلة الزمنية
    const { declination, equationOfTime } = this.getSolarPosition(julianDate);
    
    // حساب أوقات الصلاة
    const fajr = this.calculateTime(
      latitude,
      declination,
      -calculationMethod.fajrAngle,
      equationOfTime,
      longitude,
      timezone,
      true
    );
    
    const sunrise = this.calculateTime(
      latitude,
      declination,
      -0.833,
      equationOfTime,
      longitude,
      timezone,
      true
    );
    
    const dhuhr = this.calculateTime(
      latitude,
      declination,
      0,
      equationOfTime,
      longitude,
      timezone,
      false,
      true
    );
    
    const asr = this.calculateAsrTime(
      latitude,
      declination,
      calculationMethod.asrRatio,
      equationOfTime,
      longitude,
      timezone
    );
    
    const maghrib = this.calculateTime(
      latitude,
      declination,
      -0.833,
      equationOfTime,
      longitude,
      timezone,
      false
    );
    
    let isha: string;
    if (calculationMethod.ishaAngle > 0) {
      isha = this.calculateTime(
        latitude,
        declination,
        -calculationMethod.ishaAngle,
        equationOfTime,
        longitude,
        timezone,
        false
      );
    } else {
      // طريقة أم القرى - 90 دقيقة بعد المغرب
      const maghribTime = this.parseTime(maghrib);
      isha = this.addMinutes(maghribTime, 90);
    }

    return {
      fajr,
      sunrise,
      dhuhr,
      asr,
      maghrib,
      isha
    };
  }

  // حساب التاريخ الجولياني
  private getJulianDate(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    let a = Math.floor((14 - month) / 12);
    let y = year - a;
    let m = month + 12 * a - 3;
    
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119.5;
  }

  // حساب موقع الشمس
  private getSolarPosition(julianDate: number): { declination: number; equationOfTime: number } {
    const n = julianDate - 2451545.0;
    const l = (280.460 + 0.9856474 * n) % 360;
    const g = this.degreesToRadians((357.528 + 0.9856003 * n) % 360);
    
    const lambda = this.degreesToRadians(l + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
    const epsilon = this.degreesToRadians(23.439 - 0.0000004 * n);
    
    const declination = this.radiansToDegrees(Math.asin(Math.sin(epsilon) * Math.sin(lambda)));
    const alpha = this.radiansToDegrees(Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda)));
    
    const equationOfTime = 4 * (l - alpha);
    
    return { declination, equationOfTime };
  }

  // حساب وقت الصلاة
  private calculateTime(
    latitude: number,
    declination: number,
    angle: number,
    equationOfTime: number,
    longitude: number,
    timezone: number,
    isSunrise: boolean,
    isNoon: boolean = false
  ): string {
    if (isNoon) {
      const time = 12 - equationOfTime / 60 + timezone;
      return this.formatTime(time);
    }

    const latRad = this.degreesToRadians(latitude);
    const decRad = this.degreesToRadians(declination);
    const angleRad = this.degreesToRadians(angle);
    
    const cosH = (Math.sin(angleRad) - Math.sin(decRad) * Math.sin(latRad)) / 
                 (Math.cos(decRad) * Math.cos(latRad));
    
    if (Math.abs(cosH) > 1) {
      // حالات استثنائية (الشمس لا تغرب أو لا تشرق)
      return isSunrise ? "06:00" : "18:00";
    }
    
    const h = this.radiansToDegrees(Math.acos(cosH));
    const time = 12 + (isSunrise ? -h : h) / 15 - equationOfTime / 60 + timezone;
    
    return this.formatTime(time);
  }

  // حساب وقت العصر
  private calculateAsrTime(
    latitude: number,
    declination: number,
    asrRatio: number,
    equationOfTime: number,
    longitude: number,
    timezone: number
  ): string {
    const latRad = this.degreesToRadians(latitude);
    const decRad = this.degreesToRadians(declination);
    
    const shadowRatio = asrRatio + Math.tan(Math.abs(latRad - decRad));
    const angle = this.radiansToDegrees(Math.atan(1 / shadowRatio));
    
    return this.calculateTime(latitude, declination, 90 - angle, equationOfTime, longitude, timezone, false);
  }

  // حساب المنطقة الزمنية
  private getTimezone(longitude: number): number {
    return longitude / 15;
  }

  // تحويل الدرجات إلى راديان
  private degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  // تحويل الراديان إلى درجات
  private radiansToDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }

  // تنسيق الوقت
  private formatTime(time: number): string {
    let hours = Math.floor(time);
    let minutes = Math.floor((time - hours) * 60);
    
    // تصحيح الساعات والدقائق
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    if (hours < 0) {
      hours += 24;
    }
    if (hours >= 24) {
      hours -= 24;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // تحليل الوقت
  private parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // إضافة دقائق
  private addMinutes(date: Date, minutes: number): string {
    const newDate = new Date(date.getTime() + minutes * 60000);
    return this.formatTime(newDate.getHours() + newDate.getMinutes() / 60);
  }

  // حساب اتجاه القبلة
  calculateQiblaDirection(latitude: number, longitude: number): number {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    
    const lat1 = this.degreesToRadians(latitude);
    const lat2 = this.degreesToRadians(meccaLat);
    const deltaLng = this.degreesToRadians(meccaLng - longitude);
    
    const y = Math.sin(deltaLng);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltaLng);
    
    let qibla = this.radiansToDegrees(Math.atan2(y, x));
    qibla = (qibla + 360) % 360;
    
    return Math.round(qibla);
  }

  // حساب المسافة إلى مكة
  calculateDistanceToMecca(latitude: number, longitude: number): number {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = this.degreesToRadians(meccaLat - latitude);
    const dLng = this.degreesToRadians(meccaLng - longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degreesToRadians(latitude)) * Math.cos(this.degreesToRadians(meccaLat)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance);
  }
}

export default PrayerCalculator;