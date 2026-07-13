/**
 * componentRegistry — maps each navigation route to a per-component screen.
 *
 * Button uses its bespoke ButtonScreen (full Figma-matrix layout).
 * All other components use screens generated from their showcase exports via
 * showcaseRegistry.ts — each section corresponds to one named export from the
 * `@oneui/ui-native/showcase/<Name>` module.
 */

import type React from 'react';
import { AvatarScreen } from './screens/components/AvatarScreen';
import { BadgeScreen } from './screens/components/BadgeScreen';
import { ButtonScreen } from './screens/components/ButtonScreen';
import { ButtonSingleScreen } from './screens/components/ButtonSingleScreen';
import { CarouselScreen } from './screens/components/CarouselScreen';
import { CheckboxScreen } from './screens/components/CheckboxScreen';
import { ChipScreen } from './screens/components/ChipScreen';
import { ChipGroupScreen } from './screens/components/ChipGroupScreen';
import { CounterBadgeScreen } from './screens/components/CounterBadgeScreen';
import { IndicatorBadgeScreen } from './screens/components/IndicatorBadgeScreen';
import { ImageScreen } from './screens/components/ImageScreen';
import { DividerScreen } from './screens/components/DividerScreen';
import { TextScreen } from './screens/components/TextScreen';
import { LogoScreen } from './screens/components/LogoScreen';
import { ModalScreen } from './screens/components/ModalScreen';
import { BottomNavigationScreen } from './screens/components/BottomNavigationScreen';
import { InputScreen } from './screens/components/InputScreen';
import { InputFieldScreen } from './screens/components/InputFieldScreen';
import { CircularProgressIndicatorScreen } from './screens/components/CircularProgressIndicatorScreen';
import { RadioFieldScreen } from './screens/components/RadioFieldScreen';
import { CheckboxFieldScreen } from './screens/components/CheckboxFieldScreen';
import { IconButtonScreen } from './screens/components/IconButtonScreen';
import { IconScreen } from './screens/components/IconScreen';
import { IconContainedScreen } from './screens/components/IconContainedScreen';
import { PlaceholderScreen } from './screens/components/PlaceholderScreen';
import { RadioScreen } from './screens/components/RadioScreen';
import { SwitchScreen } from './screens/components/SwitchScreen';
import { TabsScreen } from './screens/components/TabsScreen';
import { TooltipScreen } from './screens/components/TooltipScreen';
import { TouchSliderScreen } from './screens/components/TouchSliderScreen';
import type { ComponentProps } from '../App';

import {
  BottomNavigationItemScreen,
  ContainerScreen,
  InputDynamicTextScreen,
  InputFeedbackScreen,
  LinkButtonScreen,
  PaginationDotsScreen,
  ProgressScreen,
  SeparatorScreen,
  SpinnerScreen,
} from './showcaseRegistry';

export interface ComponentRegistryEntry {
  readonly title: string;
  readonly Screen: React.ComponentType<ComponentProps>;
}

export const componentRegistry = {
  Avatar: { title: 'Avatar', Screen: AvatarScreen },
  Badge: { title: 'Badge', Screen: BadgeScreen },
  BottomNavigation: { title: 'BottomNavigation', Screen: BottomNavigationScreen },
  BottomNavigationItem: { title: 'BottomNavigationItem', Screen: PlaceholderScreen },
  Button: { title: 'Button', Screen: ButtonScreen },
  ButtonSingle: { title: 'Button (single)', Screen: ButtonSingleScreen },
  Carousel: { title: 'Carousel', Screen: CarouselScreen },
  Checkbox: { title: 'Checkbox', Screen: CheckboxScreen },
  CheckboxField: { title: 'CheckboxField', Screen: CheckboxFieldScreen },
  Chip: { title: 'Chip', Screen: ChipScreen },
  ChipGroup: { title: 'ChipGroup', Screen: ChipGroupScreen },
  CircularProgressIndicator: { title: 'CircularProgressIndicator', Screen: CircularProgressIndicatorScreen },
  Container: { title: 'Container', Screen: PlaceholderScreen },
  CounterBadge: { title: 'CounterBadge', Screen: CounterBadgeScreen },
  Divider: { title: 'Divider', Screen: DividerScreen },
  Icon: { title: 'Icon', Screen: IconScreen },
  IconButton: { title: 'IconButton', Screen: IconButtonScreen },
  IconContained: { title: 'IconContained', Screen: IconContainedScreen },
  Image: { title: 'Image', Screen: ImageScreen },
  IndicatorBadge: { title: 'IndicatorBadge', Screen: IndicatorBadgeScreen },
  Input: { title: 'Input', Screen: InputScreen },
  InputField: { title: 'InputField', Screen: InputFieldScreen },
  InputDynamicText: { title: 'InputDynamicText', Screen: InputDynamicTextScreen },
  InputFeedback: { title: 'InputFeedback', Screen: InputFeedbackScreen },
  LinkButton: { title: 'LinkButton', Screen: PlaceholderScreen },
  Logo: { title: 'Logo', Screen: LogoScreen },
  Modal: { title: 'Modal', Screen: ModalScreen },
  PaginationDots: { title: 'PaginationDots', Screen: PlaceholderScreen },
  Progress: { title: 'Progress', Screen: PlaceholderScreen },
  Radio: { title: 'Radio', Screen: RadioScreen },
  RadioField: { title: 'RadioField', Screen: RadioFieldScreen },
  Separator: { title: 'Separator', Screen: PlaceholderScreen },
  Spinner: { title: 'Spinner', Screen: PlaceholderScreen },
  Switch: { title: 'Switch', Screen: SwitchScreen },
  Tabs: { title: 'Tabs', Screen: TabsScreen },
  Text: { title: 'Text', Screen: TextScreen },
  Tooltip: { title: 'Tooltip', Screen: TooltipScreen },
  TouchSlider: { title: 'TouchSlider', Screen: TouchSliderScreen },
} as const satisfies Record<string, ComponentRegistryEntry>;

export type ComponentRouteName = keyof typeof componentRegistry;

export const componentRouteNames = Object.keys(componentRegistry) as ComponentRouteName[];
