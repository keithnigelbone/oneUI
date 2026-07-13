/**
 * componentSchemas.ts
 *
 * Central registry for per-component Zod prop schemas, plus helpers to expose
 * them as JSON Schema (for LLM structured outputs) and as runtime validators
 * for the canvas AST.
 *
 * Schemas come from two sources:
 *
 *   1. Hand-curated, generator-backed schemas for alpha components.
 *      These are imported eagerly and registered at module load so consumers
 *      that only pull the `@oneui/shared` package still see a working
 *      validator for Button.
 *
 *   2. Runtime-registered schemas derived from `ComponentMeta.props` via
 *      `deriveSchemaFromMeta`. The `@oneui/ui` package walks its
 *      `COMPONENT_META_REGISTRY` and calls `registerComponentPropsSchema` for
 *      each entry on import. Consumers that need full coverage (API routes,
 *      build-time docs scripts, the canvas validator) import from
 *      `@oneui/ui/registry` which transitively loads the schemas.
 *
 * Every Storybook component is covered — either by a generator output for the
 * Jio web alpha set or by a derived schema from its `*.meta.ts` file.
 */

import { z } from 'zod';
import type { ASTRoot, ASTNode } from '../types/componentAST';
import type { ComponentMeta, PropDescriptor } from '../types/componentMeta';
import { AVATAR_PROPS_SCHEMA } from './generated/Avatar.generated';
import { BADGE_PROPS_SCHEMA } from './generated/Badge.generated';
import { BOTTOM_NAVIGATION_PROPS_SCHEMA } from './generated/BottomNavigation.generated';
import { BUTTON_PROPS_SCHEMA } from './generated/Button.generated';
import { CHECKBOX_PROPS_SCHEMA } from './generated/Checkbox.generated';
import { CHIP_PROPS_SCHEMA } from './generated/Chip.generated';
import { CHIP_GROUP_PROPS_SCHEMA } from './generated/ChipGroup.generated';
import { COUNTER_BADGE_PROPS_SCHEMA } from './generated/CounterBadge.generated';
import { DIVIDER_PROPS_SCHEMA } from './generated/Divider.generated';
import { FAB_PROPS_SCHEMA } from './generated/FAB.generated';
import { ICON_PROPS_SCHEMA } from './generated/Icon.generated';
import { ICON_BUTTON_PROPS_SCHEMA } from './generated/IconButton.generated';
import { IMAGE_PROPS_SCHEMA } from './generated/Image.generated';
import { INDICATOR_BADGE_PROPS_SCHEMA } from './generated/IndicatorBadge.generated';
import { INPUT_FIELD_PROPS_SCHEMA } from './generated/InputField.generated';
import { LIST_ITEM_PROPS_SCHEMA } from './generated/ListItem.generated';
import { LIST_ITEM_GROUP_PROPS_SCHEMA } from './generated/ListItemGroup.generated';
import { LOGO_PROPS_SCHEMA } from './generated/Logo.generated';
import { PAGINATION_DOTS_PROPS_SCHEMA } from './generated/PaginationDots.generated';
import { RADIO_PROPS_SCHEMA } from './generated/Radio.generated';
import { SLIDER_PROPS_SCHEMA } from './generated/Slider.generated';
import { SPINNER_PROPS_SCHEMA } from './generated/Spinner.generated';
import { STEPPER_PROPS_SCHEMA } from './generated/Stepper.generated';
import { SWITCH_PROPS_SCHEMA } from './generated/Switch.generated';
import { TABS_PROPS_SCHEMA } from './generated/Tabs.generated';
import { TOOLTIP_PROPS_SCHEMA } from './generated/Tooltip.generated';
import { WEB_HEADER_PROPS_SCHEMA } from './generated/WebHeader.generated';

// ---------------------------------------------------------------------------
// Per-component schema registry
// ---------------------------------------------------------------------------

/**
 * Live map of PascalCase component name → Zod schema for its props.
 *
 * Seeded with generator-backed schemas. Populated further at runtime by
 * `registerComponentPropsSchema`. Treat as read-only outside of
 * registration helpers.
 */
