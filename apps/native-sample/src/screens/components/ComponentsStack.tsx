/**
 * ComponentsStack.tsx
 *
 * Native stack inside the "Components" drawer route. Two screens:
 *   - List   → `ComponentsListScreen` (SectionList of all 60+ components)
 *   - Detail → `ComponentDetailScreen` (Button showcases for the impl-ed
 *              component; pending placeholder otherwise)
 *
 * Header is intentionally `null` because the parent drawer already renders
 * the unified `<TopBar />` — we don't want a second header to stack.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentsListScreen } from './ComponentsListScreen';
import { ComponentDetailScreen } from './ComponentDetailScreen';

export type ComponentsStackParamList = {
  List: undefined;
  Detail: { id: string; name: string };
};

const Stack = createNativeStackNavigator<ComponentsStackParamList>();

export function ComponentsStack(): React.ReactElement {
  return (
    <Stack.Navigator
      screenOptions={{
        // Drawer header (TopBar) handles titling — keep stack lightweight.
        headerShown: false,
      }}
    >
      <Stack.Screen name='List' component={ComponentsListScreen} />
      <Stack.Screen name='Detail' component={ComponentDetailScreen} />
    </Stack.Navigator>
  );
}
