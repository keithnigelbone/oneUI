const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required for @oneui/ui-native subpath exports (e.g. @oneui/ui-native/theme).
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
