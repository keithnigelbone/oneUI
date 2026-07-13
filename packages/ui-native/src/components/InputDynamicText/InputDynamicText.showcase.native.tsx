/**
 * InputDynamicText.showcase.native.tsx
 *
 * Mirrors `packages/ui/src/components/Input/internals/InputDynamicText.stories.tsx`
 * and the broader Input.showcase examples. One section per story so the
 * native gallery in `apps/native-sample` matches the Storybook layout.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { InputDynamicText } from './InputDynamicText.native';
import type { InputDynamicTextSize } from './interface';
import { Surface, useSurfaceTokens } from '../../theme';

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['5'],
  width: '100%',
};

const labeledRow: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  width: '100%',
};

const surfaceCell: StyleProp<ViewStyle> = {
  padding: tokens.spacing['4'],
  borderRadius: tokens.spacing['2'],
  width: '100%',
};

function Caption({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
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

/**
 * Default — both slots populated, size M. Mirrors web `Default` story.
 */
export function InputDynamicTextDefault(): React.ReactElement {
  return (
    <View style={labeledRow}>
      <InputDynamicText
        size="m"
        content="0 / 280 characters"
        end="Helper Button"
        onEndClick={() => undefined}
      />
      <Caption>Both slots populated</Caption>
    </View>
  );
}

/**
 * Figma sizes (S / M / L) — same row content at each tier so Body XS / S / M
 * typography differences are obvious.
 */
export function InputDynamicTextFigmaSizes(): React.ReactElement {
  const sizes: InputDynamicTextSize[] = ['s', 'm', 'l'];
  return (
    <View style={column}>
      {sizes.map((size) => (
        <View key={size} style={labeledRow}>
          <SectionLabel>Size {size.toUpperCase()}</SectionLabel>
          <InputDynamicText
            size={size}
            content="Dynamic text"
            end="Helper Button"
            onEndClick={() => undefined}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Leading-only and trailing-only configurations — the row stays put with
 * `space-between` for the standard layout and flips to `flex-end` when only
 * the trailing slot is populated.
 */
export function InputDynamicTextSlotCombinations(): React.ReactElement {
  return (
    <View style={column}>
      <View style={labeledRow}>
        <SectionLabel>Leading copy only</SectionLabel>
        <InputDynamicText size="m" content="0 / 280 characters" />
      </View>
      <View style={labeledRow}>
        <SectionLabel>Trailing action only</SectionLabel>
        <InputDynamicText size="m" end="Helper Button" onEndClick={() => undefined} />
      </View>
      <View style={labeledRow}>
        <SectionLabel>Both slots</SectionLabel>
        <InputDynamicText
          size="m"
          content="Trim whitespace allowed"
          end="Clear"
          onEndClick={() => undefined}
        />
      </View>
    </View>
  );
}

/**
 * Disabled state — leading copy dims to Text-Low; trailing Button receives
 * `disabled` and the matching colour treatment from the Button cascade.
 */
export function InputDynamicTextDisabled(): React.ReactElement {
  return (
    <View style={labeledRow}>
      <InputDynamicText
        size="m"
        content="0 / 280 characters"
        end="Helper Button"
        disabled
        onEndClick={() => undefined}
      />
      <Caption>Leading copy at Text-Low, Button disabled</Caption>
    </View>
  );
}

/**
 * Polite live region on the leading copy — VoiceOver / TalkBack will
 * announce updates. Mirrors web `LiveRegion` story.
 */
export function InputDynamicTextLiveRegion(): React.ReactElement {
  return (
    <View style={labeledRow}>
      <InputDynamicText
        size="m"
        content="Updating: 12 / 100 characters"
        end="Clear"
        aria-live="polite"
        onEndClick={() => undefined}
      />
      <Caption>accessibilityLiveRegion: polite</Caption>
    </View>
  );
}

/**
 * Surface context — places the helper row inside a `<Surface mode="bold">`
 * to demonstrate that the content colour (`primary.content.medium`) remaps
 * through the surface cascade without any per-component logic.
 */
export function InputDynamicTextOnSurfaceBold(): React.ReactElement {
  return (
    <View style={column}>
      <View style={labeledRow}>
        <SectionLabel>Default surface</SectionLabel>
        <InputDynamicText
          size="m"
          content="0 / 280 characters"
          end="Helper Button"
          onEndClick={() => undefined}
        />
      </View>
      <View style={labeledRow}>
        <SectionLabel>Surface mode = "bold"</SectionLabel>
        <Surface mode="bold" style={surfaceCell as ViewStyle}>
          <InputDynamicText
            size="m"
            content="0 / 280 characters"
            end="Helper Button"
            onEndClick={() => undefined}
          />
        </Surface>
        <Caption>Content colour remaps via primary.content.medium</Caption>
      </View>
      <View style={labeledRow}>
        <SectionLabel>Surface mode = "subtle"</SectionLabel>
        <Surface mode="subtle" style={surfaceCell as ViewStyle}>
          <InputDynamicText
            size="m"
            content="0 / 280 characters"
            end="Helper Button"
            onEndClick={() => undefined}
          />
        </Surface>
      </View>
    </View>
  );
}

/**
 * Empty-state — when both `content` and `end` are empty / whitespace, the
 * component renders nothing (matches the web `null` early-return).
 */
export function InputDynamicTextEmpty(): React.ReactElement {
  return (
    <View style={labeledRow}>
      <SectionLabel>Empty — both slots blank</SectionLabel>
      <InputDynamicText size="m" content="   " end="" />
      <Caption>Renders null when both slots are empty after trim</Caption>
    </View>
  );
}
