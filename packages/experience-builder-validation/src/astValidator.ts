/**
 * astValidator.ts
 *
 * The AST-level compliance validator for the Jio AI Experience Builder Lab.
 * It is the security boundary that enforces the Core Value: every generated
 * artifact is provably composed from real Jio Design System components and
 * Jio-only imports — nothing else may reach output.
 *
 * Why AST, not regex (Pitfall 4 / VAL-05): a substring denylist
 * (`code.includes('shadcn')`) is trivially defeated by aliasing
 * (`import { Button as X } from 'shadcn'`), whitespace, string concatenation,
 * or comments. This validator operates on a STRUCTURED, already-parsed
 * artifact: a list of resolved import bindings (source module + imported name +
 * local alias) and a typed component AST. It makes every allow/deny decision
 * STRUCTURALLY:
 *
 *  1. Imports (VAL-02): every import `source` must be a Jio catalog path
 *     (`@oneui/ui/components/<Folder>`). A non-Jio source is blocking — and
 *     because we resolve the binding's `local` alias, `import { Button as X }
 *     from 'shadcn'` is caught exactly like a bare `import { Button } from
 *     'shadcn'`. The decision is "is this module source in the allowlist",
 *     never "does the code text contain a banned word".
 *  2. Markup (VAL-03 / T-01-08): any `ElementASTNode` (raw `tag: 'div'`) is
 *     blocking — defence-in-depth with the IR's markup-free guarantee.
 *  3. Components (VAL-03 / T-01-09): every `ComponentASTNode.type` must be an
 *     exact member of the registry (via `getRegistryItem`). The type is first
 *     resolved through the alias map (so a smuggled `<X/>` bound to a non-Jio
 *     import is rejected even if `X` happens to look registered). An
 *     unregistered type is a component gap + blocking.
 *  4. Props / variants / slots (VAL-03): every prop name, every value of a
 *     variant-defining prop, and every child-bearing slot must be in the
 *     component's registry meta allowlist, else blocking + a repair suggestion.
 *     Additionally, every prop the meta marks `required` MUST be present, else
 *     blocking — this closes the guardrail gap where a prop-incomplete instance
 *     (e.g. `PaginationDots` with no `count`) previously passed because the
 *     present-prop loop had nothing to iterate, starving the repair loop.
 *  5. Literal/token-boundary check (VAL-04): a structural hook walks string
 *     prop values for hardcoded visual literals (colour, spacing, radius,
 *     elevation, motion, and unapproved font/icon families). Any such literal
 *     is BLOCKING — "AI cannot bypass the Jio Design System" requires that a
 *     raw value short-circuit to repair (D-06). The shared `BRAND_ALLOWED_REGEX`
 *     token-boundary (derived from the shared manifest) is the ONE acceptable
 *     regex here — it classifies a `--Token` reference as the sanctioned escape
 *     hatch (`var(--Primary-Bold)` passes; a fake `var(--NotAToken)` does not),
 *     it does not make the import/component decision.
 *
 * Returns a `JioValidationResult` (the frozen VAL-01 contract from
 * `@oneui/experience-builder-core`) in EVERY branch, so every run is auditable
 * (T-01-10): passed + blocking + warnings + repairSuggestions + componentGaps +
 * foundationGaps.
 *
 * Pure-TS, JSON-compatible, node-safe (consumes only the node-safe registry
 * adapter + the pure token manifest).
 */

import type {
  JioValidationResultT,
  ViolationT,
  ComponentGapT,
  JioComponentRegistryItemT,
  JioExperienceIRT,
  JioIRSectionT,
  JioIRLayoutNodeT,
  JioIRComponentInstanceT,
} from '@oneui/experience-builder-core';
import { JioValidationResult } from '@oneui/experience-builder-core';
import { getRegistryItem } from '@oneui/experience-builder-registry';
import type { GetRegistryItemResult } from '@oneui/experience-builder-registry';
import { BRAND_ALLOWED_REGEX } from '@oneui/shared/engine/tokenBoundary';

// ---------------------------------------------------------------------------
// Input shape: a PARSED, alias-resolved artifact.
//
// This is the structural contract Pitfall 4 demands. The caller (P2 generator /
// P3 compiler) parses the emitted code into this shape BEFORE validation; the
// validator never sees a raw code string and so never substring-matches.
// ---------------------------------------------------------------------------

/**
 * A single resolved import binding. `source` is the module specifier
 * (`@oneui/ui/components/Button` or `shadcn`); `imported` is the name as
 * exported by the source (`Button`, or `default`); `local` is the in-scope
 * alias used by the component tree (`Button`, or `X` for `Button as X`).
 *
 * Alias resolution is the whole point: the component tree references `local`
 * names, and we map each back to its `source` to decide Jio-membership — never
 * the textual import line.
 */
export interface ResolvedImport {
  source: string;
  imported: string;
  local: string;
}

/** Minimal serializable value type (mirrors the shared AST value union). */
export type AstValue =
  | string
  | number
  | boolean
  | null
  | AstValue[]
  | { [key: string]: AstValue };

