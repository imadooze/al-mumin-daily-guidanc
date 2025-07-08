import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Volume2, Heart } from 'lucide-react';

interface Name {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  meaning: string;
  description: string;
}

interface NamesPageProps {
  onPageChange?: (page: string) => void;
}

export default function NamesPage({ onPageChange }: NamesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedName, setSelectedName] = useState<Name | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // أسماء الله الحسنى الـ99
  const names: Name[] = [
    {
      id: 1,
      arabic: 'الله',
      transliteration: 'Allah',
      translation: 'Allah',
      meaning: 'الاسم الأعظم',
      description: 'الاسم الجامع لجميع صفات الكمال والجلال والجمال'
    },
    {
      id: 2,
      arabic: 'الرَّحْمٰن',
      transliteration: 'Ar-Rahman',
      translation: 'The Most Merciful',
      meaning: 'الرحيم بجميع خلقه',
      description: 'الذي وسعت رحمته كل شيء في الدنيا والآخرة'
    },
    {
      id: 3,
      arabic: 'الرَّحِيم',
      transliteration: 'Ar-Raheem',
      translation: 'The Most Compassionate',
      meaning: 'الرحيم بالمؤمنين خاصة',
      description: 'الذي يرحم عباده المؤمنين رحمة خاصة في الآخرة'
    },
    {
      id: 4,
      arabic: 'الْمَلِك',
      transliteration: 'Al-Malik',
      translation: 'The King',
      meaning: 'المالك لكل شيء',
      description: 'صاحب الملك المطلق الذي لا ينازعه فيه أحد'
    },
    {
      id: 5,
      arabic: 'الْقُدُّوس',
      transliteration: 'Al-Quddus',
      translation: 'The Most Holy',
      meaning: 'المنزه عن كل نقص',
      description: 'الطاهر المنزه عن جميع النقائص والعيوب'
    },
    {
      id: 6,
      arabic: 'السَّلَام',
      transliteration: 'As-Salaam',
      translation: 'The Source of Peace',
      meaning: 'مصدر السلام والأمان',
      description: 'الذي سلم من جميع العيوب والنقائص'
    },
    {
      id: 7,
      arabic: 'الْمُؤْمِن',
      transliteration: 'Al-Mu\'min',
      translation: 'The Guardian of Faith',
      meaning: 'المصدق لرسله',
      description: 'الذي يؤمن عباده من عذابه ويصدق رسله'
    },
    {
      id: 8,
      arabic: 'الْمُهَيْمِن',
      transliteration: 'Al-Muhaymin',
      translation: 'The Guardian',
      meaning: 'المهيمن على كل شيء',
      description: 'الرقيب الحافظ لكل شيء والشاهد على كل شيء'
    },
    {
      id: 9,
      arabic: 'الْعَزِيز',
      transliteration: 'Al-Azeez',
      translation: 'The Almighty',
      meaning: 'القوي الغالب',
      description: 'الذي لا يغلب ولا يقهر وهو الغالب لكل شيء'
    },
    {
      id: 10,
      arabic: 'الْجَبَّار',
      transliteration: 'Al-Jabbar',
      translation: 'The Compeller',
      meaning: 'القاهر العظيم',
      description: 'الذي يجبر الضعيف ويقهر الجبابرة بجبروته'
    },
    {
      id: 11,
      arabic: 'الْمُتَكَبِّر',
      transliteration: 'Al-Mutakabbir',
      translation: 'The Majestic',
      meaning: 'العظيم الكبير',
      description: 'المتعالي عن صفات الخلق المختص بصفات العظمة'
    },
    {
      id: 12,
      arabic: 'الْخَالِق',
      transliteration: 'Al-Khaliq',
      translation: 'The Creator',
      meaning: 'موجد كل شيء',
      description: 'الذي أوجد الأشياء من العدم وقدرها تقديراً'
    },
    {
      id: 13,
      arabic: 'الْبَارِئ',
      transliteration: 'Al-Bari',
      translation: 'The Originator',
      meaning: 'المبدع للخلق',
      description: 'الذي خلق الخلق بريئاً من التفاوت والاضطراب'
    },
    {
      id: 14,
      arabic: 'الْمُصَوِّر',
      transliteration: 'Al-Musawwir',
      translation: 'The Fashioner',
      meaning: 'مشكل كل مخلوق',
      description: 'الذي صور جميع الموجودات ورتبها فأعطى كل شيء صورته'
    },
    {
      id: 15,
      arabic: 'الْغَفَّار',
      transliteration: 'Al-Ghaffar',
      translation: 'The Repeatedly Forgiving',
      meaning: 'كثير المغفرة',
      description: 'الذي يغفر الذنوب مهما كثرت وعظمت لمن تاب واستغفر'
    },
    // يمكن إضافة باقي الأسماء الـ84...
    {
      id: 16,
      arabic: 'الْقَهَّار',
      transliteration: 'Al-Qahhar',
      translation: 'The Dominant',
      meaning: 'الغالب لكل شيء',
      description: 'الذي قهر كل شيء وخضع لعزته كل شيء'
    },
    {
      id: 17,
      arabic: 'الْوَهَّاب',
      transliteration: 'Al-Wahhab',
      translation: 'The Bestower',
      meaning: 'كثير العطاء',
      description: 'الذي يهب العطايا ويجزل المواهب بلا عوض'
    },
    {
      id: 18,
      arabic: 'الرَّزَّاق',
      transliteration: 'Ar-Razzaq',
      translation: 'The Provider',
      meaning: 'مقسم الأرزاق',
      description: 'الذي يرزق جميع الخلائق ويوصل إليهم أقواتهم'
    },
    {
      id: 19,
      arabic: 'الْفَتَّاح',
      transliteration: 'Al-Fattah',
      translation: 'The Opener',
      meaning: 'فاتح أبواب الرحمة',
      description: 'الذي يفتح أبواب الرزق والرحمة والهداية لعباده'
    },
    {
      id: 20,
      arabic: 'الْعَلِيم',
      transliteration: 'Al-Aleem',
      translation: 'The All-Knowing',
      meaning: 'العالم بكل شيء',
      description: 'الذي أحاط علمه بجميع الأشياء ظاهرها وباطنها'
    }
    // ... باقي الأسماء يمكن إضافتها تدريجياً
  ];

  const filteredNames = names.filter(name =>
    name.arabic.includes(searchTerm) ||
    name.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.meaning.includes(searchTerm)
  );

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const playAudio = (arabic: string) => {
    // يمكن إضافة تشغيل الصوت هنا
    // const audio = new Audio(`/audio/names/${arabic}.mp3`);
    // audio.play();
    console.log(`Playing audio for: ${arabic}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground font-arabic-display">
          أسماء الله الحسنى
        </h1>
        <p className="text-muted-foreground">
          الأسماء التسعة والتسعون المبركة
        </p>
        <div className="text-lg font-arabic-display text-islamic-green">
          "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا"
        </div>
      </div>

      {/* شريط البحث */}
      <Card className="islamic-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في أسماء الله الحسنى..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-arabic"
            />
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-green">{names.length}</div>
            <p className="text-sm text-muted-foreground">إجمالي الأسماء</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-blue">{filteredNames.length}</div>
            <p className="text-sm text-muted-foreground">نتائج البحث</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-gold">{favorites.length}</div>
            <p className="text-sm text-muted-foreground">المفضلة</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">99</div>
            <p className="text-sm text-muted-foreground">الأسماء الحسنى</p>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الأسماء */}
      <div className="grid gap-4">
        {filteredNames.map((name) => (
          <Card
            key={name.id}
            className={`islamic-card hover-lift cursor-pointer transition-all duration-300 ${
              selectedName?.id === name.id ? 'ring-2 ring-islamic-green shadow-islamic' : ''
            }`}
            onClick={() => setSelectedName(selectedName?.id === name.id ? null : name)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className="bg-islamic-green text-white min-w-[3rem] justify-center">
                    {name.id}
                  </Badge>
                  <div>
                    <CardTitle className="text-2xl font-arabic-display text-islamic-green">
                      {name.arabic}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {name.transliteration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(name.arabic);
                    }}
                    className="h-8 w-8"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(name.id);
                    }}
                    className="h-8 w-8"
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(name.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">المعنى:</span>
                  <span className="text-sm text-muted-foreground">{name.meaning}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">الترجمة:</span>
                  <span className="text-sm text-muted-foreground italic">{name.translation}</span>
                </div>
                
                {selectedName?.id === name.id && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg animate-fade-in">
                    <h4 className="font-bold text-islamic-green mb-2">الشرح والتفسير:</h4>
                    <p className="text-sm leading-relaxed font-arabic">
                      {name.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNames.length === 0 && (
        <Card className="islamic-card">
          <CardContent className="pt-6 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد نتائج للبحث "{searchTerm}"</p>
              <p className="text-sm mt-2">جرب البحث بكلمات مختلفة</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* معلومات إضافية */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center text-islamic-green">فضل معرفة أسماء الله الحسنى</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <div className="text-lg font-arabic-display leading-relaxed">
              "مَن أَحْصاها دَخَلَ الجَنَّةَ"
            </div>
            <p className="text-sm text-muted-foreground">
              صحيح البخاري ومسلم
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-bold text-islamic-green mb-2">معنى الإحصاء:</h4>
                <ul className="space-y-1 text-right text-xs">
                  <li>• الحفظ والفهم</li>
                  <li>• التدبر والتفكر</li>
                  <li>• الدعاء بها</li>
                  <li>• التعبد لله بمقتضاها</li>
                </ul>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-bold text-islamic-blue mb-2">آداب التعامل معها:</h4>
                <ul className="space-y-1 text-right text-xs">
                  <li>• التعظيم والإجلال</li>
                  <li>• عدم التحريف أو التشبيه</li>
                  <li>• الدعاء بها في الصلاة</li>
                  <li>• التخلق بآثارها</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}