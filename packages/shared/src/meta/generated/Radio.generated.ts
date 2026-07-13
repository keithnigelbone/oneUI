// @generated — do not edit by hand.
// Source: packages/ui/src/components/Radio/Radio.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';

// Deprecated props (excluded): children, accent

export const RADIO_GENERATED_PROPS: PropDescriptor[] = [
  { name: "labelAssociation", type: "enum", options: ["native","field"] as const, description: "Render inside `Field.Root` (RadioField) or standalone.", defaultValue: "native" },
  { name: "label", type: "string", description: "Visible label beside the control. Maps to `aria-label` when the wrapper is a `div`." },
  { name: "description", type: "string", description: "Supplementary copy below the label row. Maps to `aria-describedby` on the control." },
  { name: "aria-label", type: "string", description: "Accessible label when there is no visible `label` (or when overriding the visible copy).\nMaps directly to `aria-label` on the underlying radio control." },
  { name: "supplementaryDescribedById", type: "string" },
  { name: "errorHighlight", type: "boolean", description: "Error-state chrome on the wrapper (from `RadioField` when invalid).\nStandalone `Radio` does not use `errorHighlight`; use `RadioField` for validation UX." },
  { name: "value", type: "string", description: "Value for this radio item (required)", required: true },
  { name: "checked", type: "boolean", description: "Whether this option is selected. Selection is owned by the parent **`RadioGroup`** via `value` /\n`defaultValue` matching this `value`. This prop is accepted for tooling (e.g. Storybook) and\nis **not** forwarded to the underlying primitive." },
  { name: "disabled", type: "boolean", description: "Whether this radio is disabled" },
  { name: "readOnly", type: "boolean", description: "Whether this radio is read-only (focusable but value cannot change)" },
  { name: "required", type: "boolean", description: "HTML required — form validation" },
  { name: "size", type: "enum", options: ["s","m","l"] as const, description: "Size preset. Default: 'm'" },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. Controls border, hover, AND fill tokens. `auto` → secondary stack." },
  { name: "id", type: "string", description: "HTML id attribute" },
  { name: "labelWrapper", type: "enum", options: ["label","div"] as const, description: "Outer wrapper element. Use `'div'` inside a field composition so the visible label is not\nnested inside a second `<label>`.", defaultValue: "label" },
  { name: "aria-labelledby", type: "string", description: "When set, names the control via `aria-labelledby` (e.g. `RadioField` single-option layout\nwhere the visible label lives on the field, not on this `Radio`)." },
  { name: "aria-describedby", type: "string" },
  { name: "aria-invalid", type: "object" },
  { name: "data-testid", type: "string", description: "Test automation id — forwarded to the radio control (`BaseRadio.Root`)." }
];

export const RADIO_PROPS_SCHEMA = z.object({
    labelAssociation: z.enum(["native", "field"]).optional(),
    label: z.string().optional(),
    description: z.string().optional(),
    "aria-label": z.string().optional(),
    supplementaryDescribedById: z.string().optional(),
    errorHighlight: z.boolean().optional(),
    value: z.string(),
    checked: z.boolean().optional(),
    disabled: z.boolean().optional(),
    readOnly: z.boolean().optional(),
    required: z.boolean().optional(),
    size: z.enum(["s", "m", "l"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    id: z.string().optional(),
    labelWrapper: z.enum(["label", "div"]).optional(),
    "aria-labelledby": z.string().optional(),
    "aria-describedby": z.string().optional(),
    "aria-invalid": z.unknown().optional(),
    "data-testid": z.string().optional()
  }).strict();
