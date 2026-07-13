/**
 * Content Block — AI prompt contract for the ContentBlock canvas component.
 *
 * ContentBlock and JioRibbon are placed as hug-content shapes inside the
 * tldraw artboard frame. Each component renders at its intrinsic size and
 * the artboard controls positioning (x/y). Components can be freely dragged.
 */

export const CONTENT_BLOCK_PROMPT_SECTION = `
## CONTENT BLOCK (required composition unit)

Every full asset should include a **ContentBlock** component: a token-driven marketing copy block
with context label, headline, body text, and OneUI Button CTAs. It renders as a hug-content shape
inside the tldraw frame. The artboard positions the block via \`position\` (top/middle/bottom) and
\`alignment\` (left/center), which map to the shape's x/y coordinates within the frame. The user
can also freely drag the component to any position on the artboard.

When the model calls \`generate_content_block\`, pass a JSON \`layout\` with these ContentBlock props:
- \`position\`: 'top' | 'middle' | 'bottom' (vertical anchor — controls initial shape y)
- \`alignment\`: 'left' | 'center' (horizontal alignment — controls shape x + text alignment)
- \`maxWidth\`: number (percentage of canvas width for shape width, e.g. 60)
- \`contextText\`: string (small label above headline)
- \`headlineText\`: string (main headline)
- \`bodyText\`: string (supporting copy)
- \`primaryCtaText\`: string (primary button label)
- \`secondaryCtaText\`: string (secondary button label, optional)
- \`showContext\`: boolean
- \`showBody\`: boolean
- \`showButtons\`: boolean
- \`showSecondaryButton\`: boolean
- \`headlineToken\`: 'auto' | 'Display-L' | 'Display-M' | 'Display-S' | 'Headline-L' | 'Headline-M' | 'Headline-S' (auto picks from canvas size; platform/density resolve f-scale on the block)
- \`platform\`: 'auto' | 'S' | 'M' | 'L' (auto from artboard width)
- \`density\`: 'default' | 'compact' | 'open'
- \`buttonSize\`: 's' | 'm' | 'l'
- \`buttonAppearance\`: 'primary' | 'secondary' | 'neutral' | etc.

The \`canvasWidth\` and \`canvasHeight\` are set automatically from the asset dimension (used for
responsive typography resolution, not for sizing the block itself).
Typography and spacing use design tokens exclusively — no hardcoded values.

**generate_content_block** should be called before \`generate_asset_layout\` to capture structured copy intent.
`;

export type ContentBlockLayoutV0 = {
  version: 0;
  headline?: string;
  subhead?: string;
  ctaLabel?: string;
  emphasis?: 'minimal' | 'bold';
};
