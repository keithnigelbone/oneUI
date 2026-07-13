/**
 * semanticMappings/index.ts
 *
 * Composes per-set icon mapping tables into the canonical `SemanticMappings`
 * lookup used by the Icon runtime.
 *
 * Copied from @oneui/ui/icons/semanticMappings — kept in sync manually.
 * Lives here so @oneui/ui-native does not need @oneui/ui as a dependency.
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
