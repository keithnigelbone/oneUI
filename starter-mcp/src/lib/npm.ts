/**
 * npm registry helpers. Uses the user's local `npm` CLI (so it honours their
 * `.npmrc` / private registry). No monorepo dependency.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { detectPackageManager } from './framework.js';

/** The OneUI packages this MCP knows how to install/update. */
export const ONEUI_PACKAGES = [
  '@jds4/oneui-react',
  '@jds4/oneui-icons-jio',
  '@jds4/oneui-init',
  '@jds4/oneui-vite-plugin',
  '@jds4/oneui-next-plugin',
  '@jds4/oneui-webpack-plugin',
  '@jds4/oneui-esbuild-plugin',
];

function isPrerelease(version: string): boolean {
  return /-/.test(version); // 0.1.0-alpha.2 → prerelease
}

/**
 * Compare two prerelease strings per semver §11.4: dot-separated identifiers,
 * numeric identifiers compare numerically (so alpha.10 > alpha.9 — a plain
 * string compare gets this wrong and would pin installs to alpha.9 forever),
 * numeric < alphanumeric, and a shorter set has lower precedence.
 */
function comparePrerelease(a: string, b: string): number {
  if (a === b) return 0;
  if (a === '') return 1; // release > prerelease
  if (b === '') return -1;
  const as = a.split('.');
  const bs = b.split('.');
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const x = as[i];
    const y = bs[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const xn = /^\d+$/.test(x);
    const yn = /^\d+$/.test(y);
    if (xn && yn) {
      const d = parseInt(x, 10) - parseInt(y, 10);
      if (d !== 0) return d > 0 ? 1 : -1;
    } else if (xn !== yn) {
      return xn ? -1 : 1;
    } else if (x !== y) {
      return x > y ? 1 : -1;
    }
  }
  return 0;
}

/** Compare two semver-ish strings. Returns 1 if a>b, -1 if a<b, 0 equal. */
export function compareSemver(a: string, b: string): number {
  const parse = (v: string) => {
    const [core, ...preParts] = v.split('-');
    const nums = core.split('.').map((n) => parseInt(n, 10) || 0);
    return { nums, pre: preParts.join('-') };
  };
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    const d = (pa.nums[i] ?? 0) - (pb.nums[i] ?? 0);
    if (d !== 0) return d > 0 ? 1 : -1;
  }
  return comparePrerelease(pa.pre, pb.pre);
}

/** Read a package's installed version from the project's node_modules. */
export function installedVersion(projectRoot: string, pkg: string): string | null {
  const p = resolve(projectRoot, 'node_modules', ...pkg.split('/'), 'package.json');
  if (!existsSync(p)) return null;
  try {
    return (JSON.parse(readFileSync(p, 'utf8')) as { version?: string }).version ?? null;
  } catch {
    return null;
  }
}

export interface VersionInfo {
  pkg: string;
  installed: string | null;
  /** Highest published version overall — incl. prereleases. The install target. */
  latestAny: string | null;
  latestStable: string | null; // highest non-prerelease (informational)
  latestTag: string | null; // dist-tags.latest (informational — can lag, do not install from it)
  /** What setup/update installs: the highest published version (latestAny), tag only as last resort. */
  resolved: string | null;
  resolvedIsPrerelease: boolean;
}

/**
 * Query the registry for a package and resolve the version to install.
 *
 * Installs the HIGHEST published version from the full `versions` list (semver
 * max, prerelease-aware) — NOT the `latest` dist-tag, which can lag behind the
 * newest alpha (it pointed at 0.1.0-alpha.0 while alpha.5 was the newest). Today
 * everything is 0.1.0-alpha.x; once a real stable ships it will naturally rank
 * higher and win. The dist-tag is kept only as a fallback when the versions
 * list can't be read (e.g. registry hiccup).
 */
export function queryVersion(projectRoot: string, pkg: string): VersionInfo {
  const installed = installedVersion(projectRoot, pkg);
  let latestAny: string | null = null;
  let latestStable: string | null = null;
  let latestTag: string | null = null;

  const versionsRes = spawnSync('npm', ['view', pkg, 'versions', '--json'], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  if (versionsRes.status === 0 && versionsRes.stdout) {
    try {
      const parsed = JSON.parse(versionsRes.stdout);
      const versions: string[] = Array.isArray(parsed) ? parsed : [parsed];
      const sorted = [...versions].sort(compareSemver);
      latestAny = sorted.length ? sorted[sorted.length - 1] : null;
      const stable = versions.filter((v) => !isPrerelease(v)).sort(compareSemver);
      latestStable = stable.length ? stable[stable.length - 1] : null;
    } catch {
      /* ignore parse errors */
    }
  }

  const tagRes = spawnSync('npm', ['view', pkg, 'dist-tags.latest'], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  if (tagRes.status === 0 && tagRes.stdout.trim()) {
    latestTag = tagRes.stdout.trim();
  }

  const resolved = latestAny ?? latestTag;
  return {
    pkg,
    installed,
    latestAny,
    latestStable,
    latestTag,
    resolved,
    resolvedIsPrerelease: resolved ? isPrerelease(resolved) : false,
  };
}

/**
 * Resolve install specs for a list of packages, pinning each INDEPENDENTLY to its
 * own highest published version (e.g. `@jds4/oneui-react@0.1.0-alpha.5`). Falls
 * back to the bare package name if the registry can't be reached for that package.
 */
export function resolveInstallSpecs(projectRoot: string, packages: string[]): {
  specs: string[];
  resolved: Record<string, string | null>;
} {
  const resolved: Record<string, string | null> = {};
  const specs = packages.map((pkg) => {
    const v = queryVersion(projectRoot, pkg).resolved;
    resolved[pkg] = v;
    return v ? `${pkg}@${v}` : pkg;
  });
  return { specs, resolved };
}

/** Strict npm package name (scoped or not), no version suffix. */
const PKG_NAME_RE = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/** True iff `name` is a well-formed npm package name (safe to pass to a spawn argv). */
export function isValidPackageName(name: string): boolean {
  return name.length <= 214 && PKG_NAME_RE.test(name);
}

export interface UpdateCommand {
  /** Human-readable form for plan/output rendering. */
  display: string;
  bin: string;
  /** Argv array — passed to spawnSync verbatim, never re-split from a string. */
  args: string[];
}

/** Build `<pm> add pkg@version ...` commands honouring the detected manager. */
export function buildUpdateCommands(projectRoot: string, pinned: string[]): UpdateCommand[] {
  if (pinned.length === 0) return [];
  const pm = detectPackageManager(projectRoot);
  if (pm === 'pnpm') return [{ display: `pnpm add ${pinned.join(' ')}`, bin: 'pnpm', args: ['add', ...pinned] }];
  if (pm === 'yarn') return [{ display: `yarn add ${pinned.join(' ')}`, bin: 'yarn', args: ['add', ...pinned] }];
  return [{ display: `npm install --save ${pinned.join(' ')}`, bin: 'npm', args: ['install', '--save', ...pinned] }];
}
