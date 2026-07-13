import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { getSupabaseClient } from '@/lib/supabase';

type ThemeColor = { family: string; shade: number };

type SupabaseThemeRow = {
  id: string;
  project_id: string | null;
  is_predefined: boolean | null;
  primary_color: ThemeColor | null;
  secondary_color: ThemeColor | null;
  sparkle_color: ThemeColor | null;
  background_color: ThemeColor | null;
  projects?: { name?: string } | null;
};

function normalizeScaleName(name: string): string {
  return name.trim().toLowerCase();
}

function mapRole(
  value: ThemeColor | null,
  scaleNames: Set<string>,
): { scaleName: string; baseStep: number } | null {
  if (!value?.family || typeof value.shade !== 'number') return null;
  if (!scaleNames.has(normalizeScaleName(value.family))) return null;
  return { scaleName: value.family, baseStep: value.shade };
}

const POLL_INTERVAL_MS = 30_000;

/**
 * Periodically fetches published library themes from Supabase and
 * reconciles them as sub-brand configs in Convex via bulkSync.
 *
 * No Realtime websocket — just a simple interval poll + initial fetch.
 */
export function useSupabaseThemeSync(
  parentBrandId: string | undefined,
  availableScales: Array<{ name: string }>,
) {
  const bulkSync = useMutation(api.supabaseSync.bulkSync);

  const availableScaleNames = useMemo(
    () => new Set(availableScales.map((s) => normalizeScaleName(s.name))),
    [availableScales],
  );

  const lastSyncHashRef = useRef<string>('');

  const doSync = useCallback(async () => {
    if (!parentBrandId) return;
    if (availableScaleNames.size === 0) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: themes, error } = await supabase
      .from('themes')
      .select(
        'id,project_id,is_predefined,primary_color,secondary_color,sparkle_color,background_color,projects(name)',
      )
      .eq('is_predefined', true)
      .not('project_id', 'is', null);

    if (error || !themes) return;

    const mapped = (themes as unknown as SupabaseThemeRow[])
      .map((row) => {
        if (!row?.id || !row.project_id) return null;
        if (!row.is_predefined) return null;

        const projectName = row.projects?.name;
        if (!projectName) return null;

        const primary = mapRole(row.primary_color, availableScaleNames);
        const secondary = mapRole(row.secondary_color, availableScaleNames);
        const sparkle = mapRole(row.sparkle_color, availableScaleNames);
        const bg = row.background_color;

        if (!primary || !secondary || !sparkle || !bg?.family || typeof bg.shade !== 'number')
          return null;
        if (!availableScaleNames.has(normalizeScaleName(bg.family))) return null;

        return {
          supabaseThemeId: row.id,
          supabaseProjectName: projectName,
          primary,
          secondary,
          sparkle,
          brandBg: {
            scaleName: bg.family,
            backgroundStep: { light: bg.shade, dark: 200 },
          },
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    // Skip Convex mutation if the payload is identical to the last sync.
    const hash = JSON.stringify(mapped);
    if (hash === lastSyncHashRef.current) return;
    lastSyncHashRef.current = hash;

    await bulkSync({
      parentBrandId: parentBrandId as Id<'brands'>,
      themes: mapped,
    });
  }, [parentBrandId, availableScaleNames, bulkSync]);

  // Initial fetch + periodic poll
  useEffect(() => {
    if (!parentBrandId || availableScaleNames.size === 0) return;
    if (!getSupabaseClient()) return;

    // Reset hash so a brand switch always triggers a fresh sync.
    lastSyncHashRef.current = '';

    doSync();
    const id = setInterval(doSync, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [parentBrandId, availableScaleNames, doSync]);
}
