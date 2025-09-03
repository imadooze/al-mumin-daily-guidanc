/**
 * هوك محسن ودقيق للقبلة مع تقنيات حديثة
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { EnhancedCompass, type CompassReading } from '@/lib/enhanced-compass';
import { PreciseQiblaCalculator, type QiblaCalculationData, type LocationData } from '@/lib/precise-qibla-calculator';

interface QiblaState {
  qiblaData: QiblaCalculationData | null;
  location: LocationData | null;
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

  const compass = EnhancedCompass.getInstance();
  const isMounted = useRef(true);
  const compassListener = useRef<((reading: CompassReading) => void) | null>(null);

  // الحصول على الموقع بسرعة ودقة عالية مع تحسينات
  const getLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      throw new Error('الجهاز لا يدعم تحديد الموقع');
    }

    // محاولة الحصول على موقع مخزن مؤقتاً مع تحسين الذاكرة
    const cachedLocation = localStorage.getItem('enhanced-location-cache');
    let hasCached = false;

    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        const age = Date.now() - parsed.timestamp;
        // استخدام الموقع المخزن إذا كان عمره أقل من 90 ثانية
        if (age < 90000) {
          hasCached = true;
        }
      } catch (e) {
        localStorage.removeItem('enhanced-location-cache');
      }
    }

    return new Promise((resolve) => {
      // وقت أسرع للاستجابة
      const timeoutId = setTimeout(() => {
        if (hasCached) {
          const parsed = JSON.parse(cachedLocation!);
          resolve({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            accuracy: parsed.accuracy || 100,
            timestamp: parsed.timestamp
          });
        } else {
          // استخدام موقع افتراضي (مكة المكرمة للاختبار)
          const defaultLocation: LocationData = { 
            latitude: 21.4225, 
            longitude: 39.8262,
            accuracy: 1000,
            timestamp: Date.now()
          };
          resolve(defaultLocation);
        }
      }, 2000); // تقليل الوقت إلى ثانيتين

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          
          // حفظ الموقع مع تفاصيل إضافية
          localStorage.setItem('enhanced-location-cache', JSON.stringify(location));
          
          resolve(location);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn('خطأ في تحديد الموقع:', error.message);
          
          if (hasCached) {
            const parsed = JSON.parse(cachedLocation!);
            resolve({
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              accuracy: parsed.accuracy || 100,
              timestamp: parsed.timestamp
            });
          } else {
            // موقع افتراضي محسن
            const defaultLocation: LocationData = { 
              latitude: 21.4225, 
              longitude: 39.8262,
              accuracy: 1000,
              timestamp: Date.now()
            };
            resolve(defaultLocation);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 1800, // وقت أسرع
          maximumAge: 45000 // 45 ثانية فقط
        }
      );
    });
  }, []);

  // بدء البوصلة المحسنة
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

      // بدء البوصلة المحسنة
      await compass.startWatching();

      // إعداد مستمع البوصلة المحسن
      const enhancedCompassListener = (reading: CompassReading) => {
        if (!isMounted.current || !location) return;

        // التحقق من صحة الإحداثيات
        if (!PreciseQiblaCalculator.validateCoordinates(location.latitude, location.longitude)) {
          console.warn('إحداثيات غير صحيحة:', location);
          return;
        }

        // حساب بيانات القبلة بدقة عالية
        const qiblaData = PreciseQiblaCalculator.calculateFullQiblaData(
          location,
          reading.heading,
          reading.accuracy,
          reading.isCalibrated
        );
        
        setState(prev => ({
          ...prev,
          qiblaData,
          isLoading: false,
          error: null,
          isCompassActive: true
        }));
      };

      // حفظ مرجع المستمع للتنظيف
      compassListener.current = enhancedCompassListener;
      compass.addListener(enhancedCompassListener);

      // تنظيف المستمع عند الإغلاق
      return () => {
        if (compassListener.current) {
          compass.removeListener(compassListener.current);
          compassListener.current = null;
        }
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

  // إيقاف البوصلة المحسن
  const stopCompass = useCallback(() => {
    // تنظيف المستمع
    if (compassListener.current) {
      compass.removeListener(compassListener.current);
      compassListener.current = null;
    }
    
    compass.stopWatching();
    setState(prev => ({
      ...prev,
      isCompassActive: false,
      qiblaData: null
    }));
  }, [compass]);

  // تحديث الموقع المحسن
  const updateLocation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // مسح الكاش القديم قبل الحصول على موقع جديد
      localStorage.removeItem('enhanced-location-cache');
      
      const newLocation = await getLocation();
      if (newLocation && isMounted.current) {
        setState(prev => ({ ...prev, location: newLocation, isLoading: false }));
        
        // إعادة حساب القبلة مع الموقع الجديد إذا كانت البوصلة نشطة
        if (state.isCompassActive && compass.getCurrentHeading) {
          const currentHeading = compass.getCurrentHeading();
          const currentAccuracy = compass.getCurrentAccuracy();
          const compassStatus = compass.getStatus();
          
          const qiblaData = PreciseQiblaCalculator.calculateFullQiblaData(
            newLocation,
            currentHeading,
            currentAccuracy,
            compassStatus.isCalibrated
          );
          
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

  // تنظيف الموارد المحسن
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      
      // تنظيف شامل
      if (compassListener.current) {
        compass.removeListener(compassListener.current);
        compassListener.current = null;
      }
      
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