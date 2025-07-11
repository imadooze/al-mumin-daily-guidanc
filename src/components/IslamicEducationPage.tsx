import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Calendar, Lightbulb, Star, Users, Heart } from 'lucide-react';

interface IslamicEducationPageProps {
  onPageChange?: (page: string) => void;
}

export default function IslamicEducationPage({ onPageChange }: IslamicEducationPageProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const educationalTopics = [
    {
      id: 'pillars',
      title: 'أركان الإسلام',
      description: 'تعلم الأركان الخمسة للإسلام',
      icon: <Star className="h-6 w-6" />,
      content: `أركان الإسلام الخمسة:

1. الشهادتان: أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله
2. إقام الصلاة: الصلوات الخمس في أوقاتها
3. إيتاء الزكاة: إخراج الزكاة للفقراء والمحتاجين
4. صوم رمضان: الصيام في شهر رمضان المبارك
5. حج البيت: لمن استطاع إليه سبيلاً

هذه الأركان هي أساس العبادة في الإسلام`
    },
    {
      id: 'faith',
      title: 'أركان الإيمان',
      description: 'الإيمان بالله والملائكة والكتب والرسل',
      icon: <Heart className="h-6 w-6" />,
      content: `أركان الإيمان الستة:

1. الإيمان بالله: وحدانيته وصفاته العلى
2. الإيمان بالملائكة: المخلوقات النورانية المطيعة لله
3. الإيمان بالكتب: القرآن والتوراة والإنجيل والزبور
4. الإيمان بالرسل: جميع الأنبياء والمرسلين
5. الإيمان باليوم الآخر: البعث والحساب والجنة والنار
6. الإيمان بالقدر: خيره وشره من الله تعالى`
    },
    {
      id: 'prayers',
      title: 'آداب الصلاة',
      description: 'تعلم كيفية أداء الصلاة بالطريقة الصحيحة',
      icon: <Users className="h-6 w-6" />,
      content: `آداب وأحكام الصلاة:

الوضوء:
- النية والبسملة
- غسل الوجه واليدين والرأس والقدمين
- الترتيب والموالاة

أوقات الصلاة:
- الفجر: من طلوع الفجر الصادق إلى شروق الشمس
- الظهر: من زوال الشمس إلى أن يصير ظل كل شيء مثله
- العصر: إلى غروب الشمس
- المغرب: من غروب الشمس إلى مغيب الشفق الأحمر
- العشاء: إلى طلوع الفجر الصادق`
    },
    {
      id: 'hijri',
      title: 'التقويم الهجري',
      description: 'تعرف على الأشهر الهجرية ومناسباتها',
      icon: <Calendar className="h-6 w-6" />,
      content: `الأشهر الهجرية ومناسباتها:

1. محرم: شهر حرام - عاشوراء (10 محرم)
2. صفر: شهر حرام
3. ربيع الأول: مولد النبي ﷺ (12 ربيع الأول)
4. ربيع الآخر
5. جمادى الأولى
6. جمادى الآخرة
7. رجب: شهر حرام - الإسراء والمعراج (27 رجب)
8. شعبان: شهر الاستعداد لرمضان
9. رمضان: شهر الصيام - ليلة القدر
10. شوال: عيد الفطر (1 شوال)
11. ذو القعدة: شهر حرام - موسم الحج
12. ذو الحجة: شهر حرام - عيد الأضحى (10 ذو الحجة)`
    },
    {
      id: 'manners',
      title: 'الآداب الإسلامية',
      description: 'آداب المسلم في الحياة اليومية',
      icon: <Lightbulb className="h-6 w-6" />,
      content: `الآداب الإسلامية في الحياة:

آداب الطعام:
- البسملة قبل الأكل
- الأكل باليد اليمنى
- الحمد بعد الأكل
- عدم الإسراف والتبذير

آداب الكلام:
- البدء بالسلام
- الصدق في القول
- تجنب الغيبة والنميمة
- الكلمة الطيبة

آداب التعامل:
- بر الوالدين
- صلة الأرحام
- الإحسان إلى الجيران
- احترام الكبير والعطف على الصغير`
    }
  ];

  const islamicEvents = [
    { date: '1 محرم', event: 'رأس السنة الهجرية', description: 'بداية العام الهجري الجديد' },
    { date: '10 محرم', event: 'يوم عاشوراء', description: 'يوم صيام مستحب' },
    { date: '12 ربيع الأول', event: 'المولد النبوي', description: 'ذكرى مولد النبي محمد ﷺ' },
    { date: '27 رجب', event: 'الإسراء والمعراج', description: 'رحلة النبي الليلية إلى المسجد الأقصى' },
    { date: '1-30 رمضان', event: 'شهر رمضان', description: 'شهر الصيام والقرآن' },
    { date: '1 شوال', event: 'عيد الفطر', description: 'عيد انتهاء شهر رمضان' },
    { date: '8-13 ذو الحجة', event: 'موسم الحج', description: 'أيام الحج إلى بيت الله الحرام' },
    { date: '10 ذو الحجة', event: 'عيد الأضحى', description: 'العيد الكبير وذكرى فداء إسماعيل' }
  ];

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
            التعليم الديني
          </h1>
          <p className="text-muted-foreground">تعلم أساسيات الدين الإسلامي</p>
        </div>

        <div className="w-10"></div>
      </div>

      {/* مقدمة */}
      <Card className="islamic-card bg-gradient-to-r from-islamic-green/10 to-islamic-blue/10">
        <CardContent className="p-6 text-center">
          <div className="islamic-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-islamic-green mb-2">
            تعلم دينك بسهولة
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            اكتشف المبادئ الأساسية للإسلام من خلال دروس مبسطة ومفيدة للمسلم في حياته اليومية
          </p>
        </CardContent>
      </Card>

      {/* المواضيع التعليمية */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">المواضيع التعليمية</h3>
        <div className="grid gap-4">
          {educationalTopics.map((topic) => (
            <Card
              key={topic.id}
              className={`islamic-card cursor-pointer transition-all duration-300 hover-lift ${
                selectedTopic === topic.id ? 'ring-2 ring-islamic-green shadow-islamic' : ''
              }`}
              onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="islamic-gradient w-12 h-12 rounded-full flex items-center justify-center text-white">
                    {topic.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-arabic-display text-islamic-green">
                      {topic.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              {selectedTopic === topic.id && (
                <CardContent className="pt-0">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="whitespace-pre-line text-sm leading-relaxed font-arabic">
                      {topic.content}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* التقويم الهجري والمناسبات */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">المناسبات الإسلامية</h3>
        <Card className="islamic-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-islamic-blue">
              <Calendar className="h-5 w-5" />
              التقويم الهجري
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {islamicEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <Badge variant="outline" className="bg-islamic-green/10 text-islamic-green border-islamic-green/20 min-w-fit">
                    {event.date}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-islamic-blue text-sm">
                      {event.event}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نصائح للتعلم */}
      <Card className="islamic-card bg-gradient-to-r from-islamic-cream/20 to-islamic-gold/10">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-islamic-gold/20 rounded-full flex items-center justify-center mx-auto">
              <Lightbulb className="h-6 w-6 text-islamic-gold" />
            </div>
            <h3 className="font-bold text-islamic-green">نصائح للتعلم</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• ابدأ بالأساسيات وتدرج في التعلم</p>
              <p>• اقرأ القرآن والسنة النبوية</p>
              <p>• اسأل أهل العلم عند الحاجة</p>
              <p>• طبق ما تتعلمه في حياتك اليومية</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}