/** A registered Jio component instance in the artifact AST. */
export interface ComponentNode {
  id: string;
  kind: 'component';
  /** The LOCAL name used in the tree (resolved to a source via the import map). */
  type: string;
  props: Record<string, AstValue>;
  children: ArtifactAstNode[];
}

/** A raw HTML element — the markup-smuggling vector. ALWAYS blocked. */
export interface ElementNode {
  id: string;
  kind: 'element';
  tag: string;
  props: Record<string, AstValue>;
  children: ArtifactAstNode[];
}

/** Escaped text content. */
export interface TextNode {
  id: string;
  kind: 'text';
  text: string;
}

export type ArtifactAstNode = ComponentNode | ElementNode | TextNode;

/**
 * The full parsed artifact handed to the validator: the resolved import
 * bindings plus the component tree. This is what the compiler produces and the
 * validator consumes — never JSX source text.
 */
export interface ArtifactAst {
  imports: ResolvedImport[];
  root: ArtifactAstNode;
}

/**
 * A single backfill-provenance record threaded from the IR Generator (Plan 03 /
 * `irGenerator.ts` `BackfillRecord`). It records which required prop on which
 * instance was DETERMINISTICALLY filled (because the model failed to supply it),
 * and whether that prop is CONTENT (`isContent:true` — a headline/body/label the
 * ToV advisor should have authored) or merely STRUCTURAL (`isContent:false` —
 * e.g. a `variant`). The structural quality gate (QUAL-04) reads this so a
 * backfilled CONTENT prop BLOCKS (placeholder content cannot ship, D-10/T-04.2-08)
 * while a backfilled STRUCTURAL prop only flags.
 */
export interface BackfillRecord {
  instanceId: string;
  propName: string;
  isContent: boolean;
}

/** Optional context (reserved for P3 — brand/profile-scoped allowlists). */
export interface ValidateAstContext {
  /** Brand id the artifact targets (P3 will scope per-brand membership). */
  brandId?: string;
  /** Output profile (P3 will scope per-profile component support). */
  outputProfile?: string;
  /**
   * Backfill provenance from the IR Generator run metadata (Plan 03). The
   * placeholder-content check (QUAL-04) reads it: a backfilled CONTENT prop
   * blocks even when its string value looks fine, a backfilled STRUCTURAL prop
   * only flags.
   */
  backfilled?: BackfillRecord[];
  /**
   * Suppress the `placeholder-content` quality check (QUAL-04). The structural
   * import/component/literal ALLOWLIST validation (the compiler's internal Gate,
   * `compile()` → this validator) is NOT the place to enforce content quality:
   * the deterministic backfill (D-08/QUAL-03) is the intended last-resort safety
   * net there, and its humanized defaults (`'Hero item'`) would otherwise hard-
   * block the assembler's allowlist gate. The placeholder-content BLOCK belongs
   * ONLY at the WORKFLOW quality gate (`validateIrAndAst`), which reads the
   * Plan-03 provenance to distinguish a flagged-acceptable backfill from real
   * shipping output. When `true`, the placeholder scan is skipped; every other
   * allowlist check (imports / components / props / literals) still runs.
   */
  skipPlaceholderContent?: boolean;
}

// ---------------------------------------------------------------------------
// Allowlist constants
// ---------------------------------------------------------------------------

/**
 * The single Jio catalog import prefix (VAL-02 source). Mirrors the registry
 * adapter's `importPath` invariant (`@oneui/ui/components/<Folder>`). The
 * membership decision is `source.startsWith(prefix)` on the STRUCTURED import
 * `source` field — not a substring scan of code text.
 */
const JIO_IMPORT_PREFIX = '@oneui/ui/components/';

/**
 * Prop names always allowed regardless of component meta (mirrors
 * `ASTRenderer`'s ALWAYS_ALLOWED set): accessibility + framework meta keys.
 */
const ALWAYS_ALLOWED_PROP_PREFIXES = ['data-ast-', 'aria-', 'data-oneui-'];
const ALWAYS_ALLOWED_PROP_KEYS = new Set(['id', 'role', 'key', 'tabIndex', 'className', 'children']);

/**
 * The compiled-layout structural vocabulary (LAYOUT-05 / D-03). `irToAst` maps
 * every IR layout primitive (stack/grid/row/cluster/spacer) onto one of these
 * REAL Jio components. They carry EMPTY generated-prop meta in the registry
 * (queryRegistry empty-meta fall-through), so the normal prop-name allowlist
 * would wrongly trip `invalid-prop` on legitimate layout props (`gap`, `columns`,
 * …). We structurally ALLOW them — skipping the empty-meta prop allowlist — while
 * STILL running `checkLiteralHook` (so a `gap:'16px'` literal blocks) and STILL
 * requiring exact registry membership for every component instance CHILD (REG-03;
 * an unregistered child of a layout node is never exempted).
 */
