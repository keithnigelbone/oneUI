'use client';

/**
 * Brand-catalog data layer for the platform shell.
 *
 * Owns the live Convex queries + the side-effects that depend on them:
 *   - `api.brands.list` + `api.brands.seedDefaultBrands` + `api.brands.ensureSystemBrand`
 *   - Mapping raw Convex documents → `Brand` objects (system first)
 *   - Auto-registering the One UI Theme system brand as `platformBrandId`
 *   - Auto-selecting the user's brand on first load (account prefs first,
 *     then the localStorage fallback for the pre-prefs paint)
 *   - Persisting the full set of brand logos for the preloader slot machine
 *
 * Returns the derived `availableBrands` + `userBrands` arrays the shell
 * passes into Shell/TopBar/BrandPicker. Mutations are not exposed —
 * they are fire-and-forget effects.
 */

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Brand } from '@oneui/shared';
import type { UserPreferences } from '@/hooks/useUserPreferences';

interface FoundationDataLike {
  color?: { config?: unknown } | null;
}

/**
 * Resolve a stable scales-for-sync array used by `useSupabaseThemeSync`
 * for family-name validation. `foundationData` is a fresh object on every
 * Convex tick — flatten the names to a primitive key so the array
 * identity stays stable across ticks where the scale names haven't
 * actually changed.
 */
export function useAvailableScalesForSync(
  foundationData: FoundationDataLike | null | undefined,
): Array<{ name: string }> {
  const scaleNamesKey = useMemo(() => {
    const brandScales = (
      foundationData?.color?.config as { brandScales?: Array<{ name: string }> } | undefined
    )?.brandScales;
    if (!brandScales?.length) return '';
    return brandScales
      .map((s) => (typeof s.name === 'string' ? s.name.trim() : ''))
      .filter((n) => n.length > 0)
      .join('\n');
  }, [foundationData?.color?.config]);

  return useMemo(() => {
    if (!scaleNamesKey) return [];
    return scaleNamesKey.split('\n').map((name) => ({ name }));
  }, [scaleNamesKey]);
}

interface UseBrandsCatalogArgs {
  currentBrand: Brand | null;
  setBrand: (brand: Brand) => void;
  platformBrandId: string | null | undefined;
  setPlatformBrandId: (id: string) => void;
  /** Convex-backed per-user prefs — the cross-device source for brand restore. */
  prefs: UserPreferences | null;
  /** True until the prefs row resolves; auto-select waits so the first CSS injection targets the right brand. */
  prefsLoading: boolean;
  /**
   * Receives the sub-brand id to restore, snapshotted BEFORE `setBrand` runs
   * (setBrand clears `lastOpenedSubBrandId`). Consumed by `useBrandSwitching`
   * once the target brand's sub-brands load.
   */
  pendingSubBrandIdRef: MutableRefObject<string | null>;
}

interface UseBrandsCatalogResult {
  /** Raw brands query — `undefined` while loading, `[]` when empty. */
  brands: ReturnType<typeof useQuery<typeof api.brands.list>>;
  /** Mapped + sorted brands (system first). */
  availableBrands: Brand[];
  /** User-facing brands only — system brands excluded. */
  userBrands: Brand[];
}

