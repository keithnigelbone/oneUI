// @generated — do not edit by hand.
// Source: packages/ui/src/components/Stepper/Stepper.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const STEPPER_GENERATED_PROPS: PropDescriptor[] = [
  { name: "value", type: "number", description: "Controlled value" },
  { name: "defaultValue", type: "number", description: "Default value (uncontrolled)" },
  { name: "onChange", type: "function", description: "Change handler — Base UI standard signature" },
  { name: "min", type: "number", description: "Minimum allowed value" },
  { name: "max", type: "number", description: "Maximum allowed value" },
  { name: "step", type: "number", description: "Step increment. Default: 1" },
  { name: "shiftMultiplier", type: "number", description: "Jump by larger amount when holding Shift. Maps to Base UI's largeStep." },
  { name: "disabled", type: "boolean", description: "Whether the stepper is disabled" },
  { name: "readOnly", type: "boolean", description: "Whether the stepper is read-only" },
  { name: "error", type: "boolean", description: "Whether the stepper is in error state" },
  { name: "required", type: "boolean", description: "Whether the field is required" },
  { name: "size", type: "enum", options: ["s","m","l"] as const, description: "Size preset. Default: 'm'" },
  { name: "attention", type: "enum", options: ["high","medium","low"] as const, description: "Attention level controls visual weight. Default: 'medium'" },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. Controls all tokens.\n `'auto'` or omit: inherit nearest `<Surface>` effective role (see `useSurfaceAppearance`),\n else `'secondary'` when outside any Surface (same pattern as Badge, different root fallback)." },
  { name: "accent", type: "enum", options: ["primary","secondary","sparkle"] as const, description: "Accent override for fill color at high attention.\n When set, overrides the fill from appearance while keeping appearance's context.\n When not set, fill follows appearance role." },
  { name: "condensed", type: "boolean", description: "Whether to use condensed height. Default: false" },
  { name: "direction", type: "enum", options: ["ltr","rtl"] as const, description: "Visual direction. Default: 'ltr' keeps decrement left and increment right; 'rtl' mirrors the visual order." },
  { name: "start", type: "ReactNode", description: "Optional decrement control (left in LTR, right in RTL). Must be a **single `<IconButton />` element**\nwhose root accepts merged props and ref from the NumberField. Uses Base UI\n`render` on `Decrement`. Omitted: default remove icon. `partProps.decrementButton.render` overrides.\n\n**Semantics:** this slot always drives **decrease** behaviour (not “leading” in the abstract)." },
  { name: "end", type: "ReactNode", description: "Optional increment control (right in LTR, left in RTL). Same rules as {@link StepperProps.start}.\nOmitted: default add icon. `partProps.incrementButton.render` overrides.\n\n**Semantics:** this slot always drives **increase** behaviour." },
  { name: "partProps", type: "object", description: "Props for internal Base UI parts. Use for primitive-level overrides, not public content slots." },
  { name: "data-testid", type: "string", description: "Test ID" }
];

export const STEPPER_PROPS_SCHEMA = z.object({
    value: z.number().optional(),
    defaultValue: z.number().optional(),
    onChange: z.any().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    shiftMultiplier: z.number().optional(),
    disabled: z.boolean().optional(),
    readOnly: z.boolean().optional(),
    error: z.boolean().optional(),
    required: z.boolean().optional(),
    size: z.enum(["s", "m", "l"]).optional(),
    attention: z.enum(["high", "medium", "low"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    accent: z.enum(["primary", "secondary", "sparkle"]).optional(),
    condensed: z.boolean().optional(),
    direction: z.enum(["ltr", "rtl"]).optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    partProps: z.unknown().optional(),
    "data-testid": z.string().optional()
  }).strict();
