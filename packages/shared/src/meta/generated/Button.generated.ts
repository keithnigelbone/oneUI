// @generated — do not edit by hand.
// Source: packages/ui/src/components/Button/Button.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';

// Deprecated props (excluded): leftIcon, rightIcon

export const BUTTON_GENERATED_PROPS: PropDescriptor[] = [
  { name: "aria-label", type: "string" },
  { name: "aria-pressed", type: "object" },
  { name: "aria-expanded", type: "object" },
  { name: "aria-controls", type: "string" },
  { name: "aria-describedby", type: "string" },
  { name: "aria-haspopup", type: "object" },
  { name: "children", type: "ReactNode", required: true },
  { name: "attention", type: "enum", options: ["high","medium","low"] as const, description: "Emphasis level — high (bold fill), medium (subtle/tinted fill), low (ghost, text-only).\nDrives the visual treatment; the component derives the internal variant + `data-variant` from this.", defaultValue: "high", brandOverridable: true },
  { name: "size", type: "enum", options: ["xs","s","m","l",6,8,10,12] as const, deprecatedOptions: ["2xs","xl","2xl","medium","small","large",7,14,16] as const, description: "Button size — f-step number or t-shirt alias.", defaultValue: 10 },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. 'auto' resolves to 'primary'.", defaultValue: "auto" },
  { name: "contained", type: "boolean", description: "Whether the button renders in its contained form (filled pill with a\nstate-layer wrapper) or its uncontained form (transparent, underlined,\ntext-link style). Mirrors the Figma `Contained` variant property on the\nButton component set. Props that only make sense for the contained form\n(`condensed`, `fullWidth`, `decoration`) are ignored when\n`contained={false}`.", defaultValue: true, brandOverridable: true },
  { name: "condensed", type: "boolean", description: "Condensed mode: reduces height and horizontal padding while keeping the same typography.\nUse for dense layouts, inline actions, and compact UI areas. NOT the same as using a smaller size.\nOnly applies when `contained={true}`.", defaultValue: false },
  { name: "fullWidth", type: "boolean", description: "Stretch to fill container width.", defaultValue: false },
  { name: "disabled", type: "boolean", defaultValue: false },
  { name: "loading", type: "boolean", defaultValue: false },
  { name: "onPress", type: "function" },
  { name: "onClick", type: "function", description: "Web-only alias for onPress" },
  { name: "start", type: "ReactNode", description: "Content before the label. Pass a semantic icon name (string) for automatic color-inheriting\n icon rendering, or any ReactNode for custom content." },
  { name: "end", type: "ReactNode", description: "Content after the label. Pass a semantic icon name (string) for automatic color-inheriting\n icon rendering, or any ReactNode for custom content." },
  { name: "decoration", type: "object", description: "Direct decoration config — overrides DecorationContext.\n Use in Storybook stories or tests where context may not propagate." },
  { name: "type", type: "enum", options: ["button","submit","reset"] as const, description: "HTML button type attribute" },
  { name: "data-testid", type: "string", description: "Test selector passthrough" }
];

export const BUTTON_PROPS_SCHEMA = z.object({
    "aria-label": z.string().optional(),
    "aria-pressed": z.unknown().optional(),
    "aria-expanded": z.unknown().optional(),
    "aria-controls": z.string().optional(),
    "aria-describedby": z.string().optional(),
    "aria-haspopup": z.unknown().optional(),
    children: z.string(),
    attention: z.enum(["high", "medium", "low"]).optional(),
    size: z.union([z.literal("xs"), z.literal("s"), z.literal("m"), z.literal("l"), z.literal(6), z.literal(8), z.literal(10), z.literal(12)]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    contained: z.boolean().optional(),
    condensed: z.boolean().optional(),
    fullWidth: z.boolean().optional(),
    disabled: z.boolean().optional(),
    loading: z.boolean().optional(),
    onPress: z.any().optional(),
    onClick: z.any().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    decoration: z.unknown().optional(),
    type: z.enum(["button", "submit", "reset"]).optional(),
    "data-testid": z.string().optional()
  }).strict();
