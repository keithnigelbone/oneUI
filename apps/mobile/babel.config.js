// Standard Expo Babel preset. The monorepo resolves sibling packages via the
// metro.config.js `watchFolders` + `nodeModulesPaths` setup; no additional
// babel plugins needed for module resolution.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
