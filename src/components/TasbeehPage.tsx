import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Heart, Star, Target } from 'lucide-react';

interface TasbeehPageProps {
  onPageChange?: (page: string) => void;
}

export default function TasbeehPage({ onPageChange }: TasbeehPageProps) {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentTasbih, setCurrentTasbih] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(100);
  const [completedCycles, setCompletedCycles] = useState(0);

  // التسابيح الرئيسية
  const tasabeeh = [
    { text: 'سُبْحانَ اللهِ', translation: 'Glory be to Allah', color: 'bg-islamic-green' },
    { text: 'الحَمْدُ للهِ', translation: 'Praise be to Allah', color: 'bg-islamic-blue' },
    { text: 'اللهُ أَكْبَر', translation: 'Allah is Greatest', color: 'bg-islamic-gold' },
    { text: 'لا إلهَ إلاّ اللهُ', translation: 'There is no god but Allah', color: 'bg-gradient-primary' }
  ];

  // تحميل البيانات من localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('tasbeeh-count');
    const savedTotal = localStorage.getItem('tasbeeh-total');
    const savedGoal = localStorage.getItem('tasbeeh-goal');
    const savedCycles = localStorage.getItem('tasbeeh-cycles');
    
    if (savedCount) setCount(parseInt(savedCount));
    if (savedTotal) setTotalCount(parseInt(savedTotal));
    if (savedGoal) setDailyGoal(parseInt(savedGoal));
    if (savedCycles) setCompletedCycles(parseInt(savedCycles));
  }, []);

  // حفظ البيانات في localStorage
  useEffect(() => {
    localStorage.setItem('tasbeeh-count', count.toString());
    localStorage.setItem('tasbeeh-total', totalCount.toString());
    localStorage.setItem('tasbeeh-goal', dailyGoal.toString());
    localStorage.setItem('tasbeeh-cycles', completedCycles.toString());
  }, [count, totalCount, dailyGoal, completedCycles]);

  const handleTasbeeh = () => {
    const newCount = count + 1;
    const newTotal = totalCount + 1;
    
    setCount(newCount);
    setTotalCount(newTotal);
    
    // اهتزاز خفيف إذا كان متاحًا
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // عند الوصول إلى 33، ننتقل للتسبيح التالي
    if (newCount === 33) {
      setCount(0);
      if (currentTasbih < tasabeeh.length - 1) {
        setCurrentTasbih(currentTasbih + 1);
      } else {
        setCurrentTasbih(0);
        setCompletedCycles(completedCycles + 1);
      }
    }
  };

  const resetCount = () => {
    setCount(0);
    setCurrentTasbih(0);
  };

  const resetAll = () => {
    setCount(0);
    setTotalCount(0);
    setCurrentTasbih(0);
    setCompletedCycles(0);
  };

  const progress = Math.min((totalCount / dailyGoal) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground font-arabic-display">
          المسبحة الإلكترونية
        </h1>
        <p className="text-muted-foreground">
          سبح الله واحصل على الأجر والثواب
        </p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-green">{count}</div>
            <p className="text-sm text-muted-foreground">العدد الحالي</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-blue">{totalCount}</div>
            <p className="text-sm text-muted-foreground">المجموع الكلي</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-gold">{completedCycles}</div>
            <p className="text-sm text-muted-foreground">الدورات المكتملة</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
            <p className="text-sm text-muted-foreground">الهدف اليومي</p>
          </CardContent>
        </Card>
      </div>

      {/* الهدف اليومي */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            الهدف اليومي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>التقدم: {totalCount} / {dailyGoal}</span>
              <Badge variant={progress >= 100 ? "default" : "secondary"} 
                     className={progress >= 100 ? "bg-islamic-green" : ""}>
                {progress >= 100 ? 'مكتمل ✓' : `${Math.round(progress)}%`}
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDailyGoal(100)}
                className={dailyGoal === 100 ? "bg-primary text-primary-foreground" : ""}
              >
                100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDailyGoal(300)}
                className={dailyGoal === 300 ? "bg-primary text-primary-foreground" : ""}
              >
                300
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDailyGoal(500)}
                className={dailyGoal === 500 ? "bg-primary text-primary-foreground" : ""}
              >
                500
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDailyGoal(1000)}
                className={dailyGoal === 1000 ? "bg-primary text-primary-foreground" : ""}
              >
                1000
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التسبيح الحالي */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center">التسبيح الحالي</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold font-arabic-display text-foreground">
              {tasabeeh[currentTasbih].text}
            </h2>
            <p className="text-lg text-muted-foreground italic">
              {tasabeeh[currentTasbih].translation}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-6xl font-bold text-primary">
              {count}/33
            </div>
          </div>

          {/* العداد الدائري */}
          <div className="relative w-40 h-40 mx-auto">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 144 144">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="hsl(var(--islamic-green))"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${(count / 33) * 377} 377`}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="h-8 w-8 text-islamic-green animate-pulse-islamic" />
            </div>
          </div>

          {/* زر التسبيح الرئيسي */}
          <Button
            className="tasbeeh-counter w-32 h-32 rounded-full text-xl font-bold shadow-islamic-glow hover:scale-105 active:scale-95"
            onClick={handleTasbeeh}
          >
            سَبِّح
          </Button>

          {/* أزرار التحكم */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={resetCount}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة التعيين
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={resetAll}
            >
              مسح الكل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* دورة التسابيح */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle>دورة التسابيح الكاملة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasabeeh.map((tasbih, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  index === currentTasbih
                    ? 'border-islamic-green bg-islamic-green/10 shadow-islamic'
                    : index < currentTasbih
                    ? 'border-muted bg-muted/50 opacity-70'
                    : 'border-border bg-card'
                }`}
              >
                <div className="text-center space-y-2">
                  <p className="font-bold font-arabic-display text-lg">
                    {tasbih.text}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    {tasbih.translation}
                  </p>
                  {index === currentTasbih && (
                    <Badge className="bg-islamic-green">
                      التسبيح الحالي ({count}/33)
                    </Badge>
                  )}
                  {index < currentTasbih && (
                    <Badge variant="secondary">
                      مكتمل ✓
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>الدورة الواحدة = 33 × 4 تسابيح = 132 تسبيحة</p>
            <p>الدورات المكتملة: {completedCycles}</p>
          </div>
        </CardContent>
      </Card>

      {/* نصائح وفوائد */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center text-islamic-green">فضل التسبيح</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <div className="text-lg font-arabic-display leading-relaxed">
              "مَن قالَ سُبْحانَ اللهِ وبِحَمْدِهِ في يَومٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطاياهُ وإنْ كانَتْ مِثْلَ زَبَدِ البَحْرِ"
            </div>
            <p className="text-sm text-muted-foreground">
              صحيح البخاري ومسلم
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-bold text-islamic-green mb-2">فوائد التسبيح:</h4>
                <ul className="space-y-1 text-right">
                  <li>• تطهير القلب من الذنوب</li>
                  <li>• زيادة الأجر والثواب</li>
                  <li>• طمأنينة النفس</li>
                  <li>• تقوية الإيمان</li>
                </ul>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-bold text-islamic-blue mb-2">آداب التسبيح:</h4>
                <ul className="space-y-1 text-right">
                  <li>• الطهارة والوضوء</li>
                  <li>• استقبال القبلة</li>
                  <li>• الخشوع والتدبر</li>
                  <li>• الإكثار من التسبيح</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}