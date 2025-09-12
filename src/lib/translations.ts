// نظام الترجمة للتطبيق
export interface Translations {
  // التنقل الرئيسي
  home: string;
  quran: string;
  prayer: string;
  azkar: string;
  more: string;
  
  // الصفحات الإضافية
  names: string;
  tasbeeh: string;
  duas: string;
  hadith: string;
  qibla: string;
  settings: string;
  hijriCalendar: string;
  islamicEducation: string;
  
  // العناوين الرئيسية
  appName: string;
  appSubtitle: string;
  
  // التحيات
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  
  // أوقات الصلاة
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  
  // عناوين الأقسام
  morningAzkar: string;
  eveningAzkar: string;
  sleepAzkar: string;
  generalAzkar: string;
  
  // النصوص العامة
  loading: string;
  refresh: string;
  next: string;
  previous: string;
  location: string;
  weather: string;
  newHadith: string;
  
  // الإعدادات
  darkMode: string;
  language: string;
  notifications: string;
  arabic: string;
  english: string;
}

export const arabicTranslations: Translations = {
  // التنقل الرئيسي
  home: "الرئيسية",
  quran: "القرآن",
  prayer: "الصلاة", 
  azkar: "الأذكار",
  more: "المزيد",
  
  // الصفحات الإضافية
  names: "أسماء الله الحسنى",
  tasbeeh: "المسبحة الإلكترونية",
  duas: "الأدعية المختارة",
  hadith: "الأحاديث النبوية",
  qibla: "اتجاه القبلة",
  settings: "الإعدادات",
  hijriCalendar: "التقويم الهجري",
  islamicEducation: "التعليم الديني",
  
  // العناوين الرئيسية
  appName: "الـمُؤمِن",
  appSubtitle: "Al-Mumin",
  
  // التحيات
  goodMorning: "صباح الخير",
  goodAfternoon: "مساء الخير",
  goodEvening: "مساء النور",
  
  // أوقات الصلاة
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر", 
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
  
  // عناوين الأقسام
  morningAzkar: "أذكار الصباح",
  eveningAzkar: "أذكار المساء",
  sleepAzkar: "أذكار النوم",
  generalAzkar: "أذكار عامة",
  
  // النصوص العامة
  loading: "جاري التحميل...",
  refresh: "تحديث",
  next: "التالي",
  previous: "السابق",
  location: "الموقع",
  weather: "الطقس",
  newHadith: "حديث جديد",
  
  // الإعدادات
  darkMode: "الوضع المظلم",
  language: "اللغة",
  notifications: "التنبيهات",
  arabic: "العربية",
  english: "English"
};

export const englishTranslations: Translations = {
  // التنقل الرئيسي
  home: "Home",
  quran: "Quran",
  prayer: "Prayer",
  azkar: "Azkar", 
  more: "More",
  
  // الصفحات الإضافية
  names: "99 Names of Allah",
  tasbeeh: "Digital Tasbeeh",
  duas: "Selected Du'as",
  hadith: "Prophetic Traditions",
  qibla: "Qibla",
  settings: "Settings",
  hijriCalendar: "Hijri Calendar", 
  islamicEducation: "Islamic Education",
  
  // العناوين الرئيسية
  appName: "Al-Mumin",
  appSubtitle: "The Believer",
  
  // التحيات
  goodMorning: "Good Morning",
  goodAfternoon: "Good Afternoon",
  goodEvening: "Good Evening",
  
  // أوقات الصلاة
  fajr: "Fajr",
  sunrise: "Sunrise", 
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  
  // عناوين الأقسام
  morningAzkar: "Morning Azkar",
  eveningAzkar: "Evening Azkar",
  sleepAzkar: "Sleep Azkar",
  generalAzkar: "General Azkar",
  
  // النصوص العامة
  loading: "Loading...",
  refresh: "Refresh",
  next: "Next", 
  previous: "Previous",
  location: "Location",
  weather: "Weather",
  newHadith: "New Hadith",
  
  // الإعدادات
  darkMode: "Dark Mode",
  language: "Language",
  notifications: "Notifications",
  arabic: "العربية",
  english: "English"
};

export const useTranslations = () => {
  const language = localStorage.getItem('app-language') || 'arabic';
  return language === 'english' ? englishTranslations : arabicTranslations;
};