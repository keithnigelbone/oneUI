/**
 * Chip.showcase.native.tsx — peer of packages/ui/src/components/Chip/Chip.showcase.tsx
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { tokens, typography } from '@oneui/tokens';
import { Icon } from '../Icon';
import { Surface, useSurfaceTokens } from '../../theme';
import { Avatar } from '../Avatar/Avatar.native';
import { CounterBadge } from '../CounterBadge/CounterBadge.native';
import { IndicatorBadge } from '../IndicatorBadge/IndicatorBadge.native';
import { Chip } from './Chip.native';
import { resolveChipLayout, type ChipLayoutMetrics, type ChipSlotKind } from './chipLayoutMatrix';
import type { ChipAttention, ChipSize } from './interface';
import { IcCheckGlyph, IcCloseGlyph, IcHeartGlyph } from './chipShowcaseGlyphs';

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['4'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4-5'],
  width: '100%',
};

function Caption({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>{children}</Text>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.s,
        color: role.content.medium,
        fontWeight: typography.weight.medium,
        textTransform: 'capitalize',
      }}
    >
      {children}
    </Text>
  );
}

export function ChipAttentionLevels(): React.ReactElement {
  const attentions: ChipAttention[] = ['high', 'medium', 'low'];
  return (
    <View style={column}>
      {attentions.map((attention) => (
        <View key={attention} style={column}>
          <SectionLabel>{attention}</SectionLabel>
          <View style={row}>
            <View style={{ alignItems: 'center', gap: tokens.spacing['2'] }}>
              <Caption>Selected</Caption>
              <Chip appearance="secondary" attention={attention} defaultSelected>
                {attention}
              </Chip>
            </View>
            <View style={{ alignItems: 'center', gap: tokens.spacing['2'] }}>
              <Caption>Unselected</Caption>
              <Chip appearance="secondary" attention={attention}>
                {attention}
              </Chip>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function ChipSizes(): React.ReactElement {
  const sizes: ChipSize[] = ['s', 'm', 'l'];
  return (
    <View style={column}>
      {sizes.map((size) => (
        <View key={size} style={column}>
          <SectionLabel>{size.toUpperCase()}</SectionLabel>
          <View style={row}>
            <Chip size={size} appearance="secondary" attention="high" defaultSelected>
              {size.toUpperCase()}
            </Chip>
            <Chip size={size} appearance="secondary" attention="high">
              {size.toUpperCase()}
            </Chip>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Interactive QA — verifies `onSelectedChange(selected, eventDetails)` forwards the
 * Pressable event on native (web/native parity for the second callback argument).
 */
export function ChipSelectedChange(): React.ReactElement {
  const [selected, setSelected] = useState(false);
  const [lastPayload, setLastPayload] = useState('Tap the chip to inspect the callback payload.');

  return (
    <View style={column}>
      <SectionLabel>Controlled toggle</SectionLabel>
      <Caption>Standalone chip — second argument should be the press event, not undefined.</Caption>
      <Chip
        appearance="secondary"
        attention="high"
        selected={selected}
        onSelectedChange={(next, eventDetails) => {
          setSelected(next);
          const nativeEvent = (eventDetails as { nativeEvent?: { timestamp?: number } } | undefined)
            ?.nativeEvent;
          const hasEventDetails = eventDetails != null;
          setLastPayload(
            hasEventDetails
              ? `selected: ${String(next)} · eventDetails: present · timestamp: ${nativeEvent?.timestamp ?? 'n/a'}`
              : `selected: ${String(next)} · eventDetails: missing`,
          );
        }}
        aria-label="Toggle chip"
      >
        {selected ? 'Selected' : 'Unselected'}
      </Chip>
      <Caption>{lastPayload}</Caption>
    </View>
  );
}

export function ChipStates(): React.ReactElement {
  const items = [
    { label: 'Default (unselected)', selected: false, disabled: false },
    { label: 'Selected', selected: true, disabled: false },
    { label: 'Disabled (unselected)', selected: false, disabled: true },
    { label: 'Disabled (selected)', selected: true, disabled: true },
  ] as const;
  return (
    <View style={column}>
      {items.map(({ label, selected, disabled }) => (
        <View key={label} style={{ gap: tokens.spacing['2'] }}>
          <Caption>{label}</Caption>
          <Chip
            appearance="secondary"
            attention="high"
            defaultSelected={selected}
            disabled={disabled}
          >
            Chip
          </Chip>
        </View>
      ))}
    </View>
  );
}

function CheckIcon({ size }: { size: '3' | '4' | '5' }): React.ReactElement {
  return <Icon icon={IcCheckGlyph} size={size} appearance="secondary" aria-hidden />;
}

const ICON_SIZE_BY_CHIP: Record<ChipSize, '3' | '4' | '5'> = { s: '3', m: '4', l: '5' };
const BADGE_SIZE_BY_CHIP: Record<ChipSize, 'xs' | 's' | 'm'> = { s: 'xs', m: 's', l: 'm' };
const CHIP_SIZES: ChipSize[] = ['s', 'm', 'l'];

