/**
 * PlaygroundScreen
 *
 * Renders Button × variants × roles × surface modes against a brand pulled
 * live from Convex (via `api.foundations.getBrandOverviewData`). A header
 * brand picker + active-tokens panel together prove the platform → Convex →
 * mobile pipeline end-to-end. Last-selected brand persists in AsyncStorage.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import {
  Button,
  OneUINativeThemeProvider,
  Surface,
  type SurfaceToken,
} from '@oneui/ui-native';
import type { ButtonAppearance } from '@oneui/ui/components/Button/shared';
import { useActiveBrand } from '../hooks/useActiveBrand';
import { useBrandFonts } from '../hooks/useBrandFonts';
import { foundationToNativeTheme } from '@oneui/ui-native';
import { BrandPickerHeader } from '../components/BrandPickerHeader';
import { ActiveTokensPanel } from '../components/ActiveTokensPanel';

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? '';

async function convexHttpQuery<T>(
  path: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args }),
  });
  const json = (await res.json()) as { status: string; value: T };
  if (json.status !== 'success') throw new Error(`Convex HTTP query failed: ${path}`);
  return json.value;
}

const SURFACE_MODES: SurfaceToken[] = [
  'default',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
];

const ROLES: ButtonAppearance[] = [
  'primary',
  'secondary',
  'positive',
  'negative',
  'neutral',
];

type BrandList = NonNullable<ReturnType<typeof useQuery<typeof api.brands.list>>>;
type FoundationData = NonNullable<
  ReturnType<typeof useQuery<typeof api.foundations.getBrandOverviewData>>
>;

// fallow-ignore-next-line complexity
export function PlaygroundScreen() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [timedOut, setTimedOut] = useState(false);
  const [httpBrands, setHttpBrands] = useState<BrandList | undefined>(undefined);
  const [httpFoundationData, setHttpFoundationData] = useState<FoundationData | undefined>(
    undefined,
  );

  const { brands, activeId, setActiveId } = useActiveBrand(httpBrands);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (brands !== undefined) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(() => {
      setTimedOut(true);
      // WebSocket blocked by corporate network — fall back to one-shot REST queries.
      convexHttpQuery<BrandList>('brands:list').then(setHttpBrands).catch(() => {});
    }, 10_000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [brands]);

  const wsFoundationData = useQuery(
    api.foundations.getBrandOverviewData,
    activeId ? { brandId: activeId as never } : 'skip',
  );

  // Fetch foundation data via HTTP when WebSocket is unavailable.
  const fetchedFoundationRef = useRef<string | null>(null);
  useEffect(() => {
    if (wsFoundationData !== undefined || !activeId || !timedOut) return;
    if (fetchedFoundationRef.current === activeId) return;
    fetchedFoundationRef.current = activeId;
    convexHttpQuery<FoundationData>('foundations:getBrandOverviewData', {
      brandId: activeId,
    })
      .then(setHttpFoundationData)
      .catch(() => {});
  }, [activeId, wsFoundationData, timedOut]);

  const foundationData = wsFoundationData ?? httpFoundationData;

  const nativeTheme = useMemo(
    () => foundationToNativeTheme(foundationData, theme),
    [foundationData, theme],
  );

  const { ready: fontsReady } = useBrandFonts(nativeTheme?.typography.customFonts);

  const darkMode = theme === 'dark';
  const pageBackground = darkMode ? '#0b0b0b' : '#ffffff';
  const onColor = darkMode ? '#fff' : '#111';

  const activeBrand = brands?.find((b) => b._id === activeId) ?? null;

  if (brands === undefined) {
    return (
      <Frame background={pageBackground}>
        {timedOut ? (
          <>
            <ActivityIndicator />
            <Text style={[styles.loadingText, { color: onColor }]}>
              WebSocket unavailable — retrying via HTTP…
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator />
            <Text style={[styles.loadingText, { color: onColor }]}>
              Loading brands…
            </Text>
          </>
        )}
      </Frame>
    );
  }

  if (brands.length === 0) {
    return (
      <Frame background={pageBackground}>
        <Text style={[styles.emptyText, { color: onColor }]}>
          No brands yet — create one in the platform app.
        </Text>
      </Frame>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: pageBackground }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: onColor }]}>
          OneUI Native Playground
        </Text>
        <View style={styles.themeToggle}>
          <Text style={{ color: onColor }}>Dark</Text>
          <Switch
            value={darkMode}
            onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
          />
        </View>
      </View>

      <BrandPickerHeader
        brands={brands}
        activeId={activeId}
        onSelect={setActiveId}
        darkMode={darkMode}
      />

      {nativeTheme && activeBrand && fontsReady ? (
        <OneUINativeThemeProvider theme={nativeTheme}>
          <ActiveTokensPanel brandName={activeBrand.name} darkMode={darkMode} />
          {SURFACE_MODES.map((mode) => (
            <SurfaceSection key={mode} mode={mode} />
          ))}
        </OneUINativeThemeProvider>
      ) : (
        <View style={styles.themeLoading}>
          <ActivityIndicator />
          <Text style={[styles.loadingText, { color: onColor }]}>
            {foundationData === undefined
              ? 'Loading foundation…'
              : !nativeTheme
              ? 'Resolving theme…'
              : 'Loading brand fonts…'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function Frame({
  children,
  background,
}: {
  children: React.ReactNode;
  background: string;
}) {
  return (
    <View style={[styles.frame, { backgroundColor: background }]}>{children}</View>
  );
}

function SurfaceSection({ mode }: { mode: SurfaceToken }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Surface mode: {mode}</Text>
      <Surface mode={mode} appearance="primary" style={styles.surfaceCard}>
        <View style={styles.row}>
          {ROLES.map((role) => (
            <Button
              key={role}
              variant="bold"
              size="s"
              appearance={role}
              onPress={() => {}}
            >
              {role}
            </Button>
          ))}
        </View>
        <View style={styles.row}>
          {ROLES.map((role) => (
            <Button
              key={role}
              variant="subtle"
              size="s"
              appearance={role}
              onPress={() => {}}
            >
              {role}
            </Button>
          ))}
        </View>
        <View style={styles.row}>
          {ROLES.map((role) => (
            <Button
              key={role}
              variant="ghost"
              size="s"
              appearance={role}
              onPress={() => {}}
            >
              {role}
            </Button>
          ))}
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 60, paddingBottom: 64 },
  frame: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadingText: { fontSize: 13 },
  emptyText: { fontSize: 14, textAlign: 'center', maxWidth: 280 },
  themeLoading: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', flex: 1 },
  themeToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  surfaceCard: {
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
