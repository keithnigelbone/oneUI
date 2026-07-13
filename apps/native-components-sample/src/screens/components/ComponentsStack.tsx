/**
 * Components stack: list of primitives + detail showcases.
 * Initial route is Button detail so the app opens directly on showcases.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JioTypeUIWeightsScreen } from '../JioTypeUIWeightsScreen';
import { AllComponentsScreen } from '../AllComponentsScreen';
import { ComponentsListScreen } from './ComponentsListScreen';
import { ComponentDetailScreen } from './ComponentDetailScreen';
import { IconsScreen } from './IconsScreen';

export type ComponentsStackParamList = {
  List: undefined;
  Detail: { id: string; name: string };
  FontWeights: undefined;
  Icons: undefined;
  AllComponents: undefined;
};

const Stack = createNativeStackNavigator<ComponentsStackParamList>();

export function ComponentsStack(): React.ReactElement {
  return (
    <Stack.Navigator
      initialRouteName="Detail"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="List" component={ComponentsListScreen} />
      <Stack.Screen
        name="Detail"
        component={ComponentDetailScreen}
        initialParams={{ id: 'button', name: 'Button' }}
      />
      <Stack.Screen name="FontWeights" component={JioTypeUIWeightsScreen} />
      <Stack.Screen name="Icons" component={IconsScreen} />
      <Stack.Screen name="AllComponents" component={AllComponentsScreen} />
    </Stack.Navigator>
  );
}
