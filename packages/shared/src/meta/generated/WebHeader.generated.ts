// @generated — do not edit by hand.
// Source: packages/ui/src/components/WebHeader/WebHeader.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const WEB_HEADER_GENERATED_PROPS: PropDescriptor[] = [
  { name: "variant", type: "enum", options: ["hidden","default","transparent","glass","stickyHidden"] as const, description: "Header variant controlling position and background" },
  { name: "breakpoint", type: "enum", options: ["S","M","L"] as const, description: "Override breakpoint (auto-detected by default)" },
  { name: "aria-label", type: "string", description: "Accessible name for the banner landmark. Only apply when this\n`WebHeader` is the top-level page banner (i.e. a direct child of\n`<body>`, not nested inside another sectioning element). Pass a\nshort descriptor such as \"Main site header\" when the default\nimplicit banner name is not descriptive enough.\n\nNote: do NOT set this when the header is rendered inside a\n`<section>`, `<article>`, `<main>`, `<nav>`, or `<aside>` — nesting\nstrips the implicit `banner` role and `aria-label` becomes a\nprohibited attribute on the now role-less `<header>`." },
  { name: "aria-labelledby", type: "string", description: "IDREF of a visible element that labels the banner landmark." },
  { name: "children", type: "ReactNode", description: "PrimaryNav + SecondaryNav children", required: true }
];

export const WEB_HEADER_PROPS_SCHEMA = z.object({
    variant: z.enum(["hidden", "default", "transparent", "glass", "stickyHidden"]).optional(),
    breakpoint: z.enum(["S", "M", "L"]).optional(),
    "aria-label": z.string().optional(),
    "aria-labelledby": z.string().optional(),
    children: z.string()
  }).strict();
