import type { ComponentCategory, SemanticIconName } from '@oneui/shared';

/** Sidebar + section accent icons for the component catalog. */
export const CATALOG_CATEGORY_ICON: Record<ComponentCategory, SemanticIconName> = {
  navigation: 'menu',
  inputs: 'edit',
  display: 'image',
  feedback: 'notification',
  actions: 'add',
  layout: 'grid',
  overlays: 'layers',
};

/** Per-category accent token for section markers (role-explicit). */
export const CATALOG_CATEGORY_ACCENT: Record<ComponentCategory, string> = {
  navigation: 'var(--Primary-Bold)',
  inputs: 'var(--Secondary-Bold)',
  display: 'var(--Sparkle-Bold)',
  feedback: 'var(--Informative-Bold)',
  actions: 'var(--Positive-Bold)',
  layout: 'var(--Neutral-Bold)',
  overlays: 'var(--Neutral-Bold)',
};
