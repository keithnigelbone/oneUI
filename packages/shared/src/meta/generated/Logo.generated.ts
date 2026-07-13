// @generated — do not edit by hand.
// Source: packages/ui/src/components/Logo/Logo.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const LOGO_GENERATED_PROPS: PropDescriptor[] = [
  { name: "variant", type: "enum", options: ["mark","full"] as const, description: "Circular mark or full rectangular wordmark. Default: 'mark'" },
  { name: "size", type: "enum", options: ["xs","s","m","l"] as const, deprecatedOptions: ["xl","custom"] as const, description: "Size preset. Default: 'm'" },
  { name: "customSize", type: "number", description: "Custom size in pixels (only when size='custom')" },
  { name: "children", type: "ReactNode", description: "Logo content as React node (SVG element, icon, etc.) — highest priority" },
  { name: "src", type: "string", description: "Image source URL for raster/external logos" },
  { name: "svgContent", type: "string", description: "Raw SVG markup string (e.g., from Convex brand.logoSvg)" },
  { name: "material", type: "enum", options: ["custom","bronze","silver","gold"] as const, description: "Metallic material paint for inline SVG content. Raster src logos are unchanged." },
  { name: "materialTarget", type: "enum", options: ["fill","stroke","fill-stroke"] as const, description: "SVG paint channels that receive the metallic material. Default: fill-stroke" },
  { name: "materialGradientType", type: "enum", options: ["linear","radial","conic"] as const, description: "Gradient style used by the metallic SVG paint server. Defaults to linear." },
  { name: "materialGradientAngle", type: "number", description: "Gradient direction angle used by the metallic SVG paint server. Defaults to 135." },
  { name: "alt", type: "string", description: "Accessible alt text describing the brand (required)", required: true },
  { name: "onLoad", type: "function", description: "Image load callback (src mode only)" },
  { name: "onError", type: "function", description: "Image error callback (src mode only)" },
  { name: "fallback", type: "ReactNode", description: "Fallback content when src fails to load" }
];

export const LOGO_PROPS_SCHEMA = z.object({
    variant: z.enum(["mark", "full"]).optional(),
    size: z.enum(["xs", "s", "m", "l"]).optional(),
    customSize: z.number().optional(),
    children: z.string().optional(),
    src: z.string().optional(),
    svgContent: z.string().optional(),
    material: z.enum(["custom", "bronze", "silver", "gold"]).optional(),
    materialTarget: z.enum(["fill", "stroke", "fill-stroke"]).optional(),
    materialGradientType: z.enum(["linear", "radial", "conic"]).optional(),
    materialGradientAngle: z.number().optional(),
    alt: z.string(),
    onLoad: z.any().optional(),
    onError: z.any().optional(),
    fallback: z.string().optional()
  }).strict();
