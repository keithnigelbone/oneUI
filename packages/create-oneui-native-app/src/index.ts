/**
 * create-oneui-native-app
 *
 * Scaffolds a production-ready OneUI Native app pre-wired with:
 *   • @oneui/ui-native  — component library + OneUIBrandProvider
 *   • @oneui/native-cdn — CDN brand prefetch CLI
 *   • Two templates: Expo Router (default) or React Native CLI (bare)
 *
 * Usage:
 *   npx create-oneui-native-app@latest [project-name] [flags]
 *
 * Flags:
 *   --template expo | bare  Choose scaffold template
 *   --use-npm | --use-yarn | --use-pnpm | --use-bun
 *   --skip-install   Skip dependency installation
 *   --skip-git       Skip git init
 *   --skip-pat       Skip PAT prompt (write .npmrc stub for manual auth)
 *   --skip-native    Skip native dir generation (bare template only)
 *   --brand <id>     Brand id to use (default: jio)
 *   --yes / -y       Non-interactive CI mode (all defaults, implies --skip-pat)
 *   --version / -v   Print version and exit
 *   --help / -h      Print help and exit
 */

import fs from 'fs-extra';
import path from 'node:path';
import https from 'node:https';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import pc from 'picocolors';

// ── Version ───────────────────────────────────────────────────────────────────

declare const __CLI_VERSION__: string;
const CLI_VERSION = (typeof __CLI_VERSION__ !== 'undefined' ? __CLI_VERSION__ : '0.0.0-dev');

// ── Registry config (env-overridable) ────────────────────────────────────────

const REGISTRY_HOST = process.env.ONEUI_REGISTRY_HOST ?? 'jio-dsp.pkgs.visualstudio.com';
const REGISTRY_FEED = process.env.ONEUI_REGISTRY_FEED ?? 'JIO-DS-OneUI-Native';
const REGISTRY_URL = `https://${REGISTRY_HOST}/_packaging/${REGISTRY_FEED}/npm/registry/`;

// ── Reserved names ────────────────────────────────────────────────────────────

const RESERVED_NAMES = new Set([
  'react',
  'react-native',
  'react-dom',
  'expo',
  'npm',
  'node',
  'node_modules',
  'test',
]);

// ── Helpers ──────────────────────────────────────────────────────────────────

function banner(): void {
  console.log('');
  console.log(pc.bold(pc.blue('  ╔═══════════════════════════════════╗')));
  console.log(pc.bold(pc.blue('  ║   create-oneui-native-app          ║')));
  console.log(pc.bold(pc.blue('  ╚═══════════════════════════════════╝')));
  console.log('');
  console.log(pc.dim('  OneUI Native · Expo Router / RN CLI · Multi-brand ready'));
  console.log('');
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** Numbered single-choice menu using readline — no extra dependencies. */
async function promptSelect<T extends string>(
  question: string,
  choices: Array<{ label: string; value: T }>,
): Promise<T> {
  console.log('');
  console.log(pc.bold(question));
  choices.forEach((c, i) => {
    console.log(`    ${pc.cyan(String(i + 1))}  ${c.label}`);
  });
  const raw = await prompt(`  Choice ${pc.dim('[1]')}: `);
  const idx = parseInt(raw || '1', 10) - 1;
  const clamped = Math.max(0, Math.min(idx, choices.length - 1));
  return choices[clamped].value;
}

/** Prompt for a password — echoes '*' for each character typed. */
async function promptPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    process.stdout.write(question);

    let password = '';

    const onData = (char: Buffer) => {
      const c = char.toString();
      if (c === '\r' || c === '\n' || c === '') {
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', onData);
        process.stdin.pause();
        rl.close();
        process.stdout.write('\n');
        resolve(password);
      } else if (c === '' || c === '\b') {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += c;
        process.stdout.write('*');
      }
    };

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', onData);
  });
}

function detectPackageManager(): string {
  const agent = process.env.npm_config_user_agent ?? '';
  if (agent.startsWith('pnpm')) return 'pnpm';
  if (agent.startsWith('yarn')) return 'yarn';
  if (agent.startsWith('bun')) return 'bun';
  return 'npm';
}

function installCmd(pm: string): string {
  return pm === 'yarn' ? 'yarn' : `${pm} install`;
}

function runCmd(pm: string): string {
  return pm === 'yarn' ? 'yarn ios' : `${pm} run ios`;
}

