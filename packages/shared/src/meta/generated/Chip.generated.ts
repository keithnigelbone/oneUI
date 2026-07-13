// @generated — do not edit by hand.
// Source: packages/ui/src/components/Chip/Chip.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const CHIP_GENERATED_PROPS: PropDescriptor[] = [
  { name: "children", type: "ReactNode", description: "Text label content" },
  { name: "size", type: "enum", options: ["s","m","l"] as const, description: "Chip size. Default: 'm'." },
  { name: "attention", type: "enum", options: ["high","medium","low"] as const, description: "Emphasis level — high (filled when selected), medium (tinted when selected), low (outlined). Default: 'high'." },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. 'auto' resolves to 'secondary'." },
  { name: "selected", type: "boolean", description: "Selected state (controlled). Maps to Toggle pressed." },
  { name: "defaultSelected", type: "boolean", description: "Default selected state (uncontrolled). Defaults to true." },
  { name: "onSelectedChange", type: "function", description: "Called when selected state changes." },
  { name: "value", type: "string", description: "Value for use within ToggleGroup." },
  { name: "disabled", type: "boolean", description: "Whether the chip is disabled." },
  { name: "start", type: "ReactNode", description: "Content to render before the label (Icon, Avatar, CounterBadge, IndicatorBadge)" },
  { name: "end", type: "ReactNode", description: "Content to render after the label (Icon, Avatar, CounterBadge, IndicatorBadge)" },
  { name: "aria-label", type: "string", description: "Accessible label for screen readers" },
  { name: "data-testid", type: "string", description: "QA / automation hook on the root toggle button" }
];

export const CHIP_PROPS_SCHEMA = z.object({
    children: z.string().optional(),
    size: z.enum(["s", "m", "l"]).optional(),
    attention: z.enum(["high", "medium", "low"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    selected: z.boolean().optional(),
    defaultSelected: z.boolean().optional(),
    onSelectedChange: z.any().optional(),
    value: z.string().optional(),
    disabled: z.boolean().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    "aria-label": z.string().optional(),
    "data-testid": z.string().optional()
  }).strict();
