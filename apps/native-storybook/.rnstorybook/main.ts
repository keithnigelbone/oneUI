import type { StorybookConfig } from '@storybook/react-native';

/**
 * On-device Storybook config for the OneUI React Native SDK (`@oneui/ui-native`).
 *
 * Stories live in `../stories/**` and are generated from each component's
 * `*.showcase.native.tsx` peer by `scripts/generate-stories.mjs` — run
 * `pnpm generate:stories` after adding or changing a component showcase.
 */
const main: StorybookConfig = {
  stories: ['../stories/**/*.stories.?(ts|tsx|js|jsx)'],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
    '@storybook/addon-ondevice-notes',
    '@storybook/addon-ondevice-backgrounds',
  ],
};

export default main;
