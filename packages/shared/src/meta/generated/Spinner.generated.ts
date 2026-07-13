// @generated — do not edit by hand.
// Source: packages/ui/src/components/Spinner/Spinner.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';


export const SPINNER_GENERATED_PROPS: PropDescriptor[] = [
  { name: "size", type: "enum", options: ["S","M","L","XL","2XS","XS","2XL","3XL","4XL","5XL"] as const, deprecatedOptions: ["S","M","L","XL","2XS","XS","2XL","3XL","4XL","5XL"] as const, description: "Size preset — maps to spacing dimension tokens. Default: 'M' (20px)." },
  { name: "label", type: "string", description: "Accessible label announced by screen readers. Default: 'Loading'.\nThe Spinner always renders with role=\"progressbar\" aria-busy=\"true\"." }
];

export const SPINNER_PROPS_SCHEMA = z.object({
    size: z.enum(["S", "M", "L", "XL", "2XS", "XS", "2XL", "3XL", "4XL", "5XL"]).optional(),
    label: z.string().optional()
  }).strict();
