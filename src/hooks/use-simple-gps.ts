/**
 * هوك GPS مبسط وموثوق
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import SimpleGPS, { type SimpleGPSPosition, type SimpleGPSOptions } from '@/lib/simple-gps';

interface UseSimpleGPSReturn {
  position: SimpleGPSPosition | null;
  isLoading: boolean;
  error: string | null;
  accuracy: number;
  startTracking: (options?: SimpleGPSOptions) => Promise<void>;
  stopTracking: () => void;
  refreshPosition: (options?: SimpleGPSOptions) => Promise<void>;
  isSupported: boolean;
}

export function useSimpleGPS(): UseSimpleGPSReturn {
  const [position, setPosition] = useState<SimpleGPSPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gps = useRef(SimpleGPS.getInstance());
  const isMounted = useRef(true);

  // معالج تحديث الموقع
  const handlePositionUpdate = useCallback((newPosition: SimpleGPSPosition) => {
    if (!isMounted.current) return;
    
    setPosition(newPosition);
    setError(null);
    setIsLoading(false);
    
    console.log(`📍 موقع محدث: ${newPosition.accuracy.toFixed(1)}م`);
  }, []);

  // بدء التتبع
  const startTracking = useCallback(async (options?: SimpleGPSOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentPosition = await gps.current.getCurrentPosition({
        timeout: 8000,
        enableHighAccuracy: true,
        maximumAge: 30000,
        ...options
      });

      if (isMounted.current) {
        handlePositionUpdate(currentPosition);
        
        // بدء المراقبة المستمرة
        gps.current.startWatching({
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 10000,
          ...options
        });
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMsg = err instanceof Error ? err.message : 'خطأ في تحديد الموقع';
        setError(errorMsg);
        setIsLoading(false);
      }
    }
  }, [handlePositionUpdate]);

  // إيقاف التتبع
  const stopTracking = useCallback(() => {
    gps.current.stopWatching();
    setIsLoading(false);
  }, []);

  // تحديث الموقع
  const refreshPosition = useCallback(async (options?: SimpleGPSOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const newPosition = await gps.current.getCurrentPosition({
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0, // موقع جديد تماماً
        ...options
      });

      if (isMounted.current) {
        handlePositionUpdate(newPosition);
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMsg = err instanceof Error ? err.message : 'فشل في تحديث الموقع';
        setError(errorMsg);
        setIsLoading(false);
      }
    }
  }, [handlePositionUpdate]);

  // تحميل آخر موقع عند البدء
  useEffect(() => {
    const lastPosition = gps.current.getLastPosition();
    if (lastPosition) {
      setPosition(lastPosition);
    }
  }, []);

  // إعداد المستمع
  useEffect(() => {
    gps.current.addListener(handlePositionUpdate);

    return () => {
      gps.current.removeListener(handlePositionUpdate);
    };
  }, [handlePositionUpdate]);

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
    isLoading,
    error,
    accuracy: position?.accuracy || 0,
    startTracking,
    stopTracking,
    refreshPosition,
    isSupported: gps.current.isSupported()
  };
}