import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, BookOpen, Heart, Star, MessageCircle, Calendar, Compass } from 'lucide-react';

interface HomePageProps {
  onPageChange?: (page: string) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  // أوقات الصلاة المؤقتة - سيتم استبدالها بـ API
  const prayerTimes = [
    { name: 'الفجر', time: '05:24', nameEn: 'Fajr', passed: true },
    { name: 'الشروق', time: '06:48', nameEn: 'Sunrise', passed: true },
    { name: 'الظهر', time: '12:15', nameEn: 'Dhuhr', passed: false, current: true },
    { name: 'العصر', time: '15:42', nameEn: 'Asr', passed: false },
    { name: 'المغرب', time: '18:33', nameEn: 'Maghrib', passed: false },
    { name: 'العشاء', time: '20:05', nameEn: 'Isha', passed: false },
  ];

  const quickActions = [
    {
      id: 'azkar',
      title: 'الأذكار',
      titleEn: 'Azkar',
      description: 'أذكار الصباح والمساء',
      icon: BookOpen,
      color: 'bg-islamic-green',
      gradient: 'islamic-gradient'
    },
    {
      id: 'tasbeeh',
      title: 'المسبحة',
      titleEn: 'Tasbeeh',
      description: 'عداد التسبيح الإلكتروني',
      icon: Heart,
      color: 'bg-islamic-blue',
      gradient: 'islamic-gradient-secondary'
    },
    {
      id: 'names',
      title: 'أسماء الله الحسنى',
      titleEn: 'Names of Allah',
      description: 'الأسماء الـ99 الحسنى',
      icon: Star,
      color: 'bg-islamic-gold',
      gradient: 'islamic-gradient-accent'
    },
    {
      id: 'qibla',
      title: 'القبلة',
      titleEn: 'Qibla',
      description: 'اتجاه القبلة',
      icon: Compass,
      color: 'bg-islamic-green',
      gradient: 'islamic-gradient'
    },
    {
      id: 'duas',
      title: 'الأدعية',
      titleEn: 'Duas',
      description: 'أدعية مختارة',
      icon: MessageCircle,
      color: 'bg-islamic-blue',
      gradient: 'islamic-gradient-secondary'
    },
    {
      id: 'calendar',
      title: 'التقويم الهجري',
      titleEn: 'Hijri Calendar',
      description: 'التقويم والمناسبات',
      icon: Calendar,
      color: 'bg-islamic-gold',
      gradient: 'islamic-gradient-accent'
    },
  ];

  const handleCardClick = (pageId: string) => {
    if (onPageChange) {
      onPageChange(pageId);
    }
  };

  return (
    <div className="space-y-6">
      {/* الترحيب */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground font-arabic-display">
          أهلاً وسهلاً بك في الـمُؤمِن
        </h1>
        <p className="text-muted-foreground">
          دليلك اليومي للروح والإيمان
        </p>
      </div>

      {/* أوقات الصلاة */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Clock className="h-5 w-5" />
            أوقات الصلاة
          </CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            الرياض، المملكة العربية السعودية
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {prayerTimes.map((prayer) => (
              <div
                key={prayer.name}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  prayer.current
                    ? 'border-islamic-green bg-islamic-green/5 shadow-islamic'
                    : prayer.passed
                    ? 'border-border bg-muted/50 opacity-60'
                    : 'border-border bg-card hover:bg-muted/50'
                }`}
              >
                <div className="text-center space-y-1">
                  <p className="font-medium font-arabic">{prayer.name}</p>
                  <p className="text-2xl font-bold text-primary">{prayer.time}</p>
                  {prayer.current && (
                    <Badge className="bg-islamic-green hover:bg-islamic-green/90 text-white">
                      الصلاة الحالية
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الأقسام الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Card
            key={action.id}
            className="islamic-card hover-lift cursor-pointer group"
            onClick={() => handleCardClick(action.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-arabic">{action.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{action.titleEn}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">{action.description}</p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                فتح القسم
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-green">1,247</div>
            <p className="text-sm text-muted-foreground">التسبيحات اليوم</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-blue">35</div>
            <p className="text-sm text-muted-foreground">الأذكار المقروءة</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-gold">7</div>
            <p className="text-sm text-muted-foreground">أيام متتالية</p>
          </CardContent>
        </Card>
      </div>

      {/* تذكير يومي */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center text-islamic-green">تذكير يومي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <div className="text-lg font-arabic-display leading-relaxed">
              "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ"
            </div>
            <p className="text-sm text-muted-foreground">
              سورة الذاريات - الآية 55
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}