/**
 * Badge.showcase.native.tsx
 *
 * Variant matrix aligned with `packages/ui/src/components/Badge/Badge.stories.tsx`.
 * Slots compose real components — `Avatar`, `CounterBadge`, `IndicatorBadge` —
 * which auto-size against the parent Badge via the slot context provided by
 * `Badge.native.tsx`. The showcase carries zero sizing / colour logic; mirrors
 * the web Stories pattern of plain JSX composition.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { tokens, typography } from '@oneui/tokens';
import type { BadgeAppearance, BadgeAttention, BadgeSize } from './interface';
import { Badge } from './Badge.native';
import { Avatar } from '../Avatar/Avatar.native';
import { CounterBadge } from '../CounterBadge/CounterBadge.native';
import { IndicatorBadge } from '../IndicatorBadge/IndicatorBadge.native';
import { Surface, useSurfaceTokens, useTypographyTokens } from '../../theme';

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const subsection: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3'],
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        color: role.content.low,
      }}
    >
      {children}
    </Text>
  );
}

export function BadgeDefault(): React.ReactElement {
  return (
    <View style={column}>
      <Badge attention='high' size='m' aria-label='Status badge'>
        Badge
      </Badge>
      <Label>High / Medium / Low (attention)</Label>
      <View style={row}>
        <Badge attention='high' aria-label='High'>
          High
        </Badge>
        <Badge attention='medium' aria-label='Medium'>
          Medium
        </Badge>
        <Badge attention='low' aria-label='Low'>
          Low
        </Badge>
      </View>
    </View>
  );
}

/** Storybook "Variants" — attention high / medium / low. */
export function BadgeVariants(): React.ReactElement {
  return (
    <View style={row}>
      <Badge attention='high' aria-label='High attention'>
        Badge
      </Badge>
      <Badge attention='medium' aria-label='Medium attention'>
        Badge
      </Badge>
      <Badge attention='low' aria-label='Low attention'>
        Badge
      </Badge>
    </View>
  );
}

export function BadgeSizes(): React.ReactElement {
  const sizes: BadgeSize[] = ['xs', 's', 'm', 'l', 'xl'];
  return (
    <View style={row}>
      {sizes.map((s) => (
        <Badge key={s} size={s} aria-label={`${s} badge`}>
          {s.toUpperCase()}
        </Badge>
      ))}
    </View>
  );
}

