/**
 * TopBar.tsx
 *
 * Header for the Surface checker. Hosts two/three selector clusters:
 *   Theme   — light / dark
 *   Brand   — every distinct offline brand (Jio, Tira, Reliance, …)
 *   Variant — sub-brand variants of the active brand (only when >1 exists)
 *
 * All chip colours come from `useSurfaceTokens(...)`, so switching brand or
 * theme immediately recolours the bar — the bar itself is a live surface
 * read, which doubles as a sanity check that the brand snapshot resolved.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens, touchTarget, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { THEMES, type ThemeMode } from '../tokens';
import { usePageContext } from '../PageContext';

/** Light / dark only — `dim` collapses to dark in OneUIBrandProvider. */
const THEME_OPTIONS = THEMES.filter((t) => t !== 'dim') as ReadonlyArray<ThemeMode>;

export function TopBar(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const roles = useSurfaceTokens('neutral');
  const ctx = usePageContext();
  const spacing = tokens.spacing;

  // Distinct brand names (preserve manifest order).
  const brandNames = Array.from(new Set(ctx.brands.map((b) => b.brand)));
  // Variants of the active brand.
  const activeVariants = ctx.brands
    .filter((b) => b.brand === ctx.brand.brand)
    .map((b) => b.variant);

  const selectBrand = (name: string): void => {
    const base =
      ctx.brands.find((b) => b.brand === name && b.variant === 'base') ??
      ctx.brands.find((b) => b.brand === name);
    if (base) ctx.setBrand(base);
  };

  const selectVariant = (variant: string): void => {
    const match = ctx.brands.find(
      (b) => b.brand === ctx.brand.brand && b.variant === variant,
    );
    if (match) ctx.setBrand(match);
  };

  const [controlsExpanded, setControlsExpanded] = useState(false);
  const variantLabel =
    ctx.brand.variant !== 'base' ? ` · ${ctx.brand.variant}` : '';
  const summary = `${ctx.brand.brand}${variantLabel} · ${ctx.theme}`;

  return (
    <View
      style={{
        paddingHorizontal: spacing['4'],
        paddingBottom: spacing['3-5'],
        gap: spacing['3'],
        paddingTop: insets.top + spacing['3'],
        backgroundColor: roles.surfaces.bold,
        borderBottomColor: roles.content.strokeLow,
        borderBottomWidth: tokens.borderWidth.hairline,
      }}
    >
      <Pressable
        onPress={() => setControlsExpanded((open) => !open)}
        accessibilityRole='button'
        accessibilityState={{ expanded: controlsExpanded }}
        accessibilityLabel={
          controlsExpanded
            ? 'Collapse theme and brand controls'
            : `Expand theme and brand controls, current ${summary}`
        }
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing['2-5'],
          minHeight: touchTarget.min,
          borderRadius: tokens.shape.s,
          backgroundColor: pressed ? roles.states.pressed : 'transparent',
        })}
      >
        <View style={{ flex: 1, gap: spacing['1-5'] }}>
          <Text
            numberOfLines={1}
            style={{
              color: roles.onBoldContent.high,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.high,
            }}
          >
            Surface checker
          </Text>
          <Text
            numberOfLines={2}
            style={{
              color: roles.onBoldContent.medium,
              fontSize: typography.size.xs,
            }}
          >
            {controlsExpanded
              ? 'OneUI · tap to collapse theme / brand / variant'
              : `OneUI · ${summary}`}
          </Text>
        </View>
        <Text
          accessibilityElementsHidden
          importantForAccessibility='no-hide-descendants'
          style={{
            width: spacing['5'],
            textAlign: 'center',
            color: roles.onBoldContent.high,
            fontSize: typography.size.l,
            fontWeight: typography.weight.medium,
            lineHeight: typography.size.l,
          }}
        >
          {controlsExpanded ? '−' : '+'}
        </Text>
      </Pressable>

      {controlsExpanded ? (
        <View style={{ gap: spacing['3-5'] }}>
          <SelectorCluster
            label='Theme'
            value={ctx.theme}
            options={THEME_OPTIONS}
            onChange={(v) => ctx.setTheme(v as ThemeMode)}
          />
          <SelectorCluster
            label='Brand'
            value={ctx.brand.brand}
            options={brandNames}
            onChange={selectBrand}
          />
          {activeVariants.length > 1 ? (
            <SelectorCluster
              label='Variant'
              value={ctx.brand.variant}
              options={activeVariants}
              onChange={selectVariant}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

interface SelectorClusterProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function SelectorCluster({
  label,
  value,
  options,
  onChange,
}: SelectorClusterProps): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const primary = useSurfaceTokens('primary');
  const spacing = tokens.spacing;

  return (
    <View style={{ gap: spacing['2-5'] }}>
      <Text
        style={{
          color: roles.onBoldContent.medium,
          fontSize: typography.size['2xs'],
          fontWeight: typography.weight.medium,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
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
              accessibilityRole='button'
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
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
