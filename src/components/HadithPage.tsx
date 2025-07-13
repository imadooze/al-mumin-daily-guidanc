import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Star, RefreshCw, Loader } from 'lucide-react';
import { getRandomHadith, type Hadith } from '@/lib/reliable-hadith-api';

interface HadithPageProps {
  onPageChange?: (page: string) => void;
}

export default function HadithPage({ onPageChange }: HadithPageProps) {
  const [currentHadith, setCurrentHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRandomHadith = () => {
    setLoading(true);
    
    // محاكاة تأخير للتحميل
    setTimeout(() => {
      const hadith = getRandomHadith();
      setCurrentHadith(hadith);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchRandomHadith();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-islamic-cream/20 to-background">
      <div className="space-y-6 p-4 max-w-md mx-auto">
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
            <p className="text-muted-foreground">أحاديث صحيحة موثوقة</p>
          </div>

          <div className="w-10"></div>
        </div>

        {/* شرح مختصر */}
        <Card className="islamic-card">
          <CardContent className="p-4 text-center">
            <div className="islamic-gradient w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              يتم عرض حديث صحيح واحد في كل مرة من مصادر موثوقة
            </p>
          </CardContent>
        </Card>

        {/* عرض الحديث */}
        <div className="space-y-4">
          {loading ? (
            <Card className="islamic-card">
              <CardContent className="p-8 text-center">
                <Loader className="h-8 w-8 animate-spin text-islamic-green mx-auto mb-4" />
                <p className="text-muted-foreground">جاري تحميل الحديث...</p>
              </CardContent>
            </Card>
          ) : currentHadith ? (
            <Card className="islamic-card">
              <CardHeader>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Star className="h-6 w-6 text-islamic-gold" />
                    <h2 className="text-xl font-bold text-islamic-green font-arabic">
                      حديث شريف
                    </h2>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-islamic-green/10 text-islamic-green border-islamic-green/20"
                  >
                    {currentHadith.book}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* نص الحديث */}
                <div className="text-center">
                  <div className="arabic-text text-lg leading-relaxed p-6 bg-gradient-to-br from-islamic-green/5 to-islamic-blue/5 rounded-2xl border border-islamic-green/10">
                    <div className="text-right mb-4">
                      <span className="text-islamic-green font-semibold">قال رسول الله ﷺ:</span>
                    </div>
                    <div className="text-base leading-loose">
                      "{currentHadith.hadith}"
                    </div>
                  </div>
                </div>
                
                {/* معلومات الحديث */}
                <div className="bg-white/50 rounded-xl p-4 space-y-3">
                  {currentHadith.narrator && (
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">رواه: </span>
                      <span className="font-semibold text-islamic-green">{currentHadith.narrator} رضي الله عنه</span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <span className="text-sm text-muted-foreground">المصدر: </span>
                    <span className="font-semibold text-islamic-blue">{currentHadith.book}</span>
                  </div>
                  
                  {currentHadith.reference && (
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">المرجع: </span>
                      <span className="text-xs text-muted-foreground">{currentHadith.reference}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
          
          {/* إحصائيات الأحاديث */}
          <Card className="islamic-card bg-gradient-to-r from-islamic-green/5 to-islamic-blue/5">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-islamic-green">50+</div>
                  <p className="text-sm text-muted-foreground">حديث صحيح</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-islamic-blue">100%</div>
                  <p className="text-sm text-muted-foreground">أحاديث موثقة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* زر حديث جديد */}
        <div className="text-center space-y-4">
          <Button
            onClick={fetchRandomHadith}
            disabled={loading}
            className="islamic-gradient text-white px-8 py-3 rounded-xl font-arabic text-lg w-full"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-2" />
                جاري التحميل...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                حديث جديد
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            اضغط للحصول على حديث جديد من المصادر الموثوقة
          </p>
        </div>

        {/* معلومات إضافية */}
        <Card className="islamic-card bg-gradient-to-r from-islamic-cream/20 to-islamic-green/5">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-bold text-islamic-green font-arabic">
                الأحاديث النبوية الشريفة
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                جميع الأحاديث المعروضة من مصادر موثوقة ومتحققة، 
                نسأل الله أن ينفعنا بها في الدنيا والآخرة
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}