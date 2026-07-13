'use client';

import { useDocsBrand, type DocsDensity, type DocsTheme } from './DocsBrandContext';
import styles from './BrandControls.module.css';

const themes: DocsTheme[] = ['light', 'dark'];
const densities: DocsDensity[] = ['compact', 'default', 'open'];

export function BrandControls({ variant = 'inline' }: { variant?: 'inline' | 'menu' }) {
  const {
    brands,
    density,
    hasConvex,
    selectedBrandId,
    setDensity,
    setSelectedBrandId,
    setTheme,
    theme,
  } = useDocsBrand();

  const className = [styles.controls, variant === 'menu' ? styles.controlsMenu : undefined].filter(Boolean).join(' ');

  return (
    <div className={className} aria-label="Documentation preview controls">
      <label className={styles.field}>
        <span className={styles.label}>Brand</span>
        <select
          className={styles.select}
          value={selectedBrandId ?? ''}
          onChange={(event) => setSelectedBrandId(event.currentTarget.value)}
          disabled={!hasConvex || brands.length === 0}
        >
          {brands.length === 0 ? (
            <option value="">Base tokens</option>
          ) : (
            brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))
          )}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Theme</span>
        <select className={styles.select} value={theme} onChange={(event) => setTheme(event.currentTarget.value as DocsTheme)}>
          {themes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Density</span>
        <select
          className={styles.select}
          value={density}
          onChange={(event) => setDensity(event.currentTarget.value as DocsDensity)}
        >
          {densities.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {!hasConvex ? <span className={styles.status}>Set NEXT_PUBLIC_CONVEX_URL</span> : null}
    </div>
  );
}
