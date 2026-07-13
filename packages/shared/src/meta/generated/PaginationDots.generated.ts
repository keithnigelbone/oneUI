// @generated — do not edit by hand.
// Source: packages/ui/src/components/PaginationDots/PaginationDots.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const PAGINATION_DOTS_GENERATED_PROPS: PropDescriptor[] = [
  { name: "pageCount", type: "number", description: "Total number of pages / items. Required.", required: true },
  { name: "activeIndex", type: "number", description: "Controlled active index." },
  { name: "defaultActiveIndex", type: "number", description: "Default active index when uncontrolled." },
  { name: "onActiveIndexChange", type: "function", description: "Fires when the active index changes (via click, keyboard, or controlled update)." },
  { name: "loop", type: "boolean", description: "Loop mode. `true` = infinite windowed scroll, window always centered on active,\nlast → 0 wraps seamlessly. `false` = finite sequence, window clamps at the\nedges, last dot grows full size when the user approaches the end.\nDefault: `false`." },
  { name: "appearance", type: "enum", options: ["auto","primary","secondary","neutral","sparkle","brand-bg","positive","negative","warning","informative"] as const, description: "Multi-accent appearance role. `auto` resolves to `primary`. Default: `primary`." },
  { name: "readOnly", type: "boolean", description: "When true, disables all interaction (clicks, keyboard) and renders as\na read-only live-region indicator (`role=\"status\"`, `aria-live=\"polite\"`).\nUse for components that purely mirror a parent carousel's state." },
  { name: "aria-label", type: "string", description: "Accessible label for the tablist root." },
  { name: "data-testid", type: "string", description: "Stable anchor for Playwright / QA harnesses (applied to the tablist / status root)." }
];

export const PAGINATION_DOTS_PROPS_SCHEMA = z.object({
    pageCount: z.number(),
    activeIndex: z.number().optional(),
    defaultActiveIndex: z.number().optional(),
    onActiveIndexChange: z.any().optional(),
    loop: z.boolean().optional(),
    appearance: z.enum(["auto", "primary", "secondary", "neutral", "sparkle", "brand-bg", "positive", "negative", "warning", "informative"]).optional(),
    readOnly: z.boolean().optional(),
    "aria-label": z.string().optional(),
    "data-testid": z.string().optional()
  }).strict();
