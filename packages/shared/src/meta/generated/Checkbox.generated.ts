// @generated — do not edit by hand.
// Source: packages/ui/src/components/Checkbox/Checkbox.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';

// Deprecated props (excluded): children, accent

export const CHECKBOX_GENERATED_PROPS: PropDescriptor[] = [
  { name: "labelAssociation", type: "enum", options: ["native","field"] as const, description: "Render inside `Field.Root` (CheckboxField) or standalone.", defaultValue: "native" },
  { name: "label", type: "string", description: "Visible label beside the control. Maps to `aria-label` when the wrapper is a `div`." },
  { name: "description", type: "string", description: "Supplementary copy below the label row. Maps to `aria-describedby` on the control." },
  { name: "aria-label", type: "string", description: "Accessible label when there is no visible `label` (or when overriding the visible copy).\nMaps directly to `aria-label` on the underlying checkbox control.\nWhen using `CheckboxField`, the visible `Field.Label` provides association\nautomatically — prefer that over `aria-label`." },
  { name: "supplementaryDescribedById", type: "string" },
  { name: "errorHighlight", type: "boolean", description: "Error-state chrome on the wrapper (from `CheckboxField` when invalid).\nStandalone `Checkbox` does not use `errorHighlight`; use `CheckboxField` for validation UX." },
  { name: "checked", type: "boolean", description: "Whether the checkbox is checked (controlled)" },
  { name: "defaultChecked", type: "boolean", description: "Default checked state (uncontrolled)" },
  { name: "indeterminate", type: "boolean", description: "Whether the checkbox is in indeterminate state" },
  { name: "onCheckedChange", type: "function", description: "Change handler" },
  { name: "size", type: "enum", options: ["s","m","l"] as const, deprecatedOptions: ["medium","small","large"] as const, description: "Size preset. Default: 'm'" },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Appearance role — border, hover, and checked fill. `auto` → secondary stack." },
  { name: "disabled", type: "boolean", description: "Whether the checkbox is disabled" },
  { name: "readOnly", type: "boolean", description: "Whether the checkbox is read-only (visually distinct from disabled)" },
  { name: "required", type: "boolean", description: "HTML required — form validation when unchecked" },
  { name: "name", type: "string", description: "Field name for form submission" },
  { name: "value", type: "string", description: "Value used when inside a CheckboxGroup" },
  { name: "id", type: "string", description: "HTML id attribute" },
  { name: "labelWrapper", type: "enum", options: ["label","div"] as const, description: "Outer wrapper element. Use `'div'` inside `CheckboxField` (with `Field.Label`)\nso the visible label is not nested inside a second `<label>`.", defaultValue: "label" },
  { name: "aria-describedby", type: "string", description: "For composite fields — links to `Field.Description` etc." },
  { name: "aria-invalid", type: "object", description: "Invalid state for form validation (exposed on the checkbox control)." },
  { name: "data-testid", type: "string", description: "Test automation id — forwarded to the checkbox control (`BaseCheckbox.Root`)." }
];

export const CHECKBOX_PROPS_SCHEMA = z.object({
    labelAssociation: z.enum(["native", "field"]).optional(),
    label: z.string().optional(),
    description: z.string().optional(),
    "aria-label": z.string().optional(),
    supplementaryDescribedById: z.string().optional(),
    errorHighlight: z.boolean().optional(),
    checked: z.boolean().optional(),
    defaultChecked: z.boolean().optional(),
    indeterminate: z.boolean().optional(),
    onCheckedChange: z.any().optional(),
    size: z.enum(["s", "m", "l"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    disabled: z.boolean().optional(),
    readOnly: z.boolean().optional(),
    required: z.boolean().optional(),
    name: z.string().optional(),
    value: z.string().optional(),
    id: z.string().optional(),
    labelWrapper: z.enum(["label", "div"]).optional(),
    "aria-describedby": z.string().optional(),
    "aria-invalid": z.unknown().optional(),
    "data-testid": z.string().optional()
  }).strict();
