/**
 * SegmentedControl.showcase.native.tsx
 *
 * Faithful RN peer of SegmentedControl.stories.tsx + SegmentedControl.showcase.tsx.
 * Mirrors every Storybook story and its sub-cases:
 *   Default · AttentionLevels · TrackEmphasis · Sizes · Shapes · EqualWidth ·
 *   WithSlots · CounterBadgeOnBoldSurface · NestedSurfaces · IconOnly ·
 *   Appearances · States · SurfaceContext (full track×attention matrix across
 *   page root, every surface mode, bold×roles, subtle×roles, rectangular, icon).
 */

import React, { useState } from 'react';
import { ScrollView, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import { tokens } from '@oneui/tokens';
import { CounterBadge } from '../CounterBadge/CounterBadge.native';
import { Icon } from '../Icon/Icon.native';
import {
  IcGlobeGlyph,
  IcHomeGlyph,
  IcSearchGlyph,
  IcUserGlyph,
} from '../BottomNavigationItem/bottomNavShowcaseGlyphs';
import { Surface, useSurfaceTokens, useTypographyTokens, typographyToTextStyle } from '../../theme';
import { SegmentedControl } from './SegmentedControl.native';
import type {
  SegmentedControlAttention,
  SegmentedControlShape,
  SegmentedControlSize,
  SegmentedControlTrackEmphasis,
  SegmentedControlType,
} from './interface';

// ============================================================================
// Constants
// ============================================================================

type ResolvedAppearance = Exclude<ComponentAppearance, 'auto'>;

const TRACK_EMPHASIS: readonly SegmentedControlTrackEmphasis[] = ['high', 'medium', 'low'];
const ATTENTION: readonly SegmentedControlAttention[] = ['high', 'medium', 'low'];
const SIZES: readonly SegmentedControlSize[] = ['s', 'm', 'l'];

const ALL_APPEARANCES: readonly ResolvedAppearance[] = [
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

const SURFACE_MODES = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
] as const;

/** Explicit control appearance that contrasts with a tinted Surface card. */
function contrastingControlAppearance(surfaceAppearance: ResolvedAppearance): ResolvedAppearance {
  return surfaceAppearance === 'primary' ? 'secondary' : 'primary';
}

// Matrix column geometry (RN has no CSS grid — fixed/min widths + horizontal scroll).
// Text cells are fixed so equal-width segments align; hug cells (slots/icon) use
// a min-width floor and grow to content so they never overflow into the next column
// (mirrors the web grid's `max-content` columns).
const LABEL_COL_WIDTH = tokens.spacing['24'];
const CELL_WIDTH_TEXT = tokens.spacing['40'] + tokens.spacing['16'];
const CELL_WIDTH_WIDE = tokens.spacing['40'] + tokens.spacing['24'];

// ============================================================================
// Layout + typography helpers
// ============================================================================

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4-5'],
  width: '100%',
};

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['4'],
};

const surfaceShell: ViewStyle = {
  padding: tokens.spacing['5'],
  gap: tokens.spacing['4'],
  borderRadius: tokens.shape.l,
};

