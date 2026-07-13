/**
 * Slim header for the components-only app: back to list from detail,
 * safe-area padding, token-driven typography (no legacy size tokens in new UI
 * beyond what tokens package exposes as numeric steps).
 */

import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  SUPPORTED_TYPOGRAPHY_LOCALES,
  TYPOGRAPHY_LOCALE_LABELS,
  type TypographyLocale,
} from '@oneui/ui-native/theme';
import { tokens, touchTarget, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { usePageContext } from '../PageContext';
import { THEMES, type ThemeMode } from '../tokens';
import type { ComponentsStackParamList } from '../screens/components/ComponentsStack';
import {
  BRAND_DATA_SOURCE_OPTIONS,
  brandDataSourceFromLabel,
  labelForBrandDataSource,
} from '../hooks/useBrandDataSource';
import { CollapsibleSelectorCluster } from './CollapsibleSelectorCluster';

type ListNav = NativeStackNavigationProp<ComponentsStackParamList, 'List'>;
type DetailNav = NativeStackNavigationProp<ComponentsStackParamList, 'Detail'>;
type FontWeightsNav = NativeStackNavigationProp<
  ComponentsStackParamList,
  'FontWeights'
>;
type IconsNav = NativeStackNavigationProp<ComponentsStackParamList, 'Icons'>;
type AllComponentsNav = NativeStackNavigationProp<
  ComponentsStackParamList,
  'AllComponents'
>;

interface ComponentsChromeListProps {
  variant: 'list';
  navigation: ListNav;
}

interface ComponentsChromeDetailProps {
  variant: 'detail';
  navigation: DetailNav;
  title: string;
}

interface ComponentsChromeFontWeightsProps {
  variant: 'fontWeights';
  navigation: FontWeightsNav;
  title: string;
}

interface ComponentsChromeIconsProps {
  variant: 'icons';
  navigation: IconsNav;
  title: string;
}

interface ComponentsChromeAllComponentsProps {
  variant: 'allComponents';
  navigation: AllComponentsNav;
  title: string;
}

export type ComponentsChromeProps =
  | ComponentsChromeListProps
  | ComponentsChromeDetailProps
  | ComponentsChromeFontWeightsProps
  | ComponentsChromeIconsProps
  | ComponentsChromeAllComponentsProps;

export function ComponentsChrome(props: ComponentsChromeProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const roles = useSurfaceTokens('neutral');
  const spacing = tokens.spacing;
  const page = usePageContext();

  const brandNames = (page.brands ?? []).map((b) => b.name);
  const activeBrandName =
    page.brands?.find((b) => b._id === page.brandId)?.name ??
    (page.brandId ? '…' : 'loading…');

  const subtitle =
    props.variant === 'list'
      ? 'OneUI · native-components-sample'
      : props.variant === 'fontWeights'
        ? 'Bundled variable font · weight axis'
        : props.variant === 'icons'
          ? '1,609 icons · @oneui/icons-jio-native'
          : props.variant === 'allComponents'
            ? 'All components · all attention variants'
            : 'OneUI · native-components-sample · native';

  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const settingsSummary = `${activeBrandName} · ${page.theme}`;

  return (
    <View
      style={{
        paddingHorizontal: spacing['4'],
        paddingBottom: spacing['3-5'],
        paddingTop: insets.top + spacing['3'],
        backgroundColor: roles.surfaces.bold,
        borderBottomColor: roles.content.strokeLow,
        borderBottomWidth: tokens.borderWidth.hairline,
        gap: spacing['3'],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3-5'] }}>
        {props.variant === 'detail' || props.variant === 'fontWeights' || props.variant === 'icons' || props.variant === 'allComponents' ? (
          <Pressable
            onPress={() => props.navigation.navigate('List')}
            accessibilityRole='button'
            accessibilityLabel='Back to component list'
            style={({ pressed }) => ({
              minWidth: touchTarget.min,
              minHeight: touchTarget.min,
              justifyContent: 'center',
              paddingHorizontal: spacing['3'],
              borderRadius: tokens.shape.s,
              backgroundColor: pressed ? roles.states.pressed : 'transparent',
            })}
          >
            <Text
              style={{
                color: roles.onBoldContent.high,
                fontSize: typography.size.m,
                fontWeight: typography.weight.high,
              }}
            >
              ‹ Components
            </Text>
          </Pressable>
        ) : null}
        <View style={{ flex: 1, gap: spacing['1-5'] }}>
          <Text
            numberOfLines={1}
            style={{
              color: roles.onBoldContent.high,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.high,
            }}
          >
            {props.variant === 'list' ? 'Components' : props.title}
          </Text>
          <Text
            style={{
              color: roles.onBoldContent.medium,
              fontSize: typography.size.xs,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing['2-5'] }}>
        <Pressable
          onPress={() => setSettingsExpanded((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: settingsExpanded }}
          accessibilityLabel={
            settingsExpanded
              ? 'Collapse Settings'
              : `Expand Settings, ${settingsSummary}`
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
            Settings
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
            {settingsSummary}
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
            {settingsExpanded ? '−' : '+'}
          </Text>
        </Pressable>
        {settingsExpanded ? (
          <View style={{ gap: spacing['3-5'] }}>
            <CollapsibleSelectorCluster
              label='Brand'
              value={activeBrandName}
              options={brandNames.length > 0 ? brandNames : ['loading…']}
              onChange={(name) => {
                const match = page.brands?.find((b) => b.name === name);
                if (match) page.setBrandId(match._id);
              }}
            />
            {page.subBrands && page.subBrands.length > 0 ? (
              <CollapsibleSelectorCluster
                label='Variants'
                resetKey={page.brandId ?? undefined}
                value={
                  page.subBrands.find((s) => s._id === page.subBrandId)?.name ?? 'Base'
                }
                options={['Base', ...page.subBrands.map((s) => s.name)]}
                onChange={(name) => {
                  if (name === 'Base') {
                    page.setSubBrandId(null);
                  } else {
                    const match = page.subBrands?.find((s) => s.name === name);
                    if (match) page.setSubBrandId(match._id);
                  }
                }}
              />
            ) : null}
            <CollapsibleSelectorCluster
              label='Brand data'
              value={labelForBrandDataSource(page.brandDataSource)}
              options={BRAND_DATA_SOURCE_OPTIONS}
              onChange={(label) => {
                const source = brandDataSourceFromLabel(label);
                if (source) page.setBrandDataSource(source);
              }}
            />
            <CollapsibleSelectorCluster
              label='Theme'
              value={page.theme}
              options={THEMES}
              onChange={(v) => page.setTheme(v as ThemeMode)}
            />
            <CollapsibleSelectorCluster
              label='Language'
              value={TYPOGRAPHY_LOCALE_LABELS[page.language]}
              options={SUPPORTED_TYPOGRAPHY_LOCALES.map(
                (code) => TYPOGRAPHY_LOCALE_LABELS[code],
              )}
              onChange={(label) => {
                const match = SUPPORTED_TYPOGRAPHY_LOCALES.find(
                  (code) => TYPOGRAPHY_LOCALE_LABELS[code] === label,
                );
                if (match) page.setLanguage(match as TypographyLocale);
              }}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}
