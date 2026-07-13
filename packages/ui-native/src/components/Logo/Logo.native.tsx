/**
 * Logo.native.tsx
 *
 * RN peer of `packages/ui/src/components/Logo/Logo.tsx`.
 * Transparent sizing container; brand SVG controls shape and fill.
 * Optional `interactive` mode wraps the logo in a `Pressable` (Figma parity).
 *
 * Metallic paint: when `material` is set and `svgContent` is provided,
 * `applyMetallicToSvg` injects a `<linearGradient>` def with the brand's
 * resolved hex stops into the SVG string. The gradient paint replaces
 * `fill`/`stroke` attributes so the mark renders in the metallic finish.
 */

import React, { useId, useMemo, useState } from 'react';
import { Image as RNImage, Pressable, View, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { applyMetallicToSvg } from '@oneui/shared/engine';
import {
  getLogoAccessibilityProps,
  isLogoPressable,
  LOGO_DECORATIVE_A11Y,
  useLogoState,
  type LogoProps,
} from './interface';
import { useBrandMaterial, useSurfaceTokens } from '../../theme';
import { DISABLED_OPACITY, resolveSize, styles } from './Logo.styles.native';

/** Parse `viewBox` width/height ratio for full-variant wordmark width. */
function svgAspectRatio(xml: string): number | undefined {
  const match = xml.match(/viewBox=["']([^"']+)["']/i);
  if (!match) return undefined;
  const parts = match[1].split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || !Number.isFinite(parts[2]) || !Number.isFinite(parts[3]) || parts[3] === 0) {
    return undefined;
  }
  return parts[2] / parts[3];
}

export function Logo(props: LogoProps): React.ReactElement {
  const {
    material,
    materialTarget,
    materialGradientType,
    materialGradientAngle,
  } = props;
  const { contentMode, resolvedVariant, resolvedSize, isInteractive, isDisabled } =
    useLogoState(props);
  const isPressable = isLogoPressable(props, { isInteractive });
  const role = useSurfaceTokens('primary');
  const logoColor = role.surfaces.bold;
  const a11y = getLogoAccessibilityProps(props, { isInteractive, isPressable });
  const [imgError, setImgError] = useState(false);

  const brandMat = useBrandMaterial();
  const gradientId = useId();
  const safeGradientId = `oneui-logo-${gradientId.replace(/:/g, '')}`;

  const paintedSvg = useMemo(() => {
    if (!material || contentMode !== 'svg' || !props.svgContent) return props.svgContent;
    const resolved = material ? brandMat?.metallic[material] : undefined;
    return applyMetallicToSvg(
      props.svgContent,
      material,
      safeGradientId,
      materialGradientType ?? resolved?.gradientType ?? 'linear',
      materialGradientAngle ?? resolved?.angle ?? 135,
      materialTarget ?? 'fill-stroke',
      resolved?.colors,
    );
  }, [
    material,
    contentMode,
    props.svgContent,
    brandMat,
    safeGradientId,
    materialGradientType,
    materialGradientAngle,
    materialTarget,
  ]);

  const dim = resolveSize(resolvedSize, props.customSize);
  const isMark = resolvedVariant === 'mark';
  const isFull = resolvedVariant === 'full';
  const handlePress = props.onPress ?? props.onClick;

  const containerStyle: ViewStyle = {
    width: isMark ? dim : undefined,
    height: dim,
    ...(isFull ? styles.full : null),
    ...(isDisabled ? { opacity: DISABLED_OPACITY } : null),
    ...(props.style as ViewStyle),
  };

  const renderMark = (child: React.ReactNode, markStyle?: ViewStyle): React.ReactElement => (
    <View style={[styles.mark, isFull ? styles.markFull : null, markStyle]} {...LOGO_DECORATIVE_A11Y}>
      {child}
    </View>
  );

  const renderContent = (): React.ReactNode => {
    switch (contentMode) {
      case 'children':
        return renderMark(props.children);

      case 'svg': {
        const xml = paintedSvg ?? props.svgContent!;
        const aspect = svgAspectRatio(xml);
        const svgWidth = isMark ? dim : aspect != null ? dim * aspect : dim;
        // Skip `color` override when material is active — gradient owns the paint
        const colorProp = material ? undefined : logoColor;
        return renderMark(
          <SvgXml xml={xml} width={svgWidth} height={dim} color={colorProp} />,
        );
      }

      case 'image':
        if (props.src != null && !imgError) {
          return renderMark(
            <RNImage
              source={{ uri: props.src }}
              resizeMode='contain'
              onLoad={props.onLoad}
              onError={() => {
                setImgError(true);
                props.onError?.();
              }}
              style={styles.image}
              {...LOGO_DECORATIVE_A11Y}
            />,
          );
        }
        if (imgError && props.fallback != null) {
          return renderMark(
            <View style={styles.fallback}>{props.fallback}</View>,
          );
        }
        return null;

      case 'empty':
        if (props.fallback != null) {
          return renderMark(
            <View style={styles.fallback}>{props.fallback}</View>,
          );
        }
        return null;
    }
  };

  const shellStyle = [styles.base, containerStyle];

  if (isPressable && handlePress) {
    return (
      <Pressable
        {...a11y}
        disabled={isDisabled}
        onPress={handlePress}
        style={({ pressed }) => [shellStyle, pressed ? styles.pressed : null]}
        testID={props.testID}
      >
        {renderContent()}
      </Pressable>
    );
  }

  return (
    <View {...a11y} style={shellStyle} testID={props.testID}>
      {renderContent()}
    </View>
  );
}

export type { LogoProps, LogoNativeProps } from './interface';
