/**
 * ComponentReferenceCardShape.tsx
 *
 * The component-reference card. Two states (D-06 / REG-03):
 *   - normal: shows a Storybook-approved Jio component reference.
 *   - gap:    the component-gap state — heading "Component not in registry" +
 *             the exact UI-SPEC body copy, with a Warning-role badge. An
 *             unregistered component can't be emitted; the run short-circuits
 *             and produces NO artifact card (REG-03).
 *
 * Mirrors `ComponentShape.tsx`'s ShapeUtil pattern without importing it
 * (LAB-03); token-only chrome (LAB-02); Surface for non-default fills.
 */

'use client';

import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  useEditor,
  type Geometry2d,
  type RecordProps,
  type TLBaseShape,
} from 'tldraw';
import { Surface } from '@oneui/ui/components/Surface';
import { Badge } from '@oneui/ui/components/Badge';
import {
  cardShell,
  cardTitle,
  cardBody,
  cardLabel,
  cardMeta,
  createRoundedRectIndicatorPath,
  stopCanvasWheel,
} from './cardChrome';

export const COMPONENT_REFERENCE_CARD_SHAPE_TYPE = 'exp-lab-component-reference' as const;

export type ComponentReferenceCardShapeProps = {
  w: number;
  h: number;
  state: 'normal' | 'gap';
  /** The component id this card references. */
  componentId: string;
  /** Gap reason copy (REG-03) — only populated in the gap state. */
  gapReason: string;
};

export type ComponentReferenceCardShape = TLBaseShape<
  typeof COMPONENT_REFERENCE_CARD_SHAPE_TYPE,
  ComponentReferenceCardShapeProps
>;

export class ComponentReferenceCardShapeUtil extends ShapeUtil<any> {
  static override type = COMPONENT_REFERENCE_CARD_SHAPE_TYPE;

  static override props: RecordProps<any> = {
    w: T.number,
    h: T.number,
    state: T.string,
    componentId: T.string,
    gapReason: T.string,
  };

  getDefaultProps(): ComponentReferenceCardShapeProps {
    return { w: 340, h: 200, state: 'normal', componentId: '', gapReason: '' };
  }

  override canEdit() {
    return false;
  }
  override canResize() {
    return false;
  }
  override canCull() {
    return false;
  }

  getGeometry(shape: ComponentReferenceCardShape): Geometry2d {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true });
  }

  component(shape: ComponentReferenceCardShape) {
    return <ComponentReferenceCardBody shape={shape} />;
  }

  override getIndicatorPath(shape: ComponentReferenceCardShape): Path2D {
    return createRoundedRectIndicatorPath(shape.props.w, shape.props.h);
  }

  indicator(shape: ComponentReferenceCardShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}

function ComponentReferenceCardBody({ shape }: { shape: ComponentReferenceCardShape }) {
  const editor = useEditor();
  const { state, componentId, gapReason } = shape.props;
  const isGap = state === 'gap';
  const title = isGap && /storybook mcp|storybook docs|storybook documentation/i.test(gapReason ?? '')
    ? 'Storybook docs unavailable'
    : isGap
      ? 'Component not in registry'
      : 'Component reference';

  const body = (
    <div style={cardShell} data-testid={`component-reference-card-${shape.id}`} data-state={state}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={cardTitle}>{title}</h3>
        {isGap && (
          <Badge appearance="warning" size="s">
            Gap
          </Badge>
        )}
      </div>

      {isGap ? (
        <p style={cardBody}>
          {gapReason ||
            `"${componentId}" isn't a Storybook-approved Jio component. It can't be emitted. Choose a registered component or report the gap.`}
        </p>
      ) : (
        <div style={{ display: 'flex', gap: 'var(--Spacing-2)', alignItems: 'baseline' }}>
          <span style={cardMeta}>Component</span>
          <span style={cardLabel}>{componentId}</span>
        </div>
      )}
    </div>
  );

  return (
    <HTMLContainer
      style={{
        width: shape.props.w,
        height: shape.props.h,
        pointerEvents: 'all',
        borderRadius: 'var(--Shape-4)',
      }}
      onPointerDown={editor.markEventAsHandled}
      onWheel={stopCanvasWheel}
    >
      <Surface
        mode="subtle"
        material="solid"
        appearance={isGap ? 'warning' : 'primary'}
        style={{ width: '100%', height: '100%', borderRadius: 'var(--Shape-4)' }}
      >
        {body}
      </Surface>
    </HTMLContainer>
  );
}
