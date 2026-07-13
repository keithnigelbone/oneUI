/**
 * GenericPlaceholderShape.tsx
 *
 * The catch-all card for every card-kind the Lab does not yet render with a
 * dedicated shape (D-06): the non-rendered artifact types plus the
 * evaluation-report / variant-group / export kinds. The full 13-member union
 * is contract-present from plan 01; this shape keeps every member representable
 * on the canvas as a labelled placeholder until its phase lights up a real
 * renderer.
 *
 * Mirrors `ComponentShape.tsx`'s ShapeUtil pattern without importing it
 * (LAB-03); token-only chrome (LAB-02).
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
import type { CardKind } from '@oneui/experience-builder-core';
import { Surface } from '@oneui/ui/components/Surface';
import {
  cardShell,
  cardTitle,
  cardBody,
  cardMeta,
  createRoundedRectIndicatorPath,
  stopCanvasWheel,
} from './cardChrome';

export const GENERIC_PLACEHOLDER_SHAPE_TYPE = 'exp-lab-generic-placeholder' as const;

export type GenericPlaceholderShapeProps = {
  w: number;
  h: number;
  /** Which of the 13 card kinds this placeholder stands in for. */
  cardKind: CardKind;
  /** Optional human label override. */
  label: string;
};

export type GenericPlaceholderShape = TLBaseShape<
  typeof GENERIC_PLACEHOLDER_SHAPE_TYPE,
  GenericPlaceholderShapeProps
>;

export class GenericPlaceholderShapeUtil extends ShapeUtil<any> {
  static override type = GENERIC_PLACEHOLDER_SHAPE_TYPE;

  static override props: RecordProps<any> = {
    w: T.number,
    h: T.number,
    cardKind: T.string,
    label: T.string,
  };

  getDefaultProps(): GenericPlaceholderShapeProps {
    return { w: 300, h: 160, cardKind: 'evaluation-report', label: '' };
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

  getGeometry(shape: GenericPlaceholderShape): Geometry2d {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true });
  }

  component(shape: GenericPlaceholderShape) {
    return <GenericPlaceholderBody shape={shape} />;
  }

  override getIndicatorPath(shape: GenericPlaceholderShape): Path2D {
    return createRoundedRectIndicatorPath(shape.props.w, shape.props.h);
  }

  indicator(shape: GenericPlaceholderShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}

function GenericPlaceholderBody({ shape }: { shape: GenericPlaceholderShape }) {
  const editor = useEditor();
  const { cardKind, label } = shape.props;

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
        mode="minimal"
        material="solid"
        appearance="primary"
        style={{ width: '100%', height: '100%', borderRadius: 'var(--Shape-4)' }}
        data-testid={`generic-placeholder-card-${shape.id}`}
        data-card-kind={cardKind}
      >
        <div
          style={{
            ...cardShell,
            border: 'var(--Stroke-M) dashed var(--Neutral-Stroke-Low)',
            boxShadow: 'none',
          }}
        >
          <h3 style={cardTitle}>{label || cardKind}</h3>
          <p style={cardBody}>
            This card kind is contract-present and renders here as a placeholder until its phase.
          </p>
          <span style={cardMeta}>{cardKind}</span>
        </div>
      </Surface>
    </HTMLContainer>
  );
}
