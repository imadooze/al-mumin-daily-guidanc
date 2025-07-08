import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, BookOpen, Moon, Sun, Loader2 } from 'lucide-react';
import { getSurahs, getSurahVerses, type Surah, type Verse } from '@/lib/quran-api';
import { useToast } from '@/hooks/use-toast';

interface QuranPageProps {
  onPageChange?: (page: string) => void;
}

export default function QuranPage({ onPageChange }: QuranPageProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [versesLoading, setVersesLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      const surahsData = await getSurahs();
      setSurahs(surahsData);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل السور',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSurahVerses = async (surah: Surah) => {
    try {
      setVersesLoading(true);
      setSelectedSurah(surah);
      const versesData = await getSurahVerses(surah.id);
      setVerses(versesData);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل آيات السورة',
        variant: 'destructive'
      });
    } finally {
      setVersesLoading(false);
    }
  };

  const goBackToSurahs = () => {
    setSelectedSurah(null);
    setVerses([]);
  };

  const filteredSurahs = surahs.filter(surah => 
    surah.name_arabic.includes(searchTerm) || 
    surah.name_simple.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.translated_name.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* العنوان الرئيسي */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange?.('home')}
          className="rounded-full"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground font-arabic-display">
            القرآن الكريم
          </h1>
          <p className="text-muted-foreground">Holy Quran</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-full"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* شريط البحث */}
      <Card className="islamic-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="ابحث عن سورة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2 text-muted-foreground">جاري تحميل السور...</span>
        </div>
      ) : selectedSurah ? (
        /* عرض آيات السورة */
        <div className="space-y-4">
          <Card className="islamic-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBackToSurahs}
                  className="gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  العودة للسور
                </Button>
                <div className="text-center">
                  <CardTitle className="text-xl font-arabic-display">
                    سورة {selectedSurah.name_arabic}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedSurah.verses_count} آية - {selectedSurah.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}
                  </p>
                </div>
                <div className="w-20"></div>
              </div>
            </CardHeader>
          </Card>

          {versesLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-2 text-muted-foreground">جاري تحميل الآيات...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {verses.map((verse) => (
                <Card key={verse.id} className="islamic-card">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">{verse.verse_number}</span>
                        </div>
                        <div className="flex-1 arabic-text text-lg leading-relaxed">
                          {verse.text_uthmani}
                        </div>
                      </div>
                      {verse.translations && verse.translations.length > 0 && (
                        <div className="border-t border-border pt-4">
                          <p className="text-sm text-muted-foreground italic">
                            {verse.translations[0].text}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* قائمة السور */
        <div className="space-y-3">
          {filteredSurahs.map((surah) => (
            <Card 
              key={surah.id} 
              className="islamic-card hover-lift cursor-pointer"
              onClick={() => loadSurahVerses(surah)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{surah.id}</span>
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg font-arabic">{surah.name_arabic}</h3>
                      <p className="text-sm text-muted-foreground">{surah.translated_name.name}</p>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{surah.verses_count} آية</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      surah.revelation_place === 'makkah' 
                        ? 'bg-islamic-green/20 text-islamic-green'
                        : 'bg-islamic-blue/20 text-islamic-blue'
                    }`}>
                      {surah.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* رسالة عدم وجود نتائج */}
          {filteredSurahs.length === 0 && !loading && (
            <Card className="islamic-card">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لم يتم العثور على سور تطابق البحث</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}