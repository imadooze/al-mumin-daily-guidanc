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

export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [isNavigating, setIsNavigating] = useState(false);

  // تحديد الصفحة الحالية بناءً على المسار
  const determineCurrentPage = useCallback((): PageId => {
    const pathname = location.pathname;
    
    if (pathname === '/qibla') {
      return 'qibla';
    } else if (pathname === '/') {
      // في الصفحة الرئيسية، استخدم الصفحة المحفوظة
      return currentPage;
    }
    
    return 'home';
  }, [location.pathname, currentPage]);

  // معالجة state المُمرر من التنقل
  useEffect(() => {
    const state = location.state as { targetPage?: PageId } | null;
    if (state?.targetPage) {
      setCurrentPage(state.targetPage);
      // مسح state لتجنب المشاكل
      window.history.replaceState(null, '', location.pathname);
    }
  }, [location.state, location.pathname]);

  // تحديث الصفحة الحالية عند تغيير المسار
  useEffect(() => {
    const newPage = determineCurrentPage();
    if (newPage !== currentPage && location.pathname !== '/') {
      setCurrentPage(newPage);
    }
  }, [location.pathname, determineCurrentPage, currentPage]);

  // دالة التنقل الرئيسية
  const navigateToPage = useCallback((pageId: PageId) => {
    if (isNavigating) return; // منع التنقل المزدوج
    
    setIsNavigating(true);
    
    try {
      if (pageId === 'qibla') {
        // التنقل لصفحة القبلة المنفصلة
        navigate('/qibla');
      } else if (pageId === 'home') {
        // التنقل للصفحة الرئيسية
        setCurrentPage('home');
        if (location.pathname !== '/') {
          navigate('/');
        }
      } else {
        // التنقل للصفحات الداخلية
        if (location.pathname === '/qibla') {
          // إذا كنا في صفحة القبلة، انتقل للرئيسية مع الصفحة المطلوبة
          navigate('/', { state: { targetPage: pageId } });
        } else {
          // تحديث الصفحة مباشرة
          setCurrentPage(pageId);
        }
      }
    } finally {
      setTimeout(() => setIsNavigating(false), 100);
    }
  }, [navigate, location.pathname, isNavigating]);

  // الحصول على الصفحة الحالية النشطة
  const getActivePage = useCallback((): PageId => {
    return determineCurrentPage();
  }, [determineCurrentPage]);

  return {
    currentPage,
    navigateToPage,
    getActivePage,
    isNavigating,
    location
  };
}