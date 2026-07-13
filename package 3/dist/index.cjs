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
var src_exports = {};
__export(src_exports, {
  detectFramework: () => detectFramework,
  detectPackageManager: () => detectPackageManager,
  installSpec: () => installSpec,
  patchSnippets: () => patchSnippets,
  runInstall: () => runInstall,
  writeBrandsConfig: () => writeBrandsConfig
});
module.exports = __toCommonJS(src_exports);
var import_node_fs = require("fs");
var import_node_path = require("path");
var import_node_child_process = require("child_process");
function detectFramework(projectRoot) {
  const reasons = [];
  const pkgJsonPath = (0, import_node_path.join)(projectRoot, "package.json");
  let deps = {};
  if ((0, import_node_fs.existsSync)(pkgJsonPath)) {
    try {
      const pkg = JSON.parse((0, import_node_fs.readFileSync)(pkgJsonPath, "utf8"));
      deps = { ...pkg.dependencies, ...pkg.devDependencies };
    } catch {
      reasons.push("package.json unparseable");
    }
  } else {
    reasons.push("no package.json \u2014 assuming bare project");
  }
  if ("next" in deps || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "next.config.js")) || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "next.config.mjs")) || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "next.config.ts"))) {
    reasons.push("next dependency or next.config found");
    return { framework: "next", reasons };
  }
  if ("vite" in deps || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "vite.config.js")) || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "vite.config.mjs")) || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "vite.config.ts"))) {
    reasons.push("vite dependency or vite.config found");
    return { framework: "vite", reasons };
  }
  if ("react-scripts" in deps || "webpack" in deps || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "webpack.config.js")) || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "webpack.config.ts"))) {
    reasons.push("react-scripts / webpack dependency or config found");
    return { framework: "webpack", reasons };
  }
  if ((0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "esbuild.config.js")) || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "esbuild.config.mjs")) || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "esbuild.config.ts")) || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "build.mjs")) || (0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "bun.lockb"))) {
    reasons.push("esbuild config or bun.lockb found");
    return { framework: "esbuild", reasons };
  }
  reasons.push("no recognized framework markers");
  return { framework: "unknown", reasons };
}
var FRAMEWORK_PLUGIN = {
  next: "@jds4/oneui-next-plugin",
  vite: "@jds4/oneui-vite-plugin",
  webpack: "@jds4/oneui-webpack-plugin",
  esbuild: "@jds4/oneui-esbuild-plugin"
};
function installSpec(framework) {
  const runtime = ["@jds4/oneui-react", "@jds4/oneui-icons-jio"];
  if (framework === "unknown") return { runtime, dev: [] };
  return { runtime, dev: [FRAMEWORK_PLUGIN[framework]] };
}
function writeBrandsConfig(projectRoot, config, force = false) {
  const path = (0, import_node_path.join)(projectRoot, "oneui.brands.json");
  if ((0, import_node_fs.existsSync)(path) && !force) {
    return { written: false, path, reason: "file exists \u2014 pass --force to overwrite" };
  }
  (0, import_node_fs.writeFileSync)(path, `${JSON.stringify(config, null, 2)}
`);
  return { written: true, path };
}
function detectPackageManager(projectRoot) {
  if ((0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "pnpm-lock.yaml"))) return "pnpm";
  if ((0, import_node_fs.existsSync)((0, import_node_path.join)(projectRoot, "yarn.lock"))) return "yarn";
  return "npm";
}
function runInstall(projectRoot, runtime, dev, pm) {
  const commands = [];
  function buildInstallArgs(packages, asDev) {
    if (pm === "pnpm") return [asDev ? "add" : "add", ...asDev ? ["-D"] : [], ...packages];
    if (pm === "yarn") return ["add", ...asDev ? ["-D"] : [], ...packages];
    return ["install", ...asDev ? ["-D"] : ["--save"], ...packages];
  }
  function exec(args) {
    commands.push(`${pm} ${args.join(" ")}`);
    const res = (0, import_node_child_process.spawnSync)(pm, args, { cwd: projectRoot, stdio: "inherit" });
    return res.status === 0;
  }
  if (runtime.length > 0) {
    if (!exec(buildInstallArgs(runtime, false))) return { ok: false, commands };
  }
  if (dev.length > 0) {
    if (!exec(buildInstallArgs(dev, true))) return { ok: false, commands };
  }
  return { ok: true, commands };
}
function patchSnippets(framework) {
  const importSnippet = "// Add at the top of your app entry (main.tsx / _app.tsx):\nimport '@jds4/oneui-react/styles';\n";
  if (framework === "next") {
    return {
      configFile: "next.config.js",
      snippet: `${importSnippet}
// next.config.js \u2014 wrap your config with withOneui:
const { withOneui } = require('@jds4/oneui-next-plugin');

/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['@jds4/oneui-react', '@jds4/oneui-icons-jio'],
  // ...your existing config
};

module.exports = withOneui()(config);
`
    };
  }
  if (framework === "vite") {
    return {
      configFile: "vite.config.ts",
      snippet: `${importSnippet}
// vite.config.ts \u2014 add the oneui plugin:
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { oneui } from '@jds4/oneui-vite-plugin';

export default defineConfig({
  plugins: [react(), oneui()],
});
`
    };
  }
  if (framework === "webpack") {
    return {
      configFile: "webpack.config.js",
      snippet: `${importSnippet}
// webpack.config.js \u2014 add the oneui plugin:
const { oneui } = require('@jds4/oneui-webpack-plugin');

module.exports = {
  // ...your existing config
  plugins: [
    // ...your existing plugins
    oneui(),
  ],
};
`
    };
  }
  if (framework === "esbuild") {
    return {
      configFile: "esbuild.config.mjs (or your build script)",
      snippet: `${importSnippet}
// esbuild build script \u2014 add the oneui plugin:
import { build } from 'esbuild';
import { oneui } from '@jds4/oneui-esbuild-plugin';

await build({
  // ...your existing options
  plugins: [
    // ...your existing plugins
    oneui(),
  ],
});
`
    };
  }
  return {
    configFile: "your bundler config",
    snippet: `${importSnippet}
# Couldn't detect your framework. OneUI ships plugins for Vite, Webpack,
# and Next.js. Install whichever fits your stack:
#   @jds4/oneui-vite-plugin
#   @jds4/oneui-webpack-plugin
#   @jds4/oneui-next-plugin
# Each exposes the same oneui()/withOneui() API.
`
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  detectFramework,
  detectPackageManager,
  installSpec,
  patchSnippets,
  runInstall,
  writeBrandsConfig
});
//# sourceMappingURL=index.cjs.map