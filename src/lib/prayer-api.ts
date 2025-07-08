import axios from 'axios';

// API أوقات الصلاة من AlAdhan
const PRAYER_API_BASE = 'https://api.aladhan.com/v1';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface PrayerData {
  timings: PrayerTimes;
  date: {
    readable: string;
    timestamp: string;
    hijri: {
      date: string;
      format: string;
      day: string;
      weekday: {
        en: string;
        ar: string;
      };
      month: {
        number: number;
        en: string;
        ar: string;
      };
      year: string;
      designation: {
        abbreviated: string;
        expanded: string;
      };
    };
    gregorian: {
      date: string;
      format: string;
      day: string;
      weekday: {
        en: string;
      };
      month: {
        number: number;
        en: string;
      };
      year: string;
      designation: {
        abbreviated: string;
        expanded: string;
      };
    };
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
      params: {
        Fajr: number;
        Isha: number;
      };
    };
    latitudeAdjustmentMethod: string;
    midnightMode: string;
    school: string;
    offset: {
      Imsak: number;
      Fajr: number;
      Sunrise: number;
      Dhuhr: number;
      Asr: number;
      Maghrib: number;
      Sunset: number;
      Isha: number;
      Midnight: number;
    };
  };
}

export interface PrayerResponse {
  code: number;
  status: string;
  data: PrayerData;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

// جلب أوقات الصلاة حسب الإحداثيات
export const getPrayerTimes = async (latitude: number, longitude: number, method: number = 4): Promise<PrayerData | null> => {
  try {
    const response = await axios.get<PrayerResponse>(
      `${PRAYER_API_BASE}/timings?latitude=${latitude}&longitude=${longitude}&method=${method}`
    );
    
    if (response.data.code === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب أوقات الصلاة:', error);
    return null;
  }
};

// جلب أوقات الصلاة حسب اسم المدينة
export const getPrayerTimesByCity = async (city: string, country: string, method: number = 4): Promise<PrayerData | null> => {
  try {
    const response = await axios.get<PrayerResponse>(
      `${PRAYER_API_BASE}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`
    );
    
    if (response.data.code === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب أوقات الصلاة:', error);
    return null;
  }
};

// حساب اتجاه القبلة
export const calculateQiblaDirection = (latitude: number, longitude: number): number => {
  // إحداثيات الكعبة المشرفة
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
};

// حساب المسافة إلى مكة المكرمة
export const calculateDistanceToMecca = (latitude: number, longitude: number): number => {
  const meccaLat = 21.4225;
  const meccaLng = 39.8262;
  
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (meccaLat - latitude) * Math.PI / 180;
  const dLng = (meccaLng - longitude) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(latitude * Math.PI / 180) * Math.cos(meccaLat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance);
};

// الحصول على الموقع الجغرافي
export const getCurrentLocation = (): Promise<LocationInfo> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('الموقع الجغرافي غير مدعوم في هذا المتصفح'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // جلب معلومات المدينة من API
          const locationResponse = await axios.get(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`
          );
          
          resolve({
            latitude,
            longitude,
            city: locationResponse.data.city || locationResponse.data.locality || 'غير محدد',
            country: locationResponse.data.countryName || 'غير محدد',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          });
        } catch (error) {
          // في حالة فشل جلب معلومات المدينة، نرجع الإحداثيات فقط
          resolve({
            latitude,
            longitude,
            city: 'غير محدد',
            country: 'غير محدد',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          });
        }
      },
      (error) => {
        let errorMessage = 'خطأ في تحديد الموقع';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'تم رفض طلب تحديد الموقع';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'الموقع غير متاح';
            break;
          case error.TIMEOUT:
            errorMessage = 'انتهت مهلة طلب الموقع';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 دقائق
      }
    );
  });
};