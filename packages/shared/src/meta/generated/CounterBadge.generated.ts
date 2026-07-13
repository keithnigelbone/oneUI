// @generated — do not edit by hand.
// Source: packages/ui/src/components/CounterBadge/CounterBadge.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const COUNTER_BADGE_GENERATED_PROPS: PropDescriptor[] = [
  { name: "value", type: "number", description: "Numeric value to display", required: true },
  { name: "max", type: "number", description: "Maximum value before showing overflow (e.g., \"99+\"). Default: 99" },
  { name: "showZero", type: "boolean", description: "Whether to show the badge when value is 0. Default: false" },
  { name: "size", type: "enum", options: ["xs","s","m","l"] as const, description: "CounterBadge size. Default: 'm'" },
  { name: "attention", type: "enum", options: ["high","medium","low"] as const, description: "Figma attention level — high (bold fill), medium (subtle/tinted fill), low (ghost/transparent). Default: 'high'." },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. 'auto' resolves to 'primary'." },
  { name: "aria-label", type: "string", description: "Accessible label for screen readers" },
  { name: "data-testid", type: "string", description: "Test automation id — forwarded to the root `<span role=\"status\">`." }
];

export const COUNTER_BADGE_PROPS_SCHEMA = z.object({
    value: z.number(),
    max: z.number().optional(),
    showZero: z.boolean().optional(),
    size: z.enum(["xs", "s", "m", "l"]).optional(),
    attention: z.enum(["high", "medium", "low"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    "aria-label": z.string().optional(),
    "data-testid": z.string().optional()
  }).strict();
