const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// unstable_enablePackageExports is required for @oneui/ui-native subpath exports
// (e.g. @oneui/ui-native/theme). Remove when React Native enables this by default.
const config = {
  resolver: {
    unstable_enablePackageExports: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
