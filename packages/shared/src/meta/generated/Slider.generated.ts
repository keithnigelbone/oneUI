// @generated — do not edit by hand.
// Source: packages/ui/src/components/Slider/Slider.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const SLIDER_GENERATED_PROPS: PropDescriptor[] = [
  { name: "value", type: "object", description: "Current value (controlled). Number for single thumb, array for range." },
  { name: "defaultValue", type: "object", description: "Default value (uncontrolled)." },
  { name: "onValueChange", type: "function", description: "Called as the user drags." },
  { name: "onValueCommitted", type: "function", description: "Called when the user releases / commits the value." },
  { name: "min", type: "number" },
  { name: "max", type: "number" },
  { name: "step", type: "number" },
  { name: "largeStep", type: "number" },
  { name: "minStepsBetweenValues", type: "number" },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. Default 'auto' → 'secondary'." },
  { name: "orientation", type: "enum", options: ["horizontal","vertical"] as const, description: "Orientation. Default 'horizontal'." },
  { name: "knobStyle", type: "enum", options: ["inside","outside"] as const, description: "Knob placement style. Default 'outside'." },
  { name: "showTooltip", type: "object", description: "Tooltip visibility. Default 'auto' (drag + focus)." },
  { name: "formatValue", type: "function", description: "Formatter for tooltip value." },
  { name: "showSteps", type: "boolean", description: "Render tick marks at every step." },
  { name: "stepLabels", type: "ReactNode", description: "Optional labels under step marks." },
  { name: "snapToSteps", type: "boolean", description: "When true (default), the thumb snaps to exact step positions.\nWhen false, dragging is continuous but tick marks still appear at step positions." },
  { name: "start", type: "ReactNode", description: "Node rendered at the start of the slider (e.g. an IconButton). 30×30 slot per Figma." },
  { name: "end", type: "ReactNode", description: "Node rendered at the end of the slider (e.g. an IconButton). 30×30 slot per Figma." },
  { name: "disabled", type: "boolean" },
  { name: "readOnly", type: "boolean" },
  { name: "name", type: "string" },
  { name: "form", type: "string" },
  { name: "aria-label", type: "string" },
  { name: "aria-labelledby", type: "string" },
  { name: "ariaLabels", type: "object", description: "Per-thumb aria-label for range sliders (array indexed by thumb). Falls back to `aria-label` when absent.\nUse this only in range mode; for single-thumb sliders use `aria-label`." }
];

export const SLIDER_PROPS_SCHEMA = z.object({
    value: z.unknown().optional(),
    defaultValue: z.unknown().optional(),
    onValueChange: z.any().optional(),
    onValueCommitted: z.any().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    largeStep: z.number().optional(),
    minStepsBetweenValues: z.number().optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    knobStyle: z.enum(["inside", "outside"]).optional(),
    showTooltip: z.unknown().optional(),
    formatValue: z.any().optional(),
    showSteps: z.boolean().optional(),
    stepLabels: z.string().optional(),
    snapToSteps: z.boolean().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    disabled: z.boolean().optional(),
    readOnly: z.boolean().optional(),
    name: z.string().optional(),
    form: z.string().optional(),
    "aria-label": z.string().optional(),
    "aria-labelledby": z.string().optional(),
    ariaLabels: z.unknown().optional()
  }).strict();
