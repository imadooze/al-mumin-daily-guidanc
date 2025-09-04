/**
 * هوك GPS محسن للتطبيق
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import EnhancedGPS, { type GPSPosition, type GPSOptions, type GPSStatus } from '@/lib/enhanced-gps';

interface UseEnhancedGPSReturn {
  position: GPSPosition | null;
  status: GPSStatus;
  isLoading: boolean;
  error: string | null;
  startTracking: (options?: GPSOptions) => Promise<void>;
  stopTracking: () => void;
  refreshPosition: (options?: GPSOptions) => Promise<void>;
  isSupported: boolean;
}

export function useEnhancedGPS(): UseEnhancedGPSReturn {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [status, setStatus] = useState<GPSStatus>({
    isActive: false,
    lastUpdate: 0,
    accuracy: 0,
    source: 'cached'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gps = useRef(EnhancedGPS.getInstance());
  const isMounted = useRef(true);

  // معالج تحديث الموقع
  const handlePositionUpdate = useCallback((newPosition: GPSPosition) => {
    if (!isMounted.current) return;
    
    setPosition(newPosition);
    setStatus(gps.current.getStatus());
    setError(null);
    setIsLoading(false);
    
    console.log(`📍 موقع محدث: ${newPosition.accuracy.toFixed(1)}م`);
  }, []);

  // معالج الأخطاء
  const handleError = useCallback((errorMsg: string) => {
    if (!isMounted.current) return;
    
    setError(errorMsg);
    setIsLoading(false);
    setStatus(gps.current.getStatus());
    
    console.error('خطأ GPS:', errorMsg);
  }, []);

  // بدء التتبع
  const startTracking = useCallback(async (options?: GPSOptions) => {
    if (!gps.current.isSupported()) {
      setError('GPS غير مدعوم في هذا الجهاز');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // الحصول على موقع فوري أولاً
      const currentPosition = await gps.current.getCurrentPosition({
        desiredAccuracy: 15,
        maxRetries: 2,
        timeout: 8000,
        ...options
      });

      if (isMounted.current) {
        handlePositionUpdate(currentPosition);
        
        // بدء المراقبة المستمرة
        gps.current.startWatching({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
          ...options
        });
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMsg = err instanceof Error ? err.message : 'خطأ في تحديد الموقع';
        handleError(errorMsg);
      }
    }
  }, [handlePositionUpdate, handleError]);

  // إيقاف التتبع
  const stopTracking = useCallback(() => {
    gps.current.stopWatching();
    setStatus(gps.current.getStatus());
    setIsLoading(false);
  }, []);

  // تحديث الموقع
  const refreshPosition = useCallback(async (options?: GPSOptions) => {
    if (!gps.current.isSupported()) {
      setError('GPS غير مدعوم في هذا الجهاز');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newPosition = await gps.current.getCurrentPosition({
        desiredAccuracy: 10,
        maxRetries: 3,
        timeout: 12000,
        ...options
      });

      if (isMounted.current) {
        handlePositionUpdate(newPosition);
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMsg = err instanceof Error ? err.message : 'فشل في تحديث الموقع';
        handleError(errorMsg);
      }
    }
  }, [handlePositionUpdate, handleError]);

  // تحميل آخر موقع معروف عند البدء
  useEffect(() => {
    const lastKnown = gps.current.getLastKnownPosition();
    if (lastKnown) {
      setPosition(lastKnown);
      setStatus(gps.current.getStatus());
    }
  }, []);

  // إعداد المستمعين
  useEffect(() => {
    gps.current.addListener(handlePositionUpdate);
    gps.current.addErrorListener(handleError);

    return () => {
      gps.current.removeListener(handlePositionUpdate);
      gps.current.removeErrorListener(handleError);
    };
  }, [handlePositionUpdate, handleError]);

  // تنظيف الموارد
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      gps.current.stopWatching();
    };
  }, []);

  return {
    position,
    status,
    isLoading,
    error,
    startTracking,
    stopTracking,
    refreshPosition,
    isSupported: gps.current.isSupported()
  };
}