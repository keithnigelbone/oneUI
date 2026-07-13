#!/usr/bin/env node

// src/index.ts
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";
function detectFramework(projectRoot) {
  const reasons = [];
  const pkgJsonPath = join(projectRoot, "package.json");
  let deps = {};
  if (existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
      deps = { ...pkg.dependencies, ...pkg.devDependencies };
    } catch {
      reasons.push("package.json unparseable");
    }
  } else {
    reasons.push("no package.json \u2014 assuming bare project");
  }
  if ("next" in deps || existsSync(join(projectRoot, "next.config.js")) || existsSync(join(projectRoot, "next.config.mjs")) || existsSync(join(projectRoot, "next.config.ts"))) {
    reasons.push("next dependency or next.config found");
    return { framework: "next", reasons };
  }
  if ("vite" in deps || existsSync(join(projectRoot, "vite.config.js")) || existsSync(join(projectRoot, "vite.config.mjs")) || existsSync(join(projectRoot, "vite.config.ts"))) {
    reasons.push("vite dependency or vite.config found");
    return { framework: "vite", reasons };
  }
  if ("react-scripts" in deps || "webpack" in deps || existsSync(join(projectRoot, "webpack.config.js")) || existsSync(join(projectRoot, "webpack.config.ts"))) {
    reasons.push("react-scripts / webpack dependency or config found");
    return { framework: "webpack", reasons };
  }
  if (existsSync(join(projectRoot, "esbuild.config.js")) || existsSync(join(projectRoot, "esbuild.config.mjs")) || existsSync(join(projectRoot, "esbuild.config.ts")) || existsSync(join(projectRoot, "build.mjs")) || existsSync(join(projectRoot, "bun.lockb"))) {
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
  const path = join(projectRoot, "oneui.brands.json");
  if (existsSync(path) && !force) {
    return { written: false, path, reason: "file exists \u2014 pass --force to overwrite" };
  }
  writeFileSync(path, `${JSON.stringify(config, null, 2)}
`);
  return { written: true, path };
}
function detectPackageManager(projectRoot) {
  if (existsSync(join(projectRoot, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(projectRoot, "yarn.lock"))) return "yarn";
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
    const res = spawnSync(pm, args, { cwd: projectRoot, stdio: "inherit" });
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

export {
  detectFramework,
  installSpec,
  writeBrandsConfig,
  detectPackageManager,
  runInstall,
  patchSnippets
};
//# sourceMappingURL=chunk-XLUONOGO.mjs.map