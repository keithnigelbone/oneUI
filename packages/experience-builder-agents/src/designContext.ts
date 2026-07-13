/**
 * designContext.ts
 *
 * Compact repo-local design context retrieval for Lab planner/design prompts.
 * Reads the project skills and generated design-md snippets in Node routes.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DESIGN_MD_SPEC_ALPHA } from '@oneui/shared/engine/compositionDesignMdSpec';

const MAX_CHARS = 24000;
let cachedContext: string | null = null;

function readIfExists(path: string): string {
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf8');
}

function compactMarkdown(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('#') || line.startsWith('- ') || line.startsWith('|'))
    .join('\n');
}

export function getCompactDesignContext(): string {
  if (cachedContext != null) return cachedContext;
  const root = process.cwd();
  const snippets: string[] = [];

  // The repo-root design.md is the tokenised, multi-brand OneUI constitution — read
  // it first so its token-accurate rules win the MAX_CHARS budget. It is table/bullet
  // dense, so `compactMarkdown` retains most of it.
  const designMd = compactMarkdown(readIfExists(join(root, 'design.md')));
  if (designMd) snippets.push(`## design.md (OneUI design constitution)\n${designMd}`);

  // Canonical skills (single source of truth in .claude/skills). Curated for the
  // generation budget: design.md (above) is the condensed constitution, so we skip
  // the large, overlapping design-composition SKILL.md and instead include the
  // high-signal, non-redundant references — surface judgment, navigation fundamentals,
  // and page-type layout recipes (which most directly drive grid/layout quality).
  // (surface-context is the CSS remapping mechanism for building components, not
  // needed when generating IR; its rule is summarised in design.md's Surface Context.)
  const skillFiles = [
    '.claude/skills/surface/SKILL.md',
    '.claude/skills/design-composition/references/navigation-patterns.md',
    '.claude/skills/design-composition/references/composition-patterns.md',
  ];
  for (const rel of skillFiles) {
    const compact = compactMarkdown(readIfExists(join(root, rel)));
    if (compact) snippets.push(`## ${rel}\n${compact}`);
  }

  const specCompact = compactMarkdown(DESIGN_MD_SPEC_ALPHA);
  if (specCompact) snippets.push(`## Google DESIGN.md alpha spec\n${specCompact}`);

  const designMdDir = join(root, 'apps/platform/src/generated/design-md');
  if (existsSync(designMdDir)) {
    for (const file of readdirSync(designMdDir)
      .filter((name) => name.endsWith('.md'))
      .sort()) {
      const compact = compactMarkdown(readIfExists(join(designMdDir, file)));
      if (compact) snippets.push(`## generated/design-md/${file}\n${compact}`);
    }
  }

  const exportDir = join(root, 'docs/exports');
  if (existsSync(exportDir)) {
    for (const file of readdirSync(exportDir)
      .filter((name) => name.endsWith('.DESIGN.md'))
      .sort()) {
      const compact = compactMarkdown(readIfExists(join(exportDir, file)));
      if (compact) snippets.push(`## docs/exports/${file}\n${compact}`);
    }
  }

  cachedContext = snippets.join('\n\n').slice(0, MAX_CHARS);
  return cachedContext;
}
