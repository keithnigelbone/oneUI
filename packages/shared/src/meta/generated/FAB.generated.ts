// @generated — do not edit by hand.
// Source: packages/ui/src/components/FAB/FAB.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const FAB_GENERATED_PROPS: PropDescriptor[] = [
  { name: "icon", type: "string", description: "Icon to display", required: true },
  { name: "label", type: "ReactNode", description: "Optional label text (creates extended FAB)" },
  { name: "variant", type: "enum", options: ["primary","secondary","surface"] as const, description: "Visual variant affecting colors" },
  { name: "size", type: "enum", options: ["medium","small","large"] as const, deprecatedOptions: ["medium","small","large"] as const, description: "Size affecting dimensions" },
  { name: "position", type: "enum", options: ["bottom-right","bottom-left","bottom-center"] as const, description: "Position on screen (only applies when position=\"fixed\")" },
  { name: "disabled", type: "boolean", description: "Disabled state" },
  { name: "loading", type: "boolean", description: "Loading state" },
  { name: "onPress", type: "function", description: "Press/click handler" },
  { name: "aria-label", type: "string", description: "Accessibility label (required if no label prop)" },
  { name: "data-testid", type: "string", description: "Test ID for testing" }
];

export const FAB_PROPS_SCHEMA = z.object({
    icon: z.string(),
    label: z.string().optional(),
    variant: z.enum(["primary", "secondary", "surface"]).optional(),
    size: z.enum(["medium", "small", "large"]).optional(),
    position: z.enum(["bottom-right", "bottom-left", "bottom-center"]).optional(),
    disabled: z.boolean().optional(),
    loading: z.boolean().optional(),
    onPress: z.any().optional(),
    "aria-label": z.string().optional(),
    "data-testid": z.string().optional()
  }).strict();