// Showcase text uses paired label typography (size + line-height + weight +
// family) via `useTypographyTokens`, per the CLAUDE.md "always pair line-height
// with font-size" rule.
function Caption({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const typo = typographyToTextStyle(useTypographyTokens('label', 'XS', { emphasis: 'low' }));
  return <Text style={[typo, { color: role.content.low }]}>{children}</Text>;
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const typo = typographyToTextStyle(useTypographyTokens('label', 'S', { emphasis: 'medium' }));
  return <Text style={[typo, { color: role.content.medium }]}>{children}</Text>;
}

function AxisLabel({
  children,
  align = 'center',
}: {
  children: React.ReactNode;
  align?: 'center' | 'end';
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const typo = typographyToTextStyle(useTypographyTokens('label', '2XS', { emphasis: 'medium' }));
  return (
    <Text style={[typo, { color: role.content.low, textAlign: align === 'end' ? 'right' : 'center' }]}>
      {children}
    </Text>
  );
}

function MatrixCaption({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const typo = typographyToTextStyle(useTypographyTokens('label', '2XS', { emphasis: 'low' }));
  return <Text style={[typo, { color: role.content.low }]}>{children}</Text>;
}

// ============================================================================
// Demo controls
// ============================================================================

const DEFAULT_LABELS = ['One', 'Two', 'Three'] as const;

interface DemoSegmentsProps {
  size?: SegmentedControlSize;
  attention?: SegmentedControlAttention;
  trackEmphasis?: SegmentedControlTrackEmphasis;
  shape?: SegmentedControlShape;
  type?: SegmentedControlType;
  withSlots?: boolean;
  appearance?: ResolvedAppearance;
  equalWidth?: boolean;
  defaultValue?: string;
  labels?: readonly [string, string, string];
  style?: ViewStyle;
}

/** Three-segment controlled sample; supports text, slots, and icon-only variants. */
function DemoSegments({
  size = 'm',
  attention,
  trackEmphasis,
  shape,
  type = 'text',
  withSlots = false,
  appearance,
  equalWidth,
  defaultValue = 'a',
  labels = DEFAULT_LABELS,
  style,
}: DemoSegmentsProps): React.ReactElement {
  const [value, setValue] = useState(defaultValue);
  const shared = {
    size,
    attention,
    trackEmphasis,
    shape,
    equalWidth,
    style,
    appearance: appearance as never,
    value,
    onValueChange: setValue,
    'aria-label': 'Segmented control demo',
  };

  if (type === 'icon') {
    return (
      <SegmentedControl {...shared} type="icon">
        <SegmentedControl.Item value="a" start={<Icon icon={IcHomeGlyph} aria-hidden />} aria-label="One" />
        <SegmentedControl.Item value="b" start={<Icon icon={IcSearchGlyph} aria-hidden />} aria-label="Two" />
        <SegmentedControl.Item value="c" start={<Icon icon={IcUserGlyph} aria-hidden />} aria-label="Three" />
      </SegmentedControl>
    );
  }

  if (withSlots) {
    return (
      <SegmentedControl {...shared}>
        <SegmentedControl.Item
          value="a"
          start={<Icon icon={IcHomeGlyph} aria-hidden />}
          end={<CounterBadge value={3} size={size} aria-label="3 items" />}
        >
          {labels[0]}
        </SegmentedControl.Item>
        <SegmentedControl.Item
          value="b"
          start={<Icon icon={IcGlobeGlyph} aria-hidden />}
          end={<CounterBadge value={5} size={size} aria-label="5 items" />}
        >
          {labels[1]}
        </SegmentedControl.Item>
        <SegmentedControl.Item
          value="c"
          start={<Icon icon={IcUserGlyph} aria-hidden />}
          end={<CounterBadge value={2} size={size} aria-label="2 items" />}
        >
          {labels[2]}
        </SegmentedControl.Item>
      </SegmentedControl>
    );
  }

  return (
    <SegmentedControl {...shared}>
      <SegmentedControl.Item value="a">{labels[0]}</SegmentedControl.Item>
      <SegmentedControl.Item value="b">{labels[1]}</SegmentedControl.Item>
      <SegmentedControl.Item value="c">{labels[2]}</SegmentedControl.Item>
    </SegmentedControl>
  );
}

const DAY_WEEK_MONTH = ['Day', 'Week', 'Month'] as const;

// ============================================================================
// Variant matrix — 3×3 track-emphasis (columns) × attention (rows)
// ============================================================================

interface VariantMatrixProps {
  title?: string;
  description?: string;
  surface?: { mode: (typeof SURFACE_MODES)[number]; appearance?: ResolvedAppearance };
  contrastingControlAppearance?: ResolvedAppearance;
  withSlots?: boolean;
  shape?: SegmentedControlShape;
  type?: SegmentedControlType;
}

function VariantMatrix({
  title,
  description,
  surface,
  contrastingControlAppearance: contrastingAppearance,
  withSlots = false,
  shape = 'pill',
  type = 'text',
}: VariantMatrixProps): React.ReactElement {
  // equalWidth only for plain-text matrices — slots / icons hug content.
  const matrixEqualWidth = !withSlots && type === 'text';
  // Text: fixed width so equal-width segments line up. Hug: a min-width floor that
  // grows to content (via flexShrink 0 + alignItems flex-start) so a wide control
  // never overflows into the next column.
  const cellStyle: ViewStyle = matrixEqualWidth
    ? { width: CELL_WIDTH_TEXT, gap: tokens.spacing['1'] }
    : { minWidth: CELL_WIDTH_WIDE, flexShrink: 0, alignItems: 'flex-start', gap: tokens.spacing['1'] };
  const headerCellStyle: ViewStyle = matrixEqualWidth
    ? { width: CELL_WIDTH_TEXT }
    : { minWidth: CELL_WIDTH_WIDE, flexShrink: 0 };

  const renderRows = (
    controlAppearance: ResolvedAppearance | undefined,
    keySuffix: string,
    labelSuffix: string,
  ): React.ReactElement[] =>
    ATTENTION.map((attention) => (
      <View
        key={`${attention}${keySuffix}`}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: tokens.spacing['3'] }}
      >
        <View style={{ width: LABEL_COL_WIDTH }}>
          <AxisLabel align="end">att · {attention}</AxisLabel>
        </View>
        {TRACK_EMPHASIS.map((track) => (
          <View key={`${attention}-${track}${keySuffix}`} style={cellStyle}>
            <DemoSegments
              size="s"
              attention={attention}
              trackEmphasis={track}
              shape={shape}
              type={type}
              withSlots={withSlots}
              equalWidth={matrixEqualWidth}
              appearance={controlAppearance}
            />
            <MatrixCaption>
              att {attention}
              {labelSuffix} · track {track}
            </MatrixCaption>
          </View>
        ))}
      </View>
    ));

  const grid = (
    <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false}>
      <View style={{ gap: tokens.spacing['3'] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['3'] }}>
          <View style={{ width: LABEL_COL_WIDTH }} />
          {TRACK_EMPHASIS.map((track) => (
            <View key={track} style={headerCellStyle}>
              <AxisLabel>track · {track}</AxisLabel>
            </View>
          ))}
        </View>
        {renderRows(undefined, '', '')}
        {contrastingAppearance
          ? renderRows(contrastingAppearance, '-contrast', ` · ctrl · ${contrastingAppearance}`)
          : null}
      </View>
    </ScrollView>
  );

  const block = (
    <View style={{ gap: tokens.spacing['3'], width: '100%' }}>
      {title ? <SectionLabel>{title}</SectionLabel> : null}
      {description ? <Caption>{description}</Caption> : null}
      {grid}
    </View>
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

// ============================================================================
// Stories
// ============================================================================

/** Story: Default — equal-width text, Week selected. */
export function SegmentedControlDefault(): React.ReactElement {
  return <DemoSegments defaultValue="b" labels={DAY_WEEK_MONTH} />;
}

/** Story: AttentionLevels — track emphasis fixed high. */
export function SegmentedControlAttentionLevels(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>Slice of the matrix — track emphasis fixed at high</Caption>
      {ATTENTION.map((attention) => (
        <View key={attention} style={{ gap: tokens.spacing['1-5'] }}>
          <Caption>{attention}</Caption>
          <DemoSegments attention={attention} trackEmphasis="high" />
        </View>
      ))}
    </View>
  );
}

/** Story: TrackEmphasis — attention fixed high. */
export function SegmentedControlTrackEmphasisLevels(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>Slice of the matrix — attention fixed at high (medium track adds a border)</Caption>
      {TRACK_EMPHASIS.map((trackEmphasis) => (
        <View key={trackEmphasis} style={{ gap: tokens.spacing['1-5'] }}>
          <Caption>{trackEmphasis}</Caption>
          <DemoSegments trackEmphasis={trackEmphasis} attention="high" />
        </View>
      ))}
    </View>
  );
}

