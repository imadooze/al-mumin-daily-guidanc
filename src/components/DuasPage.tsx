import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, Heart, BookOpen } from 'lucide-react';

interface DuasPageProps {
  onPageChange?: (page: string) => void;
}

export default function DuasPage({ onPageChange }: DuasPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const duaCategories = [
    { id: 'all', name: 'الكل', nameEn: 'All' },
    { id: 'rizq', name: 'الرزق', nameEn: 'Sustenance' },
    { id: 'tawbah', name: 'التوبة', nameEn: 'Repentance' },
    { id: 'karb', name: 'الكرب', nameEn: 'Distress' },
    { id: 'marad', name: 'المرض', nameEn: 'Illness' },
    { id: 'istikhara', name: 'الاستخارة', nameEn: 'Guidance' },
    { id: 'walidayn', name: 'الوالدين', nameEn: 'Parents' },
    { id: 'zawaj', name: 'الزواج', nameEn: 'Marriage' },
    { id: 'safar', name: 'السفر', nameEn: 'Travel' }
  ];

  const duas = [
    {
      id: 1,
      category: 'rizq',
      title: 'دعاء الرزق',
      arabic: 'اللَّهُمَّ اكْفِنِي بِحَلالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
      source: 'سنن الترمذي',
      meaning: 'اللهم اجعل الحلال يكفيني عن الحرام، وأغنني بفضلك عن كل أحد سواك'
    },
    {
      id: 2,
      category: 'tawbah',
      title: 'سيد الاستغفار',
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ',
      source: 'صحيح البخاري',
      meaning: 'هذا هو سيد الاستغفار، من قاله موقناً به حين يمسي فمات من ليلته دخل الجنة'
    },
    {
      id: 3,
      category: 'karb',
      title: 'دعاء الكرب العظيم',
      arabic: 'لا إِلَهَ إِلا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لا إِلَهَ إِلا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لا إِلَهَ إِلا اللَّهُ رَبُّ السَّمَوَاتِ وَرَبُّ الأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
      source: 'صحيح البخاري ومسلم',
      meaning: 'دعاء يُقال عند الكرب والهم والغم'
    },
    {
      id: 4,
      category: 'marad',
      title: 'دعاء الشفاء',
      arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لا شِفَاءَ إِلا شِفَاؤُكَ، شِفَاءً لا يُغَادِرُ سَقَماً',
      source: 'صحيح البخاري ومسلم',
      meaning: 'دعاء يُقال للمريض طلباً للشفاء من الله'
    },
    {
      id: 5,
      category: 'istikhara',
      title: 'دعاء الاستخارة',
      arabic: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلا أَقْدِرُ وَتَعْلَمُ وَلا أَعْلَمُ وَأَنْتَ عَلامُ الْغُيُوبِ، اللَّهُمَّ إِن كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِي الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ',
      source: 'صحيح البخاري',
      meaning: 'يُصلى ركعتان ثم يُدعى بهذا الدعاء عند التردد في أمر ما'
    },
    {
      id: 6,
      category: 'walidayn',
      title: 'دعاء للوالدين',
      arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيراً',
      source: 'القرآن الكريم - سورة الإسراء',
      meaning: 'دعاء من القرآن للوالدين بالمغفرة والرحمة'
    },
    {
      id: 7,
      category: 'zawaj',
      title: 'دعاء طلب الزوج الصالح',
      arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَاماً',
      source: 'القرآن الكريم - سورة الفرقان',
      meaning: 'دعاء لطلب الزوج الصالح والذرية الطيبة'
    },
    {
      id: 8,
      category: 'safar',
      title: 'دعاء السفر',
      arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى',
      source: 'سنن الترمذي',
      meaning: 'دعاء يُقال عند بداية السفر'
    }
  ];

  const filteredDuas = duas.filter(dua => {
    const matchesSearch = dua.title.includes(searchTerm) || dua.arabic.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || dua.category === selectedCategory;
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
            الأدعية المختارة
          </h1>
          <p className="text-muted-foreground">Selected Du'as</p>
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
              placeholder="ابحث في الأدعية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      {/* تصنيفات الأدعية */}
      <Card className="islamic-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {duaCategories.map((category) => (
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

      {/* قائمة الأدعية */}
      <div className="space-y-4">
        {filteredDuas.map((dua) => (
          <Card key={dua.id} className="islamic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-right text-lg">
                <Heart className="h-5 w-5 text-islamic-green" />
                {dua.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="arabic-text text-lg leading-relaxed p-4 bg-muted/20 rounded-lg">
                {dua.arabic}
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <strong>المعنى:</strong> {dua.meaning}
                </div>
                <div className="flex items-center gap-2 text-sm text-islamic-blue">
                  <BookOpen className="h-4 w-4" />
                  <span>{dua.source}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* رسالة عدم وجود نتائج */}
      {filteredDuas.length === 0 && (
        <Card className="islamic-card">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لم يتم العثور على أدعية تطابق البحث</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}