/**
 * HeaderItem.showcase.native.tsx
 *
 * Item-only matrix for Figma Header.Item (3342:59395) — mirrors web
 * `HeaderItem.stories.tsx` attention / slot / alignment sections.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import { Icon } from '../Icon/Icon.native';
import { IndicatorBadge } from '../IndicatorBadge/IndicatorBadge.native';
import { useSurfaceTokens, useTypographyTokens, typographyToTextStyle } from '../../theme';
import { HeaderItem } from './HeaderItem.native';
import type { HeaderItemAttention } from './interface';
import { ROW_HEIGHT } from './Header.styles.native';
import { collectHeaderItemElements, headerItemElementKey } from './Header.utils.native';

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4-5'],
  width: '100%',
};

const navRow: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'stretch',
  minHeight: ROW_HEIGHT,
  gap: tokens.spacing['1'],
  flexWrap: 'wrap',
};

function Caption({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const captionTypography = useTypographyTokens('label', 'XS', { emphasis: 'low' });
  return (
    <Text style={[typographyToTextStyle(captionTypography), { color: role.content.medium }]}>
      {children}
    </Text>
  );
}

function NavItemRow({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <View style={navRow}>
      {collectHeaderItemElements(children).map((child, index) => (
        <React.Fragment key={headerItemElementKey(child.props.value, index)}>{child}</React.Fragment>
      ))}
    </View>
  );
}

const HOME_ICON = <Icon icon="home" size="4" appearance="neutral" />;
const CHEVRON_ICON = <Icon icon="chevronDown" size="4" appearance="neutral" />;
const CHEVRON_RIGHT_ICON = <Icon icon="chevronRight" size="4" appearance="neutral" />;
const BADGE_S = <IndicatorBadge aria-label="New" appearance="negative" />;

/* ========================================
   Attention levels — inactive vs active
   ======================================== */

