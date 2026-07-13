/**
 * Live brand/sub-brand/mode selection for the builder, backed by a tldraw atom
 * (same reactive pattern as the old themeStore) and persisted to localStorage.
 * Replaces the old --ui-* preset theme. Brand data itself comes from Convex; this
 * only holds the *selection*, which the BrandShell feeds to the BrandInjector.
 */
import { atom } from '@tldraw/state'

export type ThemeMode = 'light' | 'dark'

export interface BrandSelection {
  /** Convex brands._id, or '' until the default resolves */
  brandId: string
  /** Convex subBrandConfigs._id, or '' for the base brand */
  subBrandId: string
  mode: ThemeMode
}

const LS_KEY = 'oneui-brand-selection'

function load(): BrandSelection {
  const fallback: BrandSelection = { brandId: '', subBrandId: '', mode: 'light' }
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return { ...fallback, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return fallback
}

const brandAtom = atom<BrandSelection>('brand selection', load())

export function getBrandAtom() {
  return brandAtom
}

function persist(next: BrandSelection) {
  brandAtom.set(next)
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

/** Switching brand resets the sub-brand (sub-brands belong to a parent brand). */
export function setBrandId(brandId: string) {
  persist({ ...brandAtom.get(), brandId, subBrandId: '' })
}

export function setSubBrandId(subBrandId: string) {
  persist({ ...brandAtom.get(), subBrandId })
}

export function setMode(mode: ThemeMode) {
  persist({ ...brandAtom.get(), mode })
  document.documentElement.setAttribute('data-mode', mode)
}
