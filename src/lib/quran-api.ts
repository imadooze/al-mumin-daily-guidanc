import axios from 'axios';

// API للقرآن الكريم من Quran.com
const QURAN_API_BASE = 'https://api.quran.com/api/v4';

export interface Surah {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  juz_number: number;
  hizb_number: number;
  rub_number: number;
  text_uthmani: string;
  text_simple: string;
  page_number: number;
  translations?: {
    id: number;
    language_name: string;
    text: string;
    resource_name: string;
  }[];
}

export interface ChapterResponse {
  chapter: Surah;
}

export interface ChaptersResponse {
  chapters: Surah[];
}

export interface VersesResponse {
  verses: Verse[];
}

// جلب قائمة السور
export const getSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await axios.get<ChaptersResponse>(`${QURAN_API_BASE}/chapters`);
    return response.data.chapters;
  } catch (error) {
    console.error('خطأ في جلب السور:', error);
    return [];
  }
};

// جلب آيات سورة معينة - جميع الآيات بدون تقسيم صفحات
export const getSurahVerses = async (surahId: number, translation: string = '131'): Promise<Verse[]> => {
  try {
    // جلب جميع آيات السورة دفعة واحدة مع عدد كبير للصفحة الواحدة
    const response = await axios.get<VersesResponse>(
      `${QURAN_API_BASE}/verses/by_chapter/${surahId}?language=ar&text_type=uthmani&fields=text_uthmani,text_simple,page_number,verse_number,verse_key&translations=${translation}&per_page=300`
    );
    
    let allVerses = response.data.verses;
    
    // في حالة وجود آيات أكثر، جلب الصفحات المتبقية
    if (response.data.verses.length === 300) {
      let page = 2;
      let hasMorePages = true;
      
      while (hasMorePages) {
        try {
          const nextResponse = await axios.get<VersesResponse>(
            `${QURAN_API_BASE}/verses/by_chapter/${surahId}?language=ar&text_type=uthmani&fields=text_uthmani,text_simple,page_number,verse_number,verse_key&translations=${translation}&per_page=300&page=${page}`
          );
          
          if (nextResponse.data.verses.length > 0) {
            allVerses = [...allVerses, ...nextResponse.data.verses];
            page++;
            
            // إذا كانت الصفحة تحتوي على آيات أقل من 300، فهي الصفحة الأخيرة
            if (nextResponse.data.verses.length < 300) {
              hasMorePages = false;
            }
          } else {
            hasMorePages = false;
          }
        } catch (pageError) {
          console.error(`خطأ في جلب الصفحة ${page}:`, pageError);
          hasMorePages = false;
        }
      }
    }
    
    return allVerses;
  } catch (error) {
    console.error('خطأ في جلب الآيات:', error);
    return [];
  }
};

// جلب آية عشوائية لآية اليوم
export const getRandomVerse = async (): Promise<Verse | null> => {
  try {
    const randomSurah = Math.floor(Math.random() * 114) + 1;
    const surahInfo = await getSurahVerses(randomSurah);
    if (surahInfo.length > 0) {
      const randomVerse = Math.floor(Math.random() * surahInfo.length);
      return surahInfo[randomVerse];
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب آية عشوائية:', error);
    return null;
  }
};

// البحث في القرآن
export const searchQuran = async (query: string): Promise<Verse[]> => {
  try {
    const response = await axios.get<VersesResponse>(
      `${QURAN_API_BASE}/search?q=${encodeURIComponent(query)}&size=20&language=ar`
    );
    return response.data.verses;
  } catch (error) {
    console.error('خطأ في البحث:', error);
    return [];
  }
};