'use client';

/**
 * SegmentedControl.showcase.tsx
 *
 * Shared display components for Storybook and platform docs.
 */

import React, { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';
import { CounterBadge } from '../CounterBadge/CounterBadge';
import { Surface } from '../Surface';
import type { ComponentAppearance } from '@oneui/shared';
import type { SurfaceToken } from '@oneui/shared/engine';
import type {
  SegmentedControlAttention,
  SegmentedControlShape,
  SegmentedControlSize,
  SegmentedControlTrackEmphasis,
  SegmentedControlType,
} from './SegmentedControl.shared';
import { SlotParentAppearanceProvider } from '../../contexts/SlotParentAppearanceContext';

const TRACK_EMPHASIS: SegmentedControlTrackEmphasis[] = ['high', 'medium', 'low'];
const ATTENTION: SegmentedControlAttention[] = ['high', 'medium', 'low'];

const ALL_APPEARANCES: Exclude<ComponentAppearance, 'auto'>[] = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

const SURFACE_MODES: SurfaceToken[] = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
];

/** Explicit control appearance that contrasts with a tinted Surface card (for low-attention demos). */
function contrastingControlAppearance(
  surfaceAppearance: Exclude<ComponentAppearance, 'auto'>,
): Exclude<ComponentAppearance, 'auto'> {
  return surfaceAppearance === 'primary' ? 'secondary' : 'primary';
}

const column: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-5)',
  width: '100%',
};

const row: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--Spacing-4)',
};

const hugRow: React.CSSProperties = {
  ...row,
  alignItems: 'flex-start',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  color: 'var(--Text-Low)',
  minWidth: '72px',
};

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

const axisHeader: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-Low)',
  textTransform: 'lowercase',
};

const matrixCell: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-1)',
  minWidth: '0',
  width: '100%',
};

const matrixCellCaption: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  color: 'var(--Text-Low)',
};

const surfaceShell: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4)',
  padding: 'var(--Spacing-5)',
  borderRadius: 'var(--Shape-4)',
  width: '100%',
};

function DemoHeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="currentColor"
      />
    </svg>
  );
}

function DemoListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" fill="currentColor" />
    </svg>
  );
}

function DemoGridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" fill="currentColor" />
    </svg>
  );
}

function DemoSegmentItems({
  withSlots = false,
  type = 'text',
  segmentSize = 'm',
}: {
  withSlots?: boolean;
  type?: SegmentedControlType;
  segmentSize?: SegmentedControlSize;
}) {
  if (type === 'icon') {
    return (
      <>
        <SegmentedControl.Item value="a" start={<DemoListIcon />} aria-label="One" />
        <SegmentedControl.Item value="b" start={<DemoGridIcon />} aria-label="Two" />
        <SegmentedControl.Item value="c" start={<DemoHeartIcon />} aria-label="Three" />
      </>
    );
  }

  if (withSlots) {
    return (
      <>
        <SegmentedControl.Item
          value="a"
          start={<DemoHeartIcon />}
          end={<CounterBadge value={3} aria-label="3 items" />}
        >
          One
        </SegmentedControl.Item>
        <SegmentedControl.Item
          value="b"
          start={<DemoListIcon />}
          end={<CounterBadge value={5} aria-label="5 items" />}
        >
          Two
        </SegmentedControl.Item>
        <SegmentedControl.Item
          value="c"
          start={<DemoGridIcon />}
          end={<CounterBadge value={2} aria-label="2 items" />}
        >
          Three
        </SegmentedControl.Item>
      </>
    );
  }

  return (
    <>
      <SegmentedControl.Item value="a">One</SegmentedControl.Item>
      <SegmentedControl.Item value="b">Two</SegmentedControl.Item>
      <SegmentedControl.Item value="c">Three</SegmentedControl.Item>
    </>
  );
}

