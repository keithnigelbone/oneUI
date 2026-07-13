/**
 * useCanvasEditor.ts
 *
 * Editor state management for the experience canvas.
 * Bridges tldraw's editor instance with our AST/ComponentMeta system.
 */

import type { Editor } from 'tldraw';
import type { ComponentMeta, PropDescriptor, ASTRoot, ASTNode } from '@oneui/shared';
import { getEffectiveEnumOptions } from '@oneui/shared';
import { COMPONENT_REGISTRY } from '@oneui/ui-internal/registry/componentRegistry';
import { COMPONENT_SHAPE_TYPE, type ComponentShape } from './ComponentShape';
import { sanitizeComponentPropsForTldraw } from './canvasHelpers';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isComponentShape(shape: any): shape is ComponentShape {
  return shape?.type === COMPONENT_SHAPE_TYPE;
}

function getComponentShapes(editor: Editor): ComponentShape[] {
  return (editor.getCurrentPageShapes() as any[]).filter(isComponentShape);
}

// ---------------------------------------------------------------------------
// Selection state
// ---------------------------------------------------------------------------

export interface SelectedComponentInfo {
  shapeId: string;
  componentType: string;
  props: Record<string, unknown>;
  childText: string;
  meta: ComponentMeta | null;
}

export function getSelectedComponentInfo(editor: Editor): SelectedComponentInfo | null {
  const selectedIds = editor.getSelectedShapeIds();
  if (selectedIds.length !== 1) return null;

  const shape = editor.getShape(selectedIds[0]) as any;
  if (!isComponentShape(shape)) return null;

  const entry = COMPONENT_REGISTRY[shape.props.componentType];

  return {
    shapeId: shape.id,
    componentType: shape.props.componentType,
    props: shape.props.componentProps as Record<string, unknown>,
    childText: shape.props.childText,
    meta: entry?.meta ?? null,
  };
}

// ---------------------------------------------------------------------------
// Prop editing
// ---------------------------------------------------------------------------

export function updateShapeProp(
  editor: Editor,
  shapeId: string,
  propName: string,
  value: unknown,
) {
  const shape = editor.getShape(shapeId as any) as any;
  if (!isComponentShape(shape)) return;

  const prevProps = shape.props.componentProps as Record<string, unknown>;
  const nextProps = sanitizeComponentPropsForTldraw({
    ...prevProps,
    [propName]: value,
  });

  const isRibbon = shape.props.componentType === 'JioRibbon';
  const isContentBlock = shape.props.componentType === 'ContentBlock';
  const isDimensionProp = propName === 'canvasWidth' || propName === 'canvasHeight';

  if ((isRibbon || isContentBlock) && isDimensionProp) {
    const newW = Number(nextProps.canvasWidth ?? shape.props.w);
    const newH = Number(nextProps.canvasHeight ?? shape.props.h);

    if (newW > 0 && newH > 0) {
      editor.updateShape({
        id: shapeId as any,
        type: COMPONENT_SHAPE_TYPE as any,
        props: { w: newW, h: newH, componentProps: nextProps },
      } as any);

      // Resize parent frame to match
      const parentId = shape.parentId;
      if (parentId) {
        const parent = editor.getShape(parentId as any) as any;
        if (parent?.type === 'frame') {
          editor.updateShape({
            id: parent.id,
            type: 'frame',
            props: { w: newW, h: newH },
          } as any);
        }
      }
      return;
    }
  }

  editor.updateShape({
    id: shapeId as any,
    type: COMPONENT_SHAPE_TYPE as any,
    props: { componentProps: nextProps },
  } as any);
}

export function updateShapeChildText(
  editor: Editor,
  shapeId: string,
  text: string,
) {
  editor.updateShape({
    id: shapeId as any,
    type: COMPONENT_SHAPE_TYPE as any,
    props: { childText: text },
  } as any);
}

// ---------------------------------------------------------------------------
// AST export — preserves artboard/frame hierarchy
// ---------------------------------------------------------------------------

