/**
 * CompositionSpec bridges.
 *
 * IR remains available for migration, validation provenance, and existing
 * persistence. CompositionSpec is the live-canvas canonical artifact and can be
 * converted to the existing component-only AST renderer without introducing an
 * element/markup branch.
 */

import type {
  ASTNode,
  ASTRoot,
  ASTSerializableValue,
  ComponentASTNode,
  TextASTNode,
} from '@oneui/shared/types/componentAST';
import type {
  JioExperienceIRT,
  JioIRComponentInstanceT,
  JioIRLayoutNodeT,
  IRPropValueT,
  SlotValueT,
} from '../ir/schema';
import type {
  CompositionNodeT,
  CompositionPropValueT,
  CompositionSlotValueT,
  CompositionSpecT,
  CompositionSurfaceModeT,
} from './schema';

const SURFACE_ALIASES: Record<string, CompositionSurfaceModeT> = {
  'fg-bold': 'bold',
  'bg-bold': 'bold',
  'fg-subtle': 'subtle',
  'bg-subtle': 'subtle',
  'fg-minimal': 'minimal',
  'bg-minimal': 'minimal',
};

const SURFACE_MODES = new Set<string>([
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
]);

let textCounter = 0;
function nextTextId(prefix: string): string {
  textCounter += 1;
  return `${prefix}-${textCounter}`;
}

function normalizeSurfaceMode(value: unknown): CompositionSurfaceModeT | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const canonical = SURFACE_ALIASES[trimmed] ?? trimmed;
  return SURFACE_MODES.has(canonical) ? (canonical as CompositionSurfaceModeT) : undefined;
}