/** Story: Sizes — hug content per Figma size spec. */
export function SegmentedControlSizes(): React.ReactElement {
  return (
    <View style={column}>
      {SIZES.map((size) => (
        <View key={size} style={{ gap: tokens.spacing['1-5'] }}>
          <SectionLabel>Size {size.toUpperCase()}</SectionLabel>
          <DemoSegments size={size} equalWidth={false} labels={DAY_WEEK_MONTH} />
        </View>
      ))}
    </View>
  );
}

/** Story: Shapes — pill / rectangular × plain / slots. */
export function SegmentedControlShapes(): React.ReactElement {
  const variants: Array<{ label: string; shape: SegmentedControlShape; withSlots: boolean }> = [
    { label: 'pill · text', shape: 'pill', withSlots: false },
    { label: 'pill · text + slots', shape: 'pill', withSlots: true },
    { label: 'rectangular · text', shape: 'rectangular', withSlots: false },
    { label: 'rectangular · text + slots', shape: 'rectangular', withSlots: true },
  ];
  return (
    <View style={column}>
      {variants.map(({ label, shape, withSlots }) => (
        <View key={label} style={{ gap: tokens.spacing['1-5'] }}>
          <Caption>{label}</Caption>
          <DemoSegments shape={shape} withSlots={withSlots} equalWidth={false} />
        </View>
      ))}
    </View>
  );
}

