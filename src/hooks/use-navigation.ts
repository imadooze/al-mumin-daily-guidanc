import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type PageId = 
  | 'home' 
  | 'quran' 
  | 'prayer-times' 
  | 'qibla' 
  | 'azkar' 
  | 'more'
  | 'tasbeeh'
  | 'names'
  | 'duas'
  | 'hadith'
  | 'settings'
  | 'hijri-calendar'
  | 'learning';

export interface NavigationState {
  currentPage: PageId;
  isNavigating: boolean;
}

// مفتاح التخزين المحلي
const STORAGE_KEY = 'app-current-page';

export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // استرجاع الصفحة المحفوظة أو استخدام home كافتراضي
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as PageId) || 'home';
  });
  
  const [isNavigating, setIsNavigating] = useState(false);

  // حفظ الصفحة الحالية عند تغييرها
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentPage);
  }, [currentPage]);

  // معالجة state المُمرر من التنقل (للعودة من صفحة القبلة)
  useEffect(() => {
    const state = location.state as { targetPage?: PageId } | null;
    if (state?.targetPage) {
      setCurrentPage(state.targetPage);
      // مسح state بعد الاستخدام
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // تحديث الصفحة عند العودة من مسار القبلة
  useEffect(() => {
    if (location.pathname === '/' && !location.state) {
      // نحن في الصفحة الرئيسية، استخدم الصفحة المحفوظة
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== currentPage) {
        setCurrentPage(saved as PageId);
      }
    } else if (location.pathname === '/qibla' && currentPage !== 'qibla') {
      setCurrentPage('qibla');
    }
  }, [location.pathname]);

  // دالة التنقل الرئيسية
  const navigateToPage = useCallback((pageId: PageId) => {
    // منع التنقل المزدوج
    if (isNavigating) {
      console.log('Navigation in progress, ignoring click');
      return;
    }
    
    // إذا كنا بالفعل في نفس الصفحة، لا داعي للتنقل
    if (pageId === currentPage && location.pathname !== '/qibla') {
      console.log('Already on page:', pageId);
      return;
    }
    
    setIsNavigating(true);
    console.log('Navigating to:', pageId);
    
    try {
      if (pageId === 'qibla') {
        // التنقل لصفحة القبلة المنفصلة
        setCurrentPage('qibla');
        navigate('/qibla');
      } else {
        // تحديث الصفحة الحالية
        setCurrentPage(pageId);
        
        // إذا كنا في صفحة القبلة، نحتاج للعودة للرئيسية
        if (location.pathname === '/qibla') {
          navigate('/', { state: { targetPage: pageId } });
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // إعادة تفعيل التنقل بعد فترة قصيرة
      setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    }
  }, [currentPage, isNavigating, navigate, location.pathname]);

  // الحصول على الصفحة النشطة (للتمييز في UI)
  const getActivePage = useCallback((): PageId => {
    if (location.pathname === '/qibla') {
      return 'qibla';
    }
    return currentPage;
  }, [currentPage, location.pathname]);

  return {
    currentPage: getActivePage(),
    navigateToPage,
    isNavigating,
    location
  };
}