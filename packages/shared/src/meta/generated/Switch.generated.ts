// @generated — do not edit by hand.
// Source: packages/ui/src/components/Switch/Switch.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const SWITCH_GENERATED_PROPS: PropDescriptor[] = [
  { name: "children", type: "ReactNode", description: "Label text" },
  { name: "checked", type: "boolean", description: "Whether the switch is on (controlled)" },
  { name: "defaultChecked", type: "boolean", description: "Default state (uncontrolled)" },
  { name: "onCheckedChange", type: "function", description: "Change handler" },
  { name: "size", type: "enum", options: ["s","m","l"] as const, description: "Size preset. Default: 'm'" },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role.\n Interactive checked: explicit role wins; 'auto'/unset resolves to secondary.\n Interactive unchecked: ignores this prop and uses nearest Surface appearance, then neutral.\n ReadOnly: neutral in both visual states." },
  { name: "accent", type: "enum", options: ["primary","secondary","sparkle"] as const, description: "Accent override for selected fill color.\n When set, overrides the fill from appearance while keeping appearance's border/context.\n When not set, fill follows appearance role." },
  { name: "disabled", type: "boolean", description: "Whether the switch is disabled" },
  { name: "readOnly", type: "boolean", description: "Whether the switch is read-only (visually distinct from disabled)" },
  { name: "name", type: "string", description: "Field name for form submission" },
  { name: "id", type: "string", description: "HTML id attribute" },
  { name: "aria-label", type: "string", description: "Accessible label for switches without a text child." },
  { name: "aria-labelledby", type: "string", description: "ID of an element that labels the switch." },
  { name: "data-testid", type: "string", description: "Stable anchor for QA / e2e — forwarded to the root switch control only (not the label wrapper)." }
];

export const SWITCH_PROPS_SCHEMA = z.object({
    children: z.string().optional(),
    checked: z.boolean().optional(),
    defaultChecked: z.boolean().optional(),
    onCheckedChange: z.any().optional(),
    size: z.enum(["s", "m", "l"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    accent: z.enum(["primary", "secondary", "sparkle"]).optional(),
    disabled: z.boolean().optional(),
    readOnly: z.boolean().optional(),
    name: z.string().optional(),
    id: z.string().optional(),
    "aria-label": z.string().optional(),
    "aria-labelledby": z.string().optional(),
    "data-testid": z.string().optional()
  }).strict();
