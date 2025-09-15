/**
 * Hook محسن لمراقبة أوقات الصلاة مع دعم الأذان والإشعارات
 * Enhanced Prayer Monitor with Adhan and Notifications support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPrayerTimes, type PrayerData } from '@/lib/prayer-api';
import { EnhancedAdhanService, type PrayerSchedule } from '@/lib/enhanced-adhan-service';
import { useToast } from '@/hooks/use-toast';

export interface PrayerInfo {
  name: string;
  nameEn: string;
  time: string;
  timestamp: number;
  passed: boolean;
  current: boolean;
  timeUntil: number | null;
  enabled: boolean;
}

export interface UsePrayerMonitorReturn {
  currentPrayer: PrayerInfo | null;
  nextPrayer: PrayerInfo | null;
  allPrayers: PrayerInfo[];
  prayerData: PrayerData | null;
  isLoading: boolean;
  error: string | null;
  refreshPrayerTimes: () => Promise<void>;
  timeUntilNext: {
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
  adhanStatus: {
    isEnabled: boolean;
    isPlaying: boolean;
    hasPermission: boolean;
    isMonitoring: boolean;
  };
}

export function useEnhancedPrayerMonitor(
  latitude?: number,
  longitude?: number,
  autoStart = true
): UsePrayerMonitorReturn {
  
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [allPrayers, setAllPrayers] = useState<PrayerInfo[]>([]);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerInfo | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [adhanStatus, setAdhanStatus] = useState({
    isEnabled: false,
    isPlaying: false,
    hasPermission: false,
    isMonitoring: false
  });

  const { toast } = useToast();
  const adhanService = useRef(EnhancedAdhanService.getInstance());
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // تحديث معلومات الصلوات
  const updatePrayerInfo = useCallback(() => {
    if (!prayerData || !isMounted.current) return;

    const now = new Date();
    const timings = prayerData.timings;
    
    // تحويل أوقات الصلاة إلى تنسيق موحد
    const prayers: PrayerInfo[] = [
      { name: 'الفجر', nameEn: 'Fajr', time: timings.Fajr.substring(0, 5), key: 'fajr' },
      { name: 'الشروق', nameEn: 'Sunrise', time: timings.Sunrise.substring(0, 5), key: 'sunrise' },
      { name: 'الظهر', nameEn: 'Dhuhr', time: timings.Dhuhr.substring(0, 5), key: 'dhuhr' },
      { name: 'العصر', nameEn: 'Asr', time: timings.Asr.substring(0, 5), key: 'asr' },
      { name: 'المغرب', nameEn: 'Maghrib', time: timings.Maghrib.substring(0, 5), key: 'maghrib' },
      { name: 'العشاء', nameEn: 'Isha', time: timings.Isha.substring(0, 5), key: 'isha' }
    ].map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);
      
      // إذا كان الوقت قد مضى، اجعله لليوم التالي
      if (prayerTime < now) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }
      
      const timeDiff = prayerTime.getTime() - now.getTime();
      const timeUntil = timeDiff > 0 ? Math.floor(timeDiff / (1000 * 60)) : null;
      
      return {
        ...prayer,
        timestamp: prayerTime.getTime(),
        passed: timeDiff <= 0,
        current: Math.abs(timeDiff) <= 60000, // خلال دقيقة واحدة
        timeUntil,
        enabled: prayer.key !== 'sunrise' // الشروق ليس صلاة
      };
    });

    setAllPrayers(prayers);

    // تحديد الصلاة الحالية والتالية
    const current = prayers.find(p => p.current);
    const next = prayers
      .filter(p => !p.passed && p.enabled)
      .sort((a, b) => a.timestamp - b.timestamp)[0];

    setCurrentPrayer(current || null);
    setNextPrayer(next || null);

    // حساب الوقت المتبقي للصلاة التالية
    if (next) {
      const timeDiff = next.timestamp - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeUntilNext({ hours, minutes, seconds });
    } else {
      setTimeUntilNext(null);
    }

    // تحديث حالة خدمة الأذان
    setAdhanStatus(adhanService.current.getStatus());

  }, [prayerData]);

  // جلب أوقات الصلاة
  const refreshPrayerTimes = useCallback(async () => {
    if (!latitude || !longitude) {
      setError('الموقع غير محدد');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getPrayerTimes(latitude, longitude);
      setPrayerData(data);
      
      console.log('✅ تم تحديث أوقات الصلاة');
      
      toast({
        title: 'تم تحديث أوقات الصلاة',
        description: `${data.meta.method.name} - ${data.date.hijri.date}`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في جلب أوقات الصلاة';
      setError(errorMessage);
      console.error('❌ خطأ في جلب أوقات الصلاة:', err);
      
      toast({
        title: 'خطأ في أوقات الصلاة',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, toast]);

  // بدء مراقبة أوقات الصلاة مع الأذان
  const startAdhanMonitoring = useCallback(() => {
    if (!prayerData || allPrayers.length === 0) return;

    const prayerSchedule: PrayerSchedule[] = allPrayers
      .filter(p => p.enabled)
      .map(p => ({
        name: p.name,
        nameEn: p.nameEn,
        time: p.time,
        timestamp: p.timestamp,
        enabled: p.enabled
      }));

    adhanService.current.startPrayerMonitoring(prayerSchedule);
    
    console.log('🕌 تم بدء مراقبة الأذان');
  }, [prayerData, allPrayers]);

  // تحديث دوري كل ثانية
  useEffect(() => {
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
    }

    updateInterval.current = setInterval(() => {
      updatePrayerInfo();
    }, 1000);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [updatePrayerInfo]);

  // تحديث أوقات الصلاة عند تغيير الموقع
  useEffect(() => {
    if (autoStart && latitude && longitude) {
      refreshPrayerTimes();
    }
  }, [latitude, longitude, autoStart, refreshPrayerTimes]);

  // بدء مراقبة الأذان عند تحديث البيانات
  useEffect(() => {
    if (prayerData && allPrayers.length > 0) {
      updatePrayerInfo();
      startAdhanMonitoring();
    }
  }, [prayerData, allPrayers.length, updatePrayerInfo, startAdhanMonitoring]);

  // تنظيف عند إلغاء التثبيت
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      adhanService.current.stopPrayerMonitoring();
    };
  }, []);

  return {
    currentPrayer,
    nextPrayer,
    allPrayers,
    prayerData,
    isLoading,
    error,
    refreshPrayerTimes,
    timeUntilNext,
    adhanStatus
  };
}