export const COMPONENT_PROPS_SCHEMAS: Record<string, z.ZodType> = {
  Avatar: AVATAR_PROPS_SCHEMA,
  Badge: BADGE_PROPS_SCHEMA,
  BottomNavigation: BOTTOM_NAVIGATION_PROPS_SCHEMA,
  Button: BUTTON_PROPS_SCHEMA,
  Checkbox: CHECKBOX_PROPS_SCHEMA,
  Chip: CHIP_PROPS_SCHEMA,
  ChipGroup: CHIP_GROUP_PROPS_SCHEMA,
  CounterBadge: COUNTER_BADGE_PROPS_SCHEMA,
  Divider: DIVIDER_PROPS_SCHEMA,
  FAB: FAB_PROPS_SCHEMA,
  Icon: ICON_PROPS_SCHEMA,
  IconButton: ICON_BUTTON_PROPS_SCHEMA,
  Image: IMAGE_PROPS_SCHEMA,
  IndicatorBadge: INDICATOR_BADGE_PROPS_SCHEMA,
  InputField: INPUT_FIELD_PROPS_SCHEMA,
  ListItem: LIST_ITEM_PROPS_SCHEMA,
  ListItemGroup: LIST_ITEM_GROUP_PROPS_SCHEMA,
  Logo: LOGO_PROPS_SCHEMA,
  PaginationDots: PAGINATION_DOTS_PROPS_SCHEMA,
  Radio: RADIO_PROPS_SCHEMA,
  Slider: SLIDER_PROPS_SCHEMA,
  Spinner: SPINNER_PROPS_SCHEMA,
  Stepper: STEPPER_PROPS_SCHEMA,
  Switch: SWITCH_PROPS_SCHEMA,
  Tabs: TABS_PROPS_SCHEMA,
  Tooltip: TOOLTIP_PROPS_SCHEMA,
  WebHeader: WEB_HEADER_PROPS_SCHEMA,
};

/**
 * Register (or replace) a component's props schema at runtime.
 *
 * Intended for use by `@oneui/ui/registry/registerSchemas.ts`, which walks
 * the meta registry on import. Generator-backed entries take precedence —
 * a derived schema is only installed if no schema exists for that name yet.
 */
export function registerComponentPropsSchema(
  name: string,
  schema: z.ZodType,
  options?: { overwrite?: boolean },
): void {
  if (!options?.overwrite && name in COMPONENT_PROPS_SCHEMAS) return;
  COMPONENT_PROPS_SCHEMAS[name] = schema;
}

/** Union of every registered component name — updated as schemas are registered. */
export type RegisteredComponentName = string;

export function getComponentPropsSchema(name: string): z.ZodType | undefined {
  return COMPONENT_PROPS_SCHEMAS[name];
}

// ---------------------------------------------------------------------------
// Derive a Zod schema from a ComponentMeta's PropDescriptor[]
// ---------------------------------------------------------------------------

function flattenedEnumLiteralOptions(
  prop: PropDescriptor,
): ReadonlyArray<string | number | boolean> {
  const obd = prop.optionsByDiscriminator;
  if (!obd) return prop.options ?? [];
  const seen = new Set<string | number | boolean>();
  const out: (string | number | boolean)[] = [];
  for (const arr of Object.values(obd.options)) {
    for (const v of arr) {
      if (!seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    }
  }
  return out;
}

function descriptorToZod(prop: PropDescriptor): z.ZodType {
  switch (prop.type) {
    case 'string':
      return z.string();
    case 'number':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'enum': {
      const opts = flattenedEnumLiteralOptions(prop) as ReadonlyArray<string | number | boolean>;
      if (opts.length === 0) return z.unknown();
      if (opts.length === 1) return z.literal(opts[0] as string | number | boolean);
      const literals = opts.map((v) => z.literal(v as string | number | boolean));
      // z.union requires >=2 members; guarded above.
      return z.union(literals as unknown as [z.ZodType, z.ZodType, ...z.ZodType[]]);
    }
    case 'ReactNode':
      // ReactNode round-trips as string/number/array/node via JSON; validate loosely.
      return z.unknown();
    case 'function':
      // Callbacks don't round-trip meaningfully from JSON. Accept any.
      return z.any();
    case 'object':
      return z.unknown();
    default:
      return z.unknown();
  }
}

/**
 * Build a strict Zod object schema from a ComponentMeta.
 *
 * Every listed prop becomes an optional field unless `required: true` is set
 * on the descriptor. Unknown props are rejected (`.strict()`) so the schema
 * is safe for LLM structured-output validation.
 */
export function deriveSchemaFromMeta(meta: ComponentMeta): z.ZodType {
  const shape: Record<string, z.ZodType> = {};
  for (const prop of meta.props) {
    if (prop.deprecated) continue;
    const base = descriptorToZod(prop);
    shape[prop.name] = prop.required ? base : base.optional();
  }
  return z.object(shape).strict();
}

// ---------------------------------------------------------------------------
// AST node schema — the shape an LLM must emit
// ---------------------------------------------------------------------------

/**
 * A single rendered component in a DCA canvas tree.
 *
 * Uses a recursive shape so components can nest via `children`. The `props`
 * field is validated against the per-component schema in a second pass (after
 * structural parse) — keeping the top-level schema simple enough for current
 * LLM structured-output tooling to emit reliably.
 */
export interface ComponentNode {
  type: string;
  props?: Record<string, unknown>;
  children?: ComponentNode[];
}

export const COMPONENT_NODE_SCHEMA: z.ZodType<ComponentNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    props: z.record(z.string(), z.unknown()).optional(),
    children: z.array(COMPONENT_NODE_SCHEMA).optional(),
  }),
);

