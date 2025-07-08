import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, BookOpen, Moon, Sun } from 'lucide-react';

interface QuranPageProps {
  onPageChange?: (page: string) => void;
}

export default function QuranPage({ onPageChange }: QuranPageProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const surahs = [
    { number: 1, name: 'الفاتحة', nameEn: 'Al-Fatihah', verses: 7, type: 'مكية' },
    { number: 2, name: 'البقرة', nameEn: 'Al-Baqarah', verses: 286, type: 'مدنية' },
    { number: 3, name: 'آل عمران', nameEn: 'Ali Imran', verses: 200, type: 'مدنية' },
    { number: 4, name: 'النساء', nameEn: 'An-Nisa', verses: 176, type: 'مدنية' },
    { number: 5, name: 'المائدة', nameEn: 'Al-Maidah', verses: 120, type: 'مدنية' },
    { number: 6, name: 'الأنعام', nameEn: 'Al-Anaam', verses: 165, type: 'مكية' },
    { number: 7, name: 'الأعراف', nameEn: 'Al-Araf', verses: 206, type: 'مكية' },
    { number: 8, name: 'الأنفال', nameEn: 'Al-Anfal', verses: 75, type: 'مدنية' },
    { number: 9, name: 'التوبة', nameEn: 'At-Tawbah', verses: 129, type: 'مدنية' },
    { number: 10, name: 'يونس', nameEn: 'Yunus', verses: 109, type: 'مكية' },
    { number: 11, name: 'هود', nameEn: 'Hud', verses: 123, type: 'مكية' },
    { number: 12, name: 'يوسف', nameEn: 'Yusuf', verses: 111, type: 'مكية' },
    { number: 13, name: 'الرعد', nameEn: 'Ar-Rad', verses: 43, type: 'مدنية' },
    { number: 14, name: 'إبراهيم', nameEn: 'Ibrahim', verses: 52, type: 'مكية' },
    { number: 15, name: 'الحجر', nameEn: 'Al-Hijr', verses: 99, type: 'مكية' },
    { number: 16, name: 'النحل', nameEn: 'An-Nahl', verses: 128, type: 'مكية' },
    { number: 17, name: 'الإسراء', nameEn: 'Al-Isra', verses: 111, type: 'مكية' },
    { number: 18, name: 'الكهف', nameEn: 'Al-Kahf', verses: 110, type: 'مكية' },
    { number: 19, name: 'مريم', nameEn: 'Maryam', verses: 98, type: 'مكية' },
    { number: 20, name: 'طه', nameEn: 'Ta-Ha', verses: 135, type: 'مكية' },
    { number: 21, name: 'الأنبياء', nameEn: 'Al-Anbiya', verses: 112, type: 'مكية' },
    { number: 22, name: 'الحج', nameEn: 'Al-Hajj', verses: 78, type: 'مدنية' },
    { number: 23, name: 'المؤمنون', nameEn: 'Al-Muminun', verses: 118, type: 'مكية' },
    { number: 24, name: 'النور', nameEn: 'An-Nur', verses: 64, type: 'مدنية' },
    { number: 25, name: 'الفرقان', nameEn: 'Al-Furqan', verses: 77, type: 'مكية' },
    { number: 26, name: 'الشعراء', nameEn: 'Ash-Shuara', verses: 227, type: 'مكية' },
    { number: 27, name: 'النمل', nameEn: 'An-Naml', verses: 93, type: 'مكية' },
    { number: 28, name: 'القصص', nameEn: 'Al-Qasas', verses: 88, type: 'مكية' },
    { number: 29, name: 'العنكبوت', nameEn: 'Al-Ankabut', verses: 69, type: 'مكية' },
    { number: 30, name: 'الروم', nameEn: 'Ar-Rum', verses: 60, type: 'مكية' }
  ];

  const filteredSurahs = surahs.filter(surah => 
    surah.name.includes(searchTerm) || 
    surah.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* قائمة السور */}
      <div className="space-y-3">
        {filteredSurahs.map((surah) => (
          <Card key={surah.number} className="islamic-card hover-lift cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{surah.number}</span>
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg font-arabic">{surah.name}</h3>
                    <p className="text-sm text-muted-foreground">{surah.nameEn}</p>
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{surah.verses} آية</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    surah.type === 'مكية' 
                      ? 'bg-islamic-green/20 text-islamic-green'
                      : 'bg-islamic-blue/20 text-islamic-blue'
                  }`}>
                    {surah.type}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* رسالة عدم وجود نتائج */}
      {filteredSurahs.length === 0 && (
        <Card className="islamic-card">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لم يتم العثور على سور تطابق البحث</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}