/** Story: EqualWidth vs hug-content. */
export function SegmentedControlEqualWidth(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['1-5'] }}>
        <Caption>equalWidth</Caption>
        <EqualWidthSample equalWidth />
      </View>
      <View style={{ gap: tokens.spacing['1-5'] }}>
        <Caption>hug content</Caption>
        <EqualWidthSample equalWidth={false} />
      </View>
    </View>
  );
}

function EqualWidthSample({ equalWidth }: { equalWidth: boolean }): React.ReactElement {
  const [value, setValue] = useState('short');
  return (
    <SegmentedControl equalWidth={equalWidth} value={value} onValueChange={setValue} aria-label="Equal width demo">
      <SegmentedControl.Item value="short">Short</SegmentedControl.Item>
      <SegmentedControl.Item value="long">Much longer label</SegmentedControl.Item>
    </SegmentedControl>
  );
}

/** Story: WithSlots — start icon + end CounterBadge. */
export function SegmentedControlWithSlots(): React.ReactElement {
  const [value, setValue] = useState('liked');
  return (
    <SegmentedControl value={value} onValueChange={setValue} aria-label="With slots demo">
      <SegmentedControl.Item value="liked" start={<Icon icon={IcHomeGlyph} aria-hidden />}>
        Liked
      </SegmentedControl.Item>
      <SegmentedControl.Item value="saved" end={<CounterBadge value={12} aria-label="12 saved" />}>
        Saved
      </SegmentedControl.Item>
      <SegmentedControl.Item value="all">All</SegmentedControl.Item>
    </SegmentedControl>
  );
}

/** Story: IconOnly — pill/rectangular + track emphasis. */
export function SegmentedControlIconOnly(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>shape · pill vs rectangular (track · high)</Caption>
      {(['pill', 'rectangular'] as const).map((shape) => (
        <View key={shape} style={row}>
          <Caption>{shape}</Caption>
          <DemoSegments type="icon" shape={shape} />
        </View>
      ))}
      <Caption>track emphasis (shape · pill)</Caption>
      {TRACK_EMPHASIS.map((trackEmphasis) => (
        <View key={trackEmphasis} style={row}>
          <Caption>{trackEmphasis}</Caption>
          <DemoSegments type="icon" trackEmphasis={trackEmphasis} />
        </View>
      ))}
    </View>
  );
}

/** Story: Appearances — all 9 roles (attention high · track high). */
export function SegmentedControlAppearances(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>Explicit appearance override on page (attention · high · track · high)</Caption>
      {ALL_APPEARANCES.map((appearance) => (
        <View key={appearance} style={{ gap: tokens.spacing['1-5'] }}>
          <Caption>{appearance}</Caption>
          <DemoSegments appearance={appearance} />
        </View>
      ))}
    </View>
  );
}

/** Story: States — enabled, item-disabled, group-disabled. */
export function SegmentedControlStates(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['1-5'] }}>
        <SectionLabel>Enabled</SectionLabel>
        <StatesEnabled />
      </View>
      <View style={{ gap: tokens.spacing['1-5'] }}>
        <SectionLabel>Disabled item</SectionLabel>
        <StatesItemDisabled />
      </View>
      <View style={{ gap: tokens.spacing['1-5'] }}>
        <SectionLabel>Disabled group</SectionLabel>
        <SegmentedControl value="a" onValueChange={() => {}} disabled aria-label="Disabled control">
          <SegmentedControl.Item value="a">Disabled</SegmentedControl.Item>
          <SegmentedControl.Item value="b">Control</SegmentedControl.Item>
        </SegmentedControl>
      </View>
    </View>
  );
}

