// @generated — do not edit by hand.
// Source: packages/ui/src/components/ChipGroup/ChipGroup.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const CHIP_GROUP_GENERATED_PROPS: PropDescriptor[] = [
  { name: "value", type: "object", description: "Controlled selected values (array of chip `value` strings)." },
  { name: "defaultValue", type: "object", description: "Uncontrolled default selected values." },
  { name: "onValueChange", type: "function", description: "Called when the selection changes." },
  { name: "multiple", type: "boolean", description: "Allow multiple chips to be selected simultaneously. Default: false." },
  { name: "orientation", type: "enum", options: ["horizontal","vertical"] as const, description: "Stack direction. Default: 'horizontal'." },
  { name: "wrap", type: "boolean", description: "Whether chips wrap to the next line. Default: true." },
  { name: "size", type: "enum", options: ["s","m","l"] as const, description: "Size propagated to all child Chips." },
  { name: "attention", type: "enum", options: ["high","medium","low"] as const, description: "Emphasis level propagated to all child Chips." },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Appearance propagated to all child Chips." },
  { name: "maxSelections", type: "number", description: "Maximum number of chips that can be selected at once (multi-select only)." },
  { name: "required", type: "boolean", description: "Prevent deselecting the last selected chip.\nIn controlled mode this blocks the callback; in uncontrolled mode it\nalso prevents the internal state from reaching an empty array." },
  { name: "disabled", type: "boolean", description: "Disable all chips in the group." },
  { name: "loopFocus", type: "boolean", description: "Loop keyboard focus from last item back to first. Default: true (Base UI default)." },
  { name: "aria-label", type: "string", description: "Accessible label for the group element." },
  { name: "aria-labelledby", type: "string", description: "ID of an element that labels this group." },
  { name: "children", type: "ReactNode", required: true }
];

export const CHIP_GROUP_PROPS_SCHEMA = z.object({
    value: z.unknown().optional(),
    defaultValue: z.unknown().optional(),
    onValueChange: z.any().optional(),
    multiple: z.boolean().optional(),
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    wrap: z.boolean().optional(),
    size: z.enum(["s", "m", "l"]).optional(),
    attention: z.enum(["high", "medium", "low"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    maxSelections: z.number().optional(),
    required: z.boolean().optional(),
    disabled: z.boolean().optional(),
    loopFocus: z.boolean().optional(),
    "aria-label": z.string().optional(),
    "aria-labelledby": z.string().optional(),
    children: z.string()
  }).strict();
