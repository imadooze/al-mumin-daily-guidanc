/**
 * هوك مبسط وموثوق للقبلة
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import SimpleCompass, { QiblaData, CompassData } from '@/lib/simple-compass';

interface QiblaState {
  qiblaData: QiblaData | null;
  location: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
  isCompassActive: boolean;
}

export function useSimpleQibla() {
  const [state, setState] = useState<QiblaState>({
    qiblaData: null,
    location: null,
    isLoading: false,
    error: null,
    isCompassActive: false
  });

  const compass = SimpleCompass.getInstance();
  const isMounted = useRef(true);

  // الحصول على الموقع بسرعة ودقة عالية
  const getLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      throw new Error('الجهاز لا يدعم تحديد الموقع');
    }

    // محاولة الحصول على موقع مخزن مؤقتاً
    const cachedLocation = localStorage.getItem('cached-location');
    let hasCached = false;

    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        const age = Date.now() - parsed.timestamp;
        // استخدام الموقع المخزن إذا كان عمره أقل من دقيقتين
        if (age < 120000) {
          hasCached = true;
        }
      } catch (e) {
        localStorage.removeItem('cached-location');
      }
    }

    return new Promise((resolve, reject) => {
      // وقت أقل للاستجابة السريعة
      const timeoutId = setTimeout(() => {
        if (hasCached) {
          const parsed = JSON.parse(cachedLocation!);
          resolve({ lat: parsed.lat, lng: parsed.lng });
        } else {
          // استخدام موقع افتراضي (الرياض)
          const defaultLocation = { lat: 24.7136, lng: 46.6753 };
          resolve(defaultLocation);
        }
      }, 3000); // تقليل الوقت إلى 3 ثوانٍ

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // حفظ الموقع مع الطابع الزمني
          localStorage.setItem('cached-location', JSON.stringify({
            ...location,
            timestamp: Date.now()
          }));
          
          resolve(location);
        },
        (error) => {
          clearTimeout(timeoutId);
          if (hasCached) {
            const parsed = JSON.parse(cachedLocation!);
            resolve({ lat: parsed.lat, lng: parsed.lng });
          } else {
            // استخدام موقع افتراضي في حالة الخطأ
            const defaultLocation = { lat: 24.7136, lng: 46.6753 };
            resolve(defaultLocation);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 2500, // تقليل الوقت
          maximumAge: 60000 // دقيقة واحدة فقط
        }
      );
    });
  }, []);

  // بدء البوصلة
  const startCompass = useCallback(async () => {
    if (!isMounted.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // التحقق من دعم البوصلة
      if (!compass.isSupported()) {
        throw new Error('البوصلة غير مدعومة في هذا الجهاز');
      }

      // الحصول على الموقع أولاً
      const location = await getLocation();
      if (!location || !isMounted.current) return;

      setState(prev => ({ ...prev, location, isLoading: true }));

      // بدء البوصلة
      await compass.startWatching();

      // إعداد مستمع البوصلة
      const compassListener = (compassData: CompassData) => {
        if (!isMounted.current || !location) return;

        const qiblaData = compass.calculateQibla(location.lat, location.lng);
        
        setState(prev => ({
          ...prev,
          qiblaData,
          isLoading: false,
          error: null,
          isCompassActive: true
        }));
      };

      compass.addListener(compassListener);

      // تنظيف المستمع عند الإغلاق
      return () => {
        compass.removeListener(compassListener);
      };

    } catch (error) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'خطأ غير معروف',
          isLoading: false,
          isCompassActive: false
        }));
      }
    }
  }, [compass, getLocation]);

  // إيقاف البوصلة
  const stopCompass = useCallback(() => {
    compass.stopWatching();
    setState(prev => ({
      ...prev,
      isCompassActive: false,
      qiblaData: null
    }));
  }, [compass]);

  // تحديث الموقع
  const updateLocation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newLocation = await getLocation();
      if (newLocation && isMounted.current) {
        setState(prev => ({ ...prev, location: newLocation, isLoading: false }));
        
        // إعادة حساب القبلة مع الموقع الجديد
        if (state.isCompassActive) {
          const qiblaData = compass.calculateQibla(newLocation.lat, newLocation.lng);
          setState(prev => ({ ...prev, qiblaData }));
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'فشل في تحديث الموقع',
        isLoading: false
      }));
    }
  }, [compass, getLocation, state.isCompassActive]);

  // تنظيف الموارد
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      compass.stopWatching();
    };
  }, [compass]);

  return {
    ...state,
    startCompass,
    stopCompass,
    updateLocation,
    isSupported: compass.isSupported()
  };
}