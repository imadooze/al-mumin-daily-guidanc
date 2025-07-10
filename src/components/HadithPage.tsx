import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Search, BookOpen, Star, RefreshCw, Heart } from 'lucide-react';
import { searchAhadith, getRandomHadith, hadithCategories, ahadithDatabase } from '@/lib/hadith-api';

interface HadithPageProps {
  onPageChange?: (page: string) => void;
}

export default function HadithPage({ onPageChange }: HadithPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayedAhadith, setDisplayedAhadith] = useState(ahadithDatabase.slice(0, 10));
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loadMore, setLoadMore] = useState(10);

  useEffect(() => {
    const results = searchAhadith(searchTerm, selectedCategory);
    setDisplayedAhadith(results.slice(0, loadMore));
  }, [searchTerm, selectedCategory, loadMore]);

  const handleLoadMore = () => {
    setLoadMore(prev => prev + 10);
  };

  const toggleFavorite = (hadithId: number) => {
    setFavorites(prev => 
      prev.includes(hadithId) 
        ? prev.filter(id => id !== hadithId)
        : [...prev, hadithId]
    );
  };

  const handleRandomHadith = () => {
    const randomHadith = getRandomHadith();
    setDisplayedAhadith([randomHadith]);
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const categoryStats = hadithCategories.map(cat => ({
    ...cat,
    count: cat.id === 'all' 
      ? ahadithDatabase.length 
      : ahadithDatabase.filter(h => h.category === cat.id).length
  }));

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
          <p className="text-muted-foreground">أكثر من {ahadithDatabase.length} حديث صحيح</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleRandomHadith}
          className="rounded-full"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="islamic-card">
          <CardContent className="p-4 text-center">
            <div className="islamic-gradient w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-islamic-green">{ahadithDatabase.length}+</p>
            <p className="text-xs text-muted-foreground">حديث صحيح</p>
          </CardContent>
        </Card>
        
        <Card className="islamic-card">
          <CardContent className="p-4 text-center">
            <div className="bg-islamic-blue w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-islamic-blue">{hadithCategories.length - 1}</p>
            <p className="text-xs text-muted-foreground">تصنيف</p>
          </CardContent>
        </Card>
        
        <Card className="islamic-card">
          <CardContent className="p-4 text-center">
            <div className="bg-islamic-gold w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-islamic-gold">{favorites.length}</p>
            <p className="text-xs text-muted-foreground">مفضل</p>
          </CardContent>
        </Card>
        
        <Card className="islamic-card">
          <CardContent className="p-4 text-center">
            <div className="bg-gradient-to-r from-islamic-green to-islamic-blue w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Search className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-primary">{displayedAhadith.length}</p>
            <p className="text-xs text-muted-foreground">نتيجة</p>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث */}
      <Card className="islamic-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="ابحث في الأحاديث بالعنوان أو النص أو الراوي..."
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
        <CardHeader>
          <CardTitle className="text-center">التصنيفات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {categoryStats.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`relative ${
                  selectedCategory === category.id 
                    ? 'islamic-gradient text-white' 
                    : 'hover:bg-muted'
                }`}
              >
                {category.name}
                <Badge 
                  variant="secondary" 
                  className="ml-2 text-xs bg-white/20 text-current border-none"
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* قائمة الأحاديث */}
      <div className="space-y-4">
        {displayedAhadith.map((hadith) => (
          <Card key={hadith.id} className="islamic-card relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-right text-lg">
                  <Star className="h-5 w-5 text-islamic-gold" />
                  {hadith.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(hadith.id)}
                  className={`${favorites.includes(hadith.id) ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(hadith.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="arabic-text text-base leading-relaxed p-4 bg-muted/20 rounded-lg border-r-4 border-islamic-green">
                {hadith.arabic}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="bg-islamic-green/10 text-islamic-green border-islamic-green/20">
                    {hadithCategories.find(cat => cat.id === hadith.category)?.name}
                  </Badge>
                  <span>•</span>
                  <span><strong>الراوي:</strong> {hadith.narrator}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-islamic-blue">
                  <BookOpen className="h-4 w-4" />
                  <span><strong>المصدر:</strong> {hadith.source}</span>
                </div>
                
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <strong className="text-islamic-blue">الشرح:</strong> {hadith.explanation}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* زر تحميل المزيد */}
      {displayedAhadith.length > 0 && displayedAhadith.length < searchAhadith(searchTerm, selectedCategory).length && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            className="islamic-gradient text-white px-8 py-2"
          >
            تحميل المزيد من الأحاديث
          </Button>
        </div>
      )}

      {/* رسالة عدم وجود نتائج */}
      {displayedAhadith.length === 0 && (
        <Card className="islamic-card">
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">لم يتم العثور على أحاديث تطابق البحث</p>
            <Button onClick={handleRandomHadith} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              عرض حديث عشوائي
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}