function DemoSegments(
  props: Omit<React.ComponentProps<typeof SegmentedControl>, 'children' | 'value' | 'onValueChange'> & {
    defaultValue?: string;
    withSlots?: boolean;
    type?: SegmentedControlType;
  },
) {
  const {
    defaultValue = 'a',
    'aria-label': ariaLabel = 'Segmented control demo',
    withSlots = false,
    type = 'text',
    size = 'm',
    ...rest
  } = props;
  const [value, setValue] = useState(defaultValue);
  return (
    <SegmentedControl {...rest} type={type} size={size} value={value} onValueChange={setValue} aria-label={ariaLabel}>
      <DemoSegmentItems withSlots={withSlots} type={type} segmentSize={size} />
    </SegmentedControl>
  );
}

export interface SegmentedControlVariantMatrixProps {
  /** Matrix section title */
  title?: string;
  /** Optional caption under the title */
  description?: string;
  /** Wrap the matrix in a Surface container */
  surface?: {
    mode: SurfaceToken;
    appearance?: ComponentAppearance;
  };
  /** Min width per matrix column */
  cellMinWidth?: string;
  /**
   * When set, appends a second 3-row block (same att × track grid) with this explicit
   * `appearance` on the control — surface appearance may still differ (auto track / low att).
   */
  contrastingControlAppearance?: Exclude<ComponentAppearance, 'auto'>;
  /** Leading icon + trailing CounterBadge on demo segments */
  withSlots?: boolean;
  shape?: SegmentedControlShape;
  type?: SegmentedControlType;
}

/**
 * Full trackEmphasis × attention grid (3×3).
 * Columns = track emphasis (high · medium · low).
 * Rows = item attention (high · medium · low). Low uses auto(neutral): parent Surface ?? neutral (same as track).
 */
export function SegmentedControlVariantMatrix({
  title,
  description,
  surface,
  cellMinWidth = '168px',
  contrastingControlAppearance: contrastingAppearance,
  withSlots = false,
  shape = 'pill',
  type = 'text',
}: SegmentedControlVariantMatrixProps) {
  const resolvedCellMinWidth =
    withSlots || type === 'icon' ? `max(${cellMinWidth}, 280px)` : cellMinWidth;
  /** equalWidth only for plain-text matrices — slots/icons need hug-content */
  const matrixEqualWidth = !withSlots && type === 'text';
  const gridTemplateColumns = matrixEqualWidth
    ? `auto repeat(${TRACK_EMPHASIS.length}, minmax(${resolvedCellMinWidth}, 1fr))`
    : `auto repeat(${TRACK_EMPHASIS.length}, max-content)`;
  const hugMatrixCell: React.CSSProperties = {
    ...matrixCell,
    alignItems: 'flex-start',
    minWidth: 'max-content',
    width: 'auto',
  };

  const renderAttentionRows = (
    controlAppearance: ComponentAppearance | undefined,
    rowKeySuffix: string,
    rowLabelSuffix: string,
  ) =>
    ATTENTION.map((attention) => (
      <React.Fragment key={`${attention}${rowKeySuffix}`}>
        <span style={{ ...axisHeader, textAlign: 'end', paddingInlineEnd: 'var(--Spacing-2)' }}>
          att · {attention}
          {rowLabelSuffix}
        </span>
        {TRACK_EMPHASIS.map((track) => {
          const slug = [
            title,
            surface?.mode,
            surface?.appearance,
            controlAppearance ?? 'auto',
            attention,
            track,
            rowKeySuffix,
          ]
            .filter(Boolean)
            .join('-');
          return (
            <div
              key={`${attention}-${track}${rowKeySuffix}`}
              style={matrixEqualWidth ? matrixCell : hugMatrixCell}
            >
              <DemoSegments
                size="s"
                attention={attention}
                trackEmphasis={track}
                shape={shape}
                type={type}
                withSlots={withSlots}
                defaultValue="a"
                equalWidth={matrixEqualWidth}
                {...(controlAppearance ? { appearance: controlAppearance } : {})}
                aria-label={`${slug} segmented control`}
              />
              <span style={matrixCellCaption}>
                att {attention}
                {rowLabelSuffix} · track {track}
              </span>
            </div>
          );
        })}
      </React.Fragment>
    ));

  const matrix = (
    <div
      style={{
        width: '100%',
        overflowX: matrixEqualWidth ? undefined : 'auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns,
          gap: 'var(--Spacing-3)',
          alignItems: 'center',
          width: matrixEqualWidth ? '100%' : 'max-content',
          minWidth: matrixEqualWidth ? undefined : '100%',
        }}
      >
      <div aria-hidden />
      {TRACK_EMPHASIS.map((track) => (
        <span key={track} style={{ ...axisHeader, textAlign: 'center' }}>
          track · {track}
        </span>
      ))}

      {renderAttentionRows(undefined, '', '')}
      {contrastingAppearance
        ? renderAttentionRows(
            contrastingAppearance,
            '-contrast',
            ` · ctrl · ${contrastingAppearance}`,
          )
        : null}
      </div>
    </div>
  );

  const block = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', width: '100%' }}>
      {title ? <span style={sectionLabel}>{title}</span> : null}
      {description ? (
        <span
          style={{
            ...labelStyle,
            minWidth: 'unset',
            color: 'var(--Text-Medium)',
          }}
        >
          {description}
        </span>
      ) : null}
      {matrix}
    </div>
  );

  if (surface) {
    return (
      <Surface mode={surface.mode} appearance={surface.appearance} style={surfaceShell}>
        {block}
      </Surface>
    );
  }

  return block;
}

