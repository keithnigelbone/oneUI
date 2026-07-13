/**
 * schema.ts — the canonical, MARKUP-FREE Jio Experience IR (Zod).
 *
 * This is the input-validation trust boundary (T-01-01): in P2 the IR is
 * untrusted LLM output, and this schema is the gate that must reject any
 * attempt to smuggle HTML/JSX/markup BEFORE the compiler ever emits JSX.
 *
 * Counter-pattern to `@oneui/shared` componentAST's `ElementASTNode`:
 *   - componentAST has an `element` node with an arbitrary `tag: string` — that
 *     is the markup-smuggling vector. The IR has NO such field.
 *   - The IR carries ONLY registry component instances + escaped text. The only
 *     thing that ever emits JSX is the compiler (P2), never the IR.
 *
 * FORBIDDEN fields — NEVER add any of: rawHtml, html, tag,
 * dangerouslySetInnerHTML, or a free string-of-markup `children`. The slot
 * union below is the only place a string may appear, and it is refined to
 * reject markup.
 *
 * Pure-TS, JSON-compatible. `version: 1` mirrors `ASTRoot.version`.
 */

import { z } from 'zod';
import { ArtifactTypeSchema } from './artifactTypes';
import { OutputProfileSchema } from '../profiles/outputProfileTable';

// ---------------------------------------------------------------------------
// Markup-free string guard (IR-02 / T-01-01)
// ---------------------------------------------------------------------------

/**
 * Patterns that indicate a string is trying to carry markup rather than plain,
 * escaped, human-readable text. Any match → the string is rejected.
 *
 * We reject:
 *   - `<` followed by a letter or `/` → an opening/closing tag (`<div>`, `</p>`)
 *   - `className=` / `class=` → JSX/HTML class attribute smuggling
 *   - `style=` → inline style attribute smuggling
 *   - `dangerouslySetInnerHTML` → the React HTML-injection escape hatch
 */
const MARKUP_PATTERN = /<\s*\/?\s*[a-zA-Z]|className\s*=|class\s*=|style\s*=|dangerouslySetInnerHTML/;

/** True when `value` looks like it carries markup (and must be rejected). */
export function containsMarkup(value: string): boolean {
  return MARKUP_PATTERN.test(value);
}

/** A plain-text string refined to be markup-free. */
export const MarkupFreeString = z
  .string()
  .refine((s) => !containsMarkup(s), {
    message:
      'Markup is forbidden in the Jio Experience IR. Strings must be plain, escaped text — ' +
      'no HTML/JSX tags, className/class/style attributes, or dangerouslySetInnerHTML. ' +
      'Compose UI from registry component instances, not markup.',
  });

// ---------------------------------------------------------------------------
// Component instance + slot (the markup-free composition primitive)
// ---------------------------------------------------------------------------

/**
 * A JSON-compatible prop value (mirrors ASTSerializableValue, no functions).
 * String leaves are markup-free — props are another channel an LLM could try
 * to smuggle markup through (e.g. a `label` carrying `dangerouslySetInnerHTML`
 * or a `<div>`), so the same IR-02 guard applies here.
 */
export const IRPropValue: z.ZodType<IRPropValueT> = z.lazy(() =>
  z.union([
    MarkupFreeString,
    z.number(),
    z.boolean(),
    z.null(),
    z.array(IRPropValue),
    z.record(z.string(), IRPropValue),
  ]),
);
export type IRPropValueT =
  | string
  | number
  | boolean
  | null
  | IRPropValueT[]
  | { [key: string]: IRPropValueT };

/**
 * A slot value is EITHER nested registry component instances OR escaped,
 * markup-free text — and nothing else. This union IS the IR-02 invariant: a
 * raw markup string cannot pass, and there is no third "raw element" arm.
 */
export const SlotValue: z.ZodType<SlotValueT> = z.lazy(() =>
  z.union([z.array(JioIRComponentInstance), MarkupFreeString]),
);
export type SlotValueT = JioIRComponentInstanceT[] | string;

/**
 * A single registry component instance. `type` is a PascalCase registry
 * component name (validated against the registry by the AST validator / mapper,
 * never an HTML tag). Props are JSON-compatible; named slots hold nested
 * instances or escaped text.
 */
export interface JioIRComponentInstanceT {
  id: string;
  /** Registry component name (e.g. 'Button', 'Surface') — NOT an HTML tag. */
  type: string;
  props?: Record<string, IRPropValueT>;
  /** Named slots → nested instances or escaped, markup-free text. */
  slots?: Record<string, SlotValueT>;
  /** Optional surface mode wrapping this instance's subtree. */
  surfaceMode?: string;
}

