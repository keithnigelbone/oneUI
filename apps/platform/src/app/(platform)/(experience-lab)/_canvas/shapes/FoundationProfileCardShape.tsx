/**
 * FoundationProfileCardShape.tsx
 *
 * The foundation-profile card. Two states (D-06 / FND-03):
 *   - normal: shows the resolved foundation profile reference for the run.
 *   - gap:    the TYPED gap-report state — heading "Foundation gap" + the exact
 *             UI-SPEC body copy, with a Warning-role badge. A gap is the system
 *             CORRECTLY REFUSING to invent dimensions, never an error.
 *
 * On a gap event the run short-circuits: this card flips to its gap state and
 * NO artifact card is produced (FND-03 short-circuit, enforced by the canvas
 * reducer + the jsdom test).
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

export const FOUNDATION_PROFILE_CARD_SHAPE_TYPE = 'exp-lab-foundation-profile' as const;

export type FoundationProfileCardShapeProps = {
  w: number;
  h: number;
  state: 'normal' | 'gap';
  /** Normal state: the resolved profile ref. Gap state: the requested profile. */
  artifactType: string;
  outputProfile: string;
  /** Gap reason copy (FND-03) — only populated in the gap state. */
  gapReason: string;
};

export type FoundationProfileCardShape = TLBaseShape<
  typeof FOUNDATION_PROFILE_CARD_SHAPE_TYPE,
  FoundationProfileCardShapeProps
>;

export class FoundationProfileCardShapeUtil extends ShapeUtil<any> {
  static override type = FOUNDATION_PROFILE_CARD_SHAPE_TYPE;

  static override props: RecordProps<any> = {
    w: T.number,
    h: T.number,
    state: T.string,
    artifactType: T.string,
    outputProfile: T.string,
    gapReason: T.string,
  };

  getDefaultProps(): FoundationProfileCardShapeProps {
    return {
      w: 340,
      h: 220,
      state: 'normal',
      artifactType: 'web-ui',
      outputProfile: 'web-desktop',
      gapReason: '',
    };
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

  getGeometry(shape: FoundationProfileCardShape): Geometry2d {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true });
  }

  component(shape: FoundationProfileCardShape) {
    return <FoundationProfileCardBody shape={shape} />;
  }

  override getIndicatorPath(shape: FoundationProfileCardShape): Path2D {
    return createRoundedRectIndicatorPath(shape.props.w, shape.props.h);
  }

  indicator(shape: FoundationProfileCardShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}

function FoundationProfileCardBody({ shape }: { shape: FoundationProfileCardShape }) {
  const editor = useEditor();
  const { state, artifactType, outputProfile, gapReason } = shape.props;
  const isGap = state === 'gap';
  const isGenericGap = isGap && !artifactType && !outputProfile;

  const body = (
    <div style={cardShell} data-testid={`foundation-profile-card-${shape.id}`} data-state={state}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={cardTitle}>
          {isGenericGap ? 'Generation gap' : isGap ? 'Foundation gap' : 'Foundation profile'}
        </h3>
        {isGap && (
          <Badge appearance="warning" size="s">
            Gap
          </Badge>
        )}
      </div>

      {isGap ? (
        <p style={cardBody}>
          {gapReason ||
            (isGenericGap
              ? 'Generation stopped before a shippable preview was produced. Check the run log for the failing step.'
              : `No Jio foundation profile is defined for ${artifactType} → ${outputProfile}. Generation stopped — no dimensions were invented. Pick a covered profile, or file this as a Jio system gap.`)}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
          <div style={{ display: 'flex', gap: 'var(--Spacing-2)', alignItems: 'baseline' }}>
            <span style={cardMeta}>Artifact</span>
            <span style={cardLabel}>{artifactType}</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--Spacing-2)', alignItems: 'baseline' }}>
            <span style={cardMeta}>Profile</span>
            <span style={cardLabel}>{outputProfile}</span>
          </div>
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