/** Returns a human-readable rejection reason, or null if the name is valid. */
function nameRejectionReason(name: string): string | null {
  if (!name) return 'Name cannot be empty';
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    return 'Name can only contain lowercase letters, numbers, and hyphens';
  }
  if (RESERVED_NAMES.has(name)) {
    return `"${name}" is a reserved package name`;
  }
  if (name.length > 64) {
    return 'Name must be 64 characters or fewer';
  }
  return null;
}

function isValidName(name: string): boolean {
  return nameRejectionReason(name) === null;
}

/**
 * React Native CLI requires an alphanumeric-only identifier (no hyphens,
 * underscores, dots, or spaces). Convert the user-chosen folder name to
 * PascalCase so `cli init` accepts it.
 *
 *   my-bare-app   → MyBareApp
 *   my_app        → MyApp
 *   myapp         → Myapp
 */
function toRnProjectName(name: string): string {
  const parts = name.split(/[-_.\s]+/).filter(Boolean);
  if (parts.length === 0) return 'App';
  return parts
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/** Lightweight spinner — no extra dependencies. Returns a stop function. */
function startSpinner(label: string): () => void {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const id = setInterval(() => {
    process.stdout.write(`\r  ${pc.cyan(frames[i++ % frames.length])}  ${label}`);
  }, 80);
  return () => {
    clearInterval(id);
    process.stdout.write('\r' + ' '.repeat(label.length + 6) + '\r');
  };
}

/** Validate brand id: lowercase alphanumeric + hyphens + slashes (sub-brand), ≤64 chars. */
function validateBrandId(id: string): string | null {
  if (!id) return 'Brand id cannot be empty';
  if (!/^[a-z0-9][a-z0-9/-]*$/.test(id)) {
    return 'Brand id can only contain lowercase letters, numbers, hyphens, and slashes (for sub-brands)';
  }
  if (id.length > 64) return 'Brand id must be 64 characters or fewer';
  return null;
}

// ── .npmrc generation ─────────────────────────────────────────────────────────

function buildNpmrc(patBase64: string): string {
  const reg = `//${REGISTRY_HOST}/_packaging/${REGISTRY_FEED}/npm/registry/`;
  const regShort = `//${REGISTRY_HOST}/_packaging/${REGISTRY_FEED}/npm/`;
  const email = 'npm requires email to be set but doesn\'t use the value';

  return [
    `@oneui:registry=${REGISTRY_URL}`,
    `always-auth=true`,
    ``,
    `; begin auth token`,
    `${reg}:username=JIO-DSP`,
    `${reg}:_password=${patBase64}`,
    `${reg}:email=${email}`,
    `${regShort}:username=JIO-DSP`,
    `${regShort}:_password=${patBase64}`,
    `${regShort}:email=${email}`,
    `; end auth token`,
    ``,
    `strict-ssl=false`,
    `legacy-peer-deps=true`,
    ``,
  ].join('\n');
}

// ── PAT validation ────────────────────────────────────────────────────────────

async function probeRegistry(patBase64: string): Promise<'ok' | 'rejected' | 'network-error'> {
  return new Promise((resolve) => {
    const url = `https://${REGISTRY_HOST}/${REGISTRY_FEED}/_apis/packaging/feeds`;
    const req = https.request(
      url,
      {
        method: 'HEAD',
        headers: {
          Authorization: `Basic ${patBase64}`,
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 200 && status < 300) {
          resolve('ok');
        } else if (status === 401 || status === 403) {
          resolve('rejected');
        } else {
          // Any other status (404, 500, etc.) — treat as network-error / uncertain
          resolve('network-error');
        }
      },
    );
    req.setTimeout(8000, () => {
      req.destroy();
      resolve('network-error');
    });
    req.on('error', () => resolve('network-error'));
    req.end();
  });
}

// ── Preflight ─────────────────────────────────────────────────────────────────

async function runPreflight(
  pm: string,
  template: string,
  skipNative: boolean,
): Promise<{ warnings: string[] }> {
  const warnings: string[] = [];

  // Hard-fail if package manager is missing
  try {
    execSync(`which ${pm}`, { stdio: 'ignore' });
  } catch {
    console.error(pc.red(`  ✗ Package manager "${pm}" not found. Install it and try again.`));
    process.exit(1);
  }

  // Warn if git is missing
  try {
    execSync('which git', { stdio: 'ignore' });
  } catch {
    warnings.push('git not found — git init will be skipped');
  }

  // Warn if java is missing (bare template, native dirs)
  if (template === 'bare' && !skipNative) {
    try {
      execSync('which java', { stdio: 'ignore' });
    } catch {
      warnings.push('java not found — Android builds may fail');
    }

    if (process.platform === 'darwin') {
      try {
        execSync('which pod', { stdio: 'ignore' });
      } catch {
        warnings.push('CocoaPods (pod) not found — iOS builds will fail. Run: sudo gem install cocoapods');
      }
    }
  }

  return { warnings };
}

// ── Step result tracking ──────────────────────────────────────────────────────

interface StepResult {
  label: string;
  status: 'ok' | 'warn' | 'skip';
  note?: string;
}

// ── Scaffold ─────────────────────────────────────────────────────────────────

function renameDotfiles(dir: string): void {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      renameDotfiles(fullPath);
    } else if (entry.startsWith('_') && !entry.startsWith('__') && !entry.includes('.')) {
      // Only rename pure dotfiles: _gitignore → .gitignore
      // Preserve Expo Router source files like _layout.tsx, _error.tsx (they contain dots)
      // Skip _npmrc — written programmatically with the user's PAT
      if (entry === '_npmrc') continue;
      fs.renameSync(fullPath, path.join(dir, `.${entry.slice(1)}`));
    }
  }
}

