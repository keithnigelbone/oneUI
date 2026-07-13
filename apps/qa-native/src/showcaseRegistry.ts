/**
 * showcaseRegistry — maps every component name to a ready-to-render Screen.
 *
 * Each import pulls the `@oneui/ui-native/showcase/<Name>` module (the same
 * files used by Storybook / native-components-sample). `showcaseModuleToSections`
 * converts the named function exports into labelled sections and
 * `makeShowcaseScreen` wraps them in a ScrollView with section chrome.
 *
 * Adding a new component:
 *   1. Import its showcase module below.
 *   2. Add a one-liner: `export const XxxScreen = make('Xxx', XxxShowcase);`
 *   3. Wire it into componentRegistry.ts.
 */

import * as AvatarShowcase from '@oneui/ui-native/showcase/Avatar';
import * as BadgeShowcase from '@oneui/ui-native/showcase/Badge';
import * as BottomNavigationShowcase from '@oneui/ui-native/showcase/BottomNavigation';
import * as BottomNavigationItemShowcase from '@oneui/ui-native/showcase/BottomNavigationItem';
import * as CheckboxShowcase from '@oneui/ui-native/showcase/Checkbox';
import * as CheckboxFieldShowcase from '@oneui/ui-native/showcase/CheckboxField';
import * as ChipShowcase from '@oneui/ui-native/showcase/Chip';
import * as ChipGroupShowcase from '@oneui/ui-native/showcase/ChipGroup';
import * as ContainerShowcase from '@oneui/ui-native/showcase/Container';
import * as CounterBadgeShowcase from '@oneui/ui-native/showcase/CounterBadge';
import * as DividerShowcase from '@oneui/ui-native/showcase/Divider';
import * as IconShowcase from '@oneui/ui-native/showcase/Icon';
import * as IconButtonShowcase from '@oneui/ui-native/showcase/IconButton';
import * as IconContainedShowcase from '@oneui/ui-native/showcase/IconContained';
import * as ImageShowcase from '@oneui/ui-native/showcase/Image';
import * as IndicatorBadgeShowcase from '@oneui/ui-native/showcase/IndicatorBadge';
import * as InputShowcase from '@oneui/ui-native/showcase/Input';
import * as InputDynamicTextShowcase from '@oneui/ui-native/showcase/InputDynamicText';
import * as InputFeedbackShowcase from '@oneui/ui-native/showcase/InputFeedback';
import * as InputFieldShowcase from '@oneui/ui-native/showcase/InputField';
import * as LinkButtonShowcase from '@oneui/ui-native/showcase/LinkButton';
import * as LogoShowcase from '@oneui/ui-native/showcase/Logo';
import * as PaginationDotsShowcase from '@oneui/ui-native/showcase/PaginationDots';
import * as ProgressShowcase from '@oneui/ui-native/showcase/Progress';
import * as RadioShowcase from '@oneui/ui-native/showcase/Radio';
import * as RadioFieldShowcase from '@oneui/ui-native/showcase/RadioField';
import * as SeparatorShowcase from '@oneui/ui-native/showcase/Separator';
import * as SpinnerShowcase from '@oneui/ui-native/showcase/Spinner';
import * as TextShowcase from '@oneui/ui-native/showcase/Text';

import {
  makeShowcaseScreen,
  showcaseModuleToSections,
} from './screens/components/ShowcaseScreen';

function make(name: string, mod: Record<string, unknown>) {
  return makeShowcaseScreen(showcaseModuleToSections(mod, name));
}

export const AvatarScreen           = make('Avatar',              AvatarShowcase);
export const BadgeScreen            = make('Badge',               BadgeShowcase);
export const BottomNavigationScreen = make('BottomNavigation',    BottomNavigationShowcase);
export const BottomNavigationItemScreen = make('BottomNavigationItem', BottomNavigationItemShowcase);
export const CheckboxScreen         = make('Checkbox',            CheckboxShowcase);
export const CheckboxFieldScreen    = make('CheckboxField',       CheckboxFieldShowcase);
export const ChipScreen             = make('Chip',                ChipShowcase);
export const ChipGroupScreen        = make('ChipGroup',           ChipGroupShowcase);
export const ContainerScreen        = make('Container',           ContainerShowcase);
export const CounterBadgeScreen     = make('CounterBadge',        CounterBadgeShowcase);
export const DividerScreen          = make('Divider',             DividerShowcase);
export const IconScreen             = make('Icon',                IconShowcase);
export const IconButtonScreen       = make('IconButton',          IconButtonShowcase);
export const IconContainedScreen    = make('IconContained',       IconContainedShowcase);
export const ImageScreen            = make('Image',               ImageShowcase);
export const IndicatorBadgeScreen   = make('IndicatorBadge',      IndicatorBadgeShowcase);
export const InputScreen            = make('Input',               InputShowcase);
export const InputDynamicTextScreen = make('InputDynamicText',    InputDynamicTextShowcase);
export const InputFeedbackScreen    = make('InputFeedback',       InputFeedbackShowcase);
export const InputFieldScreen       = make('InputField',          InputFieldShowcase);
export const LinkButtonScreen       = make('LinkButton',          LinkButtonShowcase);
export const LogoScreen             = make('Logo',                LogoShowcase);
export const PaginationDotsScreen   = make('PaginationDots',      PaginationDotsShowcase);
export const ProgressScreen         = make('Progress',            ProgressShowcase);
export const RadioScreen            = make('Radio',               RadioShowcase);
export const RadioFieldScreen       = make('RadioField',          RadioFieldShowcase);
export const SeparatorScreen        = make('Separator',           SeparatorShowcase);
export const SpinnerScreen          = make('Spinner',             SpinnerShowcase);
export const TextScreen             = make('Text',                TextShowcase);
