/**
 * Avatar.native.tsx
 *
 * RN peer of `packages/ui/src/components/Avatar/Avatar.tsx`. Geometry from
 * `avatarLayout.ts` + theme spacing; brand paint from `useSurfaceTokens`.
 */

import React, { useState } from 'react';
import { Image, Text, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { IconComponent, IconComponentProps } from '@oneui/shared';
import {
  getAvatarAccessibilityProps,
  getInitials,
  resolveAvatarIconSlotColor,
  useAvatarState,
  type AvatarProps,
} from './interface';
import { tokens } from '@oneui/tokens';
import {
  useComponentRecipe,
  useComponentTheme,
  useOneUITheme,
  useBrandMaterial,
  useRoleMaterial,
  useSurfaceTokens,
  useSurfaceContext,
  useTypographyTokens,
  type NativeRoleTokens,
  type SizeForRole,
  type ResolvedMetallicGradient,
  type MaterialAssignmentTarget,
} from '../../theme';
import { MetallicGradientFill } from '../MetallicGradientFill';
import { resolveMetallicPaintFromTokenRefs } from '../../utils/metallicPaint';
import { useBadgeSlotSize } from '../Badge/BadgeSlotContext';
import { resolveRecipeBorderRadius } from '../../theme/recipeCornerRadius';
import {
  getAvatarContainerSide,
  getAvatarIconSide,
  getAvatarIconSlotMetrics,
} from './avatarLayout';
import { AvatarIconSlot } from './AvatarSlot.native';
import { Icon } from '../Icon';
import { asIconAppearance } from '../Icon/interface';
import { DISABLED_OPACITY, SIZE_TO_LABEL, styles } from './Avatar.styles.native';

const TEXT_FALLBACK_SIZES = new Set(['2xs', 'xs']);

const PERSON_PATH =
  'M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 10.5c0 3.038-3.582 5.5-8 5.5s-8-2.462-8-5.5S7.582 11 12 11s8 2.462 8 5.5';

interface ContentPaint {
  bg: string;
  iconColor: string;
  textColor: string;
  bgGradient?: ResolvedMetallicGradient | null;
}

function paintFor(attention: string, role: NativeRoleTokens): ContentPaint {
  if (attention === 'high') {
    return {
      bg: role.surfaces.bold,
      iconColor: role.onBoldContent.tinted,
      textColor: role.onBoldContent.tintedA11y,
    };
  }
  if (attention === 'medium') {
    return {
      bg: role.surfaces.subtle,
      iconColor: role.content.tinted,
      textColor: role.content.tintedA11y,
    };
  }
  return {
    bg: 'transparent',
    iconColor: role.content.tinted,
    textColor: role.content.tintedA11y,
  };
}

const DefaultPersonIcon: IconComponent = ({
  size = 24,
  color = 'currentColor',
}: IconComponentProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    <Path fill={color as string} fillRule="evenodd" d={PERSON_PATH} clipRule="evenodd" />
  </Svg>
);

function labelSizeKey(resolvedSize: string): SizeForRole['label'] {
  if (resolvedSize === 'custom') {
    return SIZE_TO_LABEL.custom;
  }
  const fromMap = SIZE_TO_LABEL[resolvedSize as keyof typeof SIZE_TO_LABEL];
  if (fromMap) {
    return fromMap;
  }
  return '3XS';
}

export function Avatar(props: AvatarProps): React.ReactElement {
  const {
    content = 'image',
    src,
    alt = '',
    fallback,
    icon,
    customSize,
    style: styleProp,
    testID,
  } = props;

  if (customSize != null && customSize <= 40) {
    console.warn('customSize must be greater than 40');
  }

  const validCustomSize = customSize != null && customSize <= 40 ? 40 : customSize 

  const imageTestID = testID ? `${testID}-image` : 'avatar-native-image';
  const iconTestID = testID ? `${testID}-icon` : undefined;
  const initialsTestID = testID ? `${testID}-initials` : undefined;
  const fallbackTestID = testID ? `${testID}-fallback` : undefined;

  const slotSizes = useBadgeSlotSize();
  const stateProps =
    props.size === undefined && slotSizes
      ? ({ ...props, size: slotSizes.avatar } as AvatarProps)
      : props;

  const { resolvedSize, resolvedAttention, resolvedAppearance, isDisabled } =
    useAvatarState(stateProps);
  const { spacing, shape } = useOneUITheme();
  const role = useSurfaceTokens(resolvedAppearance);
  const { resolvedRoles } = useSurfaceContext();
  const basePaint = paintFor(resolvedAttention, role);
  const recipeDecisions = useComponentRecipe('avatar');
  const recipeRadius = resolveRecipeBorderRadius(recipeDecisions, shape);
  const componentTheme = useComponentTheme('avatar');
  const brandMaterials = useBrandMaterial();
  const roleMaterial = useRoleMaterial(resolvedAppearance as MaterialAssignmentTarget);

  // Metallic override — only for high-attention (bold) avatars
  const metallicOverride =
    resolvedAttention === 'high'
      ? resolveMetallicPaintFromTokenRefs({
          variant: 'bold',
          tokenRefs: componentTheme.tokenRefs,
          resolvedRoles,
          materials: brandMaterials,
        })
      : {};

  const paint: ContentPaint = {
    ...basePaint,
    bgGradient:
      (metallicOverride.bgGradient as ResolvedMetallicGradient | undefined) ??
      (resolvedAttention === 'high' && roleMaterial != null ? roleMaterial : null),
  };
  if (paint.bgGradient) {
    if (metallicOverride.bg) paint.bg = metallicOverride.bg;
    const gradientText = paint.bgGradient.text;
    if (gradientText && !metallicOverride.text) {
      paint.iconColor = gradientText;
      paint.textColor = gradientText;
    }
  }

  const [gradientDims, setGradientDims] = useState<{ w: number; h: number } | null>(null);
  const showGradient = paint.bgGradient != null && resolvedAttention === 'high';
  const labelTypo = useTypographyTokens('label', labelSizeKey(resolvedSize), {
    emphasis: 'medium',
  });

  const [imageError, setImageError] = useState(false);
  const showImage = content === 'image' && Boolean(src) && !imageError;

  const effectiveContent =
    content === 'text' && TEXT_FALLBACK_SIZES.has(resolvedSize) ? 'icon' : content;

  const side = getAvatarContainerSide(spacing, resolvedSize, validCustomSize);
  const iconPixel = getAvatarIconSide(spacing, resolvedSize, side, validCustomSize);
  const defaultIconSize = resolvedSize === '2xs' ? side : iconPixel;
  const iconSlotMetrics = getAvatarIconSlotMetrics(resolvedSize, iconPixel);

  const containerRadius = recipeRadius ?? tokens.shape.Pill;
  const bgColor = showImage ? 'transparent' : (showGradient ? 'transparent' : paint.bg);

  const rootStyle: ViewStyle = {
    width: side,
    height: side,
    borderRadius: containerRadius,
    backgroundColor: bgColor,
    overflow: showGradient && !showImage ? 'hidden' : undefined,
    opacity: isDisabled ? DISABLED_OPACITY : 1,
    pointerEvents: isDisabled ? 'none' : 'auto',
    ...(styleProp as ViewStyle),
  };

  const surfaceMode: 'bold' | 'subtle' | 'default' =
    resolvedAttention === 'high' ? 'bold' : resolvedAttention === 'medium' ? 'subtle' : 'default';

  const renderIconSlot = (): React.ReactElement => {
    const custom = icon ?? fallback;
    return (
      <AvatarIconSlot
        metrics={iconSlotMetrics}
        iconPixel={defaultIconSize}
        mode={surfaceMode}
        appearance={resolvedAppearance}
        iconColor={resolveAvatarIconSlotColor(paint)}
      >
        {custom != null ? (
          <View testID={fallbackTestID}>
            {typeof custom === 'string' ? renderTextSlot() : custom}
          </View>
        ) : (
          <Icon
            icon={DefaultPersonIcon}
            appearance={asIconAppearance(resolvedAppearance)}
            size={defaultIconSize}
            aria-hidden
            testID={iconTestID}
          />
        )}
      </AvatarIconSlot>
    );
  };

  const renderTextSlot = (): React.ReactElement => {
    const textContent = fallback ?? getInitials(alt);
    if (typeof textContent === 'string' || typeof textContent === 'number') {
      return (
        <View style={styles.textWrap} testID={initialsTestID}>
          <Text
            style={{
              color: paint.textColor,
              fontSize: labelTypo.fontSize,
              lineHeight: labelTypo.lineHeight,
              fontWeight: labelTypo.fontWeight,
              fontFamily: labelTypo.fontFamily,
              textTransform: 'uppercase',
            }}
          >
            {String(textContent).toUpperCase()}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.textWrap} testID={fallbackTestID}>
        {textContent}
      </View>
    );
  };

  const renderFallback = (): React.ReactElement => {
    if (effectiveContent === 'text') {
      return renderTextSlot();
    }
    return renderIconSlot();
  };

  const a11y = getAvatarAccessibilityProps(
    { alt, accessibilityHint: props.accessibilityHint },
    isDisabled
  );

  return (
    <View
      {...a11y}
      testID={testID}
      style={[styles.root, rootStyle]}
      onLayout={showGradient && !showImage ? e => setGradientDims({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }) : undefined}
    >
      {showGradient && !showImage && gradientDims && (
        <MetallicGradientFill
          colors={paint.bgGradient!.colors}
          locations={paint.bgGradient!.locations}
          angle={paint.bgGradient!.angle}
          width={gradientDims.w}
          height={gradientDims.h}
          borderRadius={containerRadius as number}
        />
      )}
      {showImage ? (
        <Image
          testID={imageTestID}
          source={{ uri: src as string }}
          style={styles.image}
          resizeMode="cover"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onError={() => {
            setImageError(true);
          }}
        />
      ) : (
        renderFallback()
      )}
    </View>
  );
}

export type { AvatarProps, AvatarNativeProps } from './interface';
