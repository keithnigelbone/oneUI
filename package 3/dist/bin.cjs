"use strict";

// src/bin.ts
var import_promises = require("readline/promises");
var import_node_process = require("process");

// src/index.ts
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

// src/bin.ts
function parseArgs(argv) {
  const parsed = { force: false, skipInstall: false, yes: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--cdn-url" && argv[i + 1]) {
      parsed.cdnUrl = argv[i + 1];
      i++;
    } else if (a === "--brands" && argv[i + 1]) {
      parsed.brands = argv[i + 1].split(",").map((s) => s.trim()).filter(Boolean);
      i++;
    } else if (a === "--force") {
      parsed.force = true;
    } else if (a === "--skip-install") {
      parsed.skipInstall = true;
    } else if (a === "--yes" || a === "-y") {
      parsed.yes = true;
    } else if (a === "--help" || a === "-h") {
      parsed.help = true;
    }
  }
  return parsed;
}
function printHelp() {
  console.log(
    `oneui-init \u2014 set up @jds4/oneui-react in this project.

Usage: npx @jds4/oneui-init [options]

Options:
  --cdn-url <url>          OneUI CDN base URL (skips prompt)
  --brands <a,b,c>         comma-separated brand slugs to fetch (skips prompt)
  --force                  overwrite existing oneui.brands.json
  --skip-install           don't run the package manager
  -y, --yes                accept defaults; no interactive prompts
  -h, --help               show this help
`
  );
}
async function prompt(question, defaultValue) {
  const rl = (0, import_promises.createInterface)({ input: import_node_process.stdin, output: import_node_process.stdout });
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  rl.close();
  return answer.length === 0 && defaultValue !== void 0 ? defaultValue : answer;
}
function frameworkLabel(f) {
  return { next: "Next.js", vite: "Vite", webpack: "Webpack", esbuild: "esbuild", unknown: "unknown" }[f];
}
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  const projectRoot = process.cwd();
  console.log(`
[@jds4/oneui-init] running in ${projectRoot}
`);
  const { framework, reasons } = detectFramework(projectRoot);
  console.log(`Detected: ${frameworkLabel(framework)}`);
  for (const r of reasons) {
    console.log(`  \xB7 ${r}`);
  }
  if (framework === "unknown") {
    console.warn(
      `
Couldn't recognize the project's bundler. Installing the runtime packages (@jds4/oneui-react, @jds4/oneui-icons-jio) only \u2014 you'll need to wire up a bundler plugin yourself. See the snippet printed at the end for guidance.`
    );
  }
  let cdnUrl = args.cdnUrl;
  if (!cdnUrl) {
    if (args.yes) {
      console.error("\n--cdn-url is required when running with --yes.");
      (0, import_node_process.exit)(1);
    }
    cdnUrl = await prompt("OneUI CDN base URL", "https://myjiostatic.cdn.jio.com/JDS");
  }
  let brandSlugs = args.brands;
  if (!brandSlugs || brandSlugs.length === 0) {
    if (args.yes) {
      brandSlugs = ["jio"];
    } else {
      const raw = await prompt("Brands to fetch (comma-separated slugs)", "jio");
      brandSlugs = raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  const brands = {};
  for (const slug of brandSlugs) brands[slug] = "latest";
  const { runtime, dev } = installSpec(framework);
  if (!args.skipInstall) {
    const pm = detectPackageManager(projectRoot);
    console.log(`
Installing with ${pm}:
  runtime: ${runtime.join(", ")}
  dev:     ${dev.join(", ") || "(none)"}`);
    const result = runInstall(projectRoot, runtime, dev, pm);
    if (!result.ok) {
      console.error(`
Install failed. Re-run manually:
  ${result.commands.join("\n  ")}`);
      (0, import_node_process.exit)(1);
    }
  } else {
    console.log(
      `
Skipping install (--skip-install). Run yourself:
  ${detectPackageManager(projectRoot)} add ${runtime.join(" ")}
` + (dev.length > 0 ? `  ${detectPackageManager(projectRoot)} add -D ${dev.join(" ")}
` : "")
    );
  }
  const write = writeBrandsConfig(projectRoot, { cdnUrl, brands }, args.force);
  if (!write.written) {
    console.warn(`
Did not write ${write.path}: ${write.reason}`);
  } else {
    console.log(`
\u2713 Wrote ${write.path}`);
  }
  const { configFile, snippet } = patchSnippets(framework);
  console.log(`
Next steps \u2014 add to ${configFile}:
`);
  console.log(snippet);
  console.log('Done. Render `<Icon icon="home" />` inside a `<BrandProvider brand="jio">` to verify.\n');
}
main().catch((err) => {
  console.error("[@jds4/oneui-init] unexpected error:", err);
  (0, import_node_process.exit)(1);
});
//# sourceMappingURL=bin.cjs.map