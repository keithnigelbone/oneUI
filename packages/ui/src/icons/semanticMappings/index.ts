/**
 * icons/semanticMappings/index.ts
 *
 * Semantic icon mapping registry. Composes per-set mapping tables (one file
 * per library — `./jio`, `./lucide`, `./tabler`, `./hugeicons`, `./phosphor`,
 * `./remix`) into the canonical `SemanticMappings` lookup used by the Icon
 * runtime.
 *
 * The per-set files keep this index small and let consumers that only need
 * one library's mapping import it directly:
 *
 *     import { lucide } from '@oneui/ui/icons/semanticMappings/lucide';
 *
 * Component bundlers (Next.js with `optimizePackageImports`) can still
 * tree-shake on a per-file basis when callers reach for the per-set imports.
 *
 * NOTE: The runtime `<Icon>` resolves the active set via context, so the
 * default barrel re-export still pulls every set into the resolved chunk.
 * A future enhancement (Phase 7) will swap this to lazy `() => import(...)`
 * loaders keyed by `IconSetId` so only the active set's table ships to the
 * browser. The per-file split here is the prerequisite for that change.
 */

import type { IconSetId, SemanticIconMapping } from '@oneui/shared';

import { jio } from './jio';
import { tira } from './tira';
import { material } from './material';
import { lucide } from './lucide';
import { tabler } from './tabler';
import { hugeicons } from './hugeicons';
import { phosphor } from './phosphor';
import { remix } from './remix';

export { jio, tira, material, lucide, tabler, hugeicons, phosphor, remix };

export const SemanticMappings: Record<IconSetId, SemanticIconMapping> = {
  jio,
  tira,
  material,
  lucide,
  tabler,
  hugeicons,
  phosphor,
  remix,
};