export const JioIRComponentInstance: z.ZodType<JioIRComponentInstanceT> = z.lazy(() =>
  z
    .object({
      id: z.string().min(1),
      type: z.string().min(1).refine((s) => !containsMarkup(s), {
        message: 'Component `type` must be a registry component name, never markup.',
      }),
      props: z.record(z.string(), IRPropValue).optional(),
      slots: z.record(z.string(), SlotValue).optional(),
      surfaceMode: z.string().optional(),
    })
    // Reject objects that try to carry markup-bearing keys, even if extra.
    .strict(),
);

// ---------------------------------------------------------------------------
// Compositional layout node (LAYOUT-01..05 / D-01..D-04)
//
// A CLOSED, MARKUP-FREE structural vocabulary that expresses arrangement
// (stack/grid/row/cluster/spacer) without being a registry component instance.
// It carries NO `tag`/`rawHtml` (`.strict()`), only token-only + responsive
// dimension values, and nests to arbitrary depth holding nested layout nodes or
// registry component instances. The compiler (irToAst) maps each primitive onto
// the REAL Jio `Container`/`Grid` components — never an invented Stack/Row/Spacer
// and never a raw tag. This is an IR concept ONLY; no such component exists.
// ---------------------------------------------------------------------------

/** The closed set of layout primitives. Discriminated, never open. */
export const LayoutPrimitive = z.enum(['stack', 'grid', 'row', 'cluster', 'spacer']);
export type LayoutPrimitiveT = z.infer<typeof LayoutPrimitive>;

/**
 * A token-only dimension reference (D-04). EITHER a Spacing scale key (a subset
 * of Container's `ContainerSpaceKey`: '0'..'40' + 'margin'/'gutter') OR an
 * explicit `var(--Spacing-*)` / `var(--Dimension-*)` token ref. A raw literal
 * length (`'16px'`, `'1.5rem'`) is REJECTED at the IR boundary — the zero-literal
 * rule (D-04) is enforced here, not only at the AST validator backstop.
 */
const SPACING_KEY_RE =
  /^(0|0-5|1|1-5|2|2-5|3|3-5|4|4-5|5|5-5|6|7|8|9|10|12|14|16|18|20|24|28|32|40|margin|gutter)$/;
const SPACING_TOKEN_REF_RE = /^var\(--(Spacing|Dimension)-[A-Za-z0-9-]+\)$/;

/** A markup-free string further refined to a Spacing-key / token-ref grammar. */
export const TokenRefString = MarkupFreeString.refine(
  (s) => SPACING_KEY_RE.test(s) || SPACING_TOKEN_REF_RE.test(s),
  {
    message:
      'Layout dimensions must be a Jio Spacing key (e.g. "4", "gutter") or a token ' +
      'reference (var(--Spacing-4) / var(--Dimension-f3)). Raw literals like "16px" are ' +
      'forbidden — the IR is token-only (D-04).',
  },
);

/**
 * A responsive, token-only dimension value (D-04). EITHER a single token ref OR
 * a per-breakpoint object keyed by the data-Breakpoint breakpoints S/M/L.
 *
 * The per-breakpoint shape is an EXPLICIT-KEY `z.object`, NOT `z.record` — a
 * `z.record` emits JSON-Schema `propertyNames`, which Anthropic structured-output
 * rejects with a 400 (Pitfall 2). Explicit keys avoid that entirely.
 */
const ResponsiveTokenValue = z.union([
  TokenRefString,
  z
    .object({
      S: TokenRefString.optional(),
      M: TokenRefString.optional(),
      L: TokenRefString.optional(),
    })
    .strict(),
]);
export type ResponsiveTokenValueT =
  | string
  | { S?: string; M?: string; L?: string };

/** A compositional layout node — recursive, closed, markup-free (LAYOUT-01..05). */
export interface JioIRLayoutNodeT {
  kind: 'layout';
  id?: string;
  primitive: LayoutPrimitiveT;
  /** Token-only, optionally responsive. NEVER a literal length (D-04). */
  gap?: ResponsiveTokenValueT;
  padding?: ResponsiveTokenValueT;
  /** Grid only — responsive column-count token refs (D-04). */
  columns?: ResponsiveTokenValueT;
  /** Stack axis. */
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  /** row/cluster wrapping. */
  wrap?: boolean;
  surfaceMode?: string;
  /** Recursive children: nested layout nodes OR registry instances (D-03). */
  children: Array<JioIRLayoutNodeT | JioIRComponentInstanceT>;
}