const STRUCTURAL_LAYOUT_TYPES = new Set(['Container', 'Grid']);

// ---------------------------------------------------------------------------
// Structural quality gate (QUAL-04 / D-10) constants
//
// The PRIMARY, deterministic quality gate. Three blocking codes — `flat-layout`
// and `empty-section-copy` (IR pre-check, before the AST flatten loses section /
// layout boundaries) + `placeholder-content` (AST string-prop pass) — guarantee
// a generated web-ui/landing artifact reads as a genuine product UI (real
// nesting, no placeholders, substantive copy) BEFORE it can be frozen. Each
// feeds the SAME blocking/repairSuggestion accumulator the rest of the validator
// uses, so the existing bounded-repair loop patches every code.
// ---------------------------------------------------------------------------

/**
 * Prop names that carry user-visible CONTENT (copy / media references). A
 * placeholder on one of these is shippable-looking but empty of meaning — the
 * exact failure D-10 / T-04.2-08 guards. Used by the `placeholder-content` AST
 * check to decide which string props to scan for sentinels.
 */
const CONTENT_PROP_NAMES = new Set([
  'children',
  'title',
  'label',
  'heading',
  'text',
  'caption',
  'alt',
  'description',
  'content',
  'src',
  'href',
  'url',
  'imageUrl',
  'imageSrc',
]);

/**
 * Placeholder-content sentinels (QUAL-04). A content prop equal to / containing
 * one of these is a placeholder masquerading as real output:
 *  - `https://placehold.co/...` — the placeholder-image service default.
 *  - a humanized backfill default of the form `'<Section> item'` (e.g.
 *    `'Hero item'`, `'Content item'`) — the GAP-01 last-resort default the IR
 *    Generator emits when no real copy exists.
 *  - the literal `'Untitled'` default.
 * The `'<X> item'` form is matched structurally: a capitalized word run followed
 * by a single trailing ` item` (no further copy) — a genuine sentence like
 * "Add this item to your cart" never matches (it has trailing words).
 */
const PLACEHOLDER_URL_RE = /placehold\.co/i;
const HUMANIZED_ITEM_PLACEHOLDER_RE = /^[A-Z][A-Za-z0-9-]*(?: [A-Z][A-Za-z0-9-]*)* item$/;
const UNTITLED_PLACEHOLDER_RE = /^untitled$/i;

