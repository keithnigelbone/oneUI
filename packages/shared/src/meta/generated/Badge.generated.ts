// @generated — do not edit by hand.
// Source: packages/ui/src/components/Badge/Badge.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const BADGE_GENERATED_PROPS: PropDescriptor[] = [
  { name: "children", type: "ReactNode", description: "Text content displayed inside the badge" },
  { name: "size", type: "enum", options: ["xs","s","m","l"] as const, deprecatedOptions: ["xl"] as const, description: "Badge size. Default: 'm'." },
  { name: "attention", type: "enum", options: ["high","medium","low"] as const, description: "Figma attention level — high (bold fill), medium (tinted fill), low (transparent). Default: 'high'." },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. `'auto'` or omit: inherit nearest `<Surface>` effective role, else `sparkle`." },
  { name: "start", type: "ReactNode", description: "Content to render before the label (icon, avatar, counter badge, indicator badge)" },
  { name: "end", type: "ReactNode", description: "Content to render after the label (icon, avatar, counter badge, indicator badge)" },
  { name: "aria-label", type: "string", description: "Accessible label for screen readers" },
  { name: "data-testid", type: "string", description: "Test selector passthrough" }
];

export const BADGE_PROPS_SCHEMA = z.object({
    children: z.string().optional(),
    size: z.enum(["xs", "s", "m", "l"]).optional(),
    attention: z.enum(["high", "medium", "low"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    "aria-label": z.string().optional(),
    "data-testid": z.string().optional()
  }).strict();