export const JioIRLayoutNode: z.ZodType<JioIRLayoutNodeT> = z.lazy(() =>
  z
    .object({
      kind: z.literal('layout'),
      id: z.string().min(1).optional(),
      primitive: LayoutPrimitive,
      gap: ResponsiveTokenValue.optional(),
      padding: ResponsiveTokenValue.optional(),
      columns: ResponsiveTokenValue.optional(),
      direction: z.enum(['row', 'column']).optional(),
      align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
      justify: z.enum(['start', 'center', 'end', 'between', 'around']).optional(),
      wrap: z.boolean().optional(),
      surfaceMode: z.string().optional(),
      children: z.array(z.union([JioIRLayoutNode, JioIRComponentInstance])),
    })
    // No tag/rawHtml/markup key can ride along (IR-02 preserved).
    .strict(),
);

// ---------------------------------------------------------------------------
// Layout section
// ---------------------------------------------------------------------------

/** A layout section groups component instances under a named region. */
export const JioIRSection = z
  .object({
    id: z.string().min(1),
    /** Semantic region name (e.g. 'hero', 'content') — markup-free. */
    name: MarkupFreeString,
    /** Surface mode for the section container (token-driven, not markup). */
    surfaceMode: z.string().optional(),
    /** Component instances composing the section. */
    instances: z.array(JioIRComponentInstance),
    /**
     * ADDITIVE-OPTIONAL compositional layout tree (LAYOUT-01..05). When present,
     * the compiler walks this tree into real Container/Grid nodes; when absent,
     * old persisted flat IRs round-trip unchanged via `instances`. `version`
     * stays `z.literal(1)` — additive-optional, no migration (Pitfall 1).
     */
    layout: JioIRLayoutNode.optional(),
  })
  .strict();
export type JioIRSectionT = z.infer<typeof JioIRSection>;

// ---------------------------------------------------------------------------
// Content + a11y + validation status (IR-04 supporting shapes)
// ---------------------------------------------------------------------------

/** Structured, markup-free content payload (copy slots keyed by id). */
export const JioIRContent = z.record(z.string(), MarkupFreeString);
export type JioIRContentT = z.infer<typeof JioIRContent>;

/** Accessibility requirements the artifact must satisfy. */
export const JioIRA11yRequirements = z
  .object({
    /** Target WCAG level (AA mandatory per repo zero-tolerance rules). */
    wcagLevel: z.enum(['A', 'AA', 'AAA']).default('AA'),
    /** Minimum text contrast ratio target. */
    minContrastRatio: z.number().positive().optional(),
    /** Free-form, markup-free notes (e.g. 'all controls keyboard-reachable'). */
    notes: z.array(MarkupFreeString).optional(),
  })
  .strict();
export type JioIRA11yRequirementsT = z.infer<typeof JioIRA11yRequirements>;

export const ValidationStatusSchema = z.enum([
  'draft',
  'validating',
  'valid',
  'invalid',
  'gap',
]);
export type ValidationStatus = z.infer<typeof ValidationStatusSchema>;

// ---------------------------------------------------------------------------
// The IR document (IR-01 / IR-04)
// ---------------------------------------------------------------------------

export const JioExperienceIR = z
  .object({
    /** Forward-compat schema version — mirrors ASTRoot.version. */
    version: z.literal(1),
    artifactType: ArtifactTypeSchema,
    targetProfile: OutputProfileSchema,
    /** Real Jio brand id (D-02 — brands are real even in P1). */
    brandId: z.string().min(1),
    /** Foundation references resolved against the brand (tokens/scales/etc). */
    foundationRefs: z.array(z.string()),
    /** Layout sections (ordered). */
    sections: z.array(JioIRSection),
    /** Flat component-instance pool (also referenced by sections). */
    componentInstances: z.array(JioIRComponentInstance),
    /** Structured, markup-free copy. */
    content: JioIRContent,
    a11yRequirements: JioIRA11yRequirements,
    validationStatus: ValidationStatusSchema,
  })
  .strict();

export type JioExperienceIRT = z.infer<typeof JioExperienceIR>;

/** Convenience safe-parse wrapper. */
export function parseIR(input: unknown) {
  return JioExperienceIR.safeParse(input);
}
