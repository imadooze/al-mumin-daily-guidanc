import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Moon, Bed, Building, Coffee, Shield } from 'lucide-react';

interface Zikr {
  id: string;
  text: string;
  translation: string;
  count: number;
  source: string;
  benefits?: string;
}

interface AzkarPageProps {
  onPageChange?: (page: string) => void;
}

export default function AzkarPage({ onPageChange }: AzkarPageProps) {
  const [counters, setCounters] = useState<Record<string, number>>({});

  const azkarCategories = [
    {
      id: 'morning',
      title: 'أذكار الصباح',
      icon: Sun,
      color: 'bg-yellow-500',
      time: 'من الفجر إلى الشروق'
    },
    {
      id: 'evening',
      title: 'أذكار المساء',
      icon: Moon,
      color: 'bg-blue-500',
      time: 'من العصر إلى المغرب'
    },
    {
      id: 'sleep',
      title: 'أذكار النوم',
      icon: Bed,
      color: 'bg-purple-500',
      time: 'قبل النوم'
    },
    {
      id: 'prayer',
      title: 'أذكار الصلاة',
      icon: Building,
      color: 'bg-green-500',
      time: 'بعد كل صلاة'
    },
    {
      id: 'general',
      title: 'أذكار عامة',
      icon: Shield,
      color: 'bg-indigo-500',
      time: 'في أي وقت'
    }
  ];

  const azkarData: Record<string, Zikr[]> = {
    morning: [
      {
        id: 'morning_1',
        text: 'أَصْـبَحْنا وَأَصْـبَحَ المُـلْكُ لله وَالحَمدُ لله، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْـد، وهُوَ على كلّ شَيءٍ قدير، رَبِّ أسْـأَلُـكَ خَـيرَ ما في هـذا اليوم وَخَـيرَ ما بَعْـدَه، وَأَعـوذُ بِكَ مِنْ شَـرِّ ما في هـذا اليوم وَشَرِّ ما بَعْـدَه، رَبِّ أَعـوذُ بِكَ مِنَ الكَسَـلِ وَسـوءِ الكِـبَر، رَبِّ أَعـوذُ بِكَ مِنْ عَـذابٍ في النّـارِ وَعَـذابٍ في القَـبْر',
        translation: 'We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it and I take refuge in You from the evil of this day and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.',
        count: 1,
        source: 'أبو داود',
        benefits: 'حماية من الشياطين والشرور'
      },
      {
        id: 'morning_2',
        text: 'اللّهُـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـينا، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ النُّـشُور',
        translation: 'O Allah, by your leave we have reached the morning and by your leave we have reached the evening, by your leave we live and die and unto you is our resurrection.',
        count: 1,
        source: 'الترمذي',
        benefits: 'التوكل على الله في جميع الأحوال'
      },
      {
        id: 'morning_3',
        text: 'حَسْبِـيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَـيهِ تَوَكَّـلتُ وَهُوَ رَبُّ العَرْشِ العَظـيم',
        translation: 'Allah is sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne.',
        count: 7,
        source: 'أبو داود',
        benefits: 'الحفظ من الهموم والأحزان'
      },
      {
        id: 'morning_4',
        text: 'أَعـوذُ بِكَلِمـاتِ اللّهِ التّـامّـاتِ مِنْ شَـرِّ ما خَلَـق',
        translation: 'I take refuge in Allah\'s perfect words from the evil He has created.',
        count: 3,
        source: 'مسلم',
        benefits: 'الحماية من جميع المخلوقات'
      },
      {
        id: 'morning_5',
        text: 'بِسْـمِ اللهِ الذي لا يَضُـرُّ مَعَ اسمِـهِ شَيءٌ في الأرْضِ وَلا في السّمـاءِ وَهـوَ السّمـيعُ العَلـيم',
        translation: 'In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Seeing, The All-Knowing.',
        count: 3,
        source: 'أبو داود والترمذي',
        benefits: 'الحفظ من الأذى والضرر'
      }
    ],
    evening: [
      {
        id: 'evening_1',
        text: 'أَمْسَـينا وَأَمْسـى المُـلكُ للهِ وَالحَمدُ لله، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْـد، وهُوَ على كلّ شَيءٍ قدير، رَبِّ أسْـأَلُـكَ خَـيرَ ما في هـذه اللَّـيْلَةِ وَخَـيرَ ما بَعْـدَها، وَأَعـوذُ بِكَ مِنْ شَـرِّ ما في هـذه اللَّـيْلَةِ وَشَرِّ ما بَعْـدَها، رَبِّ أَعـوذُ بِكَ مِنَ الكَسَـلِ وَسـوءِ الكِـبَر، رَبِّ أَعـوذُ بِكَ مِنْ عَـذابٍ في النّـارِ وَعَـذابٍ في القَـبْر',
        translation: 'We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this night and the good of what follows it and I take refuge in You from the evil of this night and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.',
        count: 1,
        source: 'أبو داود',
        benefits: 'حماية من الشياطين والشرور'
      },
      {
        id: 'evening_2',
        text: 'اللّهُـمَّ بِكَ أَمْسَـينا وَبِكَ أَصْـبَحْنا، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ المَصـير',
        translation: 'O Allah, by your leave we have reached the evening and by your leave we have reached the morning, by your leave we live and die and unto you is our return.',
        count: 1,
        source: 'الترمذي',
        benefits: 'التوكل على الله في جميع الأحوال'
      },
      {
        id: 'evening_3',
        text: 'أَسْتَغْفِرُ اللهَ العَظِيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ، الحَيُّ القَيُّومُ، وَأَتُوبُ إِلَيهِ',
        translation: 'I seek Allah\'s forgiveness, than whom none has the right to be worshipped except He, The Ever Living, The Self-Subsisting and Supporter of all, and I turn to Him in repentance.',
        count: 3,
        source: 'أبو داود والترمذي',
        benefits: 'مغفرة الذنوب والخطايا'
      }
    ],
    sleep: [
      {
        id: 'sleep_1',
        text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنبِي، وَبِكَ أَرْفَعُهُ، فَإِن أَمْسَكْتَ نَفْسِي فارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
        translation: 'In Your name my Lord, I lie down and in Your name I rise, so if You should take my soul then have mercy upon it, and if You should return my soul then protect it in the manner You do so with Your righteous servants.',
        count: 1,
        source: 'البخاري ومسلم',
        benefits: 'الحفظ أثناء النوم'
      },
      {
        id: 'sleep_2',
        text: 'اللّهُـمَّ إِنَّـكَ خَلَـقْتَ نَفْسـي وَأَنْـتَ تَوَفّـاهـا لَكَ ممَـاتـها وَمَحْـياها، إِنْ أَحْيَيْـتَها فَاحْفَظْهـا، وَإِنْ أَمَتَّهـا فَاغْفِـرْ لَـها. اللّهُـمَّ إِنَّـي أَسْـأَلُـكَ العـافِـيَة',
        translation: 'O Allah, verily You have created my soul and You shall take its life, to You belongs its life and death. If You should keep my soul alive then protect it, and if You should take its life then forgive it. O Allah, I ask You to grant me good health.',
        count: 1,
        source: 'مسلم',
        benefits: 'طلب العافية والمغفرة'
      },
      {
        id: 'sleep_3',
        text: 'اللّهُـمَّ قِنـي عَذابَـكَ يَـوْمَ تَبْـعَثُ عِبـادَك',
        translation: 'O Allah, protect me from Your punishment on the day You resurrect Your servants.',
        count: 3,
        source: 'أبو داود والترمذي',
        benefits: 'الحماية من عذاب الآخرة'
      }
    ],
    prayer: [
      {
        id: 'prayer_1',
        text: 'أَسْتَغْفِرُ اللهَ',
        translation: 'I seek Allah\'s forgiveness.',
        count: 3,
        source: 'مسلم',
        benefits: 'طلب المغفرة'
      },
      {
        id: 'prayer_2',
        text: 'اللّهُـمَّ أَنْـتَ السَّلامُ وَمِـنْكَ السَّلام، تَبارَكْتَ يا ذا الجَـلالِ وَالإِكْـرام',
        translation: 'O Allah, You are As-Salaam and from You is all peace, blessed are You, O Possessor of majesty and honour.',
        count: 1,
        source: 'مسلم',
        benefits: 'السلام والطمأنينة'
      },
      {
        id: 'prayer_3',
        text: 'سُـبْحانَ اللهِ وَالحَمْـدُ لله وَلا إلهَ إلاّ اللهُ وَاللهُ أَكْـبَر',
        translation: 'How perfect Allah is, all praise is for Allah, none has the right to be worshipped except Allah, and Allah is the greatest.',
        count: 1,
        source: 'مسلم',
        benefits: 'الثناء على الله'
      }
    ],
    general: [
      {
        id: 'general_1',
        text: 'لا إلهَ إلاّ اللّهُ وَحدَهُ لا شريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْد، وهُوَ على كلّ شَيءٍ قدير',
        translation: 'None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent.',
        count: 10,
        source: 'البخاري ومسلم',
        benefits: 'عتق رقبة من النار'
      },
      {
        id: 'general_2',
        text: 'سُبْحـانَ اللهِ وَبِحَمْـدِهِ',
        translation: 'How perfect Allah is and I praise Him.',
        count: 100,
        source: 'مسلم',
        benefits: 'حط الخطايا'
      },
      {
        id: 'general_3',
        text: 'لا حَـوْلَ وَلا قـوَّةَ إِلاّ بِاللهِ',
        translation: 'There is no might nor power except with Allah.',
        count: 1,
        source: 'البخاري ومسلم',
        benefits: 'كنز من كنوز الجنة'
      }
    ]
  };

  const handleCount = (zikrId: string, maxCount: number) => {
    setCounters(prev => {
      const currentCount = prev[zikrId] || 0;
      const newCount = currentCount + 1;
      
      if (newCount > maxCount) {
        return { ...prev, [zikrId]: 0 };
      }
      
      return { ...prev, [zikrId]: newCount };
    });
  };

  const resetCounter = (zikrId: string) => {
    setCounters(prev => ({ ...prev, [zikrId]: 0 }));
  };

  const renderZikrCard = (zikr: Zikr) => {
    const currentCount = counters[zikr.id] || 0;
    const isCompleted = currentCount >= zikr.count;
    
    return (
      <Card key={zikr.id} className={`azkar-card ${isCompleted ? 'ring-2 ring-islamic-green' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant={isCompleted ? "default" : "secondary"} className={isCompleted ? "bg-islamic-green" : ""}>
              {currentCount}/{zikr.count}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resetCounter(zikr.id)}
              className="text-xs"
            >
              إعادة تعيين
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-right">
            <p className="text-lg leading-loose arabic-text font-arabic-display">
              {zikr.text}
            </p>
          </div>
          
          {zikr.translation && (
            <div className="text-sm text-muted-foreground italic">
              {zikr.translation}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              المصدر: {zikr.source}
            </div>
            {zikr.benefits && (
              <div className="text-xs text-islamic-green">
                {zikr.benefits}
              </div>
            )}
          </div>
          
          <Button
            className={`w-full ${isCompleted ? 'bg-islamic-green hover:bg-islamic-green/90' : 'btn-islamic'}`}
            onClick={() => handleCount(zikr.id, zikr.count)}
          >
            {isCompleted ? '✓ تم' : 'تسبيح'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground font-arabic-display">
          الأذكار والتسابيح
        </h1>
        <p className="text-muted-foreground">
          أذكار من القرآن والسنة النبوية الشريفة
        </p>
      </div>

      <Tabs defaultValue="morning" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          {azkarCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-2 text-sm"
            >
              <category.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{category.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {azkarCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2">
                <category.icon className="h-6 w-6 text-islamic-green" />
                <h2 className="text-xl font-bold font-arabic">{category.title}</h2>
              </div>
              <p className="text-muted-foreground text-sm">{category.time}</p>
            </div>

            <div className="grid gap-6">
              {azkarData[category.id]?.map(renderZikrCard)}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}