function StatesEnabled(): React.ReactElement {
  const [value, setValue] = useState('a');
  return (
    <SegmentedControl value={value} onValueChange={setValue} aria-label="Enabled control">
      <SegmentedControl.Item value="a">Enabled</SegmentedControl.Item>
      <SegmentedControl.Item value="b">Enabled</SegmentedControl.Item>
    </SegmentedControl>
  );
}

function StatesItemDisabled(): React.ReactElement {
  const [value, setValue] = useState('a');
  return (
    <SegmentedControl value={value} onValueChange={setValue} aria-label="Item disabled control">
      <SegmentedControl.Item value="a">Available</SegmentedControl.Item>
      <SegmentedControl.Item value="b" disabled>
        Disabled
      </SegmentedControl.Item>
    </SegmentedControl>
  );
}

/** Story: SurfaceContext — full variant matrix across page root, surface modes, and roles. */
export function SegmentedControlSurfaceContext(): React.ReactElement {
  return (
    <View style={column}>
      <VariantMatrix
        title="Page root — full variant matrix"
        description="Track role = neutral · item appearance = primary. Rows 1–3 auto; rows 4–6 ctrl · secondary. Start + end CounterBadge slots."
        contrastingControlAppearance="secondary"
        withSlots
      />

      <View style={{ gap: tokens.spacing['4'] }}>
        <SectionLabel>Surface modes (primary appearance) — full variant matrix each</SectionLabel>
        {SURFACE_MODES.map((mode) => (
          <VariantMatrix
            key={mode}
            title={`mode · ${mode}`}
            description="Track + item appearance inherit parent Surface role (auto). Low attention selected role = parent Surface ?? neutral."
            surface={{ mode }}
          />
        ))}
      </View>

      <View style={{ gap: tokens.spacing['4'] }}>
        <SectionLabel>Bold surface × every appearance role</SectionLabel>
        {ALL_APPEARANCES.map((appearance) => (
          <VariantMatrix
            key={`bold-${appearance}`}
            title={`bold · ${appearance}`}
            description={`Rows 1–3: auto (inherits ${appearance}). Rows 4–6: ctrl · ${contrastingControlAppearance(appearance)}. Start + CounterBadge slots.`}
            surface={{ mode: 'bold', appearance }}
            contrastingControlAppearance={contrastingControlAppearance(appearance)}
            withSlots
          />
        ))}
      </View>

      <View style={{ gap: tokens.spacing['4'] }}>
        <SectionLabel>Subtle surface × every appearance role</SectionLabel>
        {ALL_APPEARANCES.map((appearance) => (
          <VariantMatrix
            key={`subtle-${appearance}`}
            title={`subtle · ${appearance}`}
            description={`Rows 1–3: auto on ${appearance} tinted card. Rows 4–6: ctrl · ${contrastingControlAppearance(appearance)}. Start + CounterBadge slots.`}
            surface={{ mode: 'subtle', appearance }}
            contrastingControlAppearance={contrastingControlAppearance(appearance)}
            withSlots
          />
        ))}
      </View>

      <View style={{ gap: tokens.spacing['4'] }}>
        <SectionLabel>Rectangular shape — page root matrix (text + slots)</SectionLabel>
        <VariantMatrix
          title="rectangular · pill comparison"
          description="shape=rectangular · start icon + end CounterBadge. Both auto and contrasting rows."
          shape="rectangular"
          withSlots
          contrastingControlAppearance="primary"
        />
      </View>

      <View style={{ gap: tokens.spacing['4'] }}>
        <SectionLabel>Icon type — page root matrix</SectionLabel>
        <VariantMatrix
          title="icon · page root"
          description="type=icon · icon-only segments. Both auto and contrasting rows."
          type="icon"
          contrastingControlAppearance="primary"
        />
        <VariantMatrix
          title="icon · rectangular"
          description="type=icon · shape=rectangular. Both auto and contrasting rows."
          type="icon"
          shape="rectangular"
          contrastingControlAppearance="primary"
        />
      </View>
    </View>
  );
}

/** Story: CounterBadgeOnBoldSurface — isolated badge vs segment-slot diagnostic on bold. */
export function SegmentedControlOnBoldSurface(): React.ReactElement {
  return (
    <View style={{ flexDirection: 'column', gap: tokens.spacing['6'], width: '100%' }}>
      <CounterBadgeDiagnostic surfaceMode="bold" surfaceAppearance="brand-bg" />
      <CounterBadgeDiagnostic surfaceMode="bold" surfaceAppearance="primary" />
    </View>
  );
}

