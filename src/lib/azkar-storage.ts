/**
 * مخزن الأذكار والأحاديث المحلي
 * يحتوي على الأذكار والأحاديث مخزنة محلياً للعمل أوفلاين
 */

export interface Dhikr {
  id: number;
  arabic: string;
  translation: string;
  transliteration?: string;
  count: number;
  category: string;
  reward?: string;
  reference?: string;
}

export interface Hadith {
  id: number;
  arabic: string;
  translation: string;
  narrator: string;
  reference: string;
  category: string;
  explanation?: string;
}

// أذكار الصباح والمساء
export const MORNING_AZKAR: Dhikr[] = [
  {
    id: 1,
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    translation: "We have reached the morning and with it Allah's entire kingdom. All praise is for Allah. There is no god but Allah alone, with no partners. His is the dominion, and His is the praise, and He has power over all things.",
    count: 1,
    category: "أذكار الصباح",
    reference: "أبو داود"
  },
  {
    id: 2,
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    translation: "O Allah, by You we have reached the morning, and by You we reach the evening. By You we live, and by You we die, and to You is the resurrection.",
    count: 1,
    category: "أذكار الصباح",
    reference: "الترمذي"
  },
  {
    id: 3,
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ، اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...",
    translation: "I seek refuge in Allah from Satan the accursed. Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence...",
    count: 1,
    category: "أذكار الصباح",
    reference: "آية الكرسي"
  }
];

export const EVENING_AZKAR: Dhikr[] = [
  {
    id: 1,
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    translation: "We have reached the evening and with it Allah's entire kingdom. All praise is for Allah. There is no god but Allah alone, with no partners. His is the dominion, and His is the praise, and He has power over all things.",
    count: 1,
    category: "أذكار المساء",
    reference: "أبو داود"
  },
  {
    id: 2,
    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    translation: "O Allah, by You we have reached the evening, and by You we reach the morning. By You we live, and by You we die, and to You is our return.",
    count: 1,
    category: "أذكار المساء",
    reference: "الترمذي"
  }
];

// أذكار بعد الصلاة
export const PRAYER_AZKAR: Dhikr[] = [
  {
    id: 1,
    arabic: "سُبْحَانَ اللَّهِ",
    translation: "Glory be to Allah",
    transliteration: "Subhan Allah",
    count: 33,
    category: "أذكار بعد الصلاة",
    reference: "البخاري ومسلم"
  },
  {
    id: 2,
    arabic: "الْحَمْدُ لِلَّهِ",
    translation: "All praise is due to Allah",
    transliteration: "Alhamdulillah",
    count: 33,
    category: "أذكار بعد الصلاة",
    reference: "البخاري ومسلم"
  },
  {
    id: 3,
    arabic: "اللَّهُ أَكْبَرُ",
    translation: "Allah is the Greatest",
    transliteration: "Allahu Akbar",
    count: 34,
    category: "أذكار بعد الصلاة",
    reference: "البخاري ومسلم"
  }
];

// أذكار متنوعة
export const GENERAL_AZKAR: Dhikr[] = [
  {
    id: 1,
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    translation: "There is no god but Allah alone, with no partners. His is the dominion, and His is the praise, and He has power over all things.",
    transliteration: "La ilaha illa Allah wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa ala kulli shayin qadeer",
    count: 100,
    category: "أذكار عامة",
    reward: "من قالها مئة مرة في اليوم كانت له عدل عشر رقاب",
    reference: "البخاري ومسلم"
  },
  {
    id: 2,
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    translation: "Glory be to Allah and praise Him",
    transliteration: "Subhan Allahi wa bihamdihi",
    count: 100,
    category: "أذكار عامة",
    reward: "من قالها مئة مرة في اليوم حطت خطاياه وإن كانت مثل زبد البحر",
    reference: "البخاري ومسلم"
  }
];

