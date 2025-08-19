import { useState, useEffect } from 'react';

/**
 * Hook لحفظ البيانات في localStorage مع معالجة الأخطاء
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`خطأ في قراءة ${key} من localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`خطأ في حفظ ${key} في localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}