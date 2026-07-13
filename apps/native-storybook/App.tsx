/**
 * App.tsx — OneUI Storybook (React Native SDK playbook).
 *
 * Boots the shared foundation once, then hands the screen to the on-device
 * Storybook UI:
 *
 *   initJdsJioIcons   — register JDS glyphs for semantic <Icon name="…" />
 *   useFonts          — bundled JioType + Noto script families
 *   GestureHandler    — required by RN gesture-handler 2.x
 *   SafeAreaProvider  — safe-area insets for the Storybook chrome
 *   IconProvider      — iconSet="jio" so component stories resolve glyphs
 *   StorybookUIRoot   — the Storybook navigator; per-story brand/theme/density
 *                       wrapping lives in `.rnstorybook/preview.tsx`
 *
 * Brand data is read OFFLINE from the snapshots in `src/brand-data/`. Refresh
 * with `pnpm generate:brands`.
 */

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as JdsIcons from '@jds/core-icons--react-native';
import { IconProvider, initJdsJioIcons } from '@oneui/ui-native/icons';

import StorybookUIRoot from './.rnstorybook';
import {
  JIOTYPE_BUNDLED_FONT_FILES,
  NOTO_SCRIPT_BUNDLED_FONT_FILES,
} from './src/fonts/bundledFontFamilies';

// Register the JDS RN module as the Jio icon source before the first <Icon>
// renders. Idempotent.
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
        <IconProvider iconSet="jio" defaultSize="md">
          <StorybookUIRoot />
        </IconProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
