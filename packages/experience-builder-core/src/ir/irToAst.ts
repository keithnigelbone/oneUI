/**
 * irToAst.ts
 *
 * Pure function: Jio Experience IR → `ASTRoot` of ComponentASTNode/TextASTNode.
 * No React dependency — runs in Node, browser, or worker (mirrors the
 * `@oneui/shared` astToReact module convention).
 *
 * THE ENFORCEMENT (IR-03 / T-01-02 / Pitfall 2): the recursive node builder
 * has NO `element` case. It emits ONLY `kind: 'component'` and `kind: 'text'`
 * nodes. Layout sections/primitives in the IR are already registry component
 * instances (Surface, Container, Stack, …), so they map straight to
 * ComponentASTNodes — a raw HTML tag can never appear because the IR has no
 * channel to express one and this mapper has no branch to emit one.
 *
 * Types are imported (type-only) from `@oneui/shared`; no runtime dep.
 */

import type {
  ASTRoot,
  ASTNode,
  ComponentASTNode,
  TextASTNode,
  ASTSerializableValue,
} from '@oneui/shared/types/componentAST';
import type {
  JioExperienceIRT,
  JioIRComponentInstanceT,
  JioIRLayoutNodeT,
  SlotValueT,
  IRPropValueT,
} from './schema';

export interface IrToAstOptions {
  /** Name for the produced ASTRoot (defaults to the artifact type). */
  name?: string;
}

let _counter = 0;
function nextId(prefix: string): string {
  _counter += 1;
  return `${prefix}-${_counter}`;
}

/** IR prop values are already JSON-compatible — pass through to AST values. */
function toAstProps(
  props: Record<string, IRPropValueT> | undefined,
): Record<string, ASTSerializableValue> {
  return (props ?? {}) as Record<string, ASTSerializableValue>;
}

/**
 * (AGENT-04 / D-06c) The IR node identity that the canvas cursor overlay needs
 * is the node's existing stable `id` field — every ComponentASTNode this mapper
 * emits already carries it (`instance.id` / `section.id` / the layout `node.id`).
 *
 * That id is therefore NOT stamped into the compiled prop bag here. Stamping a
 * `data-ir-node-id` prop would pollute two consumers of this same compiled AST:
 * the codegen export (`astToReactComponent` would emit `<Container
 * data-ir-node-id=…>` into shippable artifact code — canvas instrumentation has
 * no business in exported artifacts) and the validation contract (`validateAst`
 * rejects the unknown prop as `invalid-prop`, short-circuiting every
 * generate→compile→validate workflow to `gap`).
 *
 * The live-preview path stamps `data-ir-node-id={node.id}` at RENDER time
 * instead (`ASTRenderer`), reading this same id field — so the preview DOM still
 * gets the attribute for the rect reporter while the compiled AST, codegen, and
 * validation stay clean. The markup-free invariant is unaffected: nodes stay
 * `kind:'component'`, never `element`.
 */

/**
 * Build the children AST nodes for an instance's slots. A slot is either a
 * string (→ TextASTNode) or an array of nested instances (→ ComponentASTNodes).
 * NO `element` node is ever produced.
 */
function buildSlotChildren(slots: Record<string, SlotValueT> | undefined): ASTNode[] {
  if (!slots) return [];
  const children: ASTNode[] = [];
  for (const value of Object.values(slots)) {
    if (typeof value === 'string') {
      const textNode: TextASTNode = {
        id: nextId('text'),
        kind: 'text',
        text: value,
      };
      children.push(textNode);
    } else {
      for (const instance of value) {
        children.push(instanceToComponentNode(instance));
      }
    }
  }
  return children;
}

/** Map a single IR component instance → a ComponentASTNode (never element). */
function instanceToComponentNode(instance: JioIRComponentInstanceT): ComponentASTNode {
  return {
    id: instance.id,
    kind: 'component',
    type: instance.type,
    // AGENT-04: the node `id` above is the canvas overlay identity; it is stamped
    // as data-ir-node-id at RENDER time (ASTRenderer), never into the prop bag.
    props: toAstProps(instance.props),
    children: buildSlotChildren(instance.slots),
  };
}

/**
 * Map the IR `justify` enum to Container's CSS-flavoured `justify` vocabulary.
 * The IR uses the short `between`/`around` tokens; Container expects the
 * `space-*` forms (Container.shared.ts mapJustifyCss). All other values pass
 * through unchanged.
 */
function mapIrJustify(j: NonNullable<JioIRLayoutNodeT['justify']>): string {
  if (j === 'between') return 'space-between';
  if (j === 'around') return 'space-around';
  return j;
}

/**
 * Compile a layout primitive node → a real Jio `Container`/`Grid`
 * ComponentASTNode (LAYOUT-05 / D-01). The primitive vocabulary is an IR concept
 * that MAPS ONTO Container/Grid — we NEVER emit an invented Stack/Row/Spacer
 * component nor a raw `element` node. Children recurse: nested layout nodes via
 * this function, leaf instances via `instanceToComponentNode`.
 */
