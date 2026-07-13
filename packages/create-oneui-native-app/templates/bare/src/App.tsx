// Brand data populated by `npm run prefetch` → node_modules/.oneui-cached,
// imported as the bare specifier '.oneui-cached' (a generated package). Falls
// back to the bundled Jio default snapshot when the cache is absent.
import '.oneui-cached';

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OneUIBrandProvider } from '@oneui/ui-native';
import { HomeScreen } from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const cycleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/*
         * brand="__BRAND_ID__" resolves brand data from node_modules/.oneui-cached
         * after running `npm run prefetch`.
         *
         * To switch brands, update oneui.brands.json, run `npm run prefetch`,
         * then change the brand prop: brand="tira"
         */}
        <OneUIBrandProvider brand="__BRAND_ID__" mode={mode}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home">
                {() => <HomeScreen mode={mode} onToggleMode={cycleMode} />}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </OneUIBrandProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