function shapeToASTNode(shape: ComponentShape): ASTNode {
  return {
    id: shape.id,
    kind: 'component' as const,
    type: shape.props.componentType,
    props: shape.props.componentProps as Record<string, any>,
    children: shape.props.childText
      ? [{ id: `${shape.id}-text`, kind: 'text' as const, text: shape.props.childText }]
      : [],
  };
}

export function canvasToAST(editor: Editor): ASTRoot {
  const allShapes = editor.getCurrentPageShapes() as any[];
  const frames = allShapes.filter((s) => s.type === 'frame');
  const componentShapes = allShapes.filter(isComponentShape);

  // If there are frames, group components by their parent frame
  if (frames.length > 0) {
    const frameNodes: ASTNode[] = frames.map((frame) => {
      // Find component shapes that are children of this frame
      const childIds = new Set(
        editor.getSortedChildIdsForParent(frame.id)
      );
      const frameComponents = componentShapes
        .filter((s) => childIds.has(s.id as any))
        .map(shapeToASTNode);

      // Orphan components not in any frame are excluded from frame nodes

      return {
        id: frame.id,
        kind: 'element' as const,
        tag: 'div',
        props: {
          style: {
            width: `${frame.props.w}px`,
            minHeight: `${frame.props.h}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--Spacing-4)',
            padding: 'var(--Spacing-4)',
          },
          'data-artboard': frame.props.name || 'Artboard',
        },
        children: frameComponents,
      };
    });

    // Orphan components (not in any frame)
    const framedIds = new Set(
      frames.flatMap((f) =>
        [...editor.getSortedChildIdsForParent(f.id)] as string[]
      ),
    );
    const orphans = componentShapes
      .filter((s) => !framedIds.has(s.id))
      .map(shapeToASTNode);

    const allChildren = [...frameNodes, ...orphans];

    return {
      version: 1,
      name: 'Canvas Export',
      root: allChildren.length === 1
        ? allChildren[0]
        : {
            id: 'canvas-root',
            kind: 'element',
            tag: 'div',
            props: { style: { display: 'flex', gap: 'var(--Spacing-4-5)' } },
            children: allChildren,
          },
    };
  }

  // No frames — flat list
  const children = componentShapes.map(shapeToASTNode);

  return {
    version: 1,
    name: 'Canvas Export',
    root: {
      id: 'canvas-root',
      kind: 'element',
      tag: 'div',
      props: { style: { display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' } },
      children,
    },
  };
}

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

export interface ValidationError {
  shapeId: string;
  propName: string;
  message: string;
}

export function validateCanvas(editor: Editor): ValidationError[] {
  const errors: ValidationError[] = [];
  const shapes = getComponentShapes(editor);

  for (const shape of shapes) {
    const entry = COMPONENT_REGISTRY[shape.props.componentType];
    if (!entry?.meta) continue;

    const meta = entry.meta;
    const props = shape.props.componentProps as Record<string, unknown>;

    // Props handled by the canvas system (not user-editable)
    const CANVAS_HANDLED_PROPS = new Set(['children', 'icon', 'value']);

    for (const propDef of meta.props) {
      // Skip props that are handled by canvas (childText, auto-rendered icons, etc.)
      if (CANVAS_HANDLED_PROPS.has(propDef.name)) continue;
      // Skip ReactNode/function props — not editable in canvas
      if (propDef.type === 'ReactNode' || propDef.type === 'function') continue;

      if (propDef.required && (props[propDef.name] === undefined || props[propDef.name] === null)) {
        errors.push({
          shapeId: shape.id,
          propName: propDef.name,
          message: `Required prop "${propDef.name}" is missing on ${meta.displayName}`,
        });
      }

      if (propDef.type === 'enum' && props[propDef.name] !== undefined) {
        const value = props[propDef.name];
        const allowed = getEffectiveEnumOptions(propDef, props);
        if (allowed.length > 0 && !allowed.includes(value as (typeof allowed)[number])) {
          errors.push({
            shapeId: shape.id,
            propName: propDef.name,
            message: `Invalid value "${String(value)}" for "${propDef.name}" on ${meta.displayName}`,
          });
        }
      }
    }
  }

  return errors;
}
