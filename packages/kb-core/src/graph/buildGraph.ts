/**
 * KB graph builder — turns a flat list of component metas into a queryable
 * node/edge graph (the `kb-graph.json` artifact).
 *
 * WHY THIS EXISTS:
 * Every meta already encodes latent relationships — `composition.slots[].accepts`
 * names child components, `tokens.*` names design tokens, `figma.componentKey`
 * binds a design node, `importPath` points at the source impl, and
 * `deprecation.useInstead` points at a replacement. Those edges sit unindexed
 * in the per-component JSON. This builder lifts them into one explicit graph so
 * an AI agent (or an MCP server) can answer "what can go inside a
 * Card?", "what uses the bold surface?", "which JDS component is this Figma
 * key?" by traversing a bounded subgraph — instead of opening + parsing the
 * component source files. Same node/edge + confidence model as a code graph,
 * applied to a design system.
 *
 * SDK-agnostic: kb-rn / kb-web / future kb-ios|android|flutter all call this
 * with their own metas. Pure function, no IO.
 */

/** Accepts tokens that are NOT component references (primitives / wildcard). */
const PRIMITIVE_ACCEPTS = new Set(['*', '#string', '#number', '#node']);

/** Structural shape this builder reads off a component meta. SDK-neutral. */
export interface GraphInputMeta {
  readonly name: string;
  readonly status?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly importPath?: string;
  readonly composition?: {
    readonly childKind?: string;
    readonly slots?: Readonly<
      Record<string, { readonly accepts?: readonly string[]; readonly cardinality?: string; readonly description?: string }>
    >;
    readonly variadic?: { readonly accepts?: readonly string[]; readonly min?: number; readonly max?: number };
  };
  readonly tokens?: Readonly<Record<string, readonly (string | number)[] | undefined>>;
  readonly figma?: { readonly componentKey?: string; readonly variantProperties?: Readonly<Record<string, string>> };
  readonly deprecation?: { readonly useInstead?: string };
}

export type GraphNodeKind = 'component' | 'token' | 'figmaKey' | 'source' | 'external';

export type GraphEdgeKind =
  | 'COMPOSES' // component --(slot/variadic)--> child component
  | 'USES_TOKEN' // component --> design token
  | 'FIGMA_KEY' // figma key --> component (design → code)
  | 'MIRRORS_SOURCE' // component --> source import path (code-of-truth)
  | 'REPLACES'; // deprecated component --> its replacement

/** Edge certainty, mirroring the code-graph 3-tier model. */
export type EdgeConfidence = 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS';

export interface GraphNode {
  readonly id: string;
  readonly kind: GraphNodeKind;
  readonly name: string;
  readonly status?: string;
  readonly tags?: readonly string[];
  readonly description?: string;
  /** Component-only: does a slot accept any component (`*`)? */
  readonly composesAny?: boolean;
  /** Token-only: which family this token belongs to. */
  readonly family?: string;
}

export interface GraphEdge {
  readonly from: string;
  readonly to: string;
  readonly kind: GraphEdgeKind;
  readonly confidence: EdgeConfidence;
  readonly slot?: string;
  readonly cardinality?: string;
  readonly via?: 'slot' | 'variadic';
  readonly min?: number;
  readonly max?: number;
  readonly family?: string;
  readonly variantProperties?: Readonly<Record<string, string>>;
}

export interface KbGraph {
  readonly schemaVersion: string;
  readonly kbVersion: string;
  readonly sdk: string;
  readonly generatedAt: string;
  readonly stats: {
    readonly nodes: number;
    readonly edges: number;
    readonly byNodeKind: Record<string, number>;
    readonly byEdgeKind: Record<string, number>;
  };
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
}

export interface BuildKbGraphOptions {
  readonly sdk: string;
  readonly schemaVersion: string;
  readonly kbVersion: string;
  /** Defaults to a fixed ISO so the artifact is reproducible unless overridden. */
  readonly generatedAt?: string;
}

const componentId = (sdk: string, name: string): string => `${sdk}:component:${name}`;
const tokenId = (family: string, value: string | number): string => `token:${family}:${String(value)}`;
const figmaId = (key: string): string => `figma:${key}`;
const sourceId = (importPath: string): string => `source:${importPath}`;

/**
 * Build the KB graph from a flat list of component metas. Pure + deterministic
 * (stable node/edge ordering, fixed timestamp unless `generatedAt` is passed).
 */
