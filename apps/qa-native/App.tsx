/**
 * App.tsx — qa-native
 *
 * Bootstraps the OneUI brand cascade from static JSON fixtures (a snapshot
 * of `api.foundations.getBrandOverviewData` + `api.componentTokenOverrides
 * .getAllBrandComponentData` for the Jio brand). Mirrors the
 * `<OneUIBrandProvider>` shape used by `apps/native-components-sample` —
 * but with the Convex `useQuery` calls swapped for filesystem imports,
 * so qa-native runs fully offline and produces deterministic builds for
 * E2E + visual QA.
 */

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  type NavigatorScreenParams,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { OneUIBrandProvider } from '@oneui/ui-native';
import { initJdsJioIcons } from '@oneui/ui-native/icons';
import * as JdsIcons from '@jds/core-icons--react-native';

// Register the JDS RN module as the Jio icon source — must happen BEFORE
// the first <Icon name="…" /> renders. Idempotent.
initJdsJioIcons(JdsIcons);

import { HomeScreen } from './src/screens/HomeScreen';
import { ComponentScreen } from './src/screens/ComponentScreen';
import { componentRegistry, type ComponentRouteName } from './src/componentRegistry';
import { ThemeModeProvider, useThemeMode } from './src/ThemeModeContext';
import { ThemeToggleButton } from './src/components/ThemeToggleButton';
import {
  BUNDLED_JIOTYPE_WEIGHT_FAMILIES,
  JIOTYPE_BUNDLED_FONT_FILES,
} from './src/brand/bundledFontFamilies';
// Combined brand export ({ foundation, components }) from the brand-data folder.
// Swap this import to another brand/sub-brand under ./src/brand-data to retheme.
import jioBrandData from './src/brand-data/Jio/base.json';

const FONT_OVERRIDES = { primary: BUNDLED_JIOTYPE_WEIGHT_FAMILIES };

export type RootStackParamList = {
  Home: undefined;
  Component: { name: ComponentRouteName };
};

export type AppNavParams = NavigatorScreenParams<RootStackParamList>;
export type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type ComponentProps = NativeStackScreenProps<RootStackParamList, 'Component'>;

const Stack = createNativeStackNavigator<RootStackParamList>();

function ThemedNavigation(): React.ReactElement {
  const { mode } = useThemeMode();
  return (
    <OneUIBrandProvider
      brandData={jioBrandData}
      themeMode={mode}
      fontFamilyOverrides={FONT_OVERRIDES}
      loadingFallback={<LoadingFallback />}
    >
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName='Home'
          screenOptions={{
            headerRight: () => <ThemeToggleButton />,
          }}
        >
          <Stack.Screen
            name='Home'
            component={HomeScreen}
            options={{ title: 'qa-native · Components' }}
          />
          <Stack.Screen
            name='Component'
            component={ComponentScreen}
            options={({ route }) => ({
              title: componentRegistry[route.params.name].title,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </OneUIBrandProvider>
  );
}

function LoadingFallback(): React.ReactElement {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}

export default function App(): React.ReactElement {
  const [fontsReady] = useFonts({
    ...JIOTYPE_BUNDLED_FONT_FILES,
  });

  if (!fontsReady) {
    return <LoadingFallback />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeModeProvider initialMode='light'>
          <StatusBar style='auto' />
          <ThemedNavigation />
        </ThemeModeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
