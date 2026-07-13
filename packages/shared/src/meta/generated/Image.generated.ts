// @generated — do not edit by hand.
// Source: packages/ui/src/components/Image/Image.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const IMAGE_GENERATED_PROPS: PropDescriptor[] = [
  { name: "src", type: "string", description: "Image source URL (required)", required: true },
  { name: "alt", type: "string", description: "Accessible alt text (required)", required: true },
  { name: "aspectRatio", type: "enum", options: ["auto","1:1","3:2","1:2","2:1","2:3","3:4","4:3","9:16","16:9","9:21","21:9"] as const, description: "Aspect ratio preset. Default: 'auto'" },
  { name: "interactive", type: "boolean", description: "When true: state layer overlay + focus ring + clickable. Default: false" },
  { name: "disabled", type: "boolean", description: "Reduces opacity. Default: false" },
  { name: "fit", type: "enum", options: ["none","inherit","cover","contain","fill","scale-down","initial","revert","revert-layer","unset"] as const, description: "Figma-aligned alias for `objectFit`. If both `fit` and `objectFit` are set,\n`fit` wins." },
  { name: "objectFit", type: "enum", options: ["none","inherit","cover","contain","fill","scale-down","initial","revert","revert-layer","unset"] as const, description: "CSS object-fit for the image. Default: 'cover'" },
  { name: "objectPosition", type: "string", description: "CSS object-position. Default: 'center'" },
  { name: "loading", type: "enum", options: ["auto","lazy","eager"] as const, description: "Browser native loading strategy. Default: 'lazy'" },
  { name: "srcSet", type: "string", description: "Responsive image sources (HTML `srcSet`)" },
  { name: "sizes", type: "string", description: "Hint for `srcSet` selection (HTML `sizes`)" },
  { name: "crossOrigin", type: "enum", options: ["anonymous","use-credentials"] as const, description: "CORS mode for the image request" },
  { name: "decoding", type: "enum", options: ["auto","sync","async"] as const, description: "Decode hint for the browser" },
  { name: "draggable", type: "boolean", description: "Native drag behavior" },
  { name: "lottieAttributes", type: "object", description: "Optional Lottie/host payload — web: `data-oneui-lottie` JSON on root" },
  { name: "width", type: "object", description: "Container width" },
  { name: "height", type: "object", description: "Container height" },
  { name: "onPress", type: "function", description: "Click handler (interactive only)" },
  { name: "onClick", type: "function", description: "Web alias for onPress" },
  { name: "onLoad", type: "function", description: "Image loaded callback" },
  { name: "onError", type: "function", description: "Image error callback" },
  { name: "fallback", type: "ReactNode", description: "Custom error fallback content (wins over `fallbackSrc`)" },
  { name: "fallbackSrc", type: "string", description: "Fallback image URL when `src` fails and `fallback` is not set" },
  { name: "aria-label", type: "string", description: "Accessible label for interactive images" },
  { name: "testID", type: "string", description: "Test id — forwarded as `data-testid` on the web root element." }
];

export const IMAGE_PROPS_SCHEMA = z.object({
    src: z.string(),
    alt: z.string(),
    aspectRatio: z.enum(["auto", "1:1", "3:2", "1:2", "2:1", "2:3", "3:4", "4:3", "9:16", "16:9", "9:21", "21:9"]).optional(),
    interactive: z.boolean().optional(),
    disabled: z.boolean().optional(),
    fit: z.enum(["none", "inherit", "cover", "contain", "fill", "scale-down", "initial", "revert", "revert-layer", "unset"]).optional(),
    objectFit: z.enum(["none", "inherit", "cover", "contain", "fill", "scale-down", "initial", "revert", "revert-layer", "unset"]).optional(),
    objectPosition: z.string().optional(),
    loading: z.enum(["auto", "lazy", "eager"]).optional(),
    srcSet: z.string().optional(),
    sizes: z.string().optional(),
    crossOrigin: z.enum(["anonymous", "use-credentials"]).optional(),
    decoding: z.enum(["auto", "sync", "async"]).optional(),
    draggable: z.boolean().optional(),
    lottieAttributes: z.unknown().optional(),
    width: z.unknown().optional(),
    height: z.unknown().optional(),
    onPress: z.any().optional(),
    onClick: z.any().optional(),
    onLoad: z.any().optional(),
    onError: z.any().optional(),
    fallback: z.string().optional(),
    fallbackSrc: z.string().optional(),
    "aria-label": z.string().optional(),
    testID: z.string().optional()
  }).strict();
