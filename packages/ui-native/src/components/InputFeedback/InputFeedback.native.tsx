/**
 * InputFeedback.native.tsx
 *
 * RN peer of `packages/ui/src/components/Input/internals/InputFeedback.tsx`.
 * Geometry lives in `./InputFeedback.styles.native.ts`; the brand-resolved
 * fill, icon paint, message colour, and typography merge inline via
 * `useSurfaceTokens` + `useTypographyTokens`.
 *
 * Variant → role mapping (matches the web `--_fb-bold` / `--_fb-subtle` /
 * `--_fb-bold-high` intermediate cascade):
 *
 *   variant      role used for useSurfaceTokens(role)
 *   ─────────    ────────────────────────────────────
 *   negative     'negative'
 *   positive     'positive'
 *   warning      'warning'
 *   informative  'informative'
 *
 * Attention controls which surface + on-colour token pair is consumed:
 *
 *   low      bg transparent     │ text role.content.high
 *   medium   bg role.subtle     │ text role.content.high
 *   high     bg role.bold       │ text role.onBoldContent.high
 *
 * `feedback_message` (or `children`) is the visible copy. Per-variant default
 * SVGs (`error` / `check_circle` / `warning` / `info` — same semantic icons
 * as the web peer's `DEFAULT_ICONS` map) render through the OneUI `<Icon>`
 * shell so consumers don't need to wire one up manually. `customIcon` (any
 * `ReactNode`) overrides the default.
 *
 * Why inline SVGs? `@oneui/ui-native/icons` ships the `<Icon>` shell — size,
 * colour, slot-context — but does NOT ship a `SemanticIconName` catalogue
 * (unlike web). Every native component that needs a default glyph defines
 * its own minimal SVG (see `Avatar.native.tsx` `DefaultPersonIcon`).
 */

