// @generated — do not edit by hand.
// Source: packages/ui/src/components/Tabs/Tabs.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const TABS_GENERATED_PROPS: PropDescriptor[] = [
  { name: "children", type: "ReactNode", required: true },
  { name: "value", type: "object" },
  { name: "defaultValue", type: "object" },
  { name: "onValueChange", type: "function" },
  { name: "orientation", type: "enum", options: ["horizontal","vertical"] as const },
  { name: "size", type: "enum", options: ["s","m","l"] as const, description: "Size forwarded to all child TabItems." },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Appearance forwarded to all child TabItems." }
];

export const TABS_PROPS_SCHEMA = z.object({
    children: z.string(),
    value: z.unknown().optional(),
    defaultValue: z.unknown().optional(),
    onValueChange: z.any().optional(),
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    size: z.enum(["s", "m", "l"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional()
  }).strict();
