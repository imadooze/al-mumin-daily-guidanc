/**
 * مخزن القرآن الكريم المحلي
 * يحتوي على السور والآيات مخزنة محلياً للعمل أوفلاين
 */

export interface QuranVerse {
  number: number;
  arabic: string;
  translation?: string;
  transliteration?: string;
}

export interface QuranSurah {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  revelationPlace: 'Makkah' | 'Madinah';
  versesCount: number;
  verses: QuranVerse[];
}

// قائمة السور مع معلوماتها الأساسية
export const QURAN_SURAHS: Omit<QuranSurah, 'verses'>[] = [
  { number: 1, name: 'الفاتحة', arabicName: 'الفاتحة', englishName: 'Al-Fatihah', revelationPlace: 'Makkah', versesCount: 7 },
  { number: 2, name: 'البقرة', arabicName: 'البقرة', englishName: 'Al-Baqarah', revelationPlace: 'Madinah', versesCount: 286 },
  { number: 3, name: 'آل عمران', arabicName: 'آل عمران', englishName: 'Ali Imran', revelationPlace: 'Madinah', versesCount: 200 },
  { number: 4, name: 'النساء', arabicName: 'النساء', englishName: 'An-Nisa', revelationPlace: 'Madinah', versesCount: 176 },
  { number: 5, name: 'المائدة', arabicName: 'المائدة', englishName: 'Al-Maidah', revelationPlace: 'Madinah', versesCount: 120 },
  // ... يمكن إضافة باقي السور
];

// آيات مختارة للعرض السريع
export const FEATURED_VERSES: QuranVerse[] = [
  {
    number: 1,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    transliteration: "Bismillah ir-Rahman ir-Raheem"
  },
  {
    number: 2,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    translation: "All praise is due to Allah, Lord of the worlds.",
    transliteration: "Alhamdu lillahi rabbil alameen"
  },
  {
    number: 255,
    arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
    translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.",
    transliteration: "Allahu la ilaha illa huwa al-hayyul qayyoom"
  }
];

// سورة الفاتحة كاملة
export const AL_FATIHAH: QuranVerse[] = [
  {
    number: 1,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful."
  },
  {
    number: 2,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    translation: "All praise is due to Allah, Lord of the worlds."
  },
  {
    number: 3,
    arabic: "الرَّحْمَنِ الرَّحِيمِ",
    translation: "The Entirely Merciful, the Especially Merciful."
  },
  {
    number: 4,
    arabic: "مَالِكِ يَوْمِ الدِّينِ",
    translation: "Sovereign of the Day of Recompense."
  },
  {
    number: 5,
    arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    translation: "It is You we worship and You we ask for help."
  },
  {
    number: 6,
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    translation: "Guide us to the straight path."
  },
  {
    number: 7,
    arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    translation: "The path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray."
  }
];

// آية الكرسي
export const AYAT_AL_KURSI: QuranVerse = {
  number: 255,
  arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
  translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great."
};

// آيات للقراءة اليومية
export const DAILY_VERSES = [
  {
    arabic: "وَاصْبِرْ نَفْسَكَ مَعَ الَّذِينَ يَدْعُونَ رَبَّهُم بِالْغَدَاةِ وَالْعَشِيِّ يُرِيدُونَ وَجْهَهُ",
    translation: "And keep yourself patient with those who call upon their Lord morning and evening, seeking His countenance.",
    reference: "سورة الكهف - الآية 28",
    tafsir: "تحث هذه الآية على الصبر والصحبة الصالحة مع الذين يذكرون الله في الصباح والمساء"
  },
  {
    arabic: "وَبَشِّرِ الصَّابِرِينَ * الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    translation: "And give good tidings to the patient, Who, when disaster strikes them, say, 'Indeed we belong to Allah, and indeed to Him we will return.'",
    reference: "سورة البقرة - الآيتان 155-156",
    tafsir: "بشارة للصابرين الذين يسترجعون عند المصائب ويتذكرون أنهم ملك لله وإليه راجعون"
  },
  {
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    translation: "And whoever fears Allah - He will make for him a way out. And will provide for him from where he does not expect.",
    reference: "سورة الطلاق - الآيتان 2-3",
    tafsir: "وعد من الله للمتقين بأن يجعل لهم مخرجاً من كل ضيق ويرزقهم من حيث لا يحتسبون"
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    translation: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    reference: "سورة البقرة - الآية 152",
    tafsir: "دعوة إلى ذكر الله والشكر له، مع وعد بأن الله يذكر من ذكره"
  },
  {
    arabic: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
    translation: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?",
    reference: "سورة القمر - الآية 17",
    tafsir: "يبين الله أنه سهل القرآن للحفظ والفهم والتدبر، ويدعو للاستفادة من هذا التيسير"
  }
];

class QuranStorage {
  private static instance: QuranStorage;

  static getInstance(): QuranStorage {
    if (!QuranStorage.instance) {
      QuranStorage.instance = new QuranStorage();
    }
    return QuranStorage.instance;
  }

  // جلب قائمة السور
  getSurahs(): Omit<QuranSurah, 'verses'>[] {
    return QURAN_SURAHS;
  }

  // جلب سورة معينة
  getSurah(surahNumber: number): QuranSurah | null {
    if (surahNumber === 1) {
      return {
        ...QURAN_SURAHS[0],
        verses: AL_FATIHAH
      };
    }
    
    // يمكن إضافة المزيد من السور المحفوظة محلياً
    return null;
  }

  // جلب آية عشوائية
  getRandomVerse(): any {
    const randomIndex = Math.floor(Math.random() * DAILY_VERSES.length);
    return DAILY_VERSES[randomIndex];
  }

  // جلب آية الكرسي
  getAyatAlKursi(): QuranVerse {
    return AYAT_AL_KURSI;
  }

  // جلب آيات مميزة
  getFeaturedVerses(): QuranVerse[] {
    return FEATURED_VERSES;
  }

  // جلب آيات للقراءة اليومية
  getDailyVerses(): any[] {
    return DAILY_VERSES;
  }

  // البحث في الآيات المحفوظة
  searchVerses(query: string): any[] {
    const lowerQuery = query.toLowerCase();
    return DAILY_VERSES.filter(verse => 
      verse.arabic.includes(query) || 
      verse.translation.toLowerCase().includes(lowerQuery) ||
      verse.reference.includes(query)
    );
  }
}

export default QuranStorage;