function CounterBadgeDiagnostic({
  surfaceMode,
  surfaceAppearance,
}: {
  surfaceMode: (typeof SURFACE_MODES)[number];
  surfaceAppearance: ResolvedAppearance;
}): React.ReactElement {
  const attentions = ['high', 'medium', 'low'] as const;
  const badgeSizes = ['xs', 's'] as const;
  return (
    <Surface mode={surfaceMode} appearance={surfaceAppearance} style={surfaceShell}>
      <SectionLabel>
        CounterBadge diagnostic — {surfaceMode} · {surfaceAppearance}
      </SectionLabel>
      <Caption>
        Isolated CounterBadge rows vs SegmentedControl end slots on the same bold Surface. The
        selected segment badge should stay distinguishable (not a flat fill).
      </Caption>

      <View style={{ gap: tokens.spacing['2'] }}>
        <AxisLabel align="end">isolated · attention high / medium / low + cross-role</AxisLabel>
        <View style={row}>
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
        </View>
      </View>

      <View style={{ gap: tokens.spacing['2'] }}>
        <AxisLabel align="end">SegmentedControl · att high · track high · auto</AxisLabel>
        <DemoSegments size="s" attention="high" trackEmphasis="high" withSlots equalWidth={false} />
      </View>

      <View style={{ gap: tokens.spacing['2'] }}>
        <AxisLabel align="end">
          SegmentedControl · att high · ctrl · {contrastingControlAppearance(surfaceAppearance)}
        </AxisLabel>
        <DemoSegments
          size="s"
          attention="high"
          trackEmphasis="high"
          appearance={contrastingControlAppearance(surfaceAppearance)}
          withSlots
          equalWidth={false}
        />
      </View>

      <View style={{ gap: tokens.spacing['2'] }}>
        <AxisLabel align="end">badge size scale on this surface (xs / s)</AxisLabel>
        <View style={row}>
          {badgeSizes.map((size) => (
            <CounterBadge key={size} value={7} size={size} aria-label={`size ${size}`} />
          ))}
        </View>
      </View>
    </Surface>
  );
}

/** Story: NestedSurfaces — control inside stacked Surface contexts. */
export function SegmentedControlNestedSurfaces(): React.ReactElement {
  const shell = { padding: tokens.spacing['4-5'], gap: tokens.spacing['3'] };
  const innerShell = { padding: tokens.spacing['4'], gap: tokens.spacing['3'] };
  return (
    <View style={column}>
      <Caption>
        Unselected labels/icons use the track role remapped by each ancestor Surface. Selected
        segment badges re-step for bold-on-bold contrast at depth.
      </Caption>

      <View style={{ gap: tokens.spacing['2'] }}>
        <Caption>bold · primary → control (auto)</Caption>
        <Surface mode="bold" appearance="primary" style={shell}>
          <DemoSegments withSlots equalWidth={false} defaultValue="b" />
        </Surface>
      </View>

      <View style={{ gap: tokens.spacing['2'] }}>
        <Caption>bold · brand-bg → control (auto)</Caption>
        <Surface mode="bold" appearance="brand-bg" style={shell}>
          <DemoSegments withSlots equalWidth={false} defaultValue="a" />
        </Surface>
      </View>

      <View style={{ gap: tokens.spacing['2'] }}>
        <Caption>bold · primary → subtle · secondary → control (auto)</Caption>
        <Surface mode="bold" appearance="primary" style={shell}>
          <Surface mode="subtle" appearance="secondary" style={innerShell}>
            <DemoSegments withSlots equalWidth={false} defaultValue="c" />
          </Surface>
        </Surface>
      </View>

      <View style={{ gap: tokens.spacing['2'] }}>
        <Caption>bold · brand-bg → elevated → subtle · primary → control (ctrl · primary)</Caption>
        <Surface mode="bold" appearance="brand-bg" style={shell}>
          <Surface mode="elevated" appearance="brand-bg" style={innerShell}>
            <Surface mode="subtle" appearance="primary" style={innerShell}>
              <DemoSegments appearance="primary" withSlots equalWidth={false} defaultValue="b" />
            </Surface>
          </Surface>
        </Surface>
      </View>
    </View>
  );
}
