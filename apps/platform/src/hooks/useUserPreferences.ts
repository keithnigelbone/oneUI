/**
 * useUserPreferences.ts
 *
 * Platform-app-scoped hook that owns user preferences persistence.
 * Reads/generates a deviceId uuid in localStorage, subscribes to the
 * Convex `userPreferences` row keyed by that deviceId, and exposes
 * `updatePref(patch)` which writes a synchronous localStorage shadow
 * copy (for FOUC prevention) and debounces the Convex upsert.
 *
 * One-shot migration: if the Convex row is missing on first load, it
 * seeds the row from the existing `oneui-studio:*` localStorage keys
 * so existing users don't lose their session.
 *
 * Kept platform-app scoped (not in @oneui/ui) so the UI package stays
 * Convex-agnostic — Storybook's BrandStyleDecorator must not pick up
 * a transitive Convex dependency.
 *
 * !!! PRE-OAUTH — DO NOT DEPLOY WITHOUT REPLACING !!!
 * Preferences are keyed on a client-generated `deviceId` persisted in
 * localStorage. Any client can choose any deviceId, so on a shared
 * deployment one user can overwrite another's preferences by crafting
 * the key. Swap `deviceId` for a real identity token (same migration
 * path as `LOCAL_USER_ID` in HomeChat) before shipping outside dev.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '@oneui/convex';

export type ThemeScopeValue = 'global' | 'scoped' | 'preview';
export type DensityValue = 'compact' | 'default' | 'open';
export type ThemeValue = 'light' | 'dark';

// IDs are plain strings at the React boundary. The Convex mutation
// validator handles the Id<'brands'> branding server-side.
export interface UserPreferences {
  defaultBrandId?: string | null;
  defaultSubBrandId?: string | null;
  lastOpenedBrandId?: string | null;
  lastOpenedSubBrandId?: string | null;
  platformBrandId?: string | null;
  themeScope?: ThemeScopeValue;
  density?: DensityValue;
  theme?: ThemeValue;
  iconSet?: string | null;
}

export type PrefsPatch = Partial<UserPreferences>;

const DEVICE_ID_KEY = 'oneui-studio:user-id';
const DEBOUNCE_MS = 200;

// Mirror of the legacy localStorage key set so we can (a) seed Convex on
// first load and (b) keep a synchronous shadow copy for the FOUC script.
const LS_KEYS = {
  lastBrand: 'oneui-studio:last-brand-id',
  lastSubBrand: 'oneui-studio:last-sub-brand-id',
  platformBrand: 'oneui-studio:platform-brand-id',
  themeScope: 'oneui-studio:theme-scope',
  theme: 'oneui-studio:theme',
  density: 'oneui-studio:density',
} as const;

function clearLegacyThemeCache(): void {
  localStorage.removeItem('oneui-studio:brand-css');
  localStorage.removeItem('oneui-studio:brand-css-meta');
}

function normalizePrefsPatch(patch: PrefsPatch): PrefsPatch {
  if (!('themeScope' in patch)) return patch;
  return { ...patch, themeScope: 'global' };
}

function readLocalStoragePrefs(): PrefsPatch {
  if (typeof window === 'undefined') return {};
  const patch: PrefsPatch = {};
  const lastBrand = localStorage.getItem(LS_KEYS.lastBrand);
  if (lastBrand) patch.lastOpenedBrandId = lastBrand;
  const lastSub = localStorage.getItem(LS_KEYS.lastSubBrand);
  if (lastSub) patch.lastOpenedSubBrandId = lastSub;
  const platformBrand = localStorage.getItem(LS_KEYS.platformBrand);
  if (platformBrand) patch.platformBrandId = platformBrand;
  const themeScope = localStorage.getItem(LS_KEYS.themeScope);
  if (themeScope !== 'global') {
    localStorage.setItem(LS_KEYS.themeScope, 'global');
    clearLegacyThemeCache();
  }
  patch.themeScope = 'global';
  const theme = localStorage.getItem(LS_KEYS.theme);
  if (theme === 'light' || theme === 'dark') patch.theme = theme;
  // Migrate V4-dropped dim → dark
  if (theme === 'dim') patch.theme = 'dark';
  const density = localStorage.getItem(LS_KEYS.density);
  if (density === 'compact' || density === 'default' || density === 'open') {
    patch.density = density;
  }
  return patch;
}

function writeLocalStorageShadow(patch: PrefsPatch): void {
  if (typeof window === 'undefined') return;
  try {
    const legacyThemeScope = 'themeScope' in patch && patch.themeScope !== 'global';
    patch = normalizePrefsPatch(patch);
    if ('lastOpenedBrandId' in patch) {
      if (patch.lastOpenedBrandId) {
        localStorage.setItem(LS_KEYS.lastBrand, patch.lastOpenedBrandId);
      } else {
        localStorage.removeItem(LS_KEYS.lastBrand);
      }
    }
    if ('lastOpenedSubBrandId' in patch) {
      if (patch.lastOpenedSubBrandId) {
        localStorage.setItem(LS_KEYS.lastSubBrand, patch.lastOpenedSubBrandId);
      } else {
        localStorage.removeItem(LS_KEYS.lastSubBrand);
      }
    }
    if ('platformBrandId' in patch) {
      if (patch.platformBrandId) {
        localStorage.setItem(LS_KEYS.platformBrand, patch.platformBrandId);
      } else {
        localStorage.removeItem(LS_KEYS.platformBrand);
      }
    }
    if ('themeScope' in patch) {
      localStorage.setItem(LS_KEYS.themeScope, 'global');
      if (legacyThemeScope) clearLegacyThemeCache();
    }
    if (patch.theme) localStorage.setItem(LS_KEYS.theme, patch.theme);
    if (patch.density) localStorage.setItem(LS_KEYS.density, patch.density);
  } catch (err) {
    // localStorage can fail in Safari Private Browsing, when quota is
    // exceeded, or when third-party cookies are blocked. Silent failure
    // breaks FOUC prevention (the blocking script below reads these
    // keys), so surface it in dev so the root cause isn't invisible.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[useUserPreferences] localStorage write failed', err);
    }
  }
}

/**
 * Reads or mints the client-side device id used to key Convex prefs.
 *
 * !!! PRE-OAUTH — DO NOT DEPLOY WITHOUT REPLACING !!!
 * This id is purely client-chosen; on a shared deployment any user can
 * fabricate another user's id and clobber their prefs row. See the
 * module-level warning for the full migration plan.
 */