export function HeaderItemAttentionLevels(): React.ReactElement {
  const attentions: HeaderItemAttention[] = ['low', 'medium', 'high'];

  return (
    <View style={column}>
      {attentions.map((attention) => (
        <View key={attention} style={{ gap: tokens.spacing['2'] }}>
          <Caption>attention=&quot;{attention}&quot;</Caption>
          <NavItemRow>
            <HeaderItem value={`${attention}-idle`} attention={attention}>
              Inactive
            </HeaderItem>
            <HeaderItem value={`${attention}-active`} attention={attention} active>
              Active
            </HeaderItem>
          </NavItemRow>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   Full matrix — all attention × active (label only)
   ======================================== */

export function HeaderItemFullMatrix(): React.ReactElement {
  const attentions: HeaderItemAttention[] = ['low', 'medium', 'high'];
  const states = [
    { label: 'inactive', active: false },
    { label: 'active', active: true },
  ] as const;

  return (
    <View style={column}>
      {attentions.map((attention) => (
        <View key={attention} style={{ gap: tokens.spacing['2'] }}>
          <Caption>{attention}</Caption>
          <NavItemRow>
            {states.map(({ label, active }) => (
              <HeaderItem
                key={`${attention}-${label}`}
                value={`${attention}-${label}`}
                attention={attention}
                active={active}
              >
                {label}
              </HeaderItem>
            ))}
          </NavItemRow>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   Start slots — S (badge) and M (icon)
   ======================================== */

export function HeaderItemStartSlots(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Caption>startSize=&quot;M&quot; — 16px icon</Caption>
        <NavItemRow>
          <HeaderItem value="start-m-idle" attention="medium" startSize="M" start={HOME_ICON}>
            Home
          </HeaderItem>
          <HeaderItem value="start-m-active" attention="medium" startSize="M" start={HOME_ICON} active>
            Home
          </HeaderItem>
        </NavItemRow>
      </View>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Caption>startSize=&quot;S&quot; — indicator badge</Caption>
        <NavItemRow>
          <HeaderItem value="start-s-idle" attention="medium" startSize="S" start={BADGE_S}>
            Updates
          </HeaderItem>
          <HeaderItem value="start-s-active" attention="medium" startSize="S" start={BADGE_S} active>
            Updates
          </HeaderItem>
        </NavItemRow>
      </View>
    </View>
  );
}

/* ========================================
   End slots — S and M
   ======================================== */

export function HeaderItemEndSlots(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Caption>endSize=&quot;M&quot; — 16px icon</Caption>
        <NavItemRow>
          <HeaderItem value="end-m-idle" attention="medium" endSize="M" end={CHEVRON_ICON}>
            Menu
          </HeaderItem>
          <HeaderItem value="end-m-active" attention="medium" endSize="M" end={CHEVRON_ICON} active>
            Menu
          </HeaderItem>
        </NavItemRow>
      </View>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Caption>endSize=&quot;S&quot; — indicator badge</Caption>
        <NavItemRow>
          <HeaderItem value="end-s-idle" attention="medium" endSize="S" end={BADGE_S}>
            Inbox
          </HeaderItem>
          <HeaderItem value="end-s-active" attention="medium" endSize="S" end={BADGE_S} active>
            Inbox
          </HeaderItem>
        </NavItemRow>
      </View>
    </View>
  );
}

/* ========================================
   Combined start + end slots
   ======================================== */

export function HeaderItemCombinedSlots(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Caption>medium — start M + end S</Caption>
        <NavItemRow>
          <HeaderItem
            value="combo-med-idle"
            attention="medium"
            startSize="M"
            start={HOME_ICON}
            endSize="S"
            end={BADGE_S}
          >
            Home
          </HeaderItem>
          <HeaderItem
            value="combo-med-active"
            attention="medium"
            startSize="M"
            start={HOME_ICON}
            endSize="S"
            end={BADGE_S}
            active
          >
            Home
          </HeaderItem>
        </NavItemRow>
      </View>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Caption>high — start S + end M (pill when active)</Caption>
        <NavItemRow>
          <HeaderItem
            value="combo-high-idle"
            attention="high"
            startSize="S"
            start={BADGE_S}
            endSize="M"
            end={CHEVRON_RIGHT_ICON}
          >
            Category
          </HeaderItem>
          <HeaderItem
            value="combo-high-active"
            attention="high"
            startSize="S"
            start={BADGE_S}
            endSize="M"
            end={CHEVRON_RIGHT_ICON}
            active
          >
            Category
          </HeaderItem>
        </NavItemRow>
      </View>
    </View>
  );
}

/* ========================================
   visuallyAlignToStart — first item flush start
   ======================================== */

export function HeaderItemAlignToStart(): React.ReactElement {
  return (
    <View style={{ gap: tokens.spacing['2'], paddingStart: tokens.spacing.Margin }}>
      <Caption>First item uses visuallyAlignToStart (paddingStart: 0)</Caption>
      <NavItemRow>
        <HeaderItem value="align-1" attention="medium" visuallyAlignToStart active>
          First
        </HeaderItem>
        <HeaderItem value="align-2" attention="medium">
          Second
        </HeaderItem>
        <HeaderItem value="align-3" attention="medium">
          Third
        </HeaderItem>
      </NavItemRow>
    </View>
  );
}

/* ========================================
   Attention × slots matrix (active only)
   ======================================== */

export function HeaderItemAttentionSlotMatrix(): React.ReactElement {
  const attentions: HeaderItemAttention[] = ['low', 'medium', 'high'];

  return (
    <View style={column}>
      {attentions.map((attention) => (
        <View key={attention} style={{ gap: tokens.spacing['2'] }}>
          <Caption>{attention} · active · start M + end S</Caption>
          <NavItemRow>
            <HeaderItem
              value={`slot-${attention}`}
              attention={attention}
              startSize="M"
              start={HOME_ICON}
              endSize="S"
              end={BADGE_S}
              active
            >
              Label
            </HeaderItem>
          </NavItemRow>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   Disabled state
   ======================================== */

export function HeaderItemDisabled(): React.ReactElement {
  return (
    <NavItemRow>
      <HeaderItem value="disabled-low" attention="low" disabled>
        Disabled
      </HeaderItem>
      <HeaderItem value="disabled-med" attention="medium" disabled active>
        Disabled active
      </HeaderItem>
      <HeaderItem value="disabled-high" attention="high" disabled active>
        Disabled active
      </HeaderItem>
    </NavItemRow>
  );
}
