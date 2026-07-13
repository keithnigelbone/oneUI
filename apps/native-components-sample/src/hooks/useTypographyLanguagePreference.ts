import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTypographyLocale, type TypographyLocale } from '@oneui/ui-native/theme';

const STORAGE_KEY = 'oneui-native-components-sample:last-language';

interface UseTypographyLanguagePreferenceResult {
  language: TypographyLocale;
  setLanguage: (code: TypographyLocale) => void;
}

export function useTypographyLanguagePreference(): UseTypographyLanguagePreferenceResult {
  const [language, setLanguageState] = useState<TypographyLocale>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored && isTypographyLocale(stored)) {
          setLanguageState(stored);
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback((code: TypographyLocale) => {
    setLanguageState(code);
    AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
  }, []);

  return { language, setLanguage };
}
