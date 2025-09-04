/**
 * هوك محسن ودقيق للقبلة مع GPS مبسط وموثوق
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { EnhancedCompass, type CompassReading } from '@/lib/enhanced-compass';
import { PreciseQiblaCalculator, type QiblaCalculationData } from '@/lib/precise-qibla-calculator';
import { useSimpleGPS } from './use-simple-gps';
import type { SimpleGPSPosition } from '@/lib/simple-gps';

interface QiblaState {
  qiblaData: QiblaCalculationData | null;
  location: SimpleGPSPosition | null;
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

  // استخدام GPS المبسط
  const {
    position: gpsPosition,
    isLoading: gpsLoading,
    error: gpsError,
    accuracy: gpsAccuracy,
    startTracking: startGPS,
    stopTracking: stopGPS,
    refreshPosition: refreshGPS,
    isSupported: gpsSupported
  } = useSimpleGPS();

  const compass = EnhancedCompass.getInstance();
  const isMounted = useRef(true);
  const compassListener = useRef<((reading: CompassReading) => void) | null>(null);

  // تحديث الموقع عندما يتغير GPS
  useEffect(() => {
    if (gpsPosition) {
      setState(prev => ({ ...prev, location: gpsPosition }));
    }
  }, [gpsPosition]);

  // تحديث حالة التحميل والأخطاء من GPS
  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      isLoading: gpsLoading,
      error: gpsError 
    }));
  }, [gpsLoading, gpsError]);

  // بدء البوصلة المحسنة مع GPS
  const startCompass = useCallback(async () => {
    if (!isMounted.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // التحقق من دعم البوصلة و GPS
      if (!compass.isSupported()) {
        throw new Error('البوصلة غير مدعومة في هذا الجهاز');
      }

      if (!gpsSupported) {
        throw new Error('GPS غير مدعوم في هذا الجهاز');
      }

      // بدء GPS أولاً
      await startGPS({
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000
      });

      // انتظار الحصول على الموقع
      let retries = 10;
      while (!gpsPosition && retries > 0 && isMounted.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retries--;
      }

      if (!gpsPosition || !isMounted.current) {
        throw new Error('فشل في الحصول على الموقع');
      }

      // بدء البوصلة المحسنة
      await compass.startWatching();

      // إعداد مستمع البوصلة المحسن
      const enhancedCompassListener = (reading: CompassReading) => {
        if (!isMounted.current || !gpsPosition) return;

        // التحقق من صحة الإحداثيات
        if (!PreciseQiblaCalculator.validateCoordinates(gpsPosition.latitude, gpsPosition.longitude)) {
          console.warn('إحداثيات غير صحيحة:', gpsPosition);
          return;
        }

        // حساب بيانات القبلة بدقة عالية
        const qiblaData = PreciseQiblaCalculator.calculateFullQiblaData(
          gpsPosition,
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
  }, [compass, gpsSupported, startGPS, gpsPosition]);

  // إيقاف البوصلة المحسن
  const stopCompass = useCallback(() => {
    // تنظيف المستمع
    if (compassListener.current) {
      compass.removeListener(compassListener.current);
      compassListener.current = null;
    }
    
    compass.stopWatching();
    stopGPS();
    
    setState(prev => ({
      ...prev,
      isCompassActive: false,
      qiblaData: null
    }));
  }, [compass, stopGPS]);

  // تحديث الموقع المحسن
  const updateLocation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await refreshGPS({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      // إعادة حساب القبلة مع الموقع الجديد إذا كانت البوصلة نشطة
      if (state.isCompassActive && gpsPosition && compass.getCurrentHeading) {
        const currentHeading = compass.getCurrentHeading();
        const currentAccuracy = compass.getCurrentAccuracy();
        const compassStatus = compass.getStatus();
        
        const qiblaData = PreciseQiblaCalculator.calculateFullQiblaData(
          gpsPosition,
          currentHeading,
          currentAccuracy,
          compassStatus.isCalibrated
        );
        
        setState(prev => ({ ...prev, qiblaData }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'فشل في تحديث الموقع',
        isLoading: false
      }));
    }
  }, [refreshGPS, state.isCompassActive, gpsPosition, compass]);

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
      stopGPS();
    };
  }, [compass, stopGPS]);

  return {
    ...state,
    startCompass,
    stopCompass,
    updateLocation,
    isSupported: compass.isSupported() && gpsSupported,
    gpsAccuracy: gpsPosition?.accuracy || 0
  };
}