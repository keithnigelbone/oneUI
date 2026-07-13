import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Preview } from '@storybook/react-native';
import { OneUIBrandProvider, type BrandData } from '@oneui/ui-native/theme';
import { OFFLINE_BRANDS, getOfflineBrandData } from '../src/brand-data/brands';

/**
 * Global Storybook preview for the OneUI RN SDK playbook.
 *
 * Every story is wrapped in `<OneUIBrandProvider>` on a clean light "page"
 * canvas. Two toolbar globals let designers/devs inspect each component across
 * the foundation matrix:
 *
 *   • brand   — brand + variant snapshot (offline)
 *   • density — compact / default / open
 *
 * Theme is locked to LIGHT (the playbook renders light-only by request).
 * Fonts + JDS icons are registered once at app boot (App.tsx).
 */

const BRAND_ITEMS = OFFLINE_BRANDS.map((b) => ({
  title: b.variant === 'base' ? b.brand : `${b.brand} · ${b.variant}`,
  value: `${b.brand}::${b.variant}`,
}));

const DEFAULT_BRAND_VALUE =
  BRAND_ITEMS.find((i) => i.value === 'Jio::base')?.value ??
  BRAND_ITEMS[0]?.value ??
  'Jio::base';

function ThemedStory({
  children,
  brandValue,
  density,
}: {
  children: React.ReactNode;
  brandValue: string;
  density: 'compact' | 'default' | 'open';
}): React.ReactElement {
  const [brandName, variant] = brandValue.split('::');
  const brandData: BrandData | undefined = getOfflineBrandData(brandName, variant);

  if (!brandData) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>No offline snapshot</Text>
        <Text style={styles.fallbackText}>{`${brandName} / ${variant} is missing.`}</Text>
      </View>
    );
  }

  return (
    <OneUIBrandProvider
      brand={brandData}
      mode="light"
      density={density}
      language="en"
      loadingFallback={
        <View style={styles.fallback}>
          <ActivityIndicator color="#4B1FD6" />
          <Text style={styles.fallbackText}>Building theme…</Text>
        </View>
      }
    >
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stage}>{children}</View>
        </ScrollView>
      </View>
    </OneUIBrandProvider>
  );
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    backgrounds: { disable: true },
  },
  globalTypes: {
    brand: {
      description: 'OneUI brand + variant',
      defaultValue: DEFAULT_BRAND_VALUE,
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: BRAND_ITEMS,
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Spacing density',
      defaultValue: 'default',
      toolbar: {
        title: 'Density',
        icon: 'grow',
        items: [
          { title: 'Compact', value: 'compact' },
          { title: 'Default', value: 'default' },
          { title: 'Open', value: 'open' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ThemedStory
        brandValue={context.globals.brand ?? DEFAULT_BRAND_VALUE}
        density={context.globals.density ?? 'default'}
      >
        <Story />
      </ThemedStory>
    ),
  ],
};

const styles = StyleSheet.create({
  // Clean light page surface — components sit on white, matching how a real
  // app screen presents them.
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48, flexGrow: 1 },
  stage: { flex: 1, gap: 16 },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  fallbackTitle: { fontSize: 18, fontWeight: '700', color: '#1A1D21' },
  fallbackText: { fontSize: 14, color: '#5B6370', textAlign: 'center' },
});

export default preview;