// الأحاديث النبوية
export const AUTHENTIC_HADITHS: Hadith[] = [
  {
    id: 1,
    arabic: "قال رسول الله صلى الله عليه وسلم: إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى",
    translation: "The Messenger of Allah (peace be upon him) said: 'Actions are but by intention and every man shall have but that which he intended.'",
    narrator: "عمر بن الخطاب رضي الله عنه",
    reference: "صحيح البخاري ومسلم",
    category: "الأخلاق والآداب",
    explanation: "هذا الحديث أصل عظيم في الإسلام، يبين أن صحة العمل وفساده بحسب النية"
  },
  {
    id: 2,
    arabic: "قال رسول الله صلى الله عليه وسلم: من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت",
    translation: "The Messenger of Allah (peace be upon him) said: 'Whoever believes in Allah and the Last Day should speak good or remain silent.'",
    narrator: "أبو هريرة رضي الله عنه",
    reference: "صحيح البخاري ومسلم",
    category: "الأخلاق والآداب",
    explanation: "يحث هذا الحديث على حفظ اللسان وعدم قول إلا الخير أو الصمت"
  },
  {
    id: 3,
    arabic: "قال رسول الله صلى الله عليه وسلم: المسلم من سلم المسلمون من لسانه ويده",
    translation: "The Messenger of Allah (peace be upon him) said: 'A Muslim is one from whose tongue and hand other Muslims are safe.'",
    narrator: "عبد الله بن عمرو رضي الله عنهما",
    reference: "صحيح البخاري ومسلم",
    category: "الأخلاق والآداب",
    explanation: "تعريف المسلم الحقيقي بأنه من لا يؤذي المسلمين بقوله أو فعله"
  },
  {
    id: 4,
    arabic: "قال رسول الله صلى الله عليه وسلم: الطهور شطر الإيمان، والحمد لله تملأ الميزان، وسبحان الله والحمد لله تملآن أو تملأ ما بين السماوات والأرض",
    translation: "The Messenger of Allah (peace be upon him) said: 'Cleanliness is half of faith. Alhamdulillah fills the scale, and Subhan Allah and Alhamdulillah fill up what is between the heavens and the earth.'",
    narrator: "أبو مالك الأشعري رضي الله عنه",
    reference: "صحيح مسلم",
    category: "العبادة والذكر",
    explanation: "يبين فضل الطهارة والذكر وأثرهما العظيم في الإيمان"
  }
];

class AzkarStorage {
  private static instance: AzkarStorage;

  static getInstance(): AzkarStorage {
    if (!AzkarStorage.instance) {
      AzkarStorage.instance = new AzkarStorage();
    }
    return AzkarStorage.instance;
  }

  // جلب أذكار الصباح
  getMorningAzkar(): Dhikr[] {
    return MORNING_AZKAR;
  }

  // جلب أذكار المساء
  getEveningAzkar(): Dhikr[] {
    return EVENING_AZKAR;
  }

  // جلب أذكار بعد الصلاة
  getPrayerAzkar(): Dhikr[] {
    return PRAYER_AZKAR;
  }

  // جلب الأذكار العامة
  getGeneralAzkar(): Dhikr[] {
    return GENERAL_AZKAR;
  }

  // جلب جميع الأذكار
  getAllAzkar(): Dhikr[] {
    return [
      ...MORNING_AZKAR,
      ...EVENING_AZKAR,
      ...PRAYER_AZKAR,
      ...GENERAL_AZKAR
    ];
  }

  // جلب الأحاديث
  getHadiths(): Hadith[] {
    return AUTHENTIC_HADITHS;
  }

  // جلب حديث عشوائي
  getRandomHadith(): Hadith {
    const randomIndex = Math.floor(Math.random() * AUTHENTIC_HADITHS.length);
    return AUTHENTIC_HADITHS[randomIndex];
  }

  // البحث في الأذكار
  searchAzkar(query: string): Dhikr[] {
    const lowerQuery = query.toLowerCase();
    const allAzkar = this.getAllAzkar();
    
    return allAzkar.filter(dhikr => 
      dhikr.arabic.includes(query) || 
      dhikr.translation.toLowerCase().includes(lowerQuery) ||
      dhikr.category.includes(query)
    );
  }

  // البحث في الأحاديث
  searchHadiths(query: string): Hadith[] {
    const lowerQuery = query.toLowerCase();
    
    return AUTHENTIC_HADITHS.filter(hadith => 
      hadith.arabic.includes(query) || 
      hadith.translation.toLowerCase().includes(lowerQuery) ||
      hadith.narrator.includes(query) ||
      hadith.category.includes(query)
    );
  }

  // جلب أذكار حسب الفئة
  getAzkarByCategory(category: string): Dhikr[] {
    const allAzkar = this.getAllAzkar();
    return allAzkar.filter(dhikr => dhikr.category === category);
  }

  // جلب أحاديث حسب الفئة
  getHadithsByCategory(category: string): Hadith[] {
    return AUTHENTIC_HADITHS.filter(hadith => hadith.category === category);
  }
}

export default AzkarStorage;