/**
 * Substitute template placeholders:
 *   __PROJECT_NAME__     → folder name (npm package name, app.json displayName)
 *   __RN_PROJECT_NAME__  → PascalCase RN identifier. MUST match the moduleName
 *                          baked into the generated native MainActivity /
 *                          AppDelegate (RN CLI forces PascalCase), otherwise
 *                          AppRegistry.registerComponent uses the wrong name and
 *                          the app crashes with "<Name> has not been registered".
 *   __BRAND_ID__         → chosen brand id (default: jio)
 */
function applyProjectName(dir: string, name: string, rnName: string, brandId: string): void {
  const targets = [
    'package.json',
    'app.json',
    'src/App.tsx',
    'src/app/_layout.tsx',
    'src/app/index.tsx',
    'src/screens/HomeScreen.tsx',
    'src/components/DemoScreen.tsx',
  ];
  for (const target of targets) {
    const file = path.join(dir, target);
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');
    fs.writeFileSync(
      file,
      content
        .replace(/__RN_PROJECT_NAME__/g, rnName)
        .replace(/__PROJECT_NAME__/g, name)
        .replace(/__BRAND_ID__/g, brandId),
    );
  }
}

/** Write oneui.brands.json to the scaffolded project root. */
function writeBrandsJson(dir: string, brandId: string): void {
  const brandsJson = {
    cdnUrl: 'https://myjiostatic.cdn.jio.com/JDS/ReactNative',
    brands: {
      [brandId]: 'latest',
    },
  };
  fs.writeFileSync(
    path.join(dir, 'oneui.brands.json'),
    JSON.stringify(brandsJson, null, 2) + '\n',
    'utf-8',
  );
}

/** Add lint/format scripts and devDependencies to the scaffolded package.json (idempotent). */
function injectLintSetup(dir: string): void {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
    scripts?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  pkg.scripts = pkg.scripts ?? {};
  if (!pkg.scripts['lint']) pkg.scripts['lint'] = 'eslint . --ext .ts,.tsx';
  if (!pkg.scripts['format']) pkg.scripts['format'] = 'prettier --write .';

  pkg.devDependencies = pkg.devDependencies ?? {};
  if (!pkg.devDependencies['@react-native/eslint-config']) {
    pkg.devDependencies['@react-native/eslint-config'] = '*';
  }
  if (!pkg.devDependencies['eslint']) pkg.devDependencies['eslint'] = '*';
  if (!pkg.devDependencies['prettier']) pkg.devDependencies['prettier'] = '*';

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
}

function scaffoldProject(
  targetDir: string,
  projectName: string,
  templateDir: string,
  rnProjectName: string,
  brandId: string,
): void {
  fs.copySync(templateDir, targetDir, {
    filter: (src) => {
      const rel = path.relative(templateDir, src);
      return (
        !rel.startsWith('node_modules') &&
        !rel.startsWith('.expo') &&
        !rel.startsWith('.oneui-cached')
      );
    },
  });

  renameDotfiles(targetDir);
  applyProjectName(targetDir, projectName, rnProjectName, brandId);
  writeBrandsJson(targetDir, brandId);
  injectLintSetup(targetDir);
}

