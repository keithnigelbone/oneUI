import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { TypographyScriptId } from '@oneui/shared';
import type { ResolvedTypographyLanguage } from './typography-locales';

export interface TypographyLanguageContextValue extends ResolvedTypographyLanguage {
  /** Alias for `locale` — BCP-47 primary tag used for typography resolution. */
  language: string;
}

const TypographyLanguageContext = createContext<TypographyLanguageContextValue | null>(
  null,
);

export interface TypographyLanguageProviderProps {
  value: ResolvedTypographyLanguage;
  children: ReactNode;
}

export function TypographyLanguageProvider({
  value,
  children,
}: TypographyLanguageProviderProps): React.ReactElement {
  const ctx = useMemo<TypographyLanguageContextValue>(
    () => ({ ...value, language: value.locale }),
    [value],
  );
  return (
    <TypographyLanguageContext.Provider value={ctx}>
      {children}
    </TypographyLanguageContext.Provider>
  );
}

/** Typography language from the nearest `OneUIBrandProvider` (or explicit provider). */
export function useTypographyLanguage(): TypographyLanguageContextValue {
  const ctx = useContext(TypographyLanguageContext);
  if (!ctx) {
    throw new Error(
      'useTypographyLanguage must be used within <OneUIBrandProvider> or <TypographyLanguageProvider>.',
    );
  }
  return ctx;
}

/** Optional typography language — `null` outside a provider tree. */
export function useOptionalTypographyLanguage(): TypographyLanguageContextValue | null {
  return useContext(TypographyLanguageContext);
}

export type { TypographyScriptId };
