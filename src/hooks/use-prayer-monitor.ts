import { useEffect, useState } from 'react';
import { PrayerData } from '@/lib/prayer-api';

/**
 * Hook لمراقبة أوقات الصلاة والتنبيه عند حلول موعدها
 */
export function usePrayerMonitor(prayerData: PrayerData | null) {
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    nameAr: string;
    time: string;
    timeUntil: string;
  } | null>(null);

  useEffect(() => {
    if (!prayerData) return;

    const updateNextPrayer = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const prayers = [
        { name: 'Fajr', nameAr: 'الفجر', time: prayerData.timings.Fajr.substring(0, 5) },
        { name: 'Sunrise', nameAr: 'الشروق', time: prayerData.timings.Sunrise.substring(0, 5) },
        { name: 'Dhuhr', nameAr: 'الظهر', time: prayerData.timings.Dhuhr.substring(0, 5) },
        { name: 'Asr', nameAr: 'العصر', time: prayerData.timings.Asr.substring(0, 5) },
        { name: 'Maghrib', nameAr: 'المغرب', time: prayerData.timings.Maghrib.substring(0, 5) },
        { name: 'Isha', nameAr: 'العشاء', time: prayerData.timings.Isha.substring(0, 5) },
      ];

      // البحث عن الصلاة القادمة
      let nextPrayerData = null;
      
      for (const prayer of prayers) {
        const [hour, minute] = prayer.time.split(':').map(Number);
        const prayerTime = hour * 60 + minute;
        
        if (currentTime < prayerTime) {
          nextPrayerData = prayer;
          break;
        }
      }

      // إذا لم توجد صلاة قادمة اليوم، فالفجر هو التالي
      if (!nextPrayerData) {
        nextPrayerData = prayers[0];
      }

      // حساب الوقت المتبقي
      const [hour, minute] = nextPrayerData.time.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hour, minute, 0, 0);

      if (prayerTime <= now) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }

      const timeDiff = prayerTime.getTime() - now.getTime();
      const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      let timeUntil = '';
      if (hoursLeft > 0) {
        timeUntil = `${hoursLeft} ساعة و ${minutesLeft} دقيقة`;
      } else if (minutesLeft > 0) {
        timeUntil = `${minutesLeft} دقيقة`;
      } else {
        timeUntil = 'الآن';
      }

      setNextPrayer({
        name: nextPrayerData.name,
        nameAr: nextPrayerData.nameAr,
        time: nextPrayerData.time,
        timeUntil
      });
    };

    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 30000); // تحديث كل 30 ثانية

    return () => clearInterval(interval);
  }, [prayerData]);

  return nextPrayer;
}