function toSpecProps(
  props: Record<string, IRPropValueT> | undefined,
  component: string,
): Record<string, CompositionPropValueT> | undefined {
  if (!props) return undefined;
  const next: Record<string, CompositionPropValueT> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class' || key === 'className' || key === 'style') continue;
    if (key === 'children') continue;
    if (component === 'Surface' && key === 'mode') continue;
    if (component === 'Surface' && key === 'surface') continue;
    if (component === 'Surface' && key === 'surfaceMode') continue;
    next[key] = value as CompositionPropValueT;
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

function slotsToSpecSlots(
  slots: Record<string, SlotValueT> | undefined,
  fallbackSurface?: CompositionSurfaceModeT,
): Record<string, CompositionSlotValueT> | undefined {
  if (!slots) return undefined;
  const next: Record<string, CompositionSlotValueT> = {};
  for (const [slotName, value] of Object.entries(slots)) {
    next[slotName] =
      typeof value === 'string'
        ? value
        : value.map((instance) => instanceToSpecNode(instance, fallbackSurface));
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

function instanceToSpecNode(
  instance: JioIRComponentInstanceT,
  fallbackSurface?: CompositionSurfaceModeT,
): CompositionNodeT {
  const propSurface =
    instance.type === 'Surface'
      ? normalizeSurfaceMode(instance.props?.mode) ??
        normalizeSurfaceMode(instance.props?.surface) ??
        normalizeSurfaceMode(instance.props?.surfaceMode)
      : undefined;
  const surface =
    normalizeSurfaceMode(instance.surfaceMode) ??
    propSurface ??
    (instance.type === 'Surface' ? fallbackSurface : undefined);
  const slots = slotsToSpecSlots(instance.slots, surface ?? fallbackSurface) ?? {};
  const propChildren = instance.props?.children;
  if (typeof propChildren === 'string' && slots.children === undefined) {
    slots.children = propChildren;
  }
  const node: CompositionNodeT = {
    id: instance.id,
    component: instance.type,
  };
  const props = toSpecProps(instance.props, instance.type);
  if (props) node.props = props;
  if (Object.keys(slots).length > 0) node.slots = slots;
  if (surface) node.surface = surface;
  return node;
}

function mapIrJustify(j: NonNullable<JioIRLayoutNodeT['justify']>): string {
  if (j === 'between') return 'space-between';
  if (j === 'around') return 'space-around';
  return j;
}

function isLayoutNode(
  child: JioIRLayoutNodeT | JioIRComponentInstanceT,
): child is JioIRLayoutNodeT {
  return (child as { kind?: unknown }).kind === 'layout';
}

function layoutToSpecNode(
  node: JioIRLayoutNodeT,
  fallbackSurface?: CompositionSurfaceModeT,
): CompositionNodeT {
  const props: Record<string, CompositionPropValueT> = {};
  if (node.primitive === 'stack') {
    props.layout = 'flex';
    props.direction = node.direction ?? 'column';
  }
  if (node.primitive === 'row' || node.primitive === 'cluster') {
    props.layout = 'flex';
    props.direction = node.direction ?? 'row';
    if (node.wrap ?? node.primitive === 'cluster') props.wrap = true;
  }
  if (node.gap !== undefined) props.gap = node.gap as CompositionPropValueT;
  if (node.padding !== undefined) props.padding = node.padding as CompositionPropValueT;
  if (node.columns !== undefined) props.columns = node.columns as CompositionPropValueT;
  if (node.align) props.align = node.align;
  if (node.justify) props.justify = mapIrJustify(node.justify);
  if (node.wrap !== undefined && props.wrap === undefined) props.wrap = node.wrap;

  const surface = normalizeSurfaceMode(node.surfaceMode) ?? fallbackSurface;
  return {
    id: node.id ?? nextTextId('layout'),
    component: node.primitive === 'grid' ? 'Grid' : 'Container',
    ...(Object.keys(props).length > 0 ? { props } : {}),
    ...(surface ? { surface } : {}),
    slots: {
      children: node.children.map((child) =>
        isLayoutNode(child)
          ? layoutToSpecNode(child, surface)
          : instanceToSpecNode(child, surface),
      ),
    },
  };
}

export interface IrToCompositionSpecOptions {
  name?: string;
  intent?: string;
  density?: 'compact' | 'default' | 'open';
  platform?: string;
}

export function irToCompositionSpec(
  ir: JioExperienceIRT,
  options: IrToCompositionSpecOptions = {},
): CompositionSpecT {
  textCounter = 0;

  const sectionNodes = ir.sections.map<CompositionNodeT>((section) => {
    const sectionSurface = normalizeSurfaceMode(section.surfaceMode);
    if (section.layout) {
      const layout = layoutToSpecNode(section.layout, sectionSurface);
      layout.id = section.id;
      if (sectionSurface && !layout.surface) layout.surface = sectionSurface;
      return layout;
    }

    return {
      id: section.id,
      component: 'Container',
      props: { layout: 'flex', direction: 'column' },
      ...(sectionSurface ? { surface: sectionSurface } : {}),
      slots: {
        children: section.instances.map((instance) => instanceToSpecNode(instance, sectionSurface)),
      },
    };
  });

  return {
    version: '1',
    name: options.name ?? ir.artifactType,
    artifactType: ir.artifactType,
    targetProfile: ir.targetProfile,
    brandId: ir.brandId,
    foundationRefs: ir.foundationRefs,
    ...(options.density ? { density: options.density } : {}),
    ...(options.platform ? { platform: options.platform } : {}),
    ...(options.intent ? { intent: options.intent } : {}),
    root: {
      id: 'composition-root',
      component: 'Container',
      props: { layout: 'flex', direction: 'column' },
      slots: { children: sectionNodes },
    },
    content: ir.content,
  };
}

function textToAst(text: string): TextASTNode {
  return {
    id: nextTextId('text'),
    kind: 'text',
    text,
  };
}

function slotValueToAstNodes(value: CompositionSlotValueT): ASTNode[] {
  if (typeof value === 'string') return [textToAst(value)];
  return value.map((node) => compositionNodeToAst(node));
}

function slotValueToAstProp(value: CompositionSlotValueT): ASTSerializableValue {
  if (typeof value === 'string') return value;
  if (value.length === 1) return compositionNodeToAst(value[0]) as unknown as ASTSerializableValue;
  return value.map((node) => compositionNodeToAst(node)) as unknown as ASTSerializableValue;
}

function compositionNodeToAst(node: CompositionNodeT): ComponentASTNode {
  const props: Record<string, ASTSerializableValue> = {
    ...((node.props ?? {}) as Record<string, ASTSerializableValue>),
  };
  if (node.surface) {
    if (node.component === 'Surface' && props.mode === undefined) {
      props.mode = node.surface;
    } else if (node.component === 'Container' && props.surface === undefined) {
      props.surface = node.surface;
    }
  }

  const children: ASTNode[] = [];
  for (const [slotName, slotValue] of Object.entries(node.slots ?? {})) {
    if (slotName === 'children') {
      children.push(...slotValueToAstNodes(slotValue));
    } else {
      props[slotName] = slotValueToAstProp(slotValue);
    }
  }

  return {
    id: node.id,
    kind: 'component',
    type: node.component,
    props,
    children,
  };
}

export function compositionSpecToAst(spec: CompositionSpecT): ASTRoot {
  textCounter = 0;
  return {
    version: 1,
    name: spec.name ?? spec.artifactType ?? 'composition',
    root: compositionNodeToAst(spec.root),
    surfaceMode: spec.root.surface,
    metadata: {
      brandId: spec.brandId,
      ...(spec.artifactType ? { artifactType: spec.artifactType } : {}),
      ...(spec.targetProfile ? { targetProfile: spec.targetProfile } : {}),
      compositionSpecVersion: spec.version,
    },
  };
}

export function collectCompositionComponents(spec: CompositionSpecT): string[] {
  const components: string[] = [];
  const visit = (node: CompositionNodeT): void => {
    components.push(node.component);
    for (const slot of Object.values(node.slots ?? {})) {
      if (typeof slot !== 'string') slot.forEach(visit);
    }
  };
  visit(spec.root);
  return components;
}
