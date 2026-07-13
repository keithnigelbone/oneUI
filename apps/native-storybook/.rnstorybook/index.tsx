import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as lightTheme } from '@storybook/react-native-theming';
// `storybook.requires.ts` is generated automatically by the Storybook Metro
// integration (`withStorybook` in metro.config.js) on first bundle, and can
// also be regenerated manually with `pnpm storybook-generate`. It registers
// every story under `stories/**` plus the on-device addons.
import { view } from './storybook.requires';
import CustomUI from './CustomUI';

// OneUI brand accent for the Storybook chrome (navigator, tabs, selection).
// Chrome-only — component tokens still come from the brand CSS engine.
const ONEUI_INDIGO = '#4B1FD6';

/**
 * Light, OneUI-branded chrome. We always start from the light base theme and
 * override the accents so the playbook never renders in dark mode.
 */
const oneuiLightTheme = {
  ...lightTheme,
  // Nested palette drives the navigator row selection + accents.
  color: { ...lightTheme.color, primary: ONEUI_INDIGO, secondary: ONEUI_INDIGO },
  colorPrimary: ONEUI_INDIGO,
  colorSecondary: ONEUI_INDIGO,
  barSelectedColor: ONEUI_INDIGO,
  appBg: '#F4F5F7',
  appContentBg: '#FFFFFF',
  appBorderColor: '#E3E5E9',
  appBorderRadius: 10,
  barBg: '#FFFFFF',
  barTextColor: '#5B6370',
  textColor: '#1A1D21',
  inputBg: '#FFFFFF',
  inputBorder: '#D7DAE0',
};

const StorybookUIRoot = view.getStorybookUI({
  theme: oneuiLightTheme,
  CustomUIComponent: CustomUI,
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

export default StorybookUIRoot;
