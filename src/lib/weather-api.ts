import axios from 'axios';

// استخدام OpenWeatherMap API للطقس
const WEATHER_API_KEY = 'demo'; // في حالة الإنتاج، يجب استخدام مفتاح حقيقي
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number;
  condition: string;
  conditionAr: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  city: string;
}

// ترجمة حالة الطقس للعربية
const translateWeatherCondition = (condition: string): string => {
  const translations: Record<string, string> = {
    'clear sky': 'سماء صافية',
    'few clouds': 'غيوم قليلة',
    'scattered clouds': 'غيوم متناثرة',
    'broken clouds': 'غيوم كثيفة',
    'shower rain': 'زخات مطر',
    'rain': 'مطر',
    'thunderstorm': 'عاصفة رعدية',
    'snow': 'ثلج',
    'mist': 'ضباب',
    'haze': 'ضباب خفيف',
    'fog': 'ضباب كثيف',
    'overcast clouds': 'غيوم كثيفة',
    'light rain': 'مطر خفيف',
    'moderate rain': 'مطر متوسط',
    'heavy rain': 'مطر غزير',
    'sunny': 'مشمس',
    'partly cloudy': 'غائم جزئياً'
  };
  
  return translations[condition.toLowerCase()] || condition;
};

// جلب بيانات الطقس باستخدام الإحداثيات
export const getWeatherByCoordinates = async (latitude: number, longitude: number): Promise<WeatherData | null> => {
  try {
    // استخدام API بديل مجاني
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
    );
    
    if (response.data && response.data.current_weather) {
      const current = response.data.current_weather;
      
      // تحويل رمز الطقس إلى وصف
      const getWeatherDescription = (weatherCode: number): { en: string, ar: string } => {
        const descriptions: Record<number, { en: string, ar: string }> = {
          0: { en: 'Clear sky', ar: 'سماء صافية' },
          1: { en: 'Mainly clear', ar: 'صافي في الغالب' },
          2: { en: 'Partly cloudy', ar: 'غائم جزئياً' },
          3: { en: 'Overcast', ar: 'غائم' },
          45: { en: 'Fog', ar: 'ضباب' },
          48: { en: 'Depositing rime fog', ar: 'ضباب كثيف' },
          51: { en: 'Light drizzle', ar: 'رذاذ خفيف' },
          53: { en: 'Moderate drizzle', ar: 'رذاذ متوسط' },
          55: { en: 'Dense drizzle', ar: 'رذاذ كثيف' },
          61: { en: 'Slight rain', ar: 'مطر خفيف' },
          63: { en: 'Moderate rain', ar: 'مطر متوسط' },
          65: { en: 'Heavy rain', ar: 'مطر غزير' },
          71: { en: 'Slight snow', ar: 'ثلج خفيف' },
          73: { en: 'Moderate snow', ar: 'ثلج متوسط' },
          75: { en: 'Heavy snow', ar: 'ثلج كثيف' },
          77: { en: 'Snow grains', ar: 'حبيبات ثلج' },
          80: { en: 'Slight rain showers', ar: 'زخات مطر خفيفة' },
          81: { en: 'Moderate rain showers', ar: 'زخات مطر متوسطة' },
          82: { en: 'Violent rain showers', ar: 'زخات مطر عنيفة' },
          85: { en: 'Slight snow showers', ar: 'زخات ثلج خفيفة' },
          86: { en: 'Heavy snow showers', ar: 'زخات ثلج كثيفة' },
          95: { en: 'Thunderstorm', ar: 'عاصفة رعدية' },
          96: { en: 'Thunderstorm with slight hail', ar: 'عاصفة رعدية مع برد خفيف' },
          99: { en: 'Thunderstorm with heavy hail', ar: 'عاصفة رعدية مع برد كثيف' }
        };
        
        return descriptions[weatherCode] || { en: 'Unknown', ar: 'غير محدد' };
      };
      
      const description = getWeatherDescription(current.weathercode);
      
      return {
        temp: Math.round(current.temperature),
        condition: description.en,
        conditionAr: description.ar,
        humidity: 0, // لا يتوفر في هذا API
        windSpeed: Math.round(current.windspeed),
        icon: current.weathercode.toString(),
        city: 'الموقع الحالي'
      };
    }
    
    return null;
  } catch (error) {
    console.error('خطأ في جلب بيانات الطقس:', error);
    return null;
  }
};

// جلب بيانات الطقس التجريبية (للاختبار)
export const getDemoWeatherData = (): WeatherData => {
  const demoConditions = [
    { en: 'Sunny', ar: 'مشمس', temp: 25 },
    { en: 'Partly cloudy', ar: 'غائم جزئياً', temp: 22 },
    { en: 'Cloudy', ar: 'غائم', temp: 18 },
    { en: 'Light rain', ar: 'مطر خفيف', temp: 15 },
    { en: 'Clear sky', ar: 'سماء صافية', temp: 28 }
  ];
  
  const randomCondition = demoConditions[Math.floor(Math.random() * demoConditions.length)];
  
  return {
    temp: randomCondition.temp,
    condition: randomCondition.en,
    conditionAr: randomCondition.ar,
    humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
    windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
    icon: '01d',
    city: 'الموقع الحالي'
  };
};