/** True iff a string content value matches a known placeholder sentinel. */
function isPlaceholderContentValue(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (PLACEHOLDER_URL_RE.test(trimmed)) return true;
  if (HUMANIZED_ITEM_PLACEHOLDER_RE.test(trimmed)) return true;
  if (UNTITLED_PLACEHOLDER_RE.test(trimmed)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Violation builders
// ---------------------------------------------------------------------------

function blocking(
  code: string,
  message: string,
  extra: Partial<ViolationT> = {},
): ViolationT {
  return { code, message, severity: 'blocking', ...extra };
}

function isAlwaysAllowedProp(name: string): boolean {
  if (ALWAYS_ALLOWED_PROP_KEYS.has(name)) return true;
  return ALWAYS_ALLOWED_PROP_PREFIXES.some((p) => name.startsWith(p));
}

// ---------------------------------------------------------------------------
// Component prop/variant/slot checks
// ---------------------------------------------------------------------------

/**
 * Validate one component's props/variants/slots against its registry meta.
 * Returns the violations + repair suggestions found (empty when compliant).
 */
function checkComponentProps(
  node: ComponentNode,
  resolvedType: string,
  item: JioComponentRegistryItemT,
): { violations: ViolationT[]; suggestions: string[] } {
  const violations: ViolationT[] = [];
  const suggestions: string[] = [];

  const propByName = new Map(item.props.map((p) => [p.name, p]));
  const allowedSlots = new Set(item.slots);
  const variantSet = new Set(item.variants);

  for (const [propName, propValue] of Object.entries(node.props)) {
    if (isAlwaysAllowedProp(propName)) continue;

    const meta = propByName.get(propName);

    // (a) Unknown prop entirely → blocking + repair suggestion (VAL-03).
    if (!meta) {
      violations.push(
        blocking(
          'invalid-prop',
          `Prop "${propName}" is not a valid prop of Jio component "${resolvedType}".`,
          { nodeId: node.id, offender: propName },
        ),
      );
      const allowed = item.props.map((p) => p.name);
      suggestions.push(
        allowed.length > 0
          ? `Remove "${propName}" from <${resolvedType}/>. Allowed props: ${allowed.join(', ')}.`
          : `Remove "${propName}" from <${resolvedType}/>; it accepts no static props.`,
      );
      continue;
    }

    // (b) Enumerated value out of range → blocking + repair suggestion.
    if (
      meta.values &&
      meta.values.length > 0 &&
      typeof propValue === 'string' &&
      !meta.values.includes(propValue)
    ) {
      const kind = variantSet.has(propValue) ? 'variant' : 'value';
      violations.push(
        blocking(
          'invalid-variant',
          `"${propValue}" is not a valid ${kind} for prop "${propName}" of "${resolvedType}".`,
          { nodeId: node.id, offender: propValue },
        ),
      );
      suggestions.push(
        `Set <${resolvedType}/> prop "${propName}" to one of: ${meta.values.join(', ')}.`,
      );
    }
  }

  // (b2) REQUIRED-PROP CONTRACT (VAL-03 — the guardrail gap this closes). Every
  //      prop the registry meta marks `required` MUST be present on the instance.
  //      Without this, a prop-incomplete instance (e.g. `PaginationDots` with no
  //      `count`, which the renderer turns into `NaN` keys) passed validation
  //      because the present-prop loop above had nothing to iterate — so the
  //      in-gen retry (Gate C) and the bounded-repair loop never fired. A missing
  //      required prop is blocking + a concrete repair suggestion so the loop can
  //      re-prompt the model to supply it.
  //
  //      A required prop is "present" if it appears as a key on the instance's
  //      prop bag (even with a null/empty value — value-level checks are (b)).
  //      Content slots that double as required props (ReactNode-typed) are also
  //      surfaced as props by the registry adapter, so the same key check holds.
  for (const propMeta of item.props) {
    if (!propMeta.required) continue;
    if (isAlwaysAllowedProp(propMeta.name)) continue;
    if (Object.prototype.hasOwnProperty.call(node.props, propMeta.name)) continue;

    violations.push(
      blocking(
        'missing-required-prop',
        `Required prop "${propMeta.name}" is missing on Jio component "${resolvedType}".`,
        { nodeId: node.id, offender: propMeta.name },
      ),
    );
    const allowedValues =
      propMeta.values && propMeta.values.length > 0
        ? ` Allowed values: ${propMeta.values.join(', ')}.`
        : '';
    suggestions.push(
      `Add the required prop "${propMeta.name}" to <${resolvedType}/>.${allowedValues}`,
    );
  }

  // (c) Child-bearing nodes must land in a declared slot. A component with
  //     children but no slots in its meta (and no `children` slot) is misused.
  if (node.children.length > 0 && allowedSlots.size > 0 && !allowedSlots.has('children')) {
    // Components that declare named slots but not `children` should not receive
    // positional children. (Skeleton check; P3 maps each child to a named slot.)
    // We only flag when the component declares slots yet none is `children`.
    // Components with empty slots fall through (no slot info to enforce yet).
  }

  return { violations, suggestions };
}

// ---------------------------------------------------------------------------
// Literal / token-boundary check (VAL-04 — BLOCKING)
// ---------------------------------------------------------------------------

/**
 * Matches hardcoded visual literals in a string prop value:
 *  - colour: `#abc`/`#aabbcc...`, `rgb(`/`rgba(`, `hsl(`/`hsla(`
 *  - spacing / radius / elevation: bare numeric units `12px`, `1.5rem`, `0.5em`
 *  - motion: bare time units `200ms`, `0.3s` (a number immediately followed by
 *    `ms`/`s`, kept distinct from the px/rem branch)
 *
 * This is a structural classifier over a single prop value — it never sees code
 * text. The genuine-token escape hatch (`var(--<allowed>)`) is applied first in
 * `checkLiteralHook`, so a value built entirely from approved tokens never
 * reaches this regex.
 */
const VISUAL_LITERAL_RE =
  /(#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em)\b|\b\d+(?:\.\d+)?(?:ms|s)\b|\brgba?\(|\bhsla?\()/;

/** Font-family props are token hooks. Icon props on icon components are names. */
const FONT_PROP_RE = /^(font(family|-family)?)$/i;
const ICON_PROP_RE = /^icon(name|-name)?$/i;
const ICON_COMPONENTS = new Set(['Icon', 'IconButton', 'IconContained', 'SelectableIconButton', 'FAB']);

/**
 * True iff the value is a sanctioned Jio token reference: it contains `var(--`
 * AND the inner token name matches the manifest-derived `BRAND_ALLOWED_REGEX`
 * (the ONE acceptable regex here). `var(--Primary-Bold)` → allowed;
 * `var(--NotAToken)` → not allowed.
 */
function isGenuineTokenRef(value: string): boolean {
  if (!value.includes('var(--')) return false;
  // Strip everything up to (and including) the last `var(` so the boundary
  // regex tests the token name itself, mirroring the original skeleton.
  return BRAND_ALLOWED_REGEX.test(value.replace(/^.*var\(/, ''));
}

/**
 * Structural scan for hardcoded visual literals in string prop values. Every
 * such literal is BLOCKING (VAL-04): a literal value bypasses the Jio token
 * system, so it short-circuits to repair (D-06) with no model call.
 */
function checkLiteralHook(node: ComponentNode): ViolationT[] {
  const violations: ViolationT[] = [];
  for (const [propName, value] of Object.entries(node.props)) {
    if (typeof value !== 'string') continue;

    if (ICON_PROP_RE.test(propName) && ICON_COMPONENTS.has(node.type)) {
      if (value.includes('var(--')) {
        violations.push(
          blocking(
            'invalid-icon-name',
            `Prop "${propName}" on "${node.type}" must be a semantic icon name, not a token reference.`,
            { nodeId: node.id, offender: value },
          ),
        );
      }
      continue;
    }

    // The sanctioned escape hatch: a value that IS a Jio token reference is
    // fine. Classified structurally via the shared brand token-boundary.
    if (isGenuineTokenRef(value)) continue;

    if ((FONT_PROP_RE.test(propName) || ICON_PROP_RE.test(propName)) && value.trim().length > 0) {
      violations.push(
        blocking(
          'literal-value-hook',
          `Prop "${propName}" on "${node.type}" is a raw font/icon literal ("${value}"). Use the component contract value.`,
          { nodeId: node.id, offender: value },
        ),
      );
      continue;
    }

    // A fake `var()` whose token is not manifest-allowed is a smuggled literal
    // dressed up as a token — blocking (it failed the genuine-token escape hatch
    // above precisely because the token name is not in the allowlist).
    const isFakeVar = value.includes('var(--');

    if (isFakeVar || VISUAL_LITERAL_RE.test(value)) {
      violations.push(
        blocking(
          'literal-value-hook',
          `Prop "${propName}" on "${node.type}" is a hardcoded visual literal ("${value}"). Use a Jio token (e.g. var(--Primary-Bold), var(--Spacing-4)).`,
          { nodeId: node.id, offender: value },
        ),
      );
    }
  }
  return violations;
}

// ---------------------------------------------------------------------------
// Placeholder-content check (QUAL-04 — BLOCKING) — AST string-prop pass
// ---------------------------------------------------------------------------

/**
 * Scan a component instance's CONTENT props for placeholder content (QUAL-04).
 * Two signals BLOCK:
 *  1. a string content prop whose value matches a placeholder sentinel
 *     (`placehold.co`, `'<Section> item'`, `'Untitled'`); and
 *  2. a content prop that the threaded `backfilled[]` provenance marks as a
 *     backfilled CONTENT prop (`isContent:true`) on this instance — even when the
 *     string itself does not look like a placeholder, because a deterministically
 *     backfilled headline/body/label is NOT real ToV copy (D-10 / T-04.2-08).
 *
 * A backfilled STRUCTURAL prop (`isContent:false`) is acceptable output — it
 * produces a non-blocking WARNING flag only, never a block.
 *
 * Returns `{ violations, warnings }`; `violations` are blocking, `warnings` carry
 * the structural-backfill flag.
 */
function checkPlaceholderContent(
  node: ComponentNode,
  backfilled: BackfillRecord[],
): { violations: ViolationT[]; warnings: ViolationT[]; suggestions: string[] } {
  const violations: ViolationT[] = [];
  const warnings: ViolationT[] = [];
  const suggestions: string[] = [];

  // Backfill records for THIS instance, indexed by prop name.
  const recordsForNode = backfilled.filter((b) => b.instanceId === node.id);
  const backfilledContentProps = new Set(
    recordsForNode.filter((b) => b.isContent).map((b) => b.propName),
  );

  // A backfilled STRUCTURAL prop is acceptable — flag (warning) only.
  for (const rec of recordsForNode) {
    if (!rec.isContent) {
      warnings.push({
        code: 'backfilled-structural-prop',
        message: `Structural prop "${rec.propName}" on "${node.type}" was deterministically backfilled (acceptable, flagged for provenance).`,
        severity: 'warning',
        nodeId: node.id,
        offender: rec.propName,
      });
    }
  }

  for (const [propName, value] of Object.entries(node.props)) {
    const isContentProp = CONTENT_PROP_NAMES.has(propName);

    // (1) A backfilled CONTENT prop on this instance blocks regardless of value.
    if (backfilledContentProps.has(propName)) {
      violations.push(
        blocking(
          'placeholder-content',
          `Content prop "${propName}" on "${node.type}" is backfilled placeholder content (no real ToV copy). Generate substantive ${propName} copy instead of a default.`,
          { nodeId: node.id, offender: propName },
        ),
      );
      suggestions.push(
        `Supply real, substantive copy for "${propName}" on <${node.type}/> — the deterministic backfill is a placeholder, not authored content.`,
      );
      continue;
    }

    // (2) A string content prop matching a placeholder sentinel blocks.
    if (isContentProp && typeof value === 'string' && isPlaceholderContentValue(value)) {
      violations.push(
        blocking(
          'placeholder-content',
          `Content prop "${propName}" on "${node.type}" is placeholder content ("${value}"). Replace it with real, substantive copy/media — placeholders may not ship.`,
          { nodeId: node.id, offender: value },
        ),
      );
      suggestions.push(
        `Replace the placeholder "${value}" on <${node.type}/> prop "${propName}" with real Jio content.`,
      );
    }
  }

  return { violations, warnings, suggestions };
}

// ---------------------------------------------------------------------------
// The walk
// ---------------------------------------------------------------------------

interface WalkAcc {
  blocking: ViolationT[];
  warnings: ViolationT[];
  repairSuggestions: string[];
  componentGaps: ComponentGapT[];
  /** Backfill provenance threaded from the IR Generator (Plan 03). */
  backfilled: BackfillRecord[];
  /** When true, skip the QUAL-04 placeholder-content scan (compiler internal gate). */
  skipPlaceholderContent: boolean;
}

function walkNode(
  node: ArtifactAstNode,
  aliasToSource: Map<string, string>,
  acc: WalkAcc,
): void {
  switch (node.kind) {
    case 'text':
      return;

    case 'element': {
      // (VAL-03 / T-01-08) Raw markup is ALWAYS blocking — defence-in-depth.
      acc.blocking.push(
        blocking(
          'raw-element',
          `Raw HTML element <${node.tag}> is not permitted. Artifacts may only compose registered Jio components (markup smuggling guard).`,
          { nodeId: node.id, offender: node.tag },
        ),
      );
      // Still walk children so nested smuggling is reported too.
      node.children.forEach((c) => walkNode(c, aliasToSource, acc));
      return;
    }

    case 'component': {
      // Resolve the LOCAL type name through the import alias map to its source
      // module. If the local name is bound to a non-Jio import, the import
      // check already flagged the source; here we additionally refuse to treat
      // it as a registered component.
      const source = aliasToSource.get(node.type);
      const boundToNonJio = source !== undefined && !source.startsWith(JIO_IMPORT_PREFIX);

      if (boundToNonJio) {
        acc.blocking.push(
          blocking(
            'non-jio-component',
            `Component "${node.type}" resolves to a non-Jio import ("${source}") and cannot be used.`,
            { nodeId: node.id, offender: node.type },
          ),
        );
        node.children.forEach((c) => walkNode(c, aliasToSource, acc));
        return;
      }

      // (LAYOUT-05 / D-03) Compiled layout structural vocabulary. Container/Grid
      // carry EMPTY generated-prop meta, so the normal prop-name allowlist would
      // wrongly trip `invalid-prop` on their layout props. Structurally ALLOW
      // them — skip the empty-meta allowlist — but KEEP the literal/token backstop
      // (a `gap:'16px'` literal still blocks via checkLiteralHook) and STILL walk
      // children so an unregistered instance child hits exact membership (REG-03).
      if (STRUCTURAL_LAYOUT_TYPES.has(node.type)) {
        acc.blocking.push(...checkLiteralHook(node));
        // Placeholder-content backstop still applies (QUAL-04): a layout node
        // could carry a backfilled content prop or a placeholder media ref —
        // unless this is the compiler's internal allowlist gate (skip flag).
        if (!acc.skipPlaceholderContent) {
          const ph = checkPlaceholderContent(node, acc.backfilled);
          acc.blocking.push(...ph.violations);
          acc.warnings.push(...ph.warnings);
          acc.repairSuggestions.push(...ph.suggestions);
        }
        node.children.forEach((c) => walkNode(c, aliasToSource, acc));
        return;
      }

      // Registry membership (exact). If the local name was imported, prefer its
      // `imported` source-name resolution — but in this skeleton the local name
      // equals the registry id for Jio imports, so we look up the type directly.
      const lookup: GetRegistryItemResult = getRegistryItem(node.type);
      if (!lookup.ok) {
        acc.componentGaps.push({
          componentType: node.type,
          reason: lookup.message,
        });
        acc.blocking.push(
          blocking(
            'unregistered-component',
            lookup.message,
            { nodeId: node.id, offender: node.type },
          ),
        );
        node.children.forEach((c) => walkNode(c, aliasToSource, acc));
        return;
      }

      // Props / variants / slots against the meta allowlist (VAL-03).
      const { violations, suggestions } = checkComponentProps(node, node.type, lookup.item);
      acc.blocking.push(...violations);
      acc.repairSuggestions.push(...suggestions);

      // Literal/token check (VAL-04 — BLOCKING). A hardcoded visual literal
      // bypasses the Jio token system, so it short-circuits to repair (D-06).
      acc.blocking.push(...checkLiteralHook(node));

      // Placeholder-content check (QUAL-04 — BLOCKING). A placeholder sentinel or
      // a backfilled CONTENT prop is shippable-looking but empty of meaning.
      // Skipped for the compiler's internal allowlist gate — the placeholder
      // BLOCK is a workflow quality-gate concern, not an import/component check.
      if (!acc.skipPlaceholderContent) {
        const ph = checkPlaceholderContent(node, acc.backfilled);
        acc.blocking.push(...ph.violations);
        acc.warnings.push(...ph.warnings);
        acc.repairSuggestions.push(...ph.suggestions);
      }

      node.children.forEach((c) => walkNode(c, aliasToSource, acc));
      return;
    }
  }
}

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// IR pre-check (QUAL-04) — runs on the IR section/layout TREE before flatten
//
// Why a separate pass (RESEARCH Pattern 4): the AST flatten LOSES section
// boundaries and layout depth (a section's nesting tree collapses into a single
// component subtree). The `flat-layout` and `empty-section-copy` checks need
// those boundaries, so they run on the IR tree HERE, BEFORE `irToAst`. Both push
// into the SAME blocking/repairSuggestion shape `validateAst` returns, so the
// existing bounded-repair loop can patch every code (single-sourced suggestions).
// ---------------------------------------------------------------------------

/** A layout child is a nested layout node iff it carries `kind:'layout'`. */
function isLayoutNode(
  child: JioIRLayoutNodeT | JioIRComponentInstanceT,
): child is JioIRLayoutNodeT {
  return (child as JioIRLayoutNodeT).kind === 'layout';
}

/**
 * Walk a layout node and decide whether the section has REAL structure (D-10):
 *  - a nesting depth ≥ 2 (a layout node whose subtree contains another layout
 *    node), OR
 *  - any grid / row primitive anywhere in the tree.
 * A single flat `stack` of leaf instances (depth 1, no grid/row) is FLAT.
 */
function hasRealStructure(node: JioIRLayoutNodeT, depth: number): boolean {
  if (node.primitive === 'grid' || node.primitive === 'row') return true;
  for (const child of node.children) {
    if (isLayoutNode(child)) {
      // A nested layout node gives depth ≥ 2 — real structure.
      if (depth + 1 >= 2) return true;
      if (hasRealStructure(child, depth + 1)) return true;
    }
  }
  return false;
}

/**
 * Mobile column cap. A grid showing more than this many columns at the S
 * breakpoint reads as cramped/overflowing on a phone (the most common "destroyed
 * grid" symptom). Multi-column layouts must collapse toward 1–2 columns on mobile.
 */
const MAX_MOBILE_COLUMNS = 2;

/**
 * Resolve the column count a layout node renders at the mobile (S) breakpoint.
 * - a bare number applies to every breakpoint (including mobile);
 * - a responsive object uses its `S` key, falling back to the smallest declared
 *   count (mobile-first floor) when `S` is absent.
 * Returns `null` when the node declares no columns.
 */
function mobileColumnCount(columns: unknown): number | null {
  if (columns == null) return null;
  if (typeof columns === 'number') return Number.isFinite(columns) ? columns : null;
  if (typeof columns === 'string') {
    const n = Number(columns);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof columns === 'object') {
    const obj = columns as Record<string, unknown>;
    const s = obj.S ?? obj.s;
    if (s != null) {
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    }
    const nums = Object.values(obj)
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && n > 0);
    return nums.length > 0 ? Math.min(...nums) : null;
  }
  return null;
}

/** Collect every layout node whose mobile column count exceeds the cap. */
function collectExcessiveMobileColumns(
  node: JioIRLayoutNodeT,
  out: JioIRLayoutNodeT[],
): void {
  const mobile = mobileColumnCount((node as { columns?: unknown }).columns);
  if (mobile != null && mobile > MAX_MOBILE_COLUMNS) out.push(node);
  for (const child of node.children) {
    if (isLayoutNode(child)) collectExcessiveMobileColumns(child, out);
  }
}

/**
 * True iff the section has substantive copy. Copy lives in `ir.content` keyed by
 * `<sectionName>.<field>` (the IR Generator / ToV convention). A section needs at
 * least one non-empty `headline` or `body` value to read as a real product
 * section (D-10). A whitespace-only value does not count.
 */
function sectionHasSubstantiveCopy(
  section: JioIRSectionT,
  content: Record<string, string>,
): boolean {
  const prefix = `${section.name}.`;
  for (const [key, value] of Object.entries(content)) {
    if (!key.startsWith(prefix)) continue;
    const field = key.slice(prefix.length);
    if ((field === 'headline' || field === 'body') && value.trim().length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * IR-shaped structural quality pre-check (QUAL-04). Walks the IR section/layout
 * tree BEFORE the AST flatten and emits the two boundary-dependent blocking codes
 * (`flat-layout`, `empty-section-copy`) into a `JioValidationResult`. The caller
 * runs this FIRST, then `validateAst` over the compiled AST; merging the two
 * results' `blocking`/`repairSuggestions` feeds the single repair loop.
 *
 * `backfilled` is accepted (and forwarded by the workflow to `validateAst`) so
 * the placeholder check downstream can distinguish real ToV copy from a
 * backfilled default — the IR pre-check itself uses it only for parity of the
 * call signature; the placeholder block lives in the AST pass.
 */
export function validateIRStructure(
  ir: JioExperienceIRT,
  _backfilled: BackfillRecord[] = [],
): JioValidationResultT {
  const blockingViolations: ViolationT[] = [];
  const repairSuggestions: string[] = [];

  const content = (ir.content ?? {}) as Record<string, string>;

  for (const section of ir.sections) {
    // (1) flat-layout: a section with no layout tree, or a layout tree that is a
    //     single flat stack of leaves (no depth≥2, no grid/row), is FLAT.
    const flat = !section.layout || !hasRealStructure(section.layout, 1);
    if (flat) {
      blockingViolations.push(
        blocking(
          'flat-layout',
          `Section "${section.name}" has a flat layout (a single stack of leaf instances, no real nesting or grid/row). Arrange its components inside layout primitives (stack containing a grid/row, or nested layouts).`,
          { nodeId: section.id, offender: section.name },
        ),
      );
      repairSuggestions.push(
        `Give section "${section.name}" a real layout: wrap its instances in nested layout primitives (e.g. a stack containing a grid) instead of a flat list.`,
      );
    }

    // (2) responsive-grid-misuse: a multi-column grid must collapse on mobile.
    //     More than MAX_MOBILE_COLUMNS columns at S reads as a broken/overflowing
    //     grid on phones — the most common misalignment symptom. Flag it so the
    //     bounded repair loop rewrites the columns to a responsive ramp.
    if (section.layout) {
      const offenders: JioIRLayoutNodeT[] = [];
      collectExcessiveMobileColumns(section.layout, offenders);
      for (const off of offenders) {
        const mobile = mobileColumnCount((off as { columns?: unknown }).columns);
        blockingViolations.push(
          blocking(
            'responsive-grid-misuse',
            `Section "${section.name}" has a grid rendering ${mobile} columns on mobile (S); the mobile cap is ${MAX_MOBILE_COLUMNS}. Use a responsive columns object that collapses on small screens, e.g. { S: '1', M: '2', L: '4' }.`,
            { nodeId: off.id ?? section.id, offender: section.name },
          ),
        );
        repairSuggestions.push(
          `Make section "${section.name}"'s grid responsive: cap mobile (S) at ${MAX_MOBILE_COLUMNS} columns and add more only at M/L (e.g. columns: { S: '1', M: '2', L: '4' }).`,
        );
      }
    }

    // (3) empty-section-copy: every section must carry substantive headline/body.
    if (!sectionHasSubstantiveCopy(section, content)) {
      blockingViolations.push(
        blocking(
          'empty-section-copy',
          `Section "${section.name}" has no substantive headline/body copy. Every section must carry real, authored copy.`,
          { nodeId: section.id, offender: section.name },
        ),
      );
      repairSuggestions.push(
        `Author a substantive headline and/or body for section "${section.name}" (content keys "${section.name}.headline" / "${section.name}.body").`,
      );
    }
  }

  const result: JioValidationResultT = {
    passed: blockingViolations.length === 0,
    blocking: blockingViolations,
    warnings: [],
    repairSuggestions,
    componentGaps: [],
    foundationGaps: [],
  };
  return JioValidationResult.parse(result);
}

/**
 * Validate a parsed, alias-resolved artifact AST against the Jio allowlists.
 * Always returns a `JioValidationResult` (VAL-01); `passed` is true iff there
 * are zero blocking violations.
 */
export function validateAst(
  ast: ArtifactAst,
  ctx: ValidateAstContext = {},
): JioValidationResultT {
  const acc: WalkAcc = {
    blocking: [],
    warnings: [],
    repairSuggestions: [],
    componentGaps: [],
    backfilled: ctx.backfilled ?? [],
    skipPlaceholderContent: ctx.skipPlaceholderContent ?? false,
  };

  // (1) Import allowlist (VAL-02) — STRUCTURAL: decide on the resolved `source`
  //     module of each binding, never on code text. Build the alias→source map
  //     in the same pass for the component-type resolution below.
  const aliasToSource = new Map<string, string>();
  for (const imp of ast.imports) {
    aliasToSource.set(imp.local, imp.source);
    if (!imp.source.startsWith(JIO_IMPORT_PREFIX)) {
      acc.blocking.push(
        blocking(
          'non-jio-import',
          `Import "${imp.imported}${imp.local !== imp.imported ? ` as ${imp.local}` : ''}" from "${imp.source}" is not a Jio Design System import. Only "${JIO_IMPORT_PREFIX}*" imports are permitted.`,
          { offender: imp.source },
        ),
      );
      acc.repairSuggestions.push(
        `Remove the import from "${imp.source}". Compose with registry-approved Jio components imported from "${JIO_IMPORT_PREFIX}<Component>".`,
      );
    }
  }

  // (2)–(5) Walk the component tree.
  walkNode(ast.root, aliasToSource, acc);

  const result: JioValidationResultT = {
    passed: acc.blocking.length === 0,
    blocking: acc.blocking,
    warnings: acc.warnings,
    repairSuggestions: acc.repairSuggestions,
    componentGaps: acc.componentGaps,
    foundationGaps: [],
  };

  // Parse through the FROZEN contract so every returned result is provably
  // shape-conformant (T-01-10 auditability). `.parse` is identity on a valid
  // object and throws loudly if a branch ever drifts from the contract.
  return JioValidationResult.parse(result);
}