const TOKEN_KEY_BY_PX = new Map(
  Object.entries(tokens.spacing).map(([key, px]) => [px, key as unknown as string]),
);

function spacingTokenKey(px: number): string {
  return TOKEN_KEY_BY_PX.get(px as any) ?? String(px);
}

function formatLayoutMetrics(metrics: ChipLayoutMetrics): string {
  return [
    `h ${spacingTokenKey(metrics.height)}`,
    `pl ${spacingTokenKey(metrics.paddingLeft)}`,
    `pr ${spacingTokenKey(metrics.paddingRight)}`,
    `gap ${spacingTokenKey(metrics.gap)}`,
  ].join(' · ');
}

/** Heart icon — slot padding matrix QA only (not used in ChipWithSlots). */
function MatrixHeartIcon({ size }: { size: '3' | '4' | '5' }): React.ReactElement {
  return <Icon icon={IcHeartGlyph} size={size} appearance="secondary" aria-hidden />;
}

function matrixIconStart(size: ChipSize): React.ReactElement {
  return <MatrixHeartIcon size={ICON_SIZE_BY_CHIP[size]} />;
}

function matrixIconEnd(size: ChipSize): React.ReactElement {
  return <MatrixHeartIcon size={ICON_SIZE_BY_CHIP[size]} />;
}

function avatarStart(size: ChipSize): React.ReactElement {
  const avatarSize = size === 'l' ? 's' : 'xs';
  return <Avatar size={avatarSize} appearance="secondary" alt="JD" />;
}

function counterBadgeStart(size: ChipSize): React.ReactElement {
  return (
    <CounterBadge
      value={3}
      size={BADGE_SIZE_BY_CHIP[size]}
      appearance="negative"
      aria-label="3 notifications"
    />
  );
}

function counterBadgeEnd(size: ChipSize): React.ReactElement {
  return (
    <CounterBadge
      value={9}
      size={BADGE_SIZE_BY_CHIP[size]}
      appearance="negative"
      aria-label="9 notifications"
    />
  );
}

function indicatorBadgeEnd(size: ChipSize): React.ReactElement {
  return (
    <IndicatorBadge
      size={BADGE_SIZE_BY_CHIP[size]}
      appearance="negative"
      aria-label="Status indicator"
    />
  );
}

interface PaddingPattern {
  id: string;
  title: string;
  detail: string;
  startKind: ChipSlotKind | null;
  endKind: ChipSlotKind | null;
  start?: (size: ChipSize) => React.ReactNode;
  end?: (size: ChipSize) => React.ReactNode;
}

/** All slot padding combinations from chipLayoutMatrix.ts (Figma QA matrix). */
const CHIP_PADDING_PATTERNS: PaddingPattern[] = [
  {
    id: 'none',
    title: 'No slots',
    detail: 'Symmetric horizontal padding only',
    startKind: null,
    endKind: null,
  },
  {
    id: 'affordance-start',
    title: 'Start · heart',
    detail: 'End: none — affordance padding',
    startKind: 'affordance',
    endKind: null,
    start: matrixIconStart,
  },
  {
    id: 'affordance-end',
    title: 'End · heart',
    detail: 'Start: none — mirrored affordance padding',
    startKind: null,
    endKind: 'affordance',
    end: matrixIconEnd,
  },
  {
    id: 'affordance-both',
    title: 'Start + end · heart',
    detail: 'Both affordance — equal side padding',
    startKind: 'affordance',
    endKind: 'affordance',
    start: matrixIconStart,
    end: matrixIconEnd,
  },
  {
    id: 'badge-start',
    title: 'Start · CounterBadge',
    detail: 'End: none — badge padding',
    startKind: 'badge',
    endKind: null,
    start: counterBadgeStart,
  },
  {
    id: 'badge-end',
    title: 'End · IndicatorBadge',
    detail: 'Start: none — mirrored badge padding',
    startKind: null,
    endKind: 'badge',
    end: indicatorBadgeEnd,
  },
  {
    id: 'badge-both',
    title: 'Start + end · CounterBadge',
    detail: 'Both badge — equal side padding',
    startKind: 'badge',
    endKind: 'badge',
    start: counterBadgeStart,
    end: counterBadgeEnd,
  },
  {
    id: 'affordance-badge',
    title: 'Start · heart + End · IndicatorBadge',
    detail: 'Mixed (affordance + badge)',
    startKind: 'affordance',
    endKind: 'badge',
    start: matrixIconStart,
    end: indicatorBadgeEnd,
  },
  {
    id: 'badge-affordance',
    title: 'Start · CounterBadge + End · heart',
    detail: 'Mixed (badge + affordance)',
    startKind: 'badge',
    endKind: 'affordance',
    start: counterBadgeStart,
    end: matrixIconEnd,
  },
];