export const CANVAS_RESPONSE_SCHEMA = z.object({
  nodes: z.array(COMPONENT_NODE_SCHEMA),
});

export type CanvasResponse = z.infer<typeof CANVAS_RESPONSE_SCHEMA>;

// ---------------------------------------------------------------------------
// Second-pass validation: component props against generated schemas
// ---------------------------------------------------------------------------

export interface NodeValidationError {
  path: string;
  type: string;
  issues: string[];
}

/**
 * Walk a canvas response and validate each node's `props` against the
 * corresponding component schema. Returns an empty array on success.
 */
export function validateCanvasResponse(response: CanvasResponse): NodeValidationError[] {
  const errors: NodeValidationError[] = [];
  walkNodes(response.nodes, '$', errors);
  return errors;
}

function walkNodes(nodes: ComponentNode[], pathPrefix: string, errors: NodeValidationError[]): void {
  nodes.forEach((node, index) => {
    const path = `${pathPrefix}.nodes[${index}]`;
    const schema = getComponentPropsSchema(node.type);
    if (schema) {
      const result = schema.safeParse(node.props ?? {});
      if (!result.success) {
        errors.push({
          path,
          type: node.type,
          issues: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
        });
      }
    }
    if (node.children && node.children.length > 0) {
      walkNodes(node.children, `${path}.children`, errors);
    }
  });
}

// ---------------------------------------------------------------------------
// JSON Schema export — for LLM providers that accept JSON Schema (OpenAI etc.)
// ---------------------------------------------------------------------------

/**
 * Return the JSON Schema representation of a component's props schema.
 * Zod v4 ships `z.toJSONSchema` natively.
 */
export function getComponentSchemaJSON(name: string): unknown {
  const schema = getComponentPropsSchema(name);
  if (!schema) return undefined;
  return z.toJSONSchema(schema);
}

export function getAllComponentSchemasJSON(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const name of Object.keys(COMPONENT_PROPS_SCHEMAS)) {
    out[name] = z.toJSONSchema(COMPONENT_PROPS_SCHEMAS[name]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// AST validation — walks the canonical ASTRoot tree used by the canvas
// ---------------------------------------------------------------------------

/**
 * Walk an ASTRoot and validate every ComponentASTNode's `props` against the
 * registered schema for its component type. Element and text nodes are
 * skipped. Unknown component types produce no error (forward-compat).
 */
export function validateASTComponentProps(ast: ASTRoot): NodeValidationError[] {
  const errors: NodeValidationError[] = [];
  walkAST(ast.root, 'root', errors);
  return errors;
}

function walkAST(node: ASTNode, path: string, errors: NodeValidationError[]): void {
  if (node.kind === 'component') {
    const schema = getComponentPropsSchema(node.type);
    if (schema) {
      const result = schema.safeParse(node.props ?? {});
      if (!result.success) {
        errors.push({
          path,
          type: node.type,
          issues: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
        });
      }
    }
  }
  if (node.kind === 'component' || node.kind === 'element') {
    const children = Array.isArray(node.children) ? node.children : [];
    children.forEach((child, i) => {
      walkAST(child, `${path} > ${node.kind === 'component' ? node.type : node.tag}[${i}]`, errors);
    });
  }
}
