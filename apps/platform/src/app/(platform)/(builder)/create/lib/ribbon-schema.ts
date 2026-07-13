/**
 * Ribbon — secondary promotional strip (spec TBD). Token-only styling.
 */

export const RIBBON_PROMPT_SECTION = `
## RIBBON (optional)

A **Ribbon** is a compact horizontal strip (offer bar, legal, secondary message).
- Use class \`marketing-ribbon\`; height from spacing tokens; background from role surfaces (e.g. \`var(--Secondary-Subtle)\`).
- Typography: \`--Label-M-*\` or \`--Body-S-*\` tokens only.
- Call \`generate_ribbon\` with JSON \`ribbonData\` when the user wants offers, disclaimers, or secondary messaging above/below the main block.
`;

export type RibbonDataV0 = {
  version: 0;
  text: string;
  variant?: 'neutral' | 'accent' | 'inverse';
};

export type RibbonDataV1 = {
  version: 1;
  type: 'jio-dot-pattern';
  variant: 'dots' | 'dots-with-symbol';
  /** Ribbon thickness vs L: M=0.8, S=0.7, XS=0.6, XXS=0.5. */
  size?: 'XXS' | 'XS' | 'S' | 'M' | 'L';
  orientation?: 'vertical' | 'horizontal';
  placement?: 'left' | 'right' | 'center' | 'top' | 'bottom';
  symbolPosition?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  /** Optional gradient fill for the Jio symbol (dots-with-symbol variant only) */
  symbolGradient?: { stops: { offset: string; color: string }[] };
};

export type RibbonData = RibbonDataV0 | RibbonDataV1;

export function isJioRibbon(data: unknown): data is RibbonDataV1 {
  return (
    data != null &&
    typeof data === 'object' &&
    'version' in data &&
    (data as Record<string, unknown>).version === 1 &&
    'type' in data &&
    (data as Record<string, unknown>).type === 'jio-dot-pattern'
  );
}