export function ChipWithSlots(): React.ReactElement {
  return (
    <View style={column}>
      <View style={column}>
        <SectionLabel>Start — Icon</SectionLabel>
        <View style={row}>
          <Chip size="s" appearance="secondary" attention="high" defaultSelected start={<CheckIcon size="3" />}>
            S
          </Chip>
          <Chip size="m" appearance="secondary" attention="high" defaultSelected start={<CheckIcon size="4" />}>
            M
          </Chip>
          <Chip size="l" appearance="secondary" attention="high" defaultSelected start={<CheckIcon size="5" />}>
            L
          </Chip>
        </View>
      </View>
      <View style={column}>
        <SectionLabel>Start — Avatar</SectionLabel>
        <View style={row}>
          <Chip
            size="s"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<Avatar size="xs" appearance="secondary" alt="JD" />}
          >
            S
          </Chip>
          <Chip
            size="m"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<Avatar size="s" appearance="secondary" alt="JD" />}
          >
            M
          </Chip>
        </View>
      </View>
      <View style={column}>
        <SectionLabel>Start — CounterBadge</SectionLabel>
        <View style={row}>
          <Chip
            size="m"
            appearance="secondary"
            attention="high"
            defaultSelected
            start={<CounterBadge value={3} size="xs" appearance="negative" aria-label="3" />}
          >
            M
          </Chip>
        </View>
      </View>
      <View style={column}>
        <SectionLabel>Both slots</SectionLabel>
        <Chip
          appearance="secondary"
          attention="high"
          defaultSelected
          start={<CheckIcon size="4" />}
          end={<Icon icon={IcCloseGlyph} size="4" appearance="secondary" aria-hidden />}
        >
          Icon + Icon
        </Chip>
      </View>
    </View>
  );
}

export function ChipAppearances(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>Selected (High Attention)</Caption>
      <View style={row}>
        {COMPONENT_APPEARANCE_ROLES.map((role) => (
          <Chip
            key={role}
            appearance={role}
            attention="high"
            defaultSelected
            aria-label={`${role} chip`}
          >
            {role}
          </Chip>
        ))}
      </View>
      <Caption>Unselected (Low Attention)</Caption>
      <View style={row}>
        {COMPONENT_APPEARANCE_ROLES.map((role) => (
          <Chip key={role} appearance={role} attention="low" aria-label={`${role} chip`}>
            {role}
          </Chip>
        ))}
      </View>
    </View>
  );
}

const SURFACE_MODES = [
  { mode: 'default' as const, label: 'default' },
  { mode: 'minimal' as const, label: 'minimal' },
  { mode: 'subtle' as const, label: 'subtle' },
  { mode: 'moderate' as const, label: 'moderate' },
  { mode: 'bold' as const, label: 'bold' },
  { mode: 'elevated' as const, label: 'elevated' },
];

export function ChipSurfaceContext(): React.ReactElement {
  return (
    <View style={column}>
      {SURFACE_MODES.map(({ mode, label }) => (
        <View key={mode} style={{ gap: tokens.spacing['3'] }}>
          <Caption>{label}</Caption>
          <Surface mode={mode} appearance="secondary" style={{ padding: tokens.spacing['4-5'] }}>
            <View style={row}>
              <Chip appearance="secondary" attention="high" defaultSelected>
                Selected
              </Chip>
              <Chip appearance="secondary" attention="medium" defaultSelected>
                Medium
              </Chip>
              <Chip appearance="secondary" attention="low">
                Low
              </Chip>
            </View>
          </Surface>
        </View>
      ))}
    </View>
  );
}

export function ChipSlotPaddingMatrix(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>Layout metrics: {`height/padding/gap`} tokens</Caption>
      {CHIP_PADDING_PATTERNS.map((pattern) => (
        <View key={pattern.id} style={{ gap: tokens.spacing['2'] }}>
          <SectionLabel>{pattern.title}</SectionLabel>
          <Caption>{pattern.detail}</Caption>
          <View style={{ gap: tokens.spacing['3'] }}>
            {CHIP_SIZES.map((size) => {
              const metrics = resolveChipLayout(size, pattern.startKind, pattern.endKind);
              return (
                <View key={`${pattern.id}:${size}`} style={{ gap: tokens.spacing['2'] }}>
                  <Caption>
                    {size.toUpperCase()} · {formatLayoutMetrics(metrics)}
                  </Caption>
                  <Chip
                    size={size}
                    appearance="secondary"
                    attention="high"
                    defaultSelected
                    start={pattern.start?.(size)}
                    end={pattern.end?.(size)}
                    aria-label={`${pattern.title} ${size}`}
                  >
                    Chip
                  </Chip>
                </View>
              );
            })}
          </View>
        </View>
      ))}
      <View style={{ gap: tokens.spacing['3'] }}>
        <SectionLabel>Sanity: Avatar kind uses affordance padding</SectionLabel>
        <View style={row}>
          {CHIP_SIZES.map((size) => (
            <Chip
              key={size}
              size={size}
              appearance="secondary"
              attention="high"
              defaultSelected
              start={avatarStart(size)}
              aria-label={`Avatar start ${size}`}
            >
              Avatar
            </Chip>
          ))}
        </View>
      </View>
    </View>
  );
}
