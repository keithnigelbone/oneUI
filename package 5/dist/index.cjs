"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default,
  withOneui: () => withOneui
});
module.exports = __toCommonJS(index_exports);
var import_webpack_plugin = require("@jds4/oneui-webpack-plugin");
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
      wc.plugins.push(new import_webpack_plugin.OneuiWebpackPlugin(opts ?? {}));
      if (typeof userWebpack === "function") {
        return userWebpack(webpackConfig, options);
      }
      return webpackConfig;
    }
  };
}
var index_default = withOneui;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  withOneui
});
//# sourceMappingURL=index.cjs.map