/**
 * carouselSlideContentText.native.tsx — Figma on-image typography for slide copy.
 */

import React, { type ReactNode } from 'react';
import { StyleSheet, type TextStyle } from 'react-native';
import type { NativeRoleTokens } from '@oneui/shared/engine';
import { Text as OneUIText } from '../Text/Text.native';
import { useOneUITheme } from '../../theme';
import { isCarouselContentCentered } from './carouselContentLayout.native';
import { useCarouselSlideContentAlignment } from './carouselContexts.native';

function resolveOnBoldHigh(role: NativeRoleTokens | undefined): string | undefined {
  return role?.onBoldContent?.high;
}

export function useCarouselOnImageTextColor(): string {
  const theme = useOneUITheme();
  const { rootRoles } = theme;
  const fromRoles =
    resolveOnBoldHigh(rootRoles.primary) ??
    resolveOnBoldHigh(rootRoles.neutral) ??
    resolveOnBoldHigh(rootRoles.secondary) ??
    Object.values(rootRoles).map(resolveOnBoldHigh).find(Boolean);

  return (
    fromRoles ??
    rootRoles.neutral?.content.high ??
    rootRoles.primary?.content.high ??
    ''
  );
}

function useCarouselSlideTextStyle(style?: TextStyle): TextStyle {
  const alignment = useCarouselSlideContentAlignment();
  const centered = isCarouselContentCentered(alignment);
  return StyleSheet.flatten([
    centered ? { textAlign: 'center', width: '100%' } : null,
    style,
  ]);
}

export interface CarouselSlideHeadlineProps {
  children: ReactNode;
  style?: TextStyle;
  testID?: string;
}

export function CarouselSlideHeadline({
  children,
  style,
  testID,
}: CarouselSlideHeadlineProps): React.ReactElement {
  const color = useCarouselOnImageTextColor();
  const textStyle = useCarouselSlideTextStyle(style);
  return (
    <OneUIText
      variant="headline"
      size="L"
      weight="high"
      style={StyleSheet.flatten([{ color }, textStyle])}
      testID={testID}
    >
      {children}
    </OneUIText>
  );
}

export interface CarouselSlideBodyProps {
  children: ReactNode;
  style?: TextStyle;
  testID?: string;
}

/** Figma `body/M/medium` on carousel slides. */
export function CarouselSlideBody({
  children,
  style,
  testID,
}: CarouselSlideBodyProps): React.ReactElement {
  const color = useCarouselOnImageTextColor();
  const textStyle = useCarouselSlideTextStyle(style);
  return (
    <OneUIText
      variant="body"
      size="M"
      weight="medium"
      style={StyleSheet.flatten([{ color }, textStyle])}
      testID={testID}
    >
      {children}
    </OneUIText>
  );
}
