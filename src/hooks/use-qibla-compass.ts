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

  // الحصول على الموقع الحالي
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
          return location;
        }
      }

      // طلب موقع جديد
      if (!navigator.geolocation) {
        throw new Error('متصفحك لا يدعم تحديد الموقع');
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!isComponentMounted.current) {
              resolve(null);
              return;
            }

            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            // حفظ الموقع للاستخدام أوفلاين
            if (enableOfflineMode) {
              offlineStorage.saveLocation({
                latitude: location.lat,
                longitude: location.lng,
                city: '', // يمكن إضافة API لتحديد اسم المدينة
                country: '',
                timestamp: Date.now()
              });
            }

            setQiblaData(prev => ({ ...prev, location, isLoading: false }));
            resolve(location);
          },
          (error) => {
            if (!isComponentMounted.current) {
              resolve(null);
              return;
            }

            let errorMessage = 'فشل في تحديد الموقع';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'تم رفض إذن الوصول للموقع. يرجى السماح للتطبيق بالوصول للموقع';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'الموقع غير متاح حالياً';
                break;
              case error.TIMEOUT:
                errorMessage = 'انتهت مهلة تحديد الموقع';
                break;
            }

            setQiblaData(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // 5 دقائق
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

  // بدء مراقبة البوصلة
  const startCompassWatching = useCallback(async () => {
    try {
      await compassService.startWatching();
      
      const compassListener = (compassData: CompassData) => {
        if (qiblaData.location) {
          updateQiblaData(compassData, qiblaData.location);
        }
      };

      compassService.addCompassListener(compassListener);

      return () => {
        compassService.removeCompassListener(compassListener);
      };
    } catch (error) {
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

  // تهيئة النظام
  useEffect(() => {
    isComponentMounted.current = true;
    
    const initializeQiblaCompass = async () => {
      // الحصول على الموقع أولاً
      const location = await getCurrentLocation();
      
      if (location) {
        // بدء مراقبة البوصلة
        const cleanup = await startCompassWatching();
        
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

        return cleanup;
      }
    };

    initializeQiblaCompass();

    return () => {
      isComponentMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      compassService.stopWatching();
    };
  }, []);

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