import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Calendar, Heart, BookOpen, MessageCircle, Settings, HelpCircle, Instagram } from 'lucide-react';

interface MorePageProps {
  onPageChange?: (page: string) => void;
}

export default function MorePage({ onPageChange }: MorePageProps) {
  const additionalSections = [
    {
      id: 'names',
      title: 'أسماء الله الحسنى',
      titleEn: 'Names of Allah',
      description: 'الأسماء الـ99 الحسنى مع المعاني',
      icon: Star,
      color: 'bg-islamic-gold'
    },
    {
      id: 'hijri-calendar',
      title: 'التقويم الهجري',
      titleEn: 'Hijri Calendar',
      description: 'التقويم والمناسبات الإسلامية',
      icon: Calendar,
      color: 'bg-islamic-blue'
    },
    {
      id: 'tasbeeh',
      title: 'المسبحة الإلكترونية',
      titleEn: 'Digital Tasbeeh',
      description: 'عداد التسبيح مع الأهداف اليومية',
      icon: Heart,
      color: 'bg-islamic-green'
    },
    {
      id: 'duas',
      title: 'الأدعية المختارة',
      titleEn: 'Selected Du\'as',
      description: 'أدعية من القرآن والسنة',
      icon: MessageCircle,
      color: 'bg-islamic-blue'
    },
    {
      id: 'hadith',
      title: 'الأحاديث النبوية',
      titleEn: 'Prophetic Traditions',
      description: 'أحاديث صحيحة مصنفة حسب الموضوع',
      icon: BookOpen,
      color: 'bg-islamic-gold'
    },
    {
      id: 'learning',
      title: 'التعليم الديني',
      titleEn: 'Islamic Learning',
      description: 'دروس وقواعد إسلامية أساسية',
      icon: BookOpen,
      color: 'bg-islamic-green'
    }
  ];

  const settingsOptions = [
    {
      id: 'settings',
      title: 'الإعدادات',
      titleEn: 'Settings',
      description: 'الوضع المظلم، اللغة، والتنبيهات',
      icon: Settings,
      color: 'bg-muted'
    },
    {
      id: 'help',
      title: 'المساعدة والدعم',
      titleEn: 'Help & Support',
      description: 'الأسئلة الشائعة والدعم الفني',
      icon: HelpCircle,
      color: 'bg-muted'
    }
  ];

  const handleCardClick = (pageId: string) => {
    if (pageId === 'help') {
      // فتح رابط الإنستغرام
      window.open('https://www.instagram.com/bot_.en?igsh=dGY1dTl2azhtdTI0', '_blank');
      return;
    }
    
    if (onPageChange) {
      onPageChange(pageId);
    }
  };

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
            المزيد
          </h1>
          <p className="text-muted-foreground">More Sections</p>
        </div>

        <div className="w-10"></div>
      </div>

      {/* الأقسام الإضافية */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 font-arabic">الأقسام الإضافية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {additionalSections.map((section) => (
            <Card
              key={section.id}
              className="islamic-card hover-lift cursor-pointer group"
              onClick={() => handleCardClick(section.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full islamic-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold font-arabic text-lg">{section.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{section.titleEn}</p>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* الإعدادات والدعم */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 font-arabic">الإعدادات والدعم</h2>
        <div className="space-y-3">
          {settingsOptions.map((option) => (
            <Card
              key={option.id}
              className="islamic-card hover-lift cursor-pointer group"
              onClick={() => handleCardClick(option.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <option.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium font-arabic">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* معلومات التطبيق */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center">عن التطبيق</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Star className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-arabic-display">الـمُؤمِن</h3>
            <p className="text-muted-foreground">Al-Mumin</p>
            <p className="text-sm text-muted-foreground mt-2">
              دليلك اليومي للروح والإيمان
            </p>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              للدعم الفني والمساعدة:
            </p>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.open('https://www.instagram.com/bot_.en?igsh=dGY1dTl2azhtdTI0', '_blank')}
            >
              <Instagram className="h-4 w-4" />
              تابعنا على إنستغرام
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}