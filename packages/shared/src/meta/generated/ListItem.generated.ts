// @generated — do not edit by hand.
// Source: packages/ui/src/components/ListItem/ListItem.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const LIST_ITEM_GENERATED_PROPS: PropDescriptor[] = [
  { name: "title", type: "ReactNode", description: "Primary line. Rendered as Label-M-High.", required: true },
  { name: "supportText", type: "ReactNode", description: "Optional secondary line below title. Rendered as Body-S-Low." },
  { name: "supportStart", type: "ReactNode", description: "Small inline decorative slot rendered BEFORE the support text (matches Figma `.ListItem.Slot.Default.Content`). Follows the support text colour." },
  { name: "start", type: "ReactNode", description: "Leading content (icon / avatar / badge)." },
  { name: "startSize", type: "enum", options: ["S","M","L","XL"] as const, description: "Leading slot size. Default: 'M'." },
  { name: "end", type: "ReactNode", description: "Trailing content (chevron / icon)." },
  { name: "endSize", type: "enum", options: ["S","M"] as const, description: "Trailing slot size. Default: 'M'." },
  { name: "slotAlignment", type: "enum", options: ["centre","top"] as const, description: "Slot vertical alignment. Default: 'centre'. When supportText is absent, the row single-lines regardless." },
  { name: "container", type: "enum", options: ["fullWidth","inset"] as const, description: "Container variant. Default: 'fullWidth'." },
  { name: "selected", type: "object", description: "Selected emphasis. Default: false. `'high'` triggers `[data-surface=\"bold\"]` self-remap." },
  { name: "divider", type: "enum", options: ["none","inset","full"] as const, description: "Bottom hairline style. Default: 'none'. Auto-suppresses when the row is the last child." },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. Default: 'primary'." },
  { name: "disabled", type: "boolean", description: "Disable interaction + apply reduced-opacity token." },
  { name: "href", type: "string", description: "When set, renders as `<a>`." },
  { name: "onClick", type: "function", description: "When set (and no href), renders as `<button type=\"button\">`." },
  { name: "aria-label", type: "string", description: "Accessible name — required when `title` is non-textual." }
];

export const LIST_ITEM_PROPS_SCHEMA = z.object({
    title: z.string(),
    supportText: z.string().optional(),
    supportStart: z.string().optional(),
    start: z.string().optional(),
    startSize: z.enum(["S", "M", "L", "XL"]).optional(),
    end: z.string().optional(),
    endSize: z.enum(["S", "M"]).optional(),
    slotAlignment: z.enum(["centre", "top"]).optional(),
    container: z.enum(["fullWidth", "inset"]).optional(),
    selected: z.unknown().optional(),
    divider: z.enum(["none", "inset", "full"]).optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    disabled: z.boolean().optional(),
    href: z.string().optional(),
    onClick: z.any().optional(),
    "aria-label": z.string().optional()
  }).strict();
