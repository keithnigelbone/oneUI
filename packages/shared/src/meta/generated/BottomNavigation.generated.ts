// @generated — do not edit by hand.
// Source: packages/ui/src/components/BottomNavigation/BottomNavigation.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const BOTTOM_NAVIGATION_GENERATED_PROPS: PropDescriptor[] = [
  { name: "children", type: "ReactNode", description: "2–5 `<BottomNavItem>` children.", required: true },
  { name: "labelType", type: "enum", options: ["none","1line","2line"] as const, description: "Label layout for all items. Default: '1line'." },
  { name: "value", type: "string", description: "Controlled active item value. Match `value` on a child `<BottomNavItem>`." },
  { name: "defaultValue", type: "string", description: "Uncontrolled initial active item value." },
  { name: "onValueChange", type: "function", description: "Called when an item is pressed and its `value` becomes active." },
  { name: "showDivider", type: "boolean", description: "Show the top edge-to-edge divider. Default: true." },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role applied to all child items. Default: 'primary'." },
  { name: "aria-label", type: "string", description: "Accessible label for the `<nav>` landmark. Required.", required: true },
  { name: "data-testid", type: "string", description: "Test id forwarded to the root `<nav>`." }
];

export const BOTTOM_NAVIGATION_PROPS_SCHEMA = z.object({
    children: z.string(),
    labelType: z.enum(["none", "1line", "2line"]).optional(),
    value: z.string().optional(),
    defaultValue: z.string().optional(),
    onValueChange: z.any().optional(),
    showDivider: z.boolean().optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    "aria-label": z.string(),
    "data-testid": z.string().optional()
  }).strict();
