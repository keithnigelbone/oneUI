/**
 * ScreenScaffold.tsx
 *
 * Wraps every screen with a uniform layout:
 *
 *   ┌─────────────────────────────┐
 *   │  PageHeader (title + desc)  │
 *   ├─────────────────────────────┤
 *   │  ScrollView                 │
 *   │    children                 │
 *   └─────────────────────────────┘
 *
 * Mirrors the v4-sample's `<PageHeader />` + `<main>` structure. Surfaces
 * the page title at the same level the drawer route name does, so the
 * screen reads coherently regardless of the entry point.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Surface, useSurfaceTokens } from '@oneui/ui-native';

interface ScreenScaffoldProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Apply additional style to the inner content view. */
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScreenScaffold({
  title,
  description,
  children,
  contentStyle,
}: ScreenScaffoldProps): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  // Density-scaled spacing — `compact` shrinks paddings by one f-step,
  // `open` expands them. Toggling density visibly resizes every screen
  // because every screen wraps in this scaffold.
  const spacing = tokens.spacing;

  return (
    <Surface mode='default' style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          {
            paddingHorizontal: spacing['4-5'],
            paddingTop: spacing['4-5'],
            paddingBottom: spacing['7'],
            gap: spacing['4-5'],
            backgroundColor: roles.surfaces.default,
          },
          contentStyle,
        ]}
        showsVerticalScrollIndicator
      >
        <View style={{ gap: spacing['3'] }}>
          <Text
            style={{
              color: roles.content.high,
              fontSize: typography.size['3xl'],
              fontWeight: typography.weight.high,
            }}
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
        </View>
        <View style={{ gap: spacing['4-5'] }}>{children}</View>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
