/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'OneUI Native Components',
  slug: 'oneui-native-components-sample',
  scheme: 'oneui-native-components',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.oneui.nativecomponents',
  },
  android: {
    package: 'com.oneui.nativecomponents',
    adaptiveIcon: {
      backgroundColor: '#ffffff',
    },
  },
  web: {
    bundler: 'metro',
  },
  plugins: [
    'expo-font',
    './plugins/withAndroidNetworkSecurity',
    './plugins/withAndroidDevSslBypass',
  ],
};
