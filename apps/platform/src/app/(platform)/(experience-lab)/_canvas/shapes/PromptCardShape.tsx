/**
 * PromptCardShape.tsx
 *
 * The prompt card: a tldraw `ShapeUtil` that is the RUN ORIGIN for a generation
 * (D-01 / D-04). It holds the prompt text plus the run-origin config
 * (brand / artifact type / output profile) persisted directly on the shape
 * props, so the card itself is the request object — no external panel needed in
 * P1 (the docked request/run panels land in plan 06).
 *
 * Mirrors `ComponentShape.tsx`'s ShapeUtil pattern (Rectangle2d geometry,
 * `HTMLContainer` chrome) WITHOUT importing it — the Lab is isolated from the
 * existing Builder (LAB-03). All HTML chrome uses Jio tokens + `<Surface>` for
 * any non-default fill (LAB-02).
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
import type { ArtifactType, OutputProfile } from '@oneui/experience-builder-core';
import { Surface } from '@oneui/ui/components/Surface';
import type { ImageProviderPreference } from '../../_chat/imageGenerationOptions';
import {
  cardShell,
  cardTitle,
  cardLabel,
  cardBody,
  cardMeta,
  createRoundedRectIndicatorPath,
  stopCanvasWheel,
} from './cardChrome';

/** Distinct namespace so Lab shapes never collide with Builder shapes. */
export const PROMPT_CARD_SHAPE_TYPE = 'exp-lab-prompt' as const;

export type PromptCardShapeProps = {
  w: number;
  h: number;
  /** The prompt text — the run intent. */
  prompt: string;
  /** Run-origin config persisted on the card (D-04). */
  brandId: string;
  artifactType: ArtifactType;
  outputProfile: OutputProfile;
  /** Optional sub-brand selection (D-02). Empty/absent → parent brand only. */
  subBrandConfigId?: string;
  /** Optional generated-image provider preference for topic imagery. */
  imageProvider?: ImageProviderPreference;
  /**
   * Optional campaign brief fields (D-04). Revealed by the RequestPanel ONLY for
   * `social-post` / `instagram-carousel` artifact types; persisted on the card
   * and posted with the run. The web branch ignores them.
   */
  audience?: string;
  objective?: string;
  channel?: string;
  /** Lightweight run status: idle → running → valid / gap / error. */
  runStatus: 'idle' | 'running' | 'valid' | 'gap' | 'error';
};

export type PromptCardShape = TLBaseShape<typeof PROMPT_CARD_SHAPE_TYPE, PromptCardShapeProps>;

const PROMPT_PLACEHOLDER = 'Describe the experience you want to generate…';

// `ShapeUtil<any>` mirrors the Builder's `ComponentShapeUtil` — tldraw's custom
// shape generics don't accept a `TLBaseShape` with a non-default `type` literal
// at the class boundary; the exported `PromptCardShape` type documents the
// real prop shape and is used by the canvas reducer.
export class PromptCardShapeUtil extends ShapeUtil<any> {
  static override type = PROMPT_CARD_SHAPE_TYPE;

  static override props: RecordProps<any> = {
    w: T.number,
    h: T.number,
    prompt: T.string,
    brandId: T.string,
    artifactType: T.string,
    outputProfile: T.string,
    subBrandConfigId: T.optional(T.string),
    imageProvider: T.optional(T.string),
    audience: T.optional(T.string),
    objective: T.optional(T.string),
    channel: T.optional(T.string),
    runStatus: T.string,
  };

  getDefaultProps(): PromptCardShapeProps {
    return {
      w: 320,
      h: 200,
      prompt: '',
      brandId: '',
      artifactType: 'web-ui',
      outputProfile: 'web-desktop',
      runStatus: 'idle',
    };
  }

  override canEdit() {
    return true;
  }
  override canResize() {
    return false;
  }
  override canCull() {
    return false;
  }

  getGeometry(shape: PromptCardShape): Geometry2d {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true });
  }

  component(shape: PromptCardShape) {
    return <PromptCardBody shape={shape} />;
  }

  override getIndicatorPath(shape: PromptCardShape): Path2D {
    return createRoundedRectIndicatorPath(shape.props.w, shape.props.h);
  }

  indicator(shape: PromptCardShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}

function PromptCardBody({ shape }: { shape: PromptCardShape }) {
  const editor = useEditor();
  const { prompt, artifactType, outputProfile, runStatus } = shape.props;
  const isEditing = editor.getEditingShapeId() === shape.id;

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
        mode="bold"
        material="solid"
        appearance="primary"
        style={{ width: '100%', height: '100%', borderRadius: 'var(--Shape-4)' }}
        data-testid={`prompt-card-${shape.id}`}
      >
        <div style={cardShell}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={cardTitle}>Prompt</h3>
            <span style={cardMeta}>{runStatus === 'idle' ? '' : runStatus}</span>
          </div>

          {isEditing ? (
            <textarea
              autoFocus
              value={prompt}
              placeholder={PROMPT_PLACEHOLDER}
              onChange={(e) => {
                editor.updateShape({
                  id: shape.id,
                  type: PROMPT_CARD_SHAPE_TYPE as never,
                  props: { prompt: e.target.value },
                });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') editor.setEditingShape(null);
                e.stopPropagation();
              }}
              style={{
                flex: 1,
                resize: 'none',
                borderRadius: 'var(--Shape-2)',
                border: 'var(--Stroke-M) solid var(--Neutral-Stroke-Low)',
                padding: 'var(--Spacing-2)',
                outline: 'none',
                backgroundColor: 'var(--Surface-Main)',
                fontFamily: 'var(--Typography-Font-Primary)',
                fontSize: 'var(--Body-S-FontSize)',
                fontWeight: 'var(--Body-FontWeight-Low)',
                lineHeight: 'var(--Body-S-LineHeight)',
                color: 'var(--Text-High)',
              }}
            />
          ) : (
            <p style={{ ...cardBody, flex: 1 }}>{prompt || PROMPT_PLACEHOLDER}</p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-2)' }}>
            <span style={cardLabel}>{artifactType}</span>
            <span style={cardMeta}>→ {outputProfile}</span>
          </div>
        </div>
      </Surface>
    </HTMLContainer>
  );
}
