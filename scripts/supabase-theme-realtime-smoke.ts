#!/usr/bin/env npx tsx
import { createClient } from '@supabase/supabase-js';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../packages/convex/convex/_generated/api';

type ThemeColor = { family: string; shade: number };

type SupabaseThemeRow = {
  id: string;
  project_id: string | null;
  is_predefined: boolean | null;
  primary_color: ThemeColor | null;
  secondary_color: ThemeColor | null;
  sparkle_color: ThemeColor | null;
  background_color: ThemeColor | null;
};

function usage(): never {
  // eslint-disable-next-line no-console
  console.error(
    'Usage: npx tsx scripts/supabase-theme-realtime-smoke.ts <parentBrandId> [timeoutMs]',
  );
  process.exit(1);
}

const parentBrandId = process.argv[2];
const timeoutMs = Number(process.argv[3] ?? 25000);

if (!parentBrandId) usage();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
if (!convexUrl) throw new Error('Missing CONVEX_URL (or NEXT_PUBLIC_CONVEX_URL)');

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const convex = new ConvexHttpClient(convexUrl);

async function resolveProjectName(projectId: string): Promise<string | null> {
  const { data } = await supabase.from('projects').select('name').eq('id', projectId).maybeSingle();
  return (data as { name?: string } | null)?.name ?? null;
}

function mapRole(value: ThemeColor | null) {
  if (!value?.family || typeof value.shade !== 'number') return null;
  return { scaleName: value.family, baseStep: value.shade };
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('Listening for Supabase Realtime events on public.themes…');

  const channel = supabase
    .channel('oneui-smoke-themes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'themes', filter: 'is_predefined=eq.true' },
      async (payload) => {
        // eslint-disable-next-line no-console
        console.log('Realtime event:', payload.eventType);

        if (payload.eventType === 'DELETE') return;
        const row = payload.new as SupabaseThemeRow | undefined;
        if (!row?.id || !row.project_id) return;

        const projectName = await resolveProjectName(row.project_id);
        if (!projectName) return;

        const primary = mapRole(row.primary_color);
        const secondary = mapRole(row.secondary_color);
        const sparkle = mapRole(row.sparkle_color);
        const bg = row.background_color;
        if (!primary || !secondary || !sparkle || !bg?.family || typeof bg.shade !== 'number') return;

        await convex.mutation(api.supabaseSync.syncTheme, {
          parentBrandId: parentBrandId as any,
          supabaseThemeId: row.id,
          supabaseProjectName: projectName,
          primary,
          secondary,
          sparkle,
          brandBg: { scaleName: bg.family, backgroundStep: { light: bg.shade, dark: 200 } },
        });

        // eslint-disable-next-line no-console
        console.log('Synced into Convex subBrandConfigs for project:', projectName);
      },
    )
    .subscribe();

  setTimeout(async () => {
    await supabase.removeChannel(channel);
    // eslint-disable-next-line no-console
    console.log('Done.');
    process.exit(0);
  }, timeoutMs);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
