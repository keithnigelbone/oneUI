/**
 * registryItem.ts
 *
 * `JioComponentRegistryItem` — the production-shaped registry-entry contract
 * (REG-01), derived from `JioAlphaComponentCatalogEntry` in
 * `@oneui/ui/registry/jioAlphaCatalog`. The registry adapter (plan 04,
 * `experience-builder-registry`) joins the catalog with `componentRegistry`
 * refs and `@oneui/shared/meta` to produce items in this shape.
 *
 * Membership is EXACT lookup — no embeddings (Pitfall 6 / REG-05 deferred).
 * `importPath` is the validator allowlist source for VAL-02 (non-Jio import
 * block): every emitted import must be `@oneui/ui/components/<Folder>`.
 *
 * Pure-TS, JSON-compatible: Zod schema + inferred type.
 */

import { z } from 'zod';

export const JioComponentSupportStatus = z.enum(['alpha', 'experimental', 'internal']);
export type JioComponentSupportStatusT = z.infer<typeof JioComponentSupportStatus>;

/** A declared prop with its allowed values (for variant/prop allowlisting). */
export const JioRegistryProp = z
  .object({
    name: z.string().min(1),
    /** Optional enumerated allowed values (e.g. variant: ['bold','subtle','ghost']). */
    values: z.array(z.string()).optional(),
    required: z.boolean().optional(),
  })
  .strict();
export type JioRegistryPropT = z.infer<typeof JioRegistryProp>;

export const JioComponentRegistryItem = z
  .object({
    /** Stable id (PascalCase component name; matches IR instance `type`). */
    id: z.string().min(1),
    /** Display name. */
    name: z.string().min(1),
    status: JioComponentSupportStatus,
    /** Allowlist source: `@oneui/ui/components/<Folder>` (VAL-02). */
    importPath: z.string().min(1),
    storyPath: z.string().optional(),
    docsPath: z.string().optional(),
    surfaceAware: z.boolean(),
    multiAccent: z.boolean(),
    /** Declared props (prop/variant allowlist for the AST validator). */
    props: z.array(JioRegistryProp).default([]),
    /** Named variants (e.g. Button: bold/subtle/ghost). */
    variants: z.array(z.string()).default([]),
    /** Named slots the component accepts (e.g. 'children', 'start', 'end'). */
    slots: z.array(z.string()).default([]),
    /** Interactive states (e.g. 'hover', 'pressed', 'disabled', 'focus'). */
    states: z.array(z.string()).default([]),
    /** Brand ids this component is supported for (membership gate). */
    supportedBrands: z.array(z.string()).default([]),
    /** Output profiles this component is valid for. */
    supportedProfiles: z.array(z.string()).default([]),
    /** Token dependencies (e.g. surface/typography token families). */
    tokenDependencies: z.array(z.string()).default([]),
    /** Usage rules / anti-patterns (markup-free guidance text). */
    usageRules: z.array(z.string()).default([]),
    antiPatterns: z.array(z.string()).default([]),
    notes: z.string().optional(),
  })
  .strict();

export type JioComponentRegistryItemT = z.infer<typeof JioComponentRegistryItem>;
