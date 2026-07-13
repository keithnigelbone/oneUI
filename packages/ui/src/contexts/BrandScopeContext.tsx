'use client';

import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';

export type BrandScopeMode = 'light' | 'dark';

/** @deprecated Use `BrandScopeMode` */
export type BrandScopeTheme = BrandScopeMode;

export interface BrandScopeValue {
  brand: string;
  theme?: string;
  mode: BrandScopeMode;
  instanceId: string;
}

const BrandScopeContext = createContext<BrandScopeValue | null>(null);

export interface BrandScopeProviderProps {
  value: BrandScopeValue;
  children: ReactNode;
}

export function BrandScopeProvider({ value, children }: BrandScopeProviderProps) {
  return (
    <BrandScopeContext.Provider value={value}>
      {children}
    </BrandScopeContext.Provider>
  );
}

export function useBrandScope(): BrandScopeValue | null {
  return useContext(BrandScopeContext);
}

export function useBrandScopeMode(): BrandScopeMode | null {
  return useContext(BrandScopeContext)?.mode ?? null;
}

/** @deprecated Use `useBrandScopeMode` */
export function useBrandScopeTheme(): BrandScopeMode | null {
  return useBrandScopeMode();
}

const contentsStyle: CSSProperties = { display: 'contents' };

/**
 * Base UI portals mount under document.body, outside the BrandProvider DOM
 * wrapper. React context still reaches them, so this wrapper re-applies the
 * brand/theme attributes that scoped brand CSS needs without changing layout.
 */
export function BrandScopePortal({ children }: { children: ReactNode }) {
  const scope = useBrandScope();

  if (!scope) return <>{children}</>;

  return (
    <div
      data-brand={scope.brand}
      {...(scope.theme ? { 'data-theme': scope.theme } : {})}
      data-mode={scope.mode}
      data-oneui-brand-instance={scope.instanceId}
      data-oneui-brand-portal=""
      style={contentsStyle}
    >
      {children}
    </div>
  );
}