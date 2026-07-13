/**
 * ThemedShell.tsx
 *
 * Reads PageContext, loads the active brand's OFFLINE snapshot, feeds it into
 * <OneUIBrandProvider>, and mounts the single-screen Surface checker (top bar
 * + SurfaceInspectorScreen). No navigation tree — this app does one thing.
 *
 * Split from `App.tsx` so PageContextProvider can sit one level higher (the
 * provider reads PageContext here, and OneUIBrandProvider rebuilds the theme
 * when brand/theme change without remounting the whole tree).
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { OneUIBrandProvider, type BrandData } from '@oneui/ui-native/theme';
import { getOfflineBrandData } from './brand-data/offlineBrandData.generated';
import { usePageContext } from './PageContext';
import { TopBar } from './components/TopBar';
import { SurfaceInspectorScreen } from './screens/SurfaceInspectorScreen';

export function ThemedShell(): React.ReactElement {
  const { theme, brand } = usePageContext();

  const brandData: BrandData | undefined = getOfflineBrandData(
    brand.brand,
    brand.variant,
  );

  if (!brandData) {
    return <MissingSnapshotFallback brand={brand.brand} variant={brand.variant} />;
  }

  return (
    <OneUIBrandProvider
      brand={brandData}
      mode={theme}
      language='en'
      loadingFallback={<LoadingFallback />}
    >
      <View style={styles.root}>
        <TopBar />
        <SurfaceInspectorScreen />
      </View>
    </OneUIBrandProvider>
  );
}

function LoadingFallback(): React.ReactElement {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator />
      <Text style={styles.fallbackText}>Building theme…</Text>
    </View>
  );
}

function MissingSnapshotFallback({
  brand,
  variant,
}: {
  brand: string;
  variant: string;
}): React.ReactElement {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackTitle}>No offline snapshot</Text>
      <Text style={styles.fallbackText}>
        {`${brand} / ${variant} is not in src/brand-data.`}
      </Text>
      <Text style={styles.fallbackHint}>
        Run: pnpm --filter @oneui/native-sample export:brands
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  fallbackText: {
    fontSize: 14,
    textAlign: 'center',
  },
  fallbackHint: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});