export function buildKbGraph(metas: readonly GraphInputMeta[], opts: BuildKbGraphOptions): KbGraph {
  const { sdk } = opts;
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  const knownComponents = new Set(metas.map((m) => m.name));
  const addNode = (node: GraphNode): void => {
    if (!nodes.has(node.id)) nodes.set(node.id, node);
  };

  for (const meta of metas) {
    const selfId = componentId(sdk, meta.name);
    let composesAny = false;

    // --- COMPOSES edges (slot + variadic accepts → child components) ---
    const emitAccepts = (
      accepts: readonly string[] | undefined,
      extra: { slot?: string; via: 'slot' | 'variadic'; cardinality?: string; min?: number; max?: number },
    ): void => {
      for (const accept of accepts ?? []) {
        if (accept === '*') {
          composesAny = true;
          continue;
        }
        if (PRIMITIVE_ACCEPTS.has(accept)) continue;
        // a concrete component name
        edges.push({
          from: selfId,
          to: componentId(sdk, accept),
          kind: 'COMPOSES',
          confidence: 'EXTRACTED',
          via: extra.via,
          ...(extra.slot ? { slot: extra.slot } : {}),
          ...(extra.cardinality ? { cardinality: extra.cardinality } : {}),
          ...(extra.min != null ? { min: extra.min } : {}),
          ...(extra.max != null ? { max: extra.max } : {}),
        });
      }
    };

    if (meta.composition?.slots) {
      for (const [slotName, spec] of Object.entries(meta.composition.slots)) {
        emitAccepts(spec.accepts, { slot: slotName, via: 'slot', cardinality: spec.cardinality });
      }
    }
    if (meta.composition?.variadic) {
      emitAccepts(meta.composition.variadic.accepts, {
        via: 'variadic',
        min: meta.composition.variadic.min,
        max: meta.composition.variadic.max,
      });
    }

    // --- component node (after composesAny is known) ---
    addNode({
      id: selfId,
      kind: 'component',
      name: meta.name,
      ...(meta.status ? { status: meta.status } : {}),
      ...(meta.tags ? { tags: meta.tags } : {}),
      ...(meta.description ? { description: meta.description } : {}),
      ...(composesAny ? { composesAny: true } : {}),
    });

    // --- USES_TOKEN edges ---
    if (meta.tokens) {
      for (const [family, values] of Object.entries(meta.tokens)) {
        for (const value of values ?? []) {
          const tId = tokenId(family, value);
          addNode({ id: tId, kind: 'token', name: String(value), family });
          edges.push({ from: selfId, to: tId, kind: 'USES_TOKEN', confidence: 'EXTRACTED', family });
        }
      }
    }

    // --- FIGMA_KEY edge (design node → component) ---
    if (meta.figma?.componentKey) {
      const fId = figmaId(meta.figma.componentKey);
      addNode({ id: fId, kind: 'figmaKey', name: meta.figma.componentKey });
      edges.push({
        from: fId,
        to: selfId,
        kind: 'FIGMA_KEY',
        confidence: 'EXTRACTED',
        ...(meta.figma.variantProperties ? { variantProperties: meta.figma.variantProperties } : {}),
      });
    }

    // --- MIRRORS_SOURCE edge (component → impl import path) ---
    if (meta.importPath) {
      const sId = sourceId(meta.importPath);
      addNode({ id: sId, kind: 'source', name: meta.importPath });
      edges.push({ from: selfId, to: sId, kind: 'MIRRORS_SOURCE', confidence: 'EXTRACTED' });
    }

    // --- REPLACES edge (deprecated → replacement) ---
    if (meta.deprecation?.useInstead && knownComponents.has(meta.deprecation.useInstead)) {
      edges.push({
        from: selfId,
        to: componentId(sdk, meta.deprecation.useInstead),
        kind: 'REPLACES',
        confidence: 'EXTRACTED',
      });
    }
  }

  // Ensure no COMPOSES edge dangles: targets that aren't a known JDS component
  // (e.g. RN primitives like `View` named in an `accepts`) become `external`
  // nodes so the graph stays self-consistent.
  for (const e of edges) {
    if (e.kind === 'COMPOSES' && !nodes.has(e.to)) {
      const refName = e.to.slice(e.to.lastIndexOf(':') + 1);
      addNode({ id: e.to, kind: 'external', name: refName });
    }
  }

  // Stable ordering: nodes by id, edges by (from, kind, to).
  const nodeList = [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id));
  const edgeList = edges.sort(
    (a, b) => a.from.localeCompare(b.from) || a.kind.localeCompare(b.kind) || a.to.localeCompare(b.to),
  );

  const byNodeKind: Record<string, number> = {};
  for (const n of nodeList) byNodeKind[n.kind] = (byNodeKind[n.kind] ?? 0) + 1;
  const byEdgeKind: Record<string, number> = {};
  for (const e of edgeList) byEdgeKind[e.kind] = (byEdgeKind[e.kind] ?? 0) + 1;

  return {
    schemaVersion: opts.schemaVersion,
    kbVersion: opts.kbVersion,
    sdk,
    generatedAt: opts.generatedAt ?? '1970-01-01T00:00:00.000Z',
    stats: { nodes: nodeList.length, edges: edgeList.length, byNodeKind, byEdgeKind },
    nodes: nodeList,
    edges: edgeList,
  };
}
