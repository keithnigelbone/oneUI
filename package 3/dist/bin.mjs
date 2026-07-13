#!/usr/bin/env node
import {
  detectFramework,
  detectPackageManager,
  installSpec,
  patchSnippets,
  runInstall,
  writeBrandsConfig
} from "./chunk-XLUONOGO.mjs";

// src/bin.ts
import { createInterface } from "readline/promises";
import { stdin, stdout, exit } from "process";
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
  const rl = createInterface({ input: stdin, output: stdout });
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
      exit(1);
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
      exit(1);
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
  exit(1);
});
//# sourceMappingURL=bin.mjs.map