export function BadgeWithSlots(): React.ReactElement {
  return (
    <View style={column}>
      <View style={subsection}>
        <Label>Text only</Label>
        <View style={row}>
          <Badge attention='high' aria-label='Badge'>
            Badge
          </Badge>
          <Badge attention='medium' aria-label='Badge'>
            Badge
          </Badge>
          <Badge attention='low' aria-label='Badge'>
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>Start: Avatar (icon)</Label>
        <View style={row}>
          <Badge attention='high' start={<Avatar content='icon' alt='I' />} aria-label='Badge'>
            Badge
          </Badge>
          <Badge attention='medium' start={<Avatar content='icon' alt='I' />} aria-label='Badge'>
            Badge
          </Badge>
          <Badge attention='low' start={<Avatar content='icon' alt='I' />} aria-label='Badge'>
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>Start + End: Avatar (icon)</Label>
        <View style={row}>
          <Badge
            attention='high'
            start={<Avatar content='icon' alt='I' />}
            end={<Avatar content='icon' alt='I' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
          <Badge
            attention='medium'
            start={<Avatar content='icon' alt='I' />}
            end={<Avatar content='icon' alt='I' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
          <Badge
            attention='low'
            start={<Avatar content='icon' alt='I' />}
            end={<Avatar content='icon' alt='I' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>Start: IndicatorBadge (negative)</Label>
        <View style={row}>
          <Badge
            attention='high'
            start={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
          <Badge
            attention='medium'
            start={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
          <Badge
            attention='low'
            start={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>End: IndicatorBadge (negative)</Label>
        <View style={row}>
          <Badge
            attention='high'
            end={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
          <Badge
            attention='medium'
            end={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
          <Badge
            attention='low'
            end={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>Start: CounterBadge</Label>
        <View style={row}>
          <Badge
            attention='high'
            start={<CounterBadge value={3} appearance='negative' aria-label='3' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
          <Badge
            attention='medium'
            start={<CounterBadge value={3} appearance='negative' aria-label='3' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
          <Badge
            attention='low'
            start={<CounterBadge value={3} appearance='negative' aria-label='3' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>Start: Avatar (text initials)</Label>
        <View style={row}>
          <Badge attention='high' start={<Avatar content='text' alt='AB' />} aria-label='Badge'>
            Badge
          </Badge>
          <Badge attention='medium' start={<Avatar content='text' alt='AB' />} aria-label='Badge'>
            Badge
          </Badge>
          <Badge attention='low' start={<Avatar content='text' alt='AB' />} aria-label='Badge'>
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>End: CounterBadge</Label>
        <View style={row}>
          <Badge
            attention='high'
            end={<CounterBadge value={3} appearance='negative' aria-label='3' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
          <Badge
            attention='medium'
            end={<CounterBadge value={3} appearance='negative' aria-label='3' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
          <Badge
            attention='low'
            end={<CounterBadge value={3} appearance='negative' aria-label='3' />}
            aria-label='Badge'
          >
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>End: Avatar (text initials)</Label>
        <View style={row}>
          <Badge attention='high' end={<Avatar content='text' alt='AB' />} aria-label='Badge'>
            Badge
          </Badge>
          <Badge attention='medium' end={<Avatar content='text' alt='AB' />} aria-label='Badge'>
            Badge
          </Badge>
          <Badge attention='low' end={<Avatar content='text' alt='AB' />} aria-label='Badge'>
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>Sizes with Avatar (icon) start slot</Label>
        <View style={row}>
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
            <Badge
              key={size}
              size={size}
              start={<Avatar content='icon' alt='I' />}
              aria-label={`${size} with icon`}
            >
              Badge
            </Badge>
          ))}
        </View>
      </View>
    </View>
  );
}

function SizeColumn({
  size,
  children,
  dash,
}: {
  size: BadgeSize;
  children: React.ReactNode;
  dash?: boolean;
}): React.ReactElement {
  const primary = useSurfaceTokens('primary');
  return (
    <View style={{ alignItems: 'center', gap: tokens.spacing['2-5'] }}>
      {dash ? (
        <Text
          style={{
            fontSize: typography.size.xs,
            color: primary.content.low,
            opacity: 0.35,
          }}
        >
          —
        </Text>
      ) : (
        children
      )}
      <Text style={{ fontSize: typography.size.xs, color: primary.content.low }}>
        {size.toUpperCase()}
      </Text>
    </View>
  );
}

export function BadgeSizesWithSlots(): React.ReactElement {
  const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;

  return (
    <View style={column}>
      <View style={subsection}>
        <Label>Avatar (icon)</Label>
        <View style={row}>
          {sizes.map((size) => (
            <SizeColumn key={size} size={size}>
              <Badge size={size} start={<Avatar content='icon' alt='I' />} aria-label={`${size} with icon`}>
                Badge
              </Badge>
            </SizeColumn>
          ))}
        </View>
      </View>
      <View style={subsection}>
        <Label>Avatar (text)</Label>
        <View style={row}>
          {sizes.map((size) => (
            <SizeColumn key={size} size={size}>
              <Badge size={size} start={<Avatar content='text' alt='AB' />} aria-label={`${size} with avatar`}>
                Badge
              </Badge>
            </SizeColumn>
          ))}
        </View>
      </View>
      <View style={subsection}>
        <Label>CounterBadge (xs/s omitted — counter min size)</Label>
        <View style={row}>
          {sizes.map((size) => {
            const dash = size === 'xs' || size === 's';
            return (
              <SizeColumn key={size} size={size} dash={dash}>
                <Badge
                  size={size}
                  start={<CounterBadge value={3} appearance='negative' aria-label='3' />}
                  aria-label={`${size} with counter`}
                >
                  Badge
                </Badge>
              </SizeColumn>
            );
          })}
        </View>
      </View>
      <View style={subsection}>
        <Label>IndicatorBadge</Label>
        <View style={row}>
          {sizes.map((size) => (
            <SizeColumn key={size} size={size}>
              <Badge
                size={size}
                start={<IndicatorBadge appearance='negative' aria-label='alert' />}
                aria-label={`${size} with indicator`}
              >
                Badge
              </Badge>
            </SizeColumn>
          ))}
        </View>
      </View>
    </View>
  );
}

export function BadgeAppearances(): React.ReactElement {
  const appearances = [...COMPONENT_APPEARANCE_ROLES] as BadgeAppearance[];
  return (
    <View style={column}>
      {appearances.map((appearance) => (
        <View key={appearance} style={subsection}>
          <Label>{appearance.charAt(0).toUpperCase() + appearance.slice(1)}</Label>
          <View style={row}>
            <Badge appearance={appearance} attention='high' aria-label={`${appearance} high`}>
              Badge
            </Badge>
            <Badge appearance={appearance} attention='medium' aria-label={`${appearance} medium`}>
              Badge
            </Badge>
            <Badge appearance={appearance} attention='low' aria-label={`${appearance} low`}>
              Badge
            </Badge>
          </View>
        </View>
      ))}
    </View>
  );
}

const THEME_SURFACES = ['default', 'minimal', 'subtle', 'bold', 'elevated'] as const;

export function BadgeThemes(): React.ReactElement {
  return (
    <View style={column}>
      {THEME_SURFACES.map((mode) => (
        <View key={mode} style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}>
          <View style={{ width: tokens.spacing['9'] }}>
            <Label>{mode}</Label>
          </View>
          <Surface
            mode={mode}
            appearance='primary'
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: tokens.spacing['3-5'],
              padding: tokens.spacing['4'],
              borderRadius: tokens.shape.m,
            }}
          >
            <Badge attention='high' aria-label='High'>
              Badge
            </Badge>
            <Badge attention='medium' aria-label='Medium'>
              Badge
            </Badge>
            <Badge attention='low' aria-label='Low'>
              Badge
            </Badge>
            <Badge
              attention='high'
              start={<IndicatorBadge appearance='negative' aria-label='alert' />}
              aria-label='With indicator'
            >
              Badge
            </Badge>
            <Badge
              attention='high'
              start={<CounterBadge value={3} appearance='negative' aria-label='3' />}
              aria-label='With counter'
            >
              Badge
            </Badge>
            <Badge
              attention='high'
              start={<Avatar content='icon' alt='I' />}
              aria-label='With icon'
            >
              Badge
            </Badge>
          </Surface>
        </View>
      ))}
    </View>
  );
}

export function BadgeSlotAdaptation(): React.ReactElement {
  return (
    <View style={column}>
      <View style={subsection}>
        <Label>High — slots</Label>
        <View style={row}>
          <Badge attention='high' start={<Avatar content='icon' alt='I' />} aria-label='High with icon'>
            Badge
          </Badge>
          <Badge
            attention='high'
            start={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='High with indicator'
          >
            Badge
          </Badge>
          <Badge
            attention='high'
            start={<CounterBadge value={3} appearance='negative' aria-label='3' />}
            aria-label='High with counter'
          >
            Badge
          </Badge>
          <Badge
            attention='high'
            start={<Avatar content='text' alt='AB' />}
            aria-label='High with avatar text'
          >
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>Medium — slots</Label>
        <View style={row}>
          <Badge attention='medium' start={<Avatar content='icon' alt='I' />} aria-label='Medium with icon'>
            Badge
          </Badge>
          <Badge
            attention='medium'
            start={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='Medium with indicator'
          >
            Badge
          </Badge>
          <Badge
            attention='medium'
            start={<CounterBadge value={3} appearance='negative' aria-label='3' />}
            aria-label='Medium with counter'
          >
            Badge
          </Badge>
          <Badge
            attention='medium'
            start={<Avatar content='text' alt='AB' />}
            aria-label='Medium with avatar text'
          >
            Badge
          </Badge>
        </View>
      </View>
      <View style={subsection}>
        <Label>Low — slots</Label>
        <View style={row}>
          <Badge attention='low' start={<Avatar content='icon' alt='I' />} aria-label='Low with icon'>
            Badge
          </Badge>
          <Badge
            attention='low'
            start={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='Low with indicator'
          >
            Badge
          </Badge>
          <Badge
            attention='low'
            start={<CounterBadge value={3} appearance='negative' aria-label='3' />}
            aria-label='Low with counter'
          >
            Badge
          </Badge>
          <Badge
            attention='low'
            start={<Avatar content='text' alt='AB' />}
            aria-label='Low with avatar text'
          >
            Badge
          </Badge>
        </View>
      </View>
    </View>
  );
}

/* ========================================
   Responsive — same matrix as Sizes, framed for narrow viewports.
   Mirrors web `Responsive` story.
   ======================================== */
export function BadgeResponsive(): React.ReactElement {
  const sizes: BadgeSize[] = ['xs', 's', 'm', 'l', 'xl'];
  return (
    <View style={[row, { alignItems: 'center' }]}>
      {sizes.map((s) => (
        <Badge key={s} size={s} aria-label={`${s.toUpperCase()} badge`}>
          Badge
        </Badge>
      ))}
    </View>
  );
}

/* ========================================
   FigmaSlotMatrix — mirrors web `FigmaSlotMatrix` story.
   Bold / Subtle / Ghost variants × every slot composition.
   ======================================== */
const SLOT_MATRIX_ATTENTIONS: BadgeAttention[] = ['high', 'medium', 'low'];

function SlotMatrixRow({
  label,
  factory,
}: {
  label: string;
  factory: (attention: BadgeAttention) => React.ReactNode;
}): React.ReactElement {
  return (
    <View style={subsection}>
      <Label>{label}</Label>
      <View style={row}>
        {SLOT_MATRIX_ATTENTIONS.map((attention) => (
          <React.Fragment key={attention}>{factory(attention)}</React.Fragment>
        ))}
      </View>
    </View>
  );
}

export function BadgeFigmaSlotMatrix(): React.ReactElement {
  return (
    <View style={column}>
      <SlotMatrixRow
        label='Text only'
        factory={(attention) => (
          <Badge attention={attention} size='m' aria-label='Text only badge'>
            Badge
          </Badge>
        )}
      />
      <SlotMatrixRow
        label='Start: Avatar (icon)'
        factory={(attention) => (
          <Badge
            attention={attention}
            size='m'
            start={<Avatar content='icon' alt='I' />}
            aria-label='Badge with start icon'
          >
            Badge
          </Badge>
        )}
      />
      <SlotMatrixRow
        label='Start + End: Avatar (icon)'
        factory={(attention) => (
          <Badge
            attention={attention}
            size='m'
            start={<Avatar content='icon' alt='I' />}
            end={<Avatar content='icon' alt='I' />}
            aria-label='Badge with both icons'
          >
            Badge
          </Badge>
        )}
      />
      <SlotMatrixRow
        label='Start: IndicatorBadge (negative)'
        factory={(attention) => (
          <Badge
            attention={attention}
            size='m'
            start={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='Badge with start indicator'
          >
            Badge
          </Badge>
        )}
      />
      <SlotMatrixRow
        label='End: IndicatorBadge (negative)'
        factory={(attention) => (
          <Badge
            attention={attention}
            size='m'
            end={<IndicatorBadge appearance='negative' aria-label='alert' />}
            aria-label='Badge with end indicator'
          >
            Badge
          </Badge>
        )}
      />
      <SlotMatrixRow
        label='Start: CounterBadge'
        factory={(attention) => (
          <Badge
            attention={attention}
            size='m'
            start={<CounterBadge value={3} appearance='negative' aria-label='3' />}
            aria-label='Badge with start counter'
          >
            Badge
          </Badge>
        )}
      />
      <SlotMatrixRow
        label='Start: Avatar (text initials)'
        factory={(attention) => (
          <Badge
            attention={attention}
            size='m'
            start={<Avatar content='text' alt='AB' />}
            aria-label='Badge with start avatar'
          >
            Badge
          </Badge>
        )}
      />
      <SlotMatrixRow
        label='End: Avatar (text initials)'
        factory={(attention) => (
          <Badge
            attention={attention}
            size='m'
            end={<Avatar content='text' alt='AB' />}
            aria-label='Badge with end avatar'
          >
            Badge
          </Badge>
        )}
      />
      <View style={subsection}>
        <Label>Sizes with Avatar (icon) start slot — high attention (regression target)</Label>
        <View style={row}>
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
            <Badge
              key={size}
              attention='high'
              size={size}
              start={<Avatar content='icon' alt='I' />}
              aria-label={`${size} badge with avatar`}
            >
              Badge
            </Badge>
          ))}
        </View>
      </View>
    </View>
  );
}

export function BadgeSurfaceContextBold(): React.ReactElement {
  return (
    <Surface
      mode='bold'
      appearance='primary'
      style={{
        padding: tokens.spacing['4'],
        borderRadius: tokens.shape.m,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: tokens.spacing['3-5'],
        alignItems: 'center',
      }}
    >
      <Badge attention='high' aria-label='High'>
        Badge
      </Badge>
      <Badge attention='medium' aria-label='Medium'>
        Badge
      </Badge>
      <Badge attention='low' aria-label='Low'>
        Badge
      </Badge>
      <Badge attention='high' start={<Avatar content='icon' alt='I' />} aria-label='With icon'>
        Badge
      </Badge>
      <Badge attention='high' start={<Avatar content='text' alt='AB' />} aria-label='With avatar'>
        Badge
      </Badge>
    </Surface>
  );
}

export function BadgeSurfaceContextSubtle(): React.ReactElement {
  return (
    <Surface
      mode='subtle'
      appearance='primary'
      style={{
        padding: tokens.spacing['4'],
        borderRadius: tokens.shape.m,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: tokens.spacing['3-5'],
        alignItems: 'center',
      }}
    >
      <Badge attention='high' aria-label='High'>
        Badge
      </Badge>
      <Badge attention='medium' aria-label='Medium'>
        Badge
      </Badge>
      <Badge attention='low' aria-label='Low'>
        Badge
      </Badge>
      <Badge attention='high' start={<Avatar content='icon' alt='I' />} aria-label='With icon'>
        Badge
      </Badge>
      <Badge attention='high' start={<Avatar content='text' alt='AB' />} aria-label='With avatar'>
        Badge
      </Badge>
    </Surface>
  );
}

export function BadgeSurfaceContextAllModes(): React.ReactElement {
  const modes = ['default', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'] as const;
  return (
    <View style={column}>
      {modes.map((mode) => (
        <Surface
          key={mode}
          mode={mode}
          appearance='primary'
          style={{
            padding: tokens.spacing['4'],
            borderRadius: tokens.shape.m,
            gap: tokens.spacing['3-5'],
          }}
        >
          <Label>{mode}</Label>
          <View style={row}>
            <Badge attention='high' aria-label='High'>
              Badge
            </Badge>
            <Badge attention='medium' aria-label='Medium'>
              Badge
            </Badge>
            <Badge attention='low' aria-label='Low'>
              Badge
            </Badge>
          </View>
          <View style={row}>
            <Badge attention='high' start={<Avatar content='icon' alt='I' />} aria-label='Icon'>
              Badge
            </Badge>
            <Badge attention='high' start={<Avatar content='text' alt='AB' />} aria-label='Avatar'>
              Badge
            </Badge>
            <Badge
              attention='high'
              start={<IndicatorBadge appearance='negative' aria-label='alert' />}
              aria-label='Indicator'
            >
              Badge
            </Badge>
          </View>
        </Surface>
      ))}
    </View>
  );
}

/**
 * TalkBack / VoiceOver verification: badge label + accessible slot children stay
 * separate focus targets (Avatar `alt`, CounterBadge `aria-label`).
 */
export function BadgeAccessibilityWithSlots(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const bodyTypo = useTypographyTokens('body', 'S', { emphasis: 'low' });
  return (
    <View style={column}>
      <Text
        style={{
          fontSize: bodyTypo.fontSize,
          lineHeight: bodyTypo.lineHeight,
          fontWeight: bodyTypo.fontWeight,
          fontFamily: bodyTypo.fontFamily,
          color: role.content.medium,
        }}
      >
        Turn on TalkBack (Android) or VoiceOver (iOS). Swipe through each badge below.
        You should hear the Avatar or counter first, then the badge summary — not a single
        merged announcement with hidden slots.
      </Text>
      <View style={subsection}>
        <Label>Visible text + Avatar alt (two stops: Jane Doe, then badge label)</Label>
        <Badge
          attention='high'
          aria-label='3 unread messages'
          start={<Avatar content='text' alt='Jane Doe' />}
        >
          New
        </Badge>
      </View>
      <View style={subsection}>
        <Label>aria-label only + Avatar alt (Jane Doe, then 3 unread messages)</Label>
        <Badge
          attention='high'
          aria-label='3 unread messages'
          start={<Avatar content='text' alt='Jane Doe' />}
        />
      </View>
      <View style={subsection}>
        <Label>Counter slot with its own aria-label</Label>
        <Badge
          attention='medium'
          aria-label='Notifications'
          end={<CounterBadge value={9} aria-label='9 new items' />}
        >
          Inbox
        </Badge>
      </View>
    </View>
  );
}

/**
 * BadgeMetallicMaterial — bold badge that renders a metallic gradient fill
 * when the active brand has a material assignment for the primary role.
 * Use the Tira brand in the sample app to see the gold gradient.
 */
export function BadgeMetallicMaterial(): React.ReactElement {
  return (
    <View style={column}>
      <Label>Bold (primary) — gold gradient on Tira, solid on other brands</Label>
      <View style={row}>
        <Badge attention='high' size='s' aria-label='metallic badge'>S</Badge>
        <Badge attention='high' size='m' aria-label='metallic badge'>M</Badge>
        <Badge attention='high' size='l' aria-label='metallic badge'>L</Badge>
      </View>
      <Label>Bold (secondary) — follows secondary role assignment</Label>
      <View style={row}>
        <Badge appearance='secondary' attention='high' size='m' aria-label='metallic badge secondary'>Sec</Badge>
      </View>
      <Label>Subtle + Ghost — never metallic</Label>
      <View style={row}>
        <Badge attention='medium' size='m' aria-label='subtle badge'>Medium</Badge>
        <Badge attention='low' size='m' aria-label='ghost badge'>Low</Badge>
      </View>
    </View>
  );
}
