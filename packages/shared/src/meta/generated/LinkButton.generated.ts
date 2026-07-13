// @generated — do not edit by hand.
// Source: packages/ui/src/components/LinkButton/LinkButton.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const LINK_BUTTON_GENERATED_PROPS: PropDescriptor[] = [
  { name: "children", type: "ReactNode", description: "Button label text", required: true },
  { name: "attention", type: "enum", options: ["high","medium","low"] as const, description: "Emphasis level — high (bold), medium (subtle), low (ghost). Drives text colour + underline; internal variant + `data-variant` derived from this." },
  { name: "size", type: "enum", options: ["xs","s","m","l",6,8,10,12] as const, deprecatedOptions: ["medium","small","large"] as const, description: "Button size — f-step number or t-shirt alias. Default: 10 (M)." },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. 'auto' resolves to 'primary'." },
  { name: "start", type: "ReactNode", description: "Content to render before the label (icon or spinner)" },
  { name: "end", type: "ReactNode", description: "Content to render after the label (icon or spinner)" },
  { name: "showUnderline", type: "boolean", description: "Whether the underline is visible. Defaults to `true` (LinkButton's\nclassic text-link behaviour). Set to `false` for uses where the\ncomponent is a text-style CTA without an underline — e.g. when\n`<Button contained={false}>` delegates here and the Figma spec\nmarks the underline colour as transparent by default.", defaultValue: true },
  { name: "disabled", type: "boolean", description: "Disabled state" },
  { name: "loading", type: "boolean", description: "Loading state — shows spinner" },
  { name: "onPress", type: "function", description: "Press/click handler" },
  { name: "onClick", type: "function", description: "Web-only alias for onPress" },
  { name: "aria-label", type: "string", description: "Accessibility label override" },
  { name: "type", type: "enum", options: ["button","submit","reset"] as const, description: "HTML button type attribute" }
];

export const LINK_BUTTON_PROPS_SCHEMA = z.object({
    children: z.string(),
    attention: z.enum(["high", "medium", "low"]).optional(),
    size: z.union([z.literal("xs"), z.literal("s"), z.literal("m"), z.literal("l"), z.literal(6), z.literal(8), z.literal(10), z.literal(12)]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    showUnderline: z.boolean().optional(),
    disabled: z.boolean().optional(),
    loading: z.boolean().optional(),
    onPress: z.any().optional(),
    onClick: z.any().optional(),
    "aria-label": z.string().optional(),
    type: z.enum(["button", "submit", "reset"]).optional()
  }).strict();
