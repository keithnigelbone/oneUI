/**
 * sizeLabels.ts
 *
 * Derive t-shirt size labels from a component token manifest's f-step size keys.
 * Shared by library previews (`*Preview.tsx`) and the studio token editor so both
 * can render matrix previews from a single source of truth.
 */

import type { TokenDefinition } from '../types/componentTokens';

const F_STEP_TO_LABEL: Record<string, string> = {
  '6': '2XS', '7': 'XS', '8': 'S', '10': 'M', '12': 'L', '14': 'XL', '16': '2XL',
};

export function deriveSizeLabels(tokens: Record<string, TokenDefinition>): Record<string, string> {
  const sizeKeys = new Set<string>();
  for (const def of Object.values(tokens)) {
    if (def.sizes) {
      for (const key of Object.keys(def.sizes)) {
        sizeKeys.add(key);
      }
    }
  }
  const result: Record<string, string> = {};
  const sorted = Array.from(sizeKeys).sort((a, b) => Number(a) - Number(b));
  for (const key of sorted) {
    result[key] = F_STEP_TO_LABEL[key] || key;
  }
  return result;
}
