/**
 * Component-only CompositionSpec v1.
 *
 * This is the canonical generated artifact for Experience Lab live rendering:
 * stable node ids, exact registry component names, JSON props, named slots, and
 * a canonical surface context field. It deliberately has no branch for raw
 * HTML, JSX, CSS, className, inline style, or arbitrary element tags.
 */

import { z } from 'zod';
import { ArtifactTypeSchema } from '../ir/artifactTypes';
import { OutputProfileSchema } from '../profiles/outputProfileTable';
import { MarkupFreeString, containsMarkup } from '../ir/schema';

export const CompositionSurfaceMode = z.enum([
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
]);
export type CompositionSurfaceModeT = z.infer<typeof CompositionSurfaceMode>;

const FORBIDDEN_PROP_KEYS = new Set([
  'class',
  'className',
  'style',
  'css',
  'sx',
  'rawHtml',
  'html',
  'dangerouslySetInnerHTML',
  'tag',
  'children',
]);

function rejectForbiddenObjectKeys(
  value: Record<string, unknown>,
  ctx: z.RefinementCtx,
): void {
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_PROP_KEYS.has(key)) {
      ctx.addIssue({
        code: 'custom',
        message: `CompositionSpec forbids prop/object key "${key}". Use registry props, slots, and surface instead.`,
      });
    }
  }
}

export type CompositionPropValueT =
  | string
  | number
  | boolean
  | null
  | CompositionPropValueT[]
  | { [key: string]: CompositionPropValueT };

export const CompositionPropValue: z.ZodType<CompositionPropValueT> = z.lazy(() =>
  z.union([
    MarkupFreeString,
    z.number(),
    z.boolean(),
    z.null(),
    z.array(CompositionPropValue),
    z.record(z.string(), CompositionPropValue).superRefine(rejectForbiddenObjectKeys),
  ]),
);

export interface CompositionNodeT {
  id: string;
  /** Exact registry component id, e.g. Button, Container, Grid. Never an HTML tag. */
  component: string;
  props?: Record<string, CompositionPropValueT>;
  /** Named ReactNode slots. `children` is the default positional slot. */
  slots?: Record<string, CompositionSlotValueT>;
  /** Canonical OneUI surface context for this node's subtree. */
  surface?: CompositionSurfaceModeT;
  /** Optional key into CompositionSpec.content for ToV-backed copy provenance. */
  contentRef?: string;
}

export type CompositionSlotValueT = CompositionNodeT[] | string;

export const CompositionSlotValue: z.ZodType<CompositionSlotValueT> = z.lazy(() =>
  z.union([z.array(CompositionNode), MarkupFreeString]),
);

export const CompositionNode: z.ZodType<CompositionNodeT> = z.lazy(() =>
  z
    .object({
      id: z.string().min(1),
      component: z.string().min(1).refine((value) => !containsMarkup(value), {
        message: 'Composition node `component` must be a registry component id, never markup.',
      }),
      props: z.record(z.string(), CompositionPropValue).optional(),
      slots: z.record(z.string(), CompositionSlotValue).optional(),
      surface: CompositionSurfaceMode.optional(),
      contentRef: MarkupFreeString.optional(),
    })
    .strict()
    .superRefine((node, ctx) => {
      if (node.props) rejectForbiddenObjectKeys(node.props, ctx);
    }),
);

export const CompositionSpec = z
  .object({
    version: z.literal('1'),
    name: MarkupFreeString.optional(),
    artifactType: ArtifactTypeSchema.optional(),
    targetProfile: OutputProfileSchema.optional(),
    brandId: z.string().min(1),
    foundationRefs: z.array(MarkupFreeString).optional(),
    density: z.enum(['compact', 'default', 'open']).optional(),
    platform: MarkupFreeString.optional(),
    root: CompositionNode,
    /** ToV-backed copy pool. Nodes may reference entries via `contentRef`. */
    content: z.record(z.string(), MarkupFreeString).optional(),
    intent: MarkupFreeString.optional(),
    metadata: z.record(z.string(), CompositionPropValue).optional(),
  })
  .strict()
  .superRefine((spec, ctx) => {
    if (spec.metadata) rejectForbiddenObjectKeys(spec.metadata, ctx);
  });

export type CompositionSpecT = z.infer<typeof CompositionSpec>;

export function parseCompositionSpec(input: unknown) {
  return CompositionSpec.safeParse(input);
}
