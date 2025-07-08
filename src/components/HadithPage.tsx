import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, BookOpen, Star } from 'lucide-react';

interface HadithPageProps {
  onPageChange?: (page: string) => void;
}

export default function HadithPage({ onPageChange }: HadithPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const hadithCategories = [
    { id: 'all', name: 'الكل', nameEn: 'All' },
    { id: 'aqeedah', name: 'العقيدة', nameEn: 'Faith' },
    { id: 'akhlaq', name: 'الأخلاق', nameEn: 'Ethics' },
    { id: 'salah', name: 'الصلاة', nameEn: 'Prayer' },
    { id: 'ilm', name: 'العلم', nameEn: 'Knowledge' },
    { id: 'birr', name: 'البر', nameEn: 'Righteousness' },
    { id: 'zakat', name: 'الزكاة', nameEn: 'Charity' },
    { id: 'hajj', name: 'الحج', nameEn: 'Pilgrimage' }
  ];

  const ahadith = [
    {
      id: 1,
      category: 'aqeedah',
      title: 'حديث جبريل',
      arabic: 'عَنْ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: بَيْنَمَا نَحْنُ عِنْدَ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ ذَاتَ يَوْمٍ إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ، شَدِيدُ سَوَادِ الشَّعَرِ، لَا يُرَى عَلَيْهِ أَثَرُ السَّفَرِ، وَلَا يَعْرِفُهُ مِنَّا أَحَدٌ، حَتَّى جَلَسَ إِلَى النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، فَأَسْنَدَ رُكْبَتَيْهِ إِلَى رُكْبَتَيْهِ، وَوَضَعَ كَفَّيْهِ عَلَى فَخِذَيْهِ، وَقَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنِ الْإِسْلَامِ. فَقَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: الْإِسْلَامُ أَنْ تَشْهَدَ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلَاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلًا',
      source: 'صحيح مسلم',
      narrator: 'عمر بن الخطاب رضي الله عنه',
      explanation: 'هذا الحديث يعرّف الإسلام والإيمان والإحسان، وهو من أصول الدين'
    },
    {
      id: 2,
      category: 'akhlaq',
      title: 'حسن الخلق',
      arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ',
      source: 'موطأ مالك',
      narrator: 'أبو هريرة رضي الله عنه',
      explanation: 'الهدف من بعثة النبي صلى الله عليه وسلم هو إتمام مكارم الأخلاق'
    },
    {
      id: 3,
      category: 'salah',
      title: 'عماد الدين',
      arabic: 'عَنْ مُعَاذِ بْنِ جَبَلٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: رَأْسُ الْأَمْرِ الْإِسْلَامُ، وَعَمُودُهُ الصَّلَاةُ، وَذِرْوَةُ سَنَامِهِ الْجِهَادُ',
      source: 'سنن الترمذي',
      narrator: 'معاذ بن جبل رضي الله عنه',
      explanation: 'الصلاة هي عماد الدين وأساسه بعد الشهادتين'
    },
    {
      id: 4,
      category: 'ilm',
      title: 'فضل العلم',
      arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
      source: 'صحيح مسلم',
      narrator: 'أبو هريرة رضي الله عنه',
      explanation: 'فضل طلب العلم وأن الله يسهل طريق الجنة لطالب العلم'
    },
    {
      id: 5,
      category: 'birr',
      title: 'بر الوالدين',
      arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ فَقَالَ: يَا رَسُولَ اللَّهِ، مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أَبُوكَ',
      source: 'صحيح البخاري ومسلم',
      narrator: 'أبو هريرة رضي الله عنه',
      explanation: 'فضل بر الوالدين وأن الأم أولى بحسن الصحبة'
    },
    {
      id: 6,
      category: 'zakat',
      title: 'فضل الصدقة',
      arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: مَا تَصَدَّقَ أَحَدٌ بِصَدَقَةٍ مِنْ طَيِّبٍ، وَلَا يَقْبَلُ اللَّهُ إِلَّا الطَّيِّبَ، إِلَّا أَخَذَهَا الرَّحْمَنُ بِيَمِينِهِ، وَإِنْ كَانَتْ تَمْرَةً، فَتَرْبُو فِي كَفِّ الرَّحْمَنِ حَتَّى تَكُونَ أَعْظَمَ مِنَ الْجَبَلِ',
      source: 'صحيح البخاري ومسلم',
      narrator: 'أبو هريرة رضي الله عنه',
      explanation: 'فضل الصدقة من الطيب وأن الله ينمي الصدقة'
    },
    {
      id: 7,
      category: 'hajj',
      title: 'فضل الحج',
      arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: الْحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الْجَنَّةُ',
      source: 'صحيح البخاري ومسلم',
      narrator: 'أبو هريرة رضي الله عنه',
      explanation: 'فضل الحج المبرور وأن جزاؤه الجنة'
    },
    {
      id: 8,
      category: 'akhlaq',
      title: 'الكلمة الطيبة',
      arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ',
      source: 'صحيح البخاري ومسلم',
      narrator: 'أبو هريرة رضي الله عنه',
      explanation: 'فضل الكلمة الطيبة وأنها من الصدقات'
    }
  ];

  const filteredAhadith = ahadith.filter(hadith => {
    const matchesSearch = hadith.title.includes(searchTerm) || hadith.arabic.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || hadith.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            الأحاديث النبوية
          </h1>
          <p className="text-muted-foreground">Prophetic Traditions</p>
        </div>

        <div className="w-10"></div>
      </div>

      {/* شريط البحث */}
      <Card className="islamic-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="ابحث في الأحاديث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      {/* تصنيفات الأحاديث */}
      <Card className="islamic-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {hadithCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`${
                  selectedCategory === category.id 
                    ? 'bg-gradient-primary text-white' 
                    : 'hover:bg-muted'
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* قائمة الأحاديث */}
      <div className="space-y-4">
        {filteredAhadith.map((hadith) => (
          <Card key={hadith.id} className="islamic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-right text-lg">
                <Star className="h-5 w-5 text-islamic-gold" />
                {hadith.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="arabic-text text-base leading-relaxed p-4 bg-muted/20 rounded-lg">
                {hadith.arabic}
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <strong>الراوي:</strong> {hadith.narrator}
                </div>
                <div className="flex items-center gap-2 text-sm text-islamic-blue">
                  <BookOpen className="h-4 w-4" />
                  <span>{hadith.source}</span>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <strong>الشرح:</strong> {hadith.explanation}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* رسالة عدم وجود نتائج */}
      {filteredAhadith.length === 0 && (
        <Card className="islamic-card">
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لم يتم العثور على أحاديث تطابق البحث</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}