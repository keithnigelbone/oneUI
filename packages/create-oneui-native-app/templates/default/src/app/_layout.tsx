import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OneUIBrandProvider } from '@oneui/ui-native';
import { ThemeContext } from './ThemeContext';
import '.oneui-cached';

export default function RootLayout() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const cycleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  // JioType fonts loaded locally for now.
  // Once @oneui/native-cdn ships font bundling, remove this and let the CDN handle it.
  const [fontsLoaded] = useFonts({
    'JioType-Medium': require('../../assets/fonts/JioType-Medium.ttf'),
    'JioType-Bold': require('../../assets/fonts/JioType-Bold.ttf'),
    'JioType-ExtraBlack': require('../../assets/fonts/JioType-ExtraBlack.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeContext.Provider value={{ mode, cycleMode }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {/*
           * brand="__BRAND_ID__" resolves brand data from node_modules/.oneui-cached
           * after running `npx oneui-native-cdn prefetch`.
           * Falls back to the bundled Jio default snapshot when the cache is absent.
           *
           * To switch brands, update oneui.brands.json, run `npm run prefetch`,
           * then change the brand prop: brand="tira"
           */}
          <OneUIBrandProvider brand="__BRAND_ID__" mode={mode}>
            <Stack screenOptions={{ headerShown: false }} />
          </OneUIBrandProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeContext.Provider>
  );
}
