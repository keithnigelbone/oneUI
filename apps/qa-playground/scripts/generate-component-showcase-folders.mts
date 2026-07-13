/**
 * One-time / regen: create `src/components/<slug>/*QaShowcase.tsx` for every meta slug
 * and rewrite `src/components/registerComponentShowcases.ts`.
 *
 *   pnpm exec tsx scripts/generate-component-showcase-folders.mts
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_COMPONENT_METAS } from '../../../packages/ui/src/registry/metaRegistry.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COMPONENTS = join(ROOT, 'src/components');

const lines: string[] = [];
lines.push(`import type { ComponentType } from 'react';`);
lines.push(`import { ALL_COMPONENT_METAS } from '@oneui/ui/registry/metaRegistry';`);
lines.push('');

const showcaseImports: string[] = [];

for (const meta of ALL_COMPONENT_METAS) {
  const slug = meta.slug;
  const exportName = `${meta.name}QaShowcase`;
  const dir = join(COMPONENTS, slug);
  mkdirSync(dir, { recursive: true });

  const filePath = join(dir, `${meta.name}QaShowcase.tsx`);

  if (slug === 'button') {
    showcaseImports.push(`import { ${exportName} } from './button/ButtonQaShowcase';`);
    continue;
  }

  const source = `'use client';

import { QaShowcaseRoot } from '../shared/QaShowcaseLayout';
import { ScenarioGridQaShowcase } from '../shared/ScenarioGridQaShowcase';

/**
 * ${meta.displayName} QA — **same outer mount as Button** (\`QaShowcaseRoot\`).
 * Section bands inside use {@link ../shared/QaShowcaseLayout#QaStoryBand} via {@link ../shared/ScenarioGridQaShowcase}.
 */
export function ${exportName}() {
  return (
    <QaShowcaseRoot>
      <ScenarioGridQaShowcase slug=${JSON.stringify(slug)} />
    </QaShowcaseRoot>
  );
}
`;
  writeFileSync(filePath, source, 'utf8');
  showcaseImports.push(`import { ${exportName} } from './${slug}/${meta.name}QaShowcase';`);
}

showcaseImports.sort();
lines.push(...showcaseImports);
lines.push('');
lines.push(`const BY_SLUG: Record<string, ComponentType> = {`);
for (const meta of ALL_COMPONENT_METAS) {
  lines.push(`  ${JSON.stringify(meta.slug)}: ${meta.name}QaShowcase,`);
}
lines.push(`};`);
lines.push('');
lines.push(`/** Full QA canvas per registry slug — one folder under \`components/<slug>/\`. */`);
lines.push(`export const COMPONENT_QA_SHOWCASES: Record<string, ComponentType> = Object.fromEntries(`);
lines.push(`  ALL_COMPONENT_METAS.map((m) => [m.slug, BY_SLUG[m.slug]])`);
lines.push(`) as Record<string, ComponentType>;`);
lines.push('');

writeFileSync(join(COMPONENTS, 'registerComponentShowcases.ts'), lines.join('\n'), 'utf8');
console.log(`Wrote ${ALL_COMPONENT_METAS.length} showcases + registerComponentShowcases.ts`);