import React, { useMemo, type ComponentType, type ReactNode } from 'react';
import { Text as RNText, View, type ViewStyle, type TextStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@oneui/tokens';
import { useSurfaceTokens, useTypographyTokens, type NativeRoleTokens } from '../../theme';
import { ComponentSlotIconContext } from '../../slots/ComponentSlotIconContext.native';
import { typographyToTextStyle } from '../../theme';
import { Icon } from '../Icon';
import type { IconComponent } from '@oneui/shared';
import type { DesignIconSize } from '../Icon/interface';
import {
  getInputFeedbackAccessibilityProps,
  useInputFeedbackState,
  type InputFeedbackAttention,
  type InputFeedbackProps,
  type InputFeedbackSize,
  type InputFeedbackVariant,
} from './interface';
import {
  FEEDBACK_TO_ICON_SIZE,
  PADDING_FILLED_STYLE,
  RADIUS_STYLE,
  styles,
} from './InputFeedback.styles.native';

// ---------------------------------------------------------------------------
// Default icons (per variant) — Material `error` / `check_circle` / `warning`
// / `info` paths. Conform to the shared `IconComponent` shape so they slot
// straight into `<Icon icon={…} />`.
// ---------------------------------------------------------------------------

interface DefaultIconProps {
  size?: number;
  width?: number | string;
  height?: number | string;
  color?: string;
  fill?: string;
}

function FeedbackSvg({
  size,
  width,
  height,
  color,
  fill,
  path,
}: DefaultIconProps & { path: string }): React.ReactElement {
  const resolvedWidth = width ?? size ?? '100%';
  const resolvedHeight = height ?? size ?? '100%';
  const tint = (fill ?? color ?? 'currentColor') as string;
  return (
    <Svg width={resolvedWidth} height={resolvedHeight} viewBox="0 0 24 24" fill="none">
      <Path d={path} fill={tint} />
    </Svg>
  );
}

const ERROR_PATH =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z';
const CHECK_CIRCLE_PATH =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
const WARNING_PATH = 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z';
const INFO_PATH =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';

const DEFAULT_FEEDBACK_ICONS: Record<InputFeedbackVariant, ComponentType<DefaultIconProps>> = {
  negative: (props) => <FeedbackSvg {...props} path={ERROR_PATH} />,
  positive: (props) => <FeedbackSvg {...props} path={CHECK_CIRCLE_PATH} />,
  warning: (props) => <FeedbackSvg {...props} path={WARNING_PATH} />,
  informative: (props) => <FeedbackSvg {...props} path={INFO_PATH} />,
};

// ---------------------------------------------------------------------------
// Variant → useSurfaceTokens() role + per-size typography lookups.
// ---------------------------------------------------------------------------

const VARIANT_TO_ROLE: Record<
  InputFeedbackVariant,
  'negative' | 'positive' | 'warning' | 'informative'
> = {
  negative: 'negative',
  positive: 'positive',
  warning: 'warning',
  informative: 'informative',
};

/** Per-size Body typography step (web `Body-XS` / `Body-XS` / `Body-S`). */
const SIZE_TO_BODY: Record<InputFeedbackSize, 'XS' | 'S'> = {
  s: 'XS',
  m: 'XS',
  l: 'S',
};

interface Paint {
  background: string;
  text: string;
  iconColor: string;
}

function paintFor(
  attention: InputFeedbackAttention,
  role: NativeRoleTokens,
  pageRole: NativeRoleTokens
): Paint {
  switch (attention) {
    case 'high':
      return {
        background: role.surfaces.bold,
        text: role.onBoldContent.high,
        iconColor: role.onBoldContent.high,
      };
    case 'medium':
      return {
        background: role.surfaces.subtle,
        // Web message stays at default page text on tinted backgrounds — use
        // the neutral page role to match `--Text-High` cascading colour.
        text: pageRole.content.high,
        iconColor: role.content.tintedA11y,
      };
    case 'low':
    default:
      return {
        background: 'transparent',
        text: pageRole.content.high,
        iconColor: role.content.tintedA11y,
      };
  }
}

export function InputFeedback(props: InputFeedbackProps): React.ReactElement | null {
  const state = useInputFeedbackState(props);
  const { resolvedVariant, resolvedAttention, resolvedSize, hasMessage, message } = state;

  const role = useSurfaceTokens(VARIANT_TO_ROLE[resolvedVariant]);
  const pageRole = useSurfaceTokens('neutral');
  const paint = paintFor(resolvedAttention, role, pageRole);

  const bodySize = SIZE_TO_BODY[resolvedSize];
  const messageTypo = useTypographyTokens('body', bodySize, { emphasis: 'low' });

  const a11y = getInputFeedbackAccessibilityProps(props, state);

  const iconSize: DesignIconSize = FEEDBACK_TO_ICON_SIZE[resolvedSize];
  const iconPx = designIconSizeToPx(iconSize);

  const messageStyle = useMemo<TextStyle>(() => {
    return {
      ...typographyToTextStyle(messageTypo),
      color: paint.text,
    };
  }, [messageTypo, paint.text]);

  const rowStyle = useMemo<ViewStyle>(() => {
    if (resolvedAttention === 'low') {
      return { backgroundColor: 'transparent' };
    }
    return { backgroundColor: paint.background };
  }, [resolvedAttention, paint.background]);

  // The renderer always shows an icon — either the caller-supplied
  // `customIcon` (any ReactNode) or the per-variant default. The empty
  // branch only returns null when neither the icon nor the message would
  // produce a visible row, mirroring web's `if (!hasRenderableMessage && !showFieldErrorSlot) return null`.
  if (!hasMessage && props.customIcon == null) {
    return null;
  }

  const filledStyle =
    resolvedAttention === 'low' ? styles.attentionLow : PADDING_FILLED_STYLE[resolvedSize];
  const radiusStyle = resolvedAttention === 'low' ? null : RADIUS_STYLE[resolvedSize];

  const iconNode: ReactNode = renderIconSlot({
    customIcon: props.customIcon,
    variant: resolvedVariant,
    color: paint.iconColor,
    sizePx: iconPx,
  });

  return (
    <View
      {...a11y}
      testID={props.testID}
      style={[styles.rowBase, filledStyle, radiusStyle, rowStyle, props.style]}
    >
      {iconNode != null ? (
        <View
          style={[styles.iconSlot, { width: iconPx, height: iconPx }]}
          // The icon is decorative — meaning lives in the message + live region.
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {iconNode}
        </View>
      ) : null}
      {hasMessage ? (
        <RNText
          style={[styles.messageColumn, messageStyle]}
          accessible={false}
          importantForAccessibility="no"
        >
          {message}
        </RNText>
      ) : null}
    </View>
  );
}

InputFeedback.displayName = 'InputFeedback';

interface IconSlotArgs {
  customIcon: ReactNode | undefined;
  variant: InputFeedbackVariant;
  color: string;
  sizePx: number;
}

/**
 * Resolve the icon slot — uses the OneUI design-system `<Icon>` shell from
 * `../Icon`. Mirrors web's `<Icon icon={iconName} size={iconSize} appearance={...} emphasis={...} aria-hidden />`.
 *
 * Color is published via `ComponentSlotIconContext.Provider` (peer of web's
 * `currentColor` inheritance) — the design-system Icon reads `slotIcon.color`
 * when no explicit `emphasis` is set, so neither the default nor a custom
 * nested `<Icon>` needs to receive `color` manually. The same provider also
 * carries `sizePx` so `<Icon>` children without an explicit `size` prop pick
 * up the parent-resolved pixel side.
 *
 *  - String `customIcon` → dev-warn + drop (no semantic catalogue on native).
 *  - Any other `customIcon` ReactNode → renders inside the slot provider so
 *    nested `<Icon>` instances inherit the feedback paint + size.
 *  - `customIcon` absent → render the per-variant default via OneUI `Icon`,
 *    mirroring web's `customIcon ?? DEFAULT_ICONS[variant]` fallback.
 */
function renderIconSlot({ customIcon, variant, color, sizePx }: IconSlotArgs): ReactNode {
  if (typeof customIcon === 'string') {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        `[OneUI InputFeedback] customIcon string "${customIcon}" is not supported on native. ` +
          'Pass a ReactNode (e.g. `customIcon={<Icon icon={JdsHelp} />}`).',
      );
    }
    customIcon = undefined;
  }

  return (
    <ComponentSlotIconContext.Provider value={{ color, sizePx }}>
      {customIcon ?? (
        <Icon
          icon={DEFAULT_FEEDBACK_ICONS[variant] as IconComponent}
          size={sizePx}
          aria-hidden
        />
      )}
    </ComponentSlotIconContext.Provider>
  );
}

/**
 * Resolve a `DesignIconSize` to a numeric pixel count using the default
 * `tokens.spacing` scale. Mirrors `designIconSizePx` without requiring a
 * theme handle — InputFeedback only consumes the canonical default scale.
 */
function designIconSizeToPx(size: DesignIconSize): number {
  const key = size.replace('.', '-') as keyof typeof tokens.spacing;
  return tokens.spacing[key];
}

export type { InputFeedbackProps, InputFeedbackNativeProps } from './interface';