function layoutNodeToComponentNode(node: JioIRLayoutNodeT): ComponentASTNode {
  // A node carrying `columns` is a grid regardless of its primitive label. The model
  // sometimes tags a multi-column section as 'stack'/'row'; routing that to Container
  // would silently DROP the columns (Container only grids on a numeric `columns` and
  // its flex layout ignores the prop entirely), collapsing the grid. Any column-bearing
  // node therefore compiles to the Grid component, which handles responsive columns.
  const isGrid = node.primitive === 'grid' || node.columns !== undefined;
  const type = isGrid ? 'Grid' : 'Container';
  const props: Record<string, ASTSerializableValue> = {};

  if (!isGrid && node.primitive === 'stack') {
    props.layout = 'flex';
    props.direction = node.direction ?? 'column';
  }
  if (!isGrid && (node.primitive === 'row' || node.primitive === 'cluster')) {
    props.layout = 'flex';
    props.direction = node.direction ?? 'row';
    if (node.wrap ?? node.primitive === 'cluster') props.wrap = true;
  }
  // `spacer` is a childless Container that only reserves space via its gap token.
  if (node.gap !== undefined) props.gap = node.gap as ASTSerializableValue;
  if (node.padding !== undefined) props.padding = node.padding as ASTSerializableValue;
  if (node.columns !== undefined) props.columns = node.columns as ASTSerializableValue;
  if (node.align) props.align = node.align;
  if (node.justify) props.justify = mapIrJustify(node.justify);
  if (node.wrap !== undefined && props.wrap === undefined) props.wrap = node.wrap;
  if (node.surfaceMode) props.surfaceMode = node.surfaceMode;

  const nodeId = node.id ?? nextId('layout');
  return {
    id: nodeId,
    kind: 'component',
    type,
    // AGENT-04: the node `id` is the canvas overlay identity; stamped as
    // data-ir-node-id at RENDER time (ASTRenderer), never into the prop bag.
    props,
    children: node.children.map((c) =>
      isLayoutNode(c) ? layoutNodeToComponentNode(c) : instanceToComponentNode(c),
    ),
  };
}

/** Discriminate a layout child from a registry instance (instances have no `kind`). */
function isLayoutNode(
  child: JioIRLayoutNodeT | JioIRComponentInstanceT,
): child is JioIRLayoutNodeT {
  return (child as { kind?: unknown }).kind === 'layout';
}

/**
 * Map the full IR → an ASTRoot. Sections become a single registry layout
 * component ('Container') wrapping their instances — a named registry
 * component, never a raw tag. The root is a 'Container' registry component
 * holding the sections.
 */
export function irToAst(ir: JioExperienceIRT, options: IrToAstOptions = {}): ASTRoot {
  _counter = 0;

  const sectionNodes: ComponentASTNode[] = ir.sections.map((section) => {
    // (LAYOUT-05) When a section carries an additive compositional `layout`
    // tree, compile it into real Container/Grid nodes. Otherwise fall back to a
    // registered `Container` (vertical stack) wrapping the section's instances —
    // so a section the model returns WITHOUT an explicit `layout` field (and any
    // pre-04.2 flat IR) still compiles to a real Jio component that passes the
    // allowlist validator. Emitting an unregistered `Stack` here was a regression
    // (WR-02): the IR generator does not reliably attach `layout` to every
    // section, so the `Stack` fallback hard-blocked every such run as an
    // `unregistered-component`. `Container` mirrors what a `stack` layout
    // primitive compiles to (`layoutNodeToComponentNode`) and the artifact root.
    if (section.layout) {
      const layoutRoot = layoutNodeToComponentNode(section.layout);
      // Anchor the compiled tree to the section id + section surfaceMode so the
      // section identity survives compile. The section id IS the node's id (the
      // id the agentTrace records sections under, and what the render-time
      // data-ir-node-id stamp reads); no prop-bag mutation needed.
      layoutRoot.id = section.id;
      if (section.surfaceMode && layoutRoot.props.surfaceMode === undefined) {
        layoutRoot.props.surfaceMode = section.surfaceMode;
      }
      return layoutRoot;
    }

    // Fallback: a vertical `Container` (registered) — never an unregistered
    // `Stack`. Matches the `stack` primitive's compile output and the root.
    const props: Record<string, ASTSerializableValue> = { layout: 'flex', direction: 'column' };
    if (section.surfaceMode) props.surfaceMode = section.surfaceMode;
    return {
      id: section.id,
      kind: 'component',
      // Layout primitive → registry component, NOT an HTML tag.
      type: 'Container',
      // AGENT-04: section id is the node id; stamped as data-ir-node-id at
      // render time (ASTRenderer), never into the prop bag.
      props,
      children: section.instances.map(instanceToComponentNode),
    };
  });

  const root: ComponentASTNode = {
    id: 'exp-root',
    kind: 'component',
    type: 'Container',
    // The artifact root is a vertical stack of sections. Its `id` ('exp-root')
    // is the canvas overlay identity; stamped as data-ir-node-id at render time.
    props: { layout: 'flex', direction: 'column' },
    children: sectionNodes,
  };

  return {
    version: 1,
    name: options.name ?? ir.artifactType,
    root,
    surfaceMode: ir.sections[0]?.surfaceMode,
  };
}

/** Walk an ASTRoot collecting every node's `kind` — test/assertion helper. */
export function collectNodeKinds(root: ASTRoot): string[] {
  const kinds: string[] = [];
  const visit = (node: ASTNode): void => {
    kinds.push(node.kind);
    if (node.kind === 'component') {
      node.children.forEach(visit);
    }
  };
  visit(root.root);
  return kinds;
}