/**
 * Read the exact `react-native` version the template installs, so the native
 * directories we generate match it. Returns a clean semver (strips `^`/`~`).
 * Falls back to `null` if the field is missing/unparseable — caller then lets
 * the CLI pick its default.
 */
function readTemplateRnVersion(templateDir: string): string | null {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'),
    ) as { dependencies?: Record<string, string> };
    const raw = pkg.dependencies?.['react-native'];
    if (!raw) return null;
    const cleaned = raw.replace(/^[\^~]/, '').trim();
    return /^\d+\.\d+\.\d+/.test(cleaned) ? cleaned : null;
  } catch {
    return null;
  }
}

/**
 * Generate ios/ and android/ directories by running @react-native-community/cli
 * init into a temp directory, then copying only the native folders out.
 */
function generateNativeDirs(rnName: string, targetDir: string, rnVersion: string | null): void {
  const os = require('node:os') as typeof import('node:os');
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'oneui-native-'));
  const versionFlag = rnVersion ? ` --version ${rnVersion}` : '';
  try {
    execSync(
      `npx --yes @react-native-community/cli@latest init ${rnName}${versionFlag} --skip-install`,
      {
        cwd: tmpBase,
        stdio: 'pipe',
        env: {
          ...process.env,
          CI: '1',
          NONINTERACTIVE: '1',
          npm_config_always_auth: 'false',
          npm_config_registry: 'https://registry.npmjs.org/',
        },
        timeout: 180_000,
      },
    );

    let copied = 0;
    for (const dir of ['ios', 'android']) {
      const src = path.join(tmpBase, rnName, dir);
      if (fs.existsSync(src)) {
        fs.copySync(src, path.join(targetDir, dir));
        copied++;
      }
    }

    if (copied === 0) {
      throw new Error('cli init completed but produced no ios/ or android/ directories');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stderr = (
      (err as NodeJS.ErrnoException & { stderr?: Buffer }).stderr ?? Buffer.alloc(0)
    )
      .toString()
      .trim();
    throw new Error(stderr ? `${msg}\n${stderr.slice(0, 600)}` : msg);
  } finally {
    fs.removeSync(tmpBase);
  }
}

/** Check for optional native toolchain and warn if missing. */
function checkToolchain(template: string): void {
  const checks: Array<{ cmd: string; name: string; hint: string; darwinOnly?: boolean }> = [
    {
      cmd: 'xcrun simctl list 2>/dev/null',
      name: 'Xcode / iOS Simulator',
      hint: template === 'bare' ? 'react-native run-ios' : 'expo start --ios',
      darwinOnly: true,
    },
    {
      cmd: 'adb version 2>/dev/null',
      name: 'Android Debug Bridge (adb)',
      hint: template === 'bare' ? 'react-native run-android' : 'expo start --android',
    },
  ];

  for (const check of checks) {
    if (check.darwinOnly && process.platform !== 'darwin') continue;
    try {
      execSync(check.cmd, { stdio: 'ignore' });
    } catch {
      console.log(pc.yellow(`  ⚠  ${check.name} not found — install it before running ${check.hint}`));
    }
  }
}

// ── Args ─────────────────────────────────────────────────────────────────────

type Template = 'expo' | 'bare';

interface CliOptions {
  projectName?: string;
  packageManager?: string;
  template?: Template;
  skipInstall: boolean;
  skipGit: boolean;
  skipPat: boolean;
  skipNative: boolean;
  yes: boolean;
  brand?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    skipInstall: false,
    skipGit: false,
    skipPat: false,
    skipNative: false,
    yes: false,
  };
  const pmFlags: Record<string, string> = {
    '--use-npm': 'npm',
    '--use-yarn': 'yarn',
    '--use-pnpm': 'pnpm',
    '--use-bun': 'bun',
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg in pmFlags) {
      opts.packageManager = pmFlags[arg];
    } else if (arg === '--skip-install') {
      opts.skipInstall = true;
    } else if (arg === '--skip-git') {
      opts.skipGit = true;
    } else if (arg === '--skip-pat') {
      opts.skipPat = true;
    } else if (arg === '--skip-native') {
      opts.skipNative = true;
    } else if (arg === '--yes' || arg === '-y') {
      opts.yes = true;
    } else if (arg === '--template' || arg.startsWith('--template=')) {
      const val = arg.includes('=') ? arg.split('=')[1] : argv[i + 1];
      if (val === 'expo' || val === 'bare') {
        opts.template = val as Template;
        if (!arg.includes('=')) i++;
      }
    } else if (arg === '--brand' || arg.startsWith('--brand=')) {
      const val = arg.includes('=') ? arg.split('=')[1] : argv[i + 1];
      if (val && !val.startsWith('-')) {
        opts.brand = val;
        if (!arg.includes('=')) i++;
      }
    } else if (!arg.startsWith('-') && !opts.projectName) {
      opts.projectName = arg;
    }
  }
  return opts;
}

