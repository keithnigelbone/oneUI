/**
 * App.tsx
 *
 * Root composition for the OneUI native Surface checker.
 *
 * Layering (top → bottom):
 *   initJdsJioIcons           — register JDS glyphs for semantic <Icon name="…" />
 *   useFonts                  — bundled brand font registered once at boot
 *   GestureHandlerRootView    — required by RN gesture-handler 2.x
 *   SafeAreaProvider          — exposes safe-area insets
 *   IconProvider              — iconSet="jio" + SemanticMappings resolution
 *   PageContextProvider       — drives theme + active brand (offline)
 *   ThemedShell               — feeds the offline BrandData snapshot into
 *                               <OneUIBrandProvider> and mounts the
 *                               Surface inspector
 *
 * Brand data is read entirely OFFLINE from the exported snapshots in
 * `src/brand-data/` — no Convex connection. Regenerate snapshots with
 * `pnpm --filter @oneui/native-sample export:brands`.
 *
 * Fonts are bundled with the app (see ./assets/fonts/) and loaded via
 * `useFonts` at boot — JioType static cuts plus India-core Noto Sans
 * script families (same set as native-components-sample).
 */

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as JdsIcons from '@jds/core-icons--react-native';
import { IconProvider, initJdsJioIcons } from '@oneui/ui-native/icons';

import { PageContextProvider } from './src/PageContext';
import { ThemedShell } from './src/ThemedShell';
import {
  JIOTYPE_BUNDLED_FONT_FILES,
  NOTO_SCRIPT_BUNDLED_FONT_FILES,
} from './src/fonts/bundledFontFamilies';

// Register the JDS RN module as the Jio icon source — must happen BEFORE
// the first <Icon name="…" /> renders. Idempotent.
initJdsJioIcons(JdsIcons);

export default function App(): React.ReactElement {
  const [fontsReady] = useFonts({
    ...JIOTYPE_BUNDLED_FONT_FILES,
    ...NOTO_SCRIPT_BUNDLED_FONT_FILES,
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
        <IconProvider iconSet='jio' defaultSize='md'>
          <PageContextProvider>
            <StatusBar style='auto' />
            <ThemedShell />
          </PageContextProvider>
        </IconProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
