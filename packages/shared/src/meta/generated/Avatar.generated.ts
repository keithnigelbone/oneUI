// @generated — do not edit by hand.
// Source: packages/ui/src/components/Avatar/Avatar.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const AVATAR_GENERATED_PROPS: PropDescriptor[] = [
  { name: "content", type: "enum", options: ["image","icon","text"] as const, description: "Display content: image, icon, or text (initials). Aligns with Figma property `content`." },
  { name: "size", type: "enum", options: ["2xs","xs","s","m","l","xl","2xl","custom"] as const, description: "Size preset. Default: 'm'" },
  { name: "attention", type: "enum", options: ["high","medium","low"] as const, description: "Attention level — High (filled), Medium (tinted), Low (transparent). Default: 'high'" },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. 'auto' resolves to 'primary'." },
  { name: "src", type: "string", description: "Image source URL (when content is image)" },
  { name: "alt", type: "string", description: "Alt text / name used for accessibility and initials extraction" },
  { name: "fallback", type: "ReactNode", description: "Custom fallback content when image fails or for icon/text content" },
  { name: "icon", type: "ReactNode", description: "Icon element (when content is icon)" },
  { name: "customSize", type: "number", description: "Custom size in pixels (only when size='custom')" },
  { name: "disabled", type: "boolean", description: "Disabled state" },
  { name: "onPress", type: "function", description: "Click handler — when set, the avatar renders as an interactive Base UI button." },
  { name: "onClick", type: "function", description: "Web alias for `onPress`." },
  { name: "data-testid", type: "string", description: "Test automation id — forwarded to the root element." }
];

export const AVATAR_PROPS_SCHEMA = z.object({
    content: z.enum(["image", "icon", "text"]).optional(),
    size: z.enum(["2xs", "xs", "s", "m", "l", "xl", "2xl", "custom"]).optional(),
    attention: z.enum(["high", "medium", "low"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    src: z.string().optional(),
    alt: z.string().optional(),
    fallback: z.string().optional(),
    icon: z.string().optional(),
    customSize: z.number().optional(),
    disabled: z.boolean().optional(),
    onPress: z.any().optional(),
    onClick: z.any().optional(),
    "data-testid": z.string().optional()
  }).strict();