// ── Help ──────────────────────────────────────────────────────────────────────

function printHelp(): void {
  console.log('');
  console.log(pc.bold('  create-oneui-native-app') + pc.dim(` v${CLI_VERSION}`));
  console.log('');
  console.log(pc.bold('  Usage:'));
  console.log('    npx create-oneui-native-app [project-name] [options]');
  console.log('');
  console.log(pc.bold('  Options:'));
  const opts = [
    ['--template <expo|bare>', 'Choose scaffold template (default: expo)'],
    ['--brand <id>',           'Brand id to wire into the app (default: jio)'],
    ['--use-npm',              'Use npm as package manager'],
    ['--use-yarn',             'Use yarn as package manager'],
    ['--use-pnpm',             'Use pnpm as package manager'],
    ['--use-bun',              'Use bun as package manager'],
    ['--skip-install',         'Skip dependency installation'],
    ['--skip-git',             'Skip git init'],
    ['--skip-pat',             'Skip PAT prompt (write stub .npmrc)'],
    ['--skip-native',          'Skip native dir generation (bare only)'],
    ['--yes, -y',              'Non-interactive CI mode (all defaults)'],
    ['--version, -v',          'Print version and exit'],
    ['--help, -h',             'Print this help and exit'],
  ];
  const colW = Math.max(...opts.map(([f]) => f.length)) + 4;
  for (const [flag, desc] of opts) {
    console.log(`    ${pc.cyan(flag.padEnd(colW))}${pc.dim(desc)}`);
  }
  console.log('');
  console.log(pc.bold('  Environment variables:'));
  console.log(`    ${pc.cyan('ONEUI_REGISTRY_HOST'.padEnd(colW))}${pc.dim('Override Azure DevOps hostname')}`);
  console.log(`    ${pc.cyan('ONEUI_REGISTRY_FEED'.padEnd(colW))}${pc.dim('Override Azure DevOps feed name')}`);
  console.log('');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Handle --help / --version before everything else (no banner needed)
  const rawArgv = process.argv.slice(2);
  if (rawArgv.includes('--help') || rawArgv.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  if (rawArgv.includes('--version') || rawArgv.includes('-v')) {
    console.log(CLI_VERSION);
    process.exit(0);
  }

  // Node version guard
  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
  if (nodeMajor < 18) {
    console.error(pc.red(`  Node 18+ required. You are running ${process.versions.node}.`));
    process.exit(1);
  }

  banner();

  const opts = parseArgs(rawArgv);

  if (opts.yes) {
    console.log(pc.dim('  Running in CI mode (--yes). Using defaults: Expo template, skip PAT.\n'));
  }

  // 1. Resolve template (ask first so the name prompt can be context-aware)
  let template = opts.template;
  if (!template) {
    if (opts.yes) {
      template = 'expo';
    } else {
      template = await promptSelect<Template>('  Choose a template:', [
        { label: 'Expo (Expo Router — recommended)', value: 'expo' },
        { label: 'React Native CLI (bare)', value: 'bare' },
      ]);
    }
  }

  // 2. Resolve project name — validate inline and re-prompt on bad input.
  let projectName = opts.projectName;
  while (!projectName || !isValidName(projectName)) {
    const reason = projectName ? nameRejectionReason(projectName) : null;
    if (reason) {
      console.log(pc.yellow(`  "${projectName}" is not a valid name: ${reason}.`));
    }
    projectName = await prompt(pc.bold('  Project name: '));
    if (projectName && isValidName(projectName) && template === 'bare') {
      const derived = toRnProjectName(projectName);
      if (derived !== projectName) {
        console.log(pc.dim(`  → Native project identifier will be ${pc.cyan(derived)} (used for Xcode/Android project names)`));
        const rename = await prompt(pc.dim('  Keep this name? (Y/n) '));
        if (rename.toLowerCase() === 'n') {
          projectName = ''; // force re-prompt
        }
      }
    }
  }

  // 3. Resolve brand id
  let brandId = opts.brand;
  if (!brandId && !opts.yes) {
    const brandInput = await prompt(pc.bold(`  Brand name ${pc.dim('[jio]')}: `));
    brandId = brandInput || 'jio';
    const brandErr = validateBrandId(brandId);
    if (brandErr) {
      console.log(pc.yellow(`  ⚠  Invalid brand name (${brandErr}). Falling back to "jio".`));
      brandId = 'jio';
    }
  } else if (!brandId) {
    brandId = 'jio';
  } else {
    const brandErr = validateBrandId(brandId);
    if (brandErr) {
      console.log(pc.yellow(`  ⚠  Invalid --brand value (${brandErr}). Falling back to "jio".`));
      brandId = 'jio';
    }
  }

  const templateDir = path.join(__dirname, '..', 'templates', template === 'bare' ? 'bare' : 'default');
  const targetDir = path.resolve(process.cwd(), projectName);
  const rnProjectName = toRnProjectName(projectName);
  const pm = opts.packageManager ?? detectPackageManager();

  // 4. Handle existing directory
  if (fs.existsSync(targetDir)) {
    const answer = await prompt(
      pc.yellow(`  Directory "${projectName}" already exists. Overwrite? `) + pc.dim('(y/N) '),
    );
    if (answer.toLowerCase() !== 'y') {
      console.log(pc.dim('\n  Cancelled.\n'));
      process.exit(0);
    }
    fs.removeSync(targetDir);
  }

  // Preflight checks
  const { warnings: preflightWarnings } = await runPreflight(pm, template, opts.skipNative);
  for (const w of preflightWarnings) {
    console.log(pc.yellow(`  ⚠  ${w}`));
  }

  // Step result tracking
  const steps: StepResult[] = [];

  // Track whether we created targetDir so we can roll back on failure
  const userDirExisted = fs.existsSync(targetDir);
  let weCreatedTargetDir = false;

  // 5. Scaffold template files
  console.log('');
  console.log(pc.bold(`  Scaffolding ${pc.cyan(projectName)} (${template} template, brand: ${pc.cyan(brandId)}) …`));
  weCreatedTargetDir = !userDirExisted;
  try {
    scaffoldProject(targetDir, projectName, templateDir, rnProjectName, brandId);
    console.log(pc.green('  ✓ Template copied'));
    steps.push({ label: 'Template scaffold', status: 'ok' });
  } catch (err) {
    if (weCreatedTargetDir && !userDirExisted) {
      fs.removeSync(targetDir);
    }
    throw err;
  }

  // 6. Write .npmrc
  try {
    if (!opts.skipPat && !opts.yes) {
      console.log('');
      console.log(pc.bold('  OneUI packages are hosted on a private Azure DevOps registry.'));
      console.log(pc.dim(`  Registry: ${REGISTRY_URL}`));
      console.log('');

      const patTypeAnswer = await prompt(
        `  PAT format?\n` +
        `    ${pc.cyan('1')} — Raw PAT (will be base64-encoded automatically)\n` +
        `    ${pc.cyan('2')} — Already base64-encoded PAT\n` +
        `  Choice ${pc.dim('[1]')}: `,
      );
      const usePreEncoded = patTypeAnswer.trim() === '2';

      const patLabel = usePreEncoded
        ? pc.bold('  Base64 PAT (hidden): ')
        : pc.bold('  PAT (hidden): ');

      let patRaw = '';
      while (!patRaw) {
        patRaw = await promptPassword(patLabel);
        if (!patRaw) {
          console.log(pc.yellow('  Token cannot be empty.'));
        }
      }

      const patBase64 = usePreEncoded
        ? patRaw
        : Buffer.from(patRaw).toString('base64');

      // Validate PAT against registry (up to 3 attempts)
      let probeResult: 'ok' | 'rejected' | 'network-error' = 'network-error';
      let attempts = 0;
      let currentPatBase64 = patBase64;
      while (attempts < 3) {
        process.stdout.write(pc.dim('  Checking registry access…'));
        probeResult = await probeRegistry(currentPatBase64);
        process.stdout.write('\r' + ' '.repeat(40) + '\r');
        if (probeResult === 'ok' || probeResult === 'network-error') break;
        attempts++;
        if (attempts < 3) {
          console.log(pc.red('  ✗ PAT rejected (401/403). Try again.'));
          let retryRaw = '';
          while (!retryRaw) {
            retryRaw = await promptPassword(patLabel);
            if (!retryRaw) console.log(pc.yellow('  Token cannot be empty.'));
          }
          currentPatBase64 = usePreEncoded ? retryRaw : Buffer.from(retryRaw).toString('base64');
        }
      }

      if (probeResult === 'rejected') {
        console.log(pc.yellow('  ⚠  PAT still rejected after 3 attempts. Writing .npmrc anyway — update the token manually.'));
      } else if (probeResult === 'network-error') {
        console.log(pc.yellow('  ⚠  Could not reach registry (network error / timeout). Writing .npmrc anyway.'));
      } else {
        console.log(pc.green('  ✓ Registry access confirmed'));
      }

      const npmrcPath = path.join(targetDir, '.npmrc');
      fs.writeFileSync(npmrcPath, buildNpmrc(currentPatBase64), 'utf-8');
      console.log(pc.green('  ✓ .npmrc written with registry credentials'));
      steps.push({ label: '.npmrc', status: probeResult === 'rejected' ? 'warn' : 'ok', note: probeResult === 'rejected' ? 'PAT was rejected — update manually' : undefined });
    } else {
      const npmrcSrc = path.join(templateDir, '_npmrc');
      if (fs.existsSync(npmrcSrc)) {
        fs.copyFileSync(npmrcSrc, path.join(targetDir, '.npmrc'));
      }
      console.log(pc.dim('  Skipping PAT prompt. Replace BASE64_ENCODED_PAT in .npmrc with your encoded token.'));
      steps.push({ label: '.npmrc', status: 'skip', note: 'PAT skipped — update BASE64_ENCODED_PAT manually' });
    }
  } catch (err) {
    if (weCreatedTargetDir && !userDirExisted) {
      fs.removeSync(targetDir);
    }
    throw err;
  }

  // 7. Generate native directories (bare template only)
  if (template === 'bare' && !opts.skipNative) {
    const rnVersion = readTemplateRnVersion(templateDir);
    const manualVersionFlag = rnVersion ? ` --version ${rnVersion}` : '';
    console.log(pc.bold('\n  Generating ios/ and android/ directories …'));
    if (rnProjectName !== projectName) {
      console.log(pc.dim(`  (using "${rnProjectName}" as the RN project identifier)`));
    }
    if (rnVersion) {
      console.log(pc.dim(`  (pinned to react-native ${rnVersion} to match the template)`));
    }
    const stopNative = startSpinner('Running @react-native-community/cli init …');
    try {
      generateNativeDirs(rnProjectName, targetDir, rnVersion);
      stopNative();
      console.log(pc.green('  ✓ ios/ and android/ directories generated'));
      steps.push({ label: 'Native dirs (ios/android)', status: 'ok' });
    } catch (err) {
      stopNative();
      const errLines = (err instanceof Error ? err.message : String(err))
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 6);
      console.log(pc.yellow('  ⚠  Native directory generation failed:'));
      errLines.forEach((l) => console.log(pc.dim(`     ${l}`)));
      console.log(pc.yellow('  Generate them manually:'));
      console.log(pc.dim(`     npx @react-native-community/cli init ${rnProjectName}${manualVersionFlag} --skip-install`));
      console.log(pc.dim('     Then copy the ios/ and android/ folders into your project.'));
      steps.push({ label: 'Native dirs (ios/android)', status: 'warn', note: 'Generation failed — run manually' });
    }
  } else if (template === 'bare' && opts.skipNative) {
    steps.push({ label: 'Native dirs (ios/android)', status: 'skip', note: '--skip-native passed' });
  }

  // 8. Install
  if (!opts.skipInstall) {
    console.log(pc.bold(`\n  Installing dependencies with ${pm} …`));
    const stop = startSpinner('Installing…');
    try {
      execSync(installCmd(pm), { cwd: targetDir, stdio: 'pipe' });
      stop();
      console.log(pc.green('  ✓ Dependencies installed'));
      steps.push({ label: 'Install', status: 'ok' });
    } catch {
      stop();
      console.log(pc.yellow('  ⚠  Dependency install failed — run manually:'));
      console.log(pc.dim(`     cd ${projectName} && ${installCmd(pm)}`));
      steps.push({ label: 'Install', status: 'warn', note: `Run: cd ${projectName} && ${installCmd(pm)}` });
    }
  } else {
    steps.push({ label: 'Install', status: 'skip', note: '--skip-install passed' });
  }

  // 9. Git init
  if (!opts.skipGit) {
    try {
      execSync('git init', { cwd: targetDir, stdio: 'ignore' });
      execSync('git add -A', { cwd: targetDir, stdio: 'ignore' });
      execSync('git commit -m "chore: initial commit from create-oneui-native-app"', {
        cwd: targetDir,
        stdio: 'ignore',
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: 'create-oneui-native-app',
          GIT_AUTHOR_EMAIL: '',
          GIT_COMMITTER_NAME: 'create-oneui-native-app',
          GIT_COMMITTER_EMAIL: '',
        },
      });
      console.log(pc.green('  ✓ Git repository initialised'));
      steps.push({ label: 'Git init', status: 'ok' });
    } catch {
      steps.push({ label: 'Git init', status: 'warn', note: 'git init failed — init manually' });
    }
  } else {
    steps.push({ label: 'Git init', status: 'skip', note: '--skip-git passed' });
  }

  // 10. Toolchain check
  checkToolchain(template);

  // 11. Summary
  const allGood = steps.every((s) => s.status === 'ok' || s.status === 'skip');
  console.log('');
  if (allGood) {
    console.log(pc.bold(pc.green('  ╔═══════════════════════════════════╗')));
    console.log(pc.bold(pc.green('  ║   Ready!                           ║')));
    console.log(pc.bold(pc.green('  ╚═══════════════════════════════════╝')));
  } else {
    console.log(pc.bold(pc.blue('  ╔══════════════════════════════════════════════════╗')));
    console.log(pc.bold(pc.blue('  ║   Scaffolded (some steps need attention)          ║')));
    console.log(pc.bold(pc.blue('  ╚══════════════════════════════════════════════════╝')));
    console.log('');
    console.log(pc.bold('  Step summary:'));
    for (const step of steps) {
      const icon = step.status === 'ok' ? pc.green('✓') : step.status === 'skip' ? pc.dim('–') : pc.yellow('⚠');
      const note = step.note ? pc.dim(` (${step.note})`) : '';
      console.log(`    ${icon}  ${step.label}${note}`);
    }
  }

  console.log('');
  console.log(pc.bold('  Next steps:'));
  console.log('');
  console.log(`  ${pc.dim('1.')} ${pc.cyan(`cd ${projectName}`)}`);
  console.log(`  ${pc.dim('2.')} ${pc.cyan('npx oneui-native-cdn prefetch')}  ${pc.dim('← fetch brand data')}`);

  if (template === 'bare') {
    console.log(`  ${pc.dim('3.')} ${pc.cyan('npm run link-assets')}  ${pc.dim('← register fonts')}`);
    console.log(`  ${pc.dim('4.')} ${pc.cyan(runCmd(pm))}  ${pc.dim('← launch on iOS (requires Xcode)')}`);
    if (opts.skipNative) {
      const skipRnVersion = readTemplateRnVersion(templateDir);
      const skipVersionFlag = skipRnVersion ? ` --version ${skipRnVersion}` : '';
      console.log('');
      console.log(`  ${pc.yellow('Note:')} ${pc.dim('Native dirs were skipped. Generate them with:')}`);
      console.log(`  ${pc.dim('  npx @react-native-community/cli init')} ${pc.cyan(rnProjectName)} ${pc.dim(`${skipVersionFlag} --skip-install`)}`);
    }
  } else {
    console.log(`  ${pc.dim('3.')} ${pc.cyan(runCmd(pm))}  ${pc.dim('← launch on iOS')}`);
  }

  console.log('');
  console.log(`  ${pc.dim('Edit')} ${pc.bold('oneui.brands.json')} ${pc.dim('to add brands and sub-brands.')}`);
  console.log(`  ${pc.dim('Toggle dark mode by tapping the mode button in the top-right corner of the demo screen.')}`);
  console.log('');
}

main().catch((err) => {
  console.error(pc.red('\n  Error: ') + (err instanceof Error ? err.message : String(err)));
  process.exit(1);
});

// release-pipeline test marker — safe to revert
