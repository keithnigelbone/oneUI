// @generated — do not edit by hand.
// Source: packages/ui/src/components/ListItemGroup/ListItemGroup.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const LIST_ITEM_GROUP_GENERATED_PROPS: PropDescriptor[] = [
  { name: "children", type: "ReactNode", description: "<ListItem> children — maps to Figma's `content` slot. Optional so empty groups are valid." },
  { name: "sectionDivider", type: "boolean", description: "Top edge-to-edge hairline above the first row. Default: true." },
  { name: "container", type: "enum", options: ["fullWidth","inset"] as const, description: "Container framing. Default: 'fullWidth'." },
  { name: "divider", type: "enum", options: ["none","inset","full"] as const, description: "Inter-row divider style injected into all <ListItem> children. Matches Figma's\n`divider` group property (`none` | `full` | `inset`). Per-child `divider` prop\noverrides the group default. The last row auto-suppresses via `:last-child` so\nthere's no dangling hairline. Default: `'inset'`." },
  { name: "role", type: "enum", options: ["menu","list","group"] as const, description: "Group landmark role. Default: 'group'." },
  { name: "aria-label", type: "string", description: "Accessible name for the group landmark." }
];

export const LIST_ITEM_GROUP_PROPS_SCHEMA = z.object({
    children: z.string().optional(),
    sectionDivider: z.boolean().optional(),
    container: z.enum(["fullWidth", "inset"]).optional(),
    divider: z.enum(["none", "inset", "full"]).optional(),
    role: z.enum(["menu", "list", "group"]).optional(),
    "aria-label": z.string().optional()
  }).strict();
