// @generated — do not edit by hand.
// Source: packages/ui/src/components/IndicatorBadge/IndicatorBadge.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const INDICATOR_BADGE_GENERATED_PROPS: PropDescriptor[] = [
  { name: "size", type: "enum", options: ["xs","s","m","l"] as const, deprecatedOptions: ["xl"] as const, description: "IndicatorBadge size. Default: 'm'." },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. 'auto' resolves to 'primary'." },
  { name: "aria-label", type: "string", description: "Required accessible label describing the indicator status", required: true },
  { name: "data-testid", type: "string", description: "Test automation id — forwarded to the root `<span role=\"status\">`." }
];

export const INDICATOR_BADGE_PROPS_SCHEMA = z.object({
    size: z.enum(["xs", "s", "m", "l"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    "aria-label": z.string(),
    "data-testid": z.string().optional()
  }).strict();
