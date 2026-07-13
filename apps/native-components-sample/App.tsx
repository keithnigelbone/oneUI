/**
 * Root for `native-components-sample`: fonts, gestures, safe area, Convex,
 * page context, themed stack (component list + detail; opens on Button).
 *
 * Bundled fonts load through `expo-font` `useFonts` (see
 * `src/fonts/bundledFontFamilies.ts`). To add another bundled face the same
 * way you would wire a locale font (e.g. Bengali): place the `.ttf` under
 * `assets/fonts/`, register a stable family key in `useFonts`, then set
 * `fontFamily` to that key on the screens that should use it.
 */

import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { IconProvider } from '@oneui/ui-native/icons';
// Auto-registers all 1,609 Jio icons (superset of the JDS tarball).
// Must import before the first <Icon name="…" /> renders.
import '@oneui/icons-jio-native';

import { getConvexUrl } from './src/getConvexUrl';
import {
  BUNDLED_JETBRAINS_MONO_FONT_FILES,
  JIOTYPE_BUNDLED_FONT_FILES,
} from './src/fonts/bundledFontFamilies';
import { PageContextProvider } from './src/PageContext';
import { ThemedShell } from './src/ThemedShell';

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;

export default function App(): React.ReactElement {
  const [client] = useState(() => {
    const url = getConvexUrl();
    return new ConvexReactClient(url, {
      // Local/http Convex URLs (Android adb reverse) skip cloud hostname checks.
      ...(url.startsWith('http://') ? { skipConvexDeploymentUrlCheck: true } : {}),
    });
  });

  const [fontsReady] = useFonts({
    ...JIOTYPE_BUNDLED_FONT_FILES,
    ...BUNDLED_JETBRAINS_MONO_FONT_FILES,
  });

  if (!fontsReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ConvexProvider client={client}>
          <IconProvider iconSet="jio" defaultSize="md">
            <PageContextProvider>
              <StatusBar style="auto" />
              <ThemedShell />
            </PageContextProvider>
          </IconProvider>
        </ConvexProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