export function useBrandsCatalog({
  currentBrand,
  setBrand,
  platformBrandId,
  setPlatformBrandId,
  prefs,
  prefsLoading,
  pendingSubBrandIdRef,
}: UseBrandsCatalogArgs): UseBrandsCatalogResult {
  const ensureSystemBrand = useMutation(api.brands.ensureSystemBrand);
  const seedBrands = useMutation(api.brands.seedDefaultBrands);
  const brands = useQuery(api.brands.list);

  // Seed default brands only when the DB is truly empty.
  useEffect(() => {
    if (brands !== undefined && brands.length === 0) {
      seedBrands({}).catch((err) => {
        console.error('Failed to seed brands:', err);
      });
    }
  }, [brands, seedBrands]);

  // Ensure the One UI Theme system brand always exists (idempotent).
  const systemBrandEnsured = useRef(false);
  useEffect(() => {
    if (brands !== undefined && !systemBrandEnsured.current) {
      systemBrandEnsured.current = true;
      ensureSystemBrand({}).catch((err) => {
        console.error('Failed to ensure system brand:', err);
      });
    }
  }, [brands, ensureSystemBrand]);

  // Map Convex documents → Brand objects (system first).
  const availableBrands: Brand[] = useMemo(() => {
    if (!brands || brands.length === 0) return [];
    const mapped = brands.map((b) => ({
      id: b._id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      icon: b.icon,
      logoSvg: b.logoSvg,
      status: b.status,
      isSystem: b.isSystem ?? false,
      primaryHue: b.primaryHue,
      primaryChroma: b.primaryChroma,
      secondaryHue: b.secondaryHue,
      secondaryChroma: b.secondaryChroma,
      baseBrand: b.baseBrand,
      createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
      updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(),
    }));
    return [...mapped.filter((b) => b.isSystem), ...mapped.filter((b) => !b.isSystem)];
  }, [brands]);

  // Auto-register the system brand as platformBrandId so platform-owned
  // dimensions and component defaults always have a stable source.
  useEffect(() => {
    if (!availableBrands.length) return;
    const systemBrand = availableBrands.find((b) => b.isSystem);
    if (!systemBrand) return;
    if (platformBrandId !== systemBrand.id) {
      setPlatformBrandId(systemBrand.id);
    }
  }, [availableBrands, platformBrandId, setPlatformBrandId]);

  // User-facing brands only — system/platform brands are admin-only.
  const userBrands = useMemo(
    () => availableBrands.filter((b) => !b.isSystem),
    [availableBrands],
  );

  // Persist the full set of brand logos for the preloader slot machine.
  useEffect(() => {
    if (availableBrands.length === 0) return;
    const logos = availableBrands.filter((b) => b.logoSvg).map((b) => b.logoSvg as string);
    try {
      if (logos.length > 0) {
        localStorage.setItem('oneui-studio:brand-logos', JSON.stringify(logos));
      } else {
        localStorage.removeItem('oneui-studio:brand-logos');
      }
    } catch {
      /* localStorage unavailable */
    }
  }, [availableBrands]);

  // Auto-select brand on load. Resolution order:
  //   1. prefs.defaultBrandId       — explicit Settings choice (account-wide)
  //   2. prefs.lastOpenedBrandId    — last-used, from Convex (cross-device)
  //   3. localStorage last-brand-id — same-device fallback (pre-prefs era)
  //   4. first user brand → system brand
  // Every candidate is validated against the access-scoped brand list, so a
  // revoked/deleted brand id simply falls through to the next candidate.
  // We wait for the prefs row to resolve before selecting — picking brand A
  // from localStorage and then flipping to brand B from prefs would inject
  // brand CSS twice and flash the wrong theme.
  useEffect(() => {
    if (currentBrand) return;
    if (availableBrands.length === 0) return;
    if (prefsLoading) return;
    const byId = (id?: string | null): Brand | undefined =>
      id ? userBrands.find((b) => b.id === id) : undefined;
    let lsId: string | null = null;
    try {
      lsId = localStorage.getItem('oneui-studio:last-brand-id');
    } catch {
      /* localStorage unavailable */
    }
    const target =
      byId(prefs?.defaultBrandId) ??
      byId(prefs?.lastOpenedBrandId) ??
      byId(lsId) ??
      userBrands[0] ??
      availableBrands.find((b) => b.isSystem);
    if (!target) return;
    // Snapshot the sub-brand to restore BEFORE setBrand — setBrand persists
    // `lastOpenedSubBrandId: null`, so reading prefs afterwards would lose it.
    const subBrandPref =
      (byId(prefs?.defaultBrandId) ? prefs?.defaultSubBrandId : null) ??
      prefs?.lastOpenedSubBrandId ??
      null;
    pendingSubBrandIdRef.current = subBrandPref;
    setBrand(target);
  }, [prefsLoading, prefs, userBrands, availableBrands, currentBrand, setBrand, pendingSubBrandIdRef]);

  return { brands, availableBrands, userBrands };
}
