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
    'Usage: npx tsx scripts/supabase-theme-bulk-smoke.ts <parentBrandId>',
  );
  process.exit(1);
}

const parentBrandId = process.argv[2];
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

async function main() {
  const { data: themes } = await supabase
    .from('themes')
    .select('id,project_id,is_predefined,primary_color,secondary_color,sparkle_color,background_color,projects(name)')
    .eq('is_predefined', true)
    .not('project_id', 'is', null);

  const mapped = (themes ?? [])
    .map((t) => {
      const row = t as unknown as SupabaseThemeRow & { projects?: { name?: string } | null };
      const projectName = row.projects?.name;
      if (!row.id || !row.project_id || !projectName) return null;
      if (!row.is_predefined) return null;
      if (!row.primary_color || !row.secondary_color || !row.sparkle_color || !row.background_color) return null;
      return {
        supabaseThemeId: row.id,
        supabaseProjectName: projectName,
        primary: { scaleName: row.primary_color.family, baseStep: row.primary_color.shade },
        secondary: { scaleName: row.secondary_color.family, baseStep: row.secondary_color.shade },
        sparkle: { scaleName: row.sparkle_color.family, baseStep: row.sparkle_color.shade },
        brandBg: {
          scaleName: row.background_color.family,
          backgroundStep: { light: row.background_color.shade, dark: 200 },
        },
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const result = await convex.mutation(api.supabaseSync.bulkSync, {
    parentBrandId: parentBrandId as any,
    themes: mapped,
  });

  // eslint-disable-next-line no-console
  console.log('bulkSync result:', result);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
