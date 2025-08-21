/**
 * هوك متخصص لإدارة بوصلة القبلة
 * يدمج بين نظام تحديد الموقع والبوصلة للحصول على أدق النتائج
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import CompassService, { QiblaCompassData, CompassData } from '@/lib/compass-service';
import OfflineStorage from '@/lib/offline-storage';

interface QiblaData {
  userHeading: number;
  qiblaDirection: number;
  qiblaRelativeDirection: number;
  accuracy: number;
  isCalibrated: boolean;
  distance: number;
  location: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
}

interface UseQiblaCompassOptions {
  updateInterval?: number;
  enableAutoLocation?: boolean;
  enableOfflineMode?: boolean;
}

export function useQiblaCompass(options: UseQiblaCompassOptions = {}) {
  const {
    updateInterval = 100,
    enableAutoLocation = true,
    enableOfflineMode = true
  } = options;

  const [qiblaData, setQiblaData] = useState<QiblaData>({
    userHeading: 0,
    qiblaDirection: 0,
    qiblaRelativeDirection: 0,
    accuracy: 0,
    isCalibrated: false,
    distance: 0,
    location: null,
    isLoading: false,
    error: null
  });

  const compassService = CompassService.getInstance();
  const offlineStorage = OfflineStorage.getInstance();
  const intervalRef = useRef<NodeJS.Timeout>();
  const isComponentMounted = useRef(true);

  // تحديث بيانات القبلة
  const updateQiblaData = useCallback((compassData: CompassData, location: { lat: number; lng: number }) => {
    if (!isComponentMounted.current) return;

    const qiblaCompass = compassService.calculateQiblaCompass(location.lat, location.lng);
    const distance = compassService.calculateDistanceToMecca(location.lat, location.lng);

    setQiblaData(prev => ({
      ...prev,
      userHeading: qiblaCompass.userHeading,
      qiblaDirection: qiblaCompass.qiblaDirection,
      qiblaRelativeDirection: qiblaCompass.qiblaRelativeDirection,
      accuracy: qiblaCompass.accuracy,
      isCalibrated: qiblaCompass.isCalibrated,
      distance,
      location,
      error: null
    }));
  }, [compassService]);

  // الحصول على الموقع الحالي مع معالجة محسنة للأخطاء
  const getCurrentLocation = useCallback(async (forceUpdate = false): Promise<{ lat: number; lng: number } | null> => {
    if (!isComponentMounted.current) return null;

    setQiblaData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // محاولة استخدام الموقع المحفوظ إذا كان متاحاً وحديثاً
      if (!forceUpdate && enableOfflineMode) {
        const storedLocation = offlineStorage.getStoredLocation();
        if (storedLocation && offlineStorage.isDataValid(storedLocation.timestamp)) {
          const location = { lat: storedLocation.latitude, lng: storedLocation.longitude };
          setQiblaData(prev => ({ ...prev, location, isLoading: false }));
          console.log('تم استخدام الموقع المحفوظ:', location);
          return location;
        }
      }

      // طلب موقع جديد
      if (!navigator.geolocation) {
        throw new Error('متصفحك لا يدعم تحديد الموقع');
      }

      return new Promise((resolve, reject) => {
        // تحديد timeout أقصر لتجنب التعليق
        const timeoutId = setTimeout(() => {
          console.log('انتهت مهلة تحديد الموقع، سيتم استخدام موقع افتراضي');
          // استخدام موقع افتراضي (مكة المكرمة كمثال)
          const defaultLocation = { lat: 21.4225, lng: 39.8262 };
          setQiblaData(prev => ({ ...prev, location: defaultLocation, isLoading: false }));
          resolve(defaultLocation);
        }, 8000); // 8 ثوان بدلاً من 15

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            if (!isComponentMounted.current) {
              resolve(null);
              return;
            }

            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            console.log('تم الحصول على الموقع الحالي:', location);

            // حفظ الموقع للاستخدام أوفلاين
            if (enableOfflineMode) {
              offlineStorage.saveLocation({
                latitude: location.lat,
                longitude: location.lng,
                city: '',
                country: '',
                timestamp: Date.now()
              });
            }

            setQiblaData(prev => ({ ...prev, location, isLoading: false }));
            resolve(location);
          },
          (error) => {
            clearTimeout(timeoutId);
            if (!isComponentMounted.current) {
              resolve(null);
              return;
            }

            console.error('خطأ في تحديد الموقع:', error);

            // محاولة استخدام موقع محفوظ كبديل
            const storedLocation = offlineStorage.getStoredLocation();
            if (storedLocation) {
              const location = { lat: storedLocation.latitude, lng: storedLocation.longitude };
              setQiblaData(prev => ({ 
                ...prev, 
                location, 
                isLoading: false,
                error: 'تم استخدام آخر موقع محفوظ' 
              }));
              resolve(location);
              return;
            }

            // استخدام موقع افتراضي كملاذ أخير
            const defaultLocation = { lat: 21.4225, lng: 39.8262 };
            setQiblaData(prev => ({ 
              ...prev, 
              location: defaultLocation, 
              isLoading: false,
              error: 'تم استخدام موقع افتراضي. يرجى السماح بالوصول للموقع للحصول على دقة أفضل' 
            }));
            resolve(defaultLocation);
          },
          {
            enableHighAccuracy: true,
            timeout: 7000, // تقليل timeout
            maximumAge: 60000 // دقيقة واحدة
          }
        );
      });
    } catch (error) {
      if (!isComponentMounted.current) return null;

      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف في تحديد الموقع';
      setQiblaData(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  }, [enableOfflineMode, offlineStorage]);

  // بدء مراقبة البوصلة مع معالجة أفضل للأخطاء
  const startCompassWatching = useCallback(async () => {
    try {
      console.log('بدء تشغيل البوصلة...');
      await compassService.startWatching();
      console.log('تم تشغيل البوصلة بنجاح');
      
      const compassListener = (compassData: CompassData) => {
        console.log('بيانات البوصلة:', compassData);
        if (qiblaData.location) {
          updateQiblaData(compassData, qiblaData.location);
        }
      };

      compassService.addCompassListener(compassListener);

      return () => {
        console.log('إيقاف مراقبة البوصلة');
        compassService.removeCompassListener(compassListener);
      };
    } catch (error) {
      console.error('خطأ في تشغيل البوصلة:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل في تشغيل البوصلة';
      setQiblaData(prev => ({ ...prev, error: errorMessage }));
      return () => {};
    }
  }, [compassService, qiblaData.location, updateQiblaData]);

  // معايرة البوصلة
  const calibrateCompass = useCallback(async (): Promise<boolean> => {
    try {
      setQiblaData(prev => ({ ...prev, error: null }));
      const isCalibrated = await compassService.calibrateCompass();
      
      if (!isCalibrated) {
        setQiblaData(prev => ({ 
          ...prev, 
          error: 'فشلت معايرة البوصلة. حرك الهاتف في شكل 8 عدة مرات' 
        }));
      }
      
      return isCalibrated;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في معايرة البوصلة';
      setQiblaData(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, [compassService]);

  // إعادة تعيين النظام
  const resetCompass = useCallback(() => {
    compassService.resetCompass();
    setQiblaData({
      userHeading: 0,
      qiblaDirection: 0,
      qiblaRelativeDirection: 0,
      accuracy: 0,
      isCalibrated: false,
      distance: 0,
      location: null,
      isLoading: false,
      error: null
    });
  }, [compassService]);

  // تهيئة النظام مع تسلسل أفضل
  useEffect(() => {
    isComponentMounted.current = true;
    
    const initializeQiblaCompass = async () => {
      console.log('تهيئة نظام البوصلة...');
      
      // بدء مراقبة البوصلة أولاً (لا تحتاج موقع)
      const cleanupCompass = await startCompassWatching();
      
      // ثم الحصول على الموقع
      const location = await getCurrentLocation();
      console.log('الموقع المستخدم:', location);
      
      // تحديث دوري للبيانات
      intervalRef.current = setInterval(() => {
        if (isComponentMounted.current && qiblaData.location) {
          const currentCompassData = {
            heading: compassService.getCurrentHeading(),
            accuracy: compassService.getAccuracy(),
            isCalibrated: compassService.isCompassCalibrated()
          };
          updateQiblaData(currentCompassData, qiblaData.location);
        }
      }, updateInterval);

      return cleanupCompass;
    };

    const cleanup = initializeQiblaCompass();

    return () => {
      isComponentMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      cleanup.then(cleanupFn => cleanupFn?.());
      compassService.stopWatching();
    };
  }, [getCurrentLocation, startCompassWatching, updateInterval]);

  // تنظيف الموارد عند إلغاء التحميل
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      compassService.stopWatching();
    };
  }, []);

  return {
    qiblaData,
    getCurrentLocation,
    calibrateCompass,
    resetCompass,
    isSupported: 'DeviceOrientationEvent' in window && 'geolocation' in navigator
  };
}