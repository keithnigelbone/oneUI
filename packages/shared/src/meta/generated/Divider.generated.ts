// @generated — do not edit by hand.
// Source: packages/ui/src/components/Divider/Divider.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const DIVIDER_GENERATED_PROPS: PropDescriptor[] = [
  { name: "orientation", type: "enum", options: ["horizontal","vertical"] as const, description: "Component orientation. Default: 'horizontal'" },
  { name: "size", type: "enum", options: ["s","m","l"] as const, description: "Stroke width of the divider. Default: 'm'" },
  { name: "children", type: "ReactNode", description: "Centre content — plain string/number (auto-wrapped in Label XS Medium `<Text />`),\n`<Icon />`, or `<Text />`. Divider merges `appearance` / `attention` onto\n`Icon` / `Text` when those props are unset on the child. Omit for a bare separator." },
  { name: "contentAlign", type: "enum", options: ["center","start","end"] as const, description: "Position of the centre content. Default: 'center'" },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. 'auto' resolves to 'neutral'. Default: 'auto'" },
  { name: "attention", type: "enum", options: ["high","medium","low"] as const, description: "Prominence level — drives stroke tier and centre Icon/Text emphasis. Default: 'low'" },
  { name: "roundCaps", type: "boolean", description: "Rounded stroke ends. Default: false" },
  { name: "data-testid", type: "string", description: "Test automation id — forwarded to the root separator element only." }
];

export const DIVIDER_PROPS_SCHEMA = z.object({
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    size: z.enum(["s", "m", "l"]).optional(),
    children: z.string().optional(),
    contentAlign: z.enum(["center", "start", "end"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "positive", "negative", "warning", "informative"]).optional(),
    attention: z.enum(["high", "medium", "low"]).optional(),
    roundCaps: z.boolean().optional(),
    "data-testid": z.string().optional()
  }).strict();