/** Single-axis slice: attention only (track = high). */
export function SegmentedControlAttentionLevels() {
  return (
    <div style={{ ...column, maxWidth: '420px' }}>
      <span style={labelStyle}>Slice of the matrix — track emphasis fixed at high</span>
      {ATTENTION.map((attention) => (
        <div key={attention} style={row}>
          <span style={labelStyle}>{attention}</span>
          <DemoSegments attention={attention} trackEmphasis="high" defaultValue="a" equalWidth style={{ flex: 1 }} />
        </div>
      ))}
    </div>
  );
}

/** Single-axis slice: track emphasis only (attention = high). */
export function SegmentedControlTrackEmphasisLevels() {
  return (
    <div style={{ ...column, maxWidth: '420px' }}>
      <span style={labelStyle}>Slice of the matrix — attention fixed at high</span>
      {TRACK_EMPHASIS.map((trackEmphasis) => (
        <div key={trackEmphasis} style={row}>
          <span style={labelStyle}>{trackEmphasis}</span>
          <DemoSegments trackEmphasis={trackEmphasis} attention="high" defaultValue="a" equalWidth style={{ flex: 1 }} />
        </div>
      ))}
    </div>
  );
}

export function SegmentedControlSurfaceContext() {
  return (
    <div style={{ ...column, maxWidth: '100%' }}>
      <SegmentedControlVariantMatrix
        title="Page root — full variant matrix"
        description="Track role = neutral · item appearance = primary (no Surface ancestor). Start + end CounterBadge slots on segments. Rows 1–3 auto; rows 4–6 ctrl · secondary."
        contrastingControlAppearance="secondary"
        withSlots
        cellMinWidth="172px"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        <span style={sectionLabel}>Surface modes (primary appearance) — full variant matrix each</span>
        {SURFACE_MODES.map((mode) => (
          <SegmentedControlVariantMatrix
            key={mode}
            title={`mode · ${mode}`}
            description="Track + item appearance inherit parent Surface role (auto). Low attention selected role = parent Surface ?? neutral (same as track)."
            surface={{ mode }}
            cellMinWidth="152px"
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        <span style={sectionLabel}>Bold surface × every appearance role — full variant matrix each</span>
        {ALL_APPEARANCES.map((appearance) => (
          <SegmentedControlVariantMatrix
            key={appearance}
            title={`bold · ${appearance}`}
            description={`Rows 1–3: appearance auto (inherits ${appearance} from Surface). Rows 4–6: explicit ctrl · ${contrastingControlAppearance(appearance)}. Start + CounterBadge end slots on segments.`}
            surface={{ mode: 'bold', appearance }}
            contrastingControlAppearance={contrastingControlAppearance(appearance)}
            withSlots
            cellMinWidth="172px"
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        <span style={sectionLabel}>Subtle surface × every appearance role — full variant matrix each</span>
        {ALL_APPEARANCES.map((appearance) => (
          <SegmentedControlVariantMatrix
            key={`subtle-${appearance}`}
            title={`subtle · ${appearance}`}
            description={`Rows 1–3: appearance auto on ${appearance} tinted card. Rows 4–6: ctrl · ${contrastingControlAppearance(appearance)}. Start + CounterBadge end slots.`}
            surface={{ mode: 'subtle', appearance }}
            contrastingControlAppearance={contrastingControlAppearance(appearance)}
            withSlots
            cellMinWidth="172px"
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        <span style={sectionLabel}>Rectangular shape — page root matrix (text + slots)</span>
        <SegmentedControlVariantMatrix
          title="rectangular · pill comparison"
          description="shape=rectangular · start icon + end CounterBadge on segments. Both auto and contrasting appearance rows."
          shape="rectangular"
          withSlots
          contrastingControlAppearance="primary"
          cellMinWidth="172px"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        <span style={sectionLabel}>Icon type — page root matrix</span>
        <SegmentedControlVariantMatrix
          title="icon · page root"
          description="type=icon · icon-only segments (list / grid / heart). Both auto and contrasting appearance rows."
          type="icon"
          contrastingControlAppearance="primary"
          cellMinWidth="172px"
        />
        <SegmentedControlVariantMatrix
          title="icon · rectangular"
          description="type=icon · shape=rectangular. Both auto and contrasting appearance rows."
          type="icon"
          shape="rectangular"
          contrastingControlAppearance="primary"
          cellMinWidth="172px"
        />
      </div>
    </div>
  );
}

/** Pill vs rectangular with optional start/end slots. */
export function SegmentedControlShapesShowcase() {
  const variants: Array<{
    label: string;
    shape: SegmentedControlShape;
    withSlots: boolean;
  }> = [
    { label: 'pill · text', shape: 'pill', withSlots: false },
    { label: 'pill · text + slots', shape: 'pill', withSlots: true },
    { label: 'rectangular · text', shape: 'rectangular', withSlots: false },
    { label: 'rectangular · text + slots', shape: 'rectangular', withSlots: true },
  ];

  return (
    <div style={{ ...column, maxWidth: '480px' }}>
      {variants.map(({ label, shape, withSlots }) => (
        <div key={label} style={hugRow}>
          <span style={labelStyle}>{label}</span>
          <DemoSegments shape={shape} withSlots={withSlots} defaultValue="a" equalWidth={false} />
        </div>
      ))}
    </div>
  );
}

/** Icon-only segments across shapes and track emphasis. */
export function SegmentedControlIconTypeShowcase() {
  return (
    <div style={{ ...column, maxWidth: '480px' }}>
      <span style={labelStyle}>shape · pill vs rectangular (track · high)</span>
      {(['pill', 'rectangular'] as const).map((shape) => (
        <div key={shape} style={hugRow}>
          <span style={labelStyle}>{shape}</span>
          <DemoSegments type="icon" shape={shape} defaultValue="a" equalWidth={false} />
        </div>
      ))}
      <span style={{ ...labelStyle, marginTop: 'var(--Spacing-2)' }}>track emphasis (shape · pill)</span>
      {TRACK_EMPHASIS.map((trackEmphasis) => (
        <div key={trackEmphasis} style={hugRow}>
          <span style={labelStyle}>{trackEmphasis}</span>
          <DemoSegments
            type="icon"
            trackEmphasis={trackEmphasis}
            defaultValue="a"
            equalWidth={false}
          />
        </div>
      ))}
    </div>
  );
}

export function SegmentedControlAppearances() {
  return (
    <div style={{ ...column, maxWidth: '420px' }}>
      <span style={labelStyle}>Explicit appearance override on page (attention · high · track · high)</span>
      {ALL_APPEARANCES.map((appearance) => (
        <div key={appearance} style={row}>
          <span style={labelStyle}>{appearance}</span>
          <DemoSegments appearance={appearance} defaultValue="a" equalWidth style={{ flex: 1 }} />
        </div>
      ))}
    </div>
  );
}

const diagnosticRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3)',
  width: '100%',
};

const diagnosticPair: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--Spacing-4)',
};

const diagnosticCaption: React.CSSProperties = {
  ...labelStyle,
  minWidth: 'unset',
  color: 'var(--Text-Medium)',
};

/**
 * Side-by-side CounterBadge vs SegmentedControl slots on the same Surface.
 * Use to confirm bold-on-bold badge contrast is a composition issue, not CounterBadge alone.
 */
export function SegmentedControlCounterBadgeDiagnostic({
  surfaceMode = 'bold' as SurfaceToken,
  surfaceAppearance = 'brand-bg' as Exclude<ComponentAppearance, 'auto'>,
}: {
  surfaceMode?: SurfaceToken;
  surfaceAppearance?: Exclude<ComponentAppearance, 'auto'>;
}) {
  const badgeSizes = ['xs', 's'] as const;
  const attentions = ['high', 'medium', 'low'] as const;

  return (
    <Surface mode={surfaceMode} appearance={surfaceAppearance} style={surfaceShell}>
      <SlotParentAppearanceProvider value={surfaceAppearance}>
      <span style={sectionLabel}>
        CounterBadge diagnostic — {surfaceMode} · {surfaceAppearance}
      </span>
      <span style={diagnosticCaption}>
        Top: isolated CounterBadge (inherits slot parent appearance via provider). Middle: same badges
        wrapped in a minimal track swatch. Bottom: SegmentedControl with end slots — selected segment
        should show a distinguishable badge, not a flat fill.
      </span>

      <div style={diagnosticRow}>
        <span style={axisHeader}>isolated · attention high / medium / low</span>
        <div style={diagnosticPair}>
          {attentions.map((attention) => (
            <CounterBadge
              key={attention}
              value={attention === 'high' ? 3 : attention === 'medium' ? 5 : 2}
              size="xs"
              attention={attention}
              aria-label={`${attention} attention badge`}
            />
          ))}
          <CounterBadge value={9} size="xs" appearance="negative" aria-label="cross-role negative" />
        </div>
      </div>

      <div style={diagnosticRow}>
        <span style={axisHeader}>on minimal track swatch (same surface context)</span>
        <div
          style={{
            ...diagnosticPair,
            padding: 'var(--Spacing-3)',
            borderRadius: 'var(--Shape-3)',
            backgroundColor: 'var(--Surface-Minimal, var(--Neutral-Minimal))',
          }}
        >
          {attentions.map((attention) => (
            <CounterBadge
              key={`track-${attention}`}
              value={attention === 'high' ? 3 : attention === 'medium' ? 5 : 2}
              size="xs"
              attention={attention}
              aria-label={`${attention} on track`}
            />
          ))}
        </div>
      </div>

      <div style={diagnosticRow}>
        <span style={axisHeader}>SegmentedControl · att high · track high · auto appearance</span>
        <DemoSegments
          size="s"
          attention="high"
          trackEmphasis="high"
          withSlots
          defaultValue="a"
          equalWidth={false}
          aria-label="Diagnostic segmented control auto appearance"
        />
      </div>

      <div style={diagnosticRow}>
        <span style={axisHeader}>
          SegmentedControl · att high · ctrl · {contrastingControlAppearance(surfaceAppearance)}
        </span>
        <DemoSegments
          size="s"
          attention="high"
          trackEmphasis="high"
          appearance={contrastingControlAppearance(surfaceAppearance)}
          withSlots
          defaultValue="a"
          equalWidth={false}
          aria-label="Diagnostic segmented control contrasting appearance"
        />
      </div>

      <div style={diagnosticRow}>
        <span style={axisHeader}>badge size scale on this surface (xs / s)</span>
        <div style={diagnosticPair}>
          {badgeSizes.map((size) => (
            <CounterBadge key={size} value={7} size={size} aria-label={`size ${size}`} />
          ))}
        </div>
      </div>
      </SlotParentAppearanceProvider>
    </Surface>
  );
}

/** Nested Surface stacks — track + label colours should follow each ancestor context. */
export function SegmentedControlNestedSurfacesShowcase() {
  const nests: Array<{
    id: string;
    label: string;
    render: () => React.ReactNode;
  }> = [
    {
      id: 'bold-primary',
      label: 'bold · primary → control (auto)',
      render: () => (
        <Surface mode="bold" appearance="primary" style={surfaceShell}>
          <span style={diagnosticCaption}>Page hero — primary bold</span>
          <DemoSegments
            withSlots
            defaultValue="b"
            equalWidth={false}
            aria-label="Nested bold primary segmented control"
          />
        </Surface>
      ),
    },
    {
      id: 'bold-brand-bg',
      label: 'bold · brand-bg → control (auto)',
      render: () => (
        <Surface mode="bold" appearance="brand-bg" style={surfaceShell}>
          <span style={diagnosticCaption}>Brand hero — brand-bg bold</span>
          <DemoSegments
            withSlots
            defaultValue="a"
            equalWidth={false}
            aria-label="Nested bold brand-bg segmented control"
          />
        </Surface>
      ),
    },
    {
      id: 'bold-subtle',
      label: 'bold · primary → subtle · secondary → control (auto)',
      render: () => (
        <Surface mode="bold" appearance="primary" style={surfaceShell}>
          <span style={diagnosticCaption}>Outer bold primary</span>
          <Surface
            mode="subtle"
            appearance="secondary"
            style={{
              ...surfaceShell,
              padding: 'var(--Spacing-4)',
              gap: 'var(--Spacing-3)',
            }}
          >
            <span style={diagnosticCaption}>Inner subtle secondary card</span>
            <DemoSegments
              withSlots
              defaultValue="c"
              equalWidth={false}
              aria-label="Double-nested segmented control"
            />
          </Surface>
        </Surface>
      ),
    },
    {
      id: 'bold-elevated-subtle',
      label: 'bold · brand-bg → elevated → subtle → control (ctrl · primary)',
      render: () => (
        <Surface mode="bold" appearance="brand-bg" style={surfaceShell}>
          <Surface mode="elevated" appearance="brand-bg" style={{ ...surfaceShell, padding: 'var(--Spacing-4)' }}>
            <Surface mode="subtle" appearance="primary" style={{ ...surfaceShell, padding: 'var(--Spacing-4)' }}>
              <span style={diagnosticCaption}>Triple nest — explicit primary item role</span>
              <DemoSegments
                appearance="primary"
                withSlots
                defaultValue="b"
                equalWidth={false}
                aria-label="Triple-nested primary segmented control"
              />
            </Surface>
          </Surface>
        </Surface>
      ),
    },
    {
      id: 'transparent-bold',
      label: 'transparent · bold · primary over dynamic media',
      render: () => (
        <div
          style={{
            borderRadius: 'var(--Shape-4)',
            padding: 'var(--Spacing-4-5)',
            backgroundImage: [
              'radial-gradient(circle at 20% 30%, var(--Positive-Bold) 0%, transparent 55%)',
              'radial-gradient(circle at 80% 70%, var(--Informative-Bold) 0%, transparent 55%)',
              'linear-gradient(135deg, var(--Primary-Bold) 0%, var(--Negative-Bold) 50%, var(--Warning-Bold) 100%)',
            ].join(', '),
          }}
        >
          <Surface
            mode="bold"
            appearance="primary"
            material="transparent"
            mediaContext="dynamic"
            style={surfaceShell}
          >
            <span style={diagnosticCaption}>Glass hero — SegmentedControl on transparent bold primary</span>
            <DemoSegments
              withSlots
              defaultValue="b"
              equalWidth={false}
              aria-label="Transparent bold primary segmented control"
            />
          </Surface>
        </div>
      ),
    },
  ];

  return (
    <div style={{ ...column, maxWidth: '100%' }}>
      <span style={sectionLabel}>Nested Surface stacks</span>
      <span style={diagnosticCaption}>
        Unselected labels/icons use track-role tokens remapped by each ancestor{' '}
        <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>data-surface-step</code>. Selected
        segment badges publish slot surface + step for bold-on-bold contrast.
      </span>
      {nests.map(({ id, label, render }) => (
        <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
          <span style={axisHeader}>{label}</span>
          {render()}
        </div>
      ))}
    </div>
  );
}