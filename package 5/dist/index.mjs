// src/index.ts
import { OneuiWebpackPlugin } from "@jds4/oneui-webpack-plugin";
function withOneui(configOrOpts, maybeOpts) {
  const looksLikeOpts = (v) => typeof v === "object" && v !== null && ("cdnUrl" in v || "brands" in v || "configFile" in v || "cacheDir" in v || "offline" in v);
  if (configOrOpts === void 0 || looksLikeOpts(configOrOpts)) {
    const opts = configOrOpts;
    return (config = {}) => wrapConfig(config, opts);
  }
  return wrapConfig(configOrOpts, maybeOpts);
}
function wrapConfig(config, opts) {
  const userWebpack = config.webpack;
  return {
    ...config,
    webpack(webpackConfig, options) {
      const wc = webpackConfig;
      wc.plugins = wc.plugins ?? [];
      wc.plugins.push(new OneuiWebpackPlugin(opts ?? {}));
      if (typeof userWebpack === "function") {
        return userWebpack(webpackConfig, options);
      }
      return webpackConfig;
    }
  };
}
var index_default = withOneui;
export {
  index_default as default,
  withOneui
};
//# sourceMappingURL=index.mjs.map