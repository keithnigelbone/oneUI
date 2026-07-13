/**
 * Section.tsx
 *
 * Token-driven heading + content card. Mirrors `apps/v4-sample/src/pages/
 * shared.tsx` `PageHeader`. Used by every screen as the consistent visual
 * unit so the verifier feels uniform across routes.
 */

import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';

interface SectionProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Section({
  title,
  description,
  children,
  style,
}: SectionProps): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  // Density-scaled spacing so vertical rhythm tracks the active mode.
  const spacing = tokens.spacing;
  return (
    <View
      style={[
        { paddingVertical: spacing['3-5'], gap: spacing['3-5'] },
        style,
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: roles.content.high,
            fontSize: typography.size['2xl'],
          },
        ]}
      >
        {title}
      </Text>
      {description ? (
        <Text
          style={{
            color: roles.content.medium,
            fontSize: typography.size.l,
            lineHeight: typography.size.l * 1.4,
          }}
        >
          {description}
        </Text>
      ) : null}
      <View style={{ gap: spacing['4'] }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '600',
  },
});
