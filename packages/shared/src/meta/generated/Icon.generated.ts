// @generated — do not edit by hand.
// Source: packages/ui/src/components/Icon/Icon.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const ICON_GENERATED_PROPS: PropDescriptor[] = [
  { name: "icon", type: "string", description: "Icon to display — semantic name, pack id, component, or React element", required: true },
  { name: "size", type: "enum", options: ["2","2.5","3","3.5","4","4.5","5","6","7","8","9","10","12","14","16","18","20","24","32","40"] as const, deprecatedOptions: ["2","2.5","3","3.5","4","4.5","5","6","7","8","9","10","12","14","16","18","20","24","32","40"] as const, description: "Size preset (spacing index). Default: '5' (20px)" },
  { name: "appearance", type: "enum", options: ["primary","secondary","neutral","sparkle","positive","negative","warning","informative"] as const, description: "Colour role. Omitted → slot parent → nearest Surface → neutral." },
  { name: "emphasis", type: "enum", options: ["high","medium","low","tinted","tintedA11y"] as const, description: "Colour emphasis level. Default: 'high'" },
  { name: "aria-label", type: "string", description: "Accessible label — if provided, icon is not decorative" },
  { name: "aria-hidden", type: "boolean", description: "Whether icon is hidden from assistive technology. Default: true (decorative)" },
  { name: "data-testid", type: "string", description: "QA / Playwright hook — forwarded to the root span" }
];

export const ICON_PROPS_SCHEMA = z.object({
    icon: z.string(),
    size: z.enum(["2", "2.5", "3", "3.5", "4", "4.5", "5", "6", "7", "8", "9", "10", "12", "14", "16", "18", "20", "24", "32", "40"]).optional(),
    appearance: z.enum(["primary", "secondary", "neutral", "sparkle", "positive", "negative", "warning", "informative"]).optional(),
    emphasis: z.enum(["high", "medium", "low", "tinted", "tintedA11y"]).optional(),
    "aria-label": z.string().optional(),
    "aria-hidden": z.boolean().optional(),
    "data-testid": z.string().optional()
  }).strict();
