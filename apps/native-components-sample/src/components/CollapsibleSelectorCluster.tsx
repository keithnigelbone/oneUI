/**
 * Collapsible chip row — header with +/− toggle; chips shown when expanded.
 * Used for sub-brand variants so the chrome stays compact until opened.
 */

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens, touchTarget, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';

export interface CollapsibleSelectorClusterProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  /** Reset expanded state when this key changes (e.g. parent brand id). */
  resetKey?: string;
  defaultExpanded?: boolean;
}

export function CollapsibleSelectorCluster({
  label,
  value,
  options,
  onChange,
  resetKey,
  defaultExpanded = false,
}: CollapsibleSelectorClusterProps): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const primary = useSurfaceTokens('primary');
  const spacing = tokens.spacing;
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setExpanded(false);
  }, [resetKey]);

  return (
    <View style={{ gap: spacing['2-5'] }}>
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={
          expanded ? `Collapse ${label}` : `Expand ${label}, current ${value}`
        }
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: touchTarget.min,
          gap: spacing['2-5'],
          borderRadius: tokens.shape.s,
          backgroundColor: pressed ? roles.states.pressed : 'transparent',
        })}
      >
        <Text
          style={{
            flex: 1,
            color: roles.onBoldContent.medium,
            fontSize: typography.size['2xs'],
            fontWeight: typography.weight.medium,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            flexShrink: 1,
            maxWidth: '50%',
            color: roles.onBoldContent.high,
            fontSize: typography.size.xs,
            fontWeight: typography.weight.medium,
            textAlign: 'right',
          }}
        >
          {value}
        </Text>
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: spacing['5'],
            textAlign: 'center',
            color: roles.onBoldContent.high,
            fontSize: typography.size.l,
            fontWeight: typography.weight.medium,
            lineHeight: typography.size.l,
          }}
        >
          {expanded ? '−' : '+'}
        </Text>
      </Pressable>
      {expanded ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            rowGap: spacing['2-5'],
            columnGap: spacing['2-5'],
          }}
        >
          {options.map((opt) => {
            const active = opt === value;
            return (
              <Pressable
                key={opt}
                onPress={() => onChange(opt)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${label} ${opt}`}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    paddingHorizontal: spacing['3-5'],
                    paddingVertical: spacing['2-5'],
                    borderRadius: tokens.shape.pill,
                    backgroundColor: active
                      ? primary.surfaces.bold
                      : pressed
                        ? roles.states.pressed
                        : 'transparent',
                    borderColor: active
                      ? primary.surfaces.bold
                      : roles.content.strokeMedium,
                    borderWidth: tokens.borderWidth.hairline,
                    minHeight: Math.max(32, touchTarget.min - 8),
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: active
                      ? primary.onBoldContent.high
                      : roles.onBoldContent.medium,
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.medium,
                  }}
                >
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
});
