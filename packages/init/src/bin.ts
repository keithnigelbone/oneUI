/**
 * bin.ts — CLI entry for `npx @jds4/oneui-init`.
 *
 * Pulls everything from `./index` (the testable library surface) and wires
 * it to stdin/stdout/process.argv. Keep this file thin — logic lives in
 * `index.ts` so tests can call the same code paths without spawning a
 * subprocess.
 *
 * Flags:
 *   --cdn-url <url>           skip the prompt
 *   --brands <slug1,slug2>    skip the prompt; comma-separated slugs;
 *                              each pinned to `latest`
 *   --force                   overwrite existing oneui.brands.json
 *   --skip-install            don't run the package manager (just write
 *                              the config + print snippets)
 *   --yes / -y                accept all defaults; no prompts
 *
 * Exit codes:
 *   0  success
 *   1  user aborted, or write/install failed
 */

import { createInterface } from 'node:readline/promises';
import { stdin, stdout, exit } from 'node:process';
import {
  detectFramework,
  detectPackageManager,
  installSpec,
  patchSnippets,
  runInstall,
  writeBrandsConfig,
  type Framework,
} from './index';

interface ParsedArgs {
  cdnUrl?: string;
  brands?: string[];
  force: boolean;
  skipInstall: boolean;
  yes: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = { force: false, skipInstall: false, yes: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--cdn-url' && argv[i + 1]) {
      parsed.cdnUrl = argv[i + 1];
      i++;
    } else if (a === '--brands' && argv[i + 1]) {
      parsed.brands = argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean);
      i++;
    } else if (a === '--force') {
      parsed.force = true;
    } else if (a === '--skip-install') {
      parsed.skipInstall = true;
    } else if (a === '--yes' || a === '-y') {
      parsed.yes = true;
    } else if (a === '--help' || a === '-h') {
      parsed.help = true;
    }
  }
  return parsed;
}

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(
    `oneui-init — set up @jds4/oneui-react in this project.\n`
    + `\n`
    + `Usage: npx @jds4/oneui-init [options]\n`
    + `\n`
    + `Options:\n`
    + `  --cdn-url <url>          OneUI CDN base URL (skips prompt)\n`
    + `  --brands <a,b,c>         comma-separated brand slugs to fetch (skips prompt)\n`
    + `  --force                  overwrite existing oneui.brands.json\n`
    + `  --skip-install           don't run the package manager\n`
    + `  -y, --yes                accept defaults; no interactive prompts\n`
    + `  -h, --help               show this help\n`,
  );
}

async function prompt(question: string, defaultValue?: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  const suffix = defaultValue ? ` [${defaultValue}]` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  rl.close();
  return answer.length === 0 && defaultValue !== undefined ? defaultValue : answer;
}

function frameworkLabel(f: Framework): string {
  return ({ next: 'Next.js', vite: 'Vite', webpack: 'Webpack', esbuild: 'esbuild', unknown: 'unknown' } as const)[f];
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const projectRoot = process.cwd();
  // eslint-disable-next-line no-console
  console.log(`\n[@jds4/oneui-init] running in ${projectRoot}\n`);

  // ── 1. Detect framework ────────────────────────────────────────────────
  const { framework, reasons } = detectFramework(projectRoot);
  // eslint-disable-next-line no-console
  console.log(`Detected: ${frameworkLabel(framework)}`);
  for (const r of reasons) {
    // eslint-disable-next-line no-console
    console.log(`  · ${r}`);
  }
  if (framework === 'unknown') {
    // eslint-disable-next-line no-console
    console.warn(
      `\nCouldn't recognize the project's bundler. Installing the runtime packages `
      + `(@jds4/oneui-react, @jds4/oneui-icons-jio) only — you'll need to wire up a `
      + `bundler plugin yourself. See the snippet printed at the end for guidance.`,
    );
  }

  // ── 2. Collect cdnUrl + brands ────────────────────────────────────────
  let cdnUrl = args.cdnUrl;
  if (!cdnUrl) {
    if (args.yes) {
      // eslint-disable-next-line no-console
      console.error('\n--cdn-url is required when running with --yes.');
      exit(1);
    }
    cdnUrl = await prompt('OneUI CDN base URL', 'https://myjiostatic.cdn.jio.com/JDS');
  }
  let brandSlugs = args.brands;
  if (!brandSlugs || brandSlugs.length === 0) {
    if (args.yes) {
      brandSlugs = ['jio'];
    } else {
      const raw = await prompt('Brands to fetch (comma-separated slugs)', 'jio');
      brandSlugs = raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  const brands: Record<string, string> = {};
  for (const slug of brandSlugs) brands[slug] = 'latest';

  // ── 3. Install packages ────────────────────────────────────────────────
  const { runtime, dev } = installSpec(framework);
  if (!args.skipInstall) {
    const pm = detectPackageManager(projectRoot);
    // eslint-disable-next-line no-console
    console.log(`\nInstalling with ${pm}:\n  runtime: ${runtime.join(', ')}\n  dev:     ${dev.join(', ') || '(none)'}`);
    const result = runInstall(projectRoot, runtime, dev, pm);
    if (!result.ok) {
      // eslint-disable-next-line no-console
      console.error(`\nInstall failed. Re-run manually:\n  ${result.commands.join('\n  ')}`);
      exit(1);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(
      `\nSkipping install (--skip-install). Run yourself:\n`
      + `  ${detectPackageManager(projectRoot)} add ${runtime.join(' ')}\n`
      + (dev.length > 0 ? `  ${detectPackageManager(projectRoot)} add -D ${dev.join(' ')}\n` : ''),
    );
  }

  // ── 4. Write oneui.brands.json ────────────────────────────────────────
  const write = writeBrandsConfig(projectRoot, { cdnUrl, brands }, args.force);
  if (!write.written) {
    // eslint-disable-next-line no-console
    console.warn(`\nDid not write ${write.path}: ${write.reason}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`\n✓ Wrote ${write.path}`);
  }

  // ── 5. Print snippets ─────────────────────────────────────────────────
  const { configFile, snippet } = patchSnippets(framework);
  // eslint-disable-next-line no-console
  console.log(`\nNext steps — add to ${configFile}:\n`);
  // eslint-disable-next-line no-console
  console.log(snippet);

  // eslint-disable-next-line no-console
  console.log('Done. Render `<Icon icon="home" />` inside a `<BrandProvider brand="jio">` to verify.\n');
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('[@jds4/oneui-init] unexpected error:', err);
  exit(1);
});