function getOrCreateDeviceId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export interface UseUserPreferencesResult {
  prefs: UserPreferences | null;
  deviceId: string | null;
  isLoading: boolean;
  updatePref: (patch: PrefsPatch) => void;
}

export function useUserPreferences(): UseUserPreferencesResult {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  useEffect(() => {
    setDeviceId(getOrCreateDeviceId());
  }, []);

  // Preferences are user-scoped server-side (identity from Better Auth), so
  // every read/write requires an authenticated Convex session. Gate on it —
  // otherwise the migration effect below fires `upsert` during the pre-auth
  // window and the server throws "Not authenticated".
  const { isAuthenticated } = useConvexAuth();

  const row = useQuery(
    api.userPreferences.get,
    isAuthenticated && deviceId ? { deviceId } : 'skip'
  );
  const upsertMutation = useMutation(api.userPreferences.upsert);

  // One-shot migration: when the row resolves to `null` (first visit for
  // this device), seed Convex from the legacy localStorage keys. Tracked
  // via a ref so it runs at most once per tab lifetime.
  const migratedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || !deviceId || row === undefined || migratedRef.current) return;
    if (row === null) {
      migratedRef.current = true;
      const legacyPatch = readLocalStoragePrefs();
      // Cast: at the React boundary IDs are plain strings; Convex validates
      // the Id<'brands'> brand server-side.
      upsertMutation({
        deviceId,
        patch: legacyPatch as Parameters<typeof upsertMutation>[0]['patch'],
      }).catch((err) => {
        console.warn('[useUserPreferences] migration upsert failed', err);
      });
    } else {
      migratedRef.current = true;
    }
  }, [isAuthenticated, deviceId, row, upsertMutation]);

  useEffect(() => {
    if (!isAuthenticated || !deviceId || row === undefined || row === null) return;
    if (row.themeScope && row.themeScope !== 'global') {
      writeLocalStorageShadow({ themeScope: 'global' });
      upsertMutation({ deviceId, patch: { themeScope: 'global' } }).catch((err) => {
        console.warn('[useUserPreferences] theme-scope migration failed', err);
      });
    }
  }, [isAuthenticated, deviceId, row, upsertMutation]);

  // Debounced Convex upsert. Pending patches are merged so rapid toggles
  // collapse into a single round-trip.
  const pendingPatchRef = useRef<PrefsPatch>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushPending = useCallback(() => {
    debounceTimerRef.current = null;
    if (!isAuthenticated || !deviceId) return;
    const patch = pendingPatchRef.current;
    pendingPatchRef.current = {};
    if (Object.keys(patch).length === 0) return;
    // Cast: see note in migration effect above.
    upsertMutation({
      deviceId,
      patch: patch as Parameters<typeof upsertMutation>[0]['patch'],
    }).catch((err) => {
      console.warn('[useUserPreferences] upsert failed', err);
    });
  }, [isAuthenticated, deviceId, upsertMutation]);

  const updatePref = useCallback(
    (patch: PrefsPatch) => {
      const normalizedPatch = normalizePrefsPatch(patch);
      // Write synchronous localStorage cache first so the blocking FOUC
      // script in app/layout.tsx finds fresh values on next refresh.
      writeLocalStorageShadow(normalizedPatch);
      pendingPatchRef.current = { ...pendingPatchRef.current, ...normalizedPatch };
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(flushPending, DEBOUNCE_MS);
    },
    [flushPending]
  );

  // Flush on unmount so we don't drop the last patch
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        flushPending();
      }
    };
  }, [flushPending]);

  const prefs = useMemo<UserPreferences | null>(() => {
    if (row === undefined || row === null) return null;
    // Strip Convex system fields; keep only the preference fields
    const {
      _id: _ignoredId,
      _creationTime: _ignoredCreation,
      deviceId: _ignoredDevice,
      createdAt: _ignoredCreatedAt,
      updatedAt: _ignoredUpdatedAt,
      ...rest
    } = row;
    const prefs = rest as UserPreferences;
    return prefs.themeScope && prefs.themeScope !== 'global'
      ? { ...prefs, themeScope: 'global' }
      : prefs;
  }, [row]);

  const isLoading = deviceId === null || row === undefined;

  return { prefs, deviceId, isLoading, updatePref };
}
