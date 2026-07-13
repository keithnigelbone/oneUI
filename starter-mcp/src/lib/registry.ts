/**
 * JDS / OneUI private feed (Azure DevOps Artifacts) registry helpers.
 *
 * The @jds4/* packages live on a PRIVATE Azure DevOps Artifacts feed
 * (JIO-DS-ONE-UI, org jio-dsp). Without a configured .npmrc + auth token,
 * `npm install @jds4/oneui-react` fails. These helpers let the MCP detect
 * whether the project/user is connected to the feed and emit the correct
 * setup steps — WITHOUT ever baking or writing a real Personal Access Token.
 *
 * Self-contained: no monorepo dependency, no secrets shipped.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';

/** Feed identity. */
export const FEED_NAME = 'JIO-DS-ONE-UI';
export const FEED_ORG = 'jio-dsp';
/** Canonical host (matches the feed's own "Connect to feed" instructions). */
export const FEED_HOST = 'jio-dsp.pkgs.visualstudio.com';
/** Equivalent modern host some setups use. */
export const FEED_HOST_ALT = 'pkgs.dev.azure.com/JIO-DSP';

/** Primary registry URL (connect-page host form). */
export const REGISTRY_URL = `https://${FEED_HOST}/_packaging/${FEED_NAME}/npm/registry/`;
/** Alternate registry URL (modern Azure host) — kept as a backup. */
export const REGISTRY_URL_ALT = `https://${FEED_HOST_ALT}/_packaging/${FEED_NAME}/npm/registry/`;
export const FEED_CONNECT_URL = `https://${FEED_ORG}.visualstudio.com/DS-Assets/_artifacts/feed/${FEED_NAME}/connect`;
export const PAT_CREATE_URL = `https://${FEED_ORG}.visualstudio.com/_usersSettings/tokens`;

export const PAT_PLACEHOLDER = '[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]';

/**
 * Project-level `.npmrc` — registry + flags. No secret; safe to write/commit-ignore.
 * Primary host is the connect-page form; the alternate Azure host is included
 * commented-out as a backup (swap if the primary 401s/404s for your feed).
 */
export function projectNpmrc(): string {
  return [
    `registry=${REGISTRY_URL}`,
    'always-auth=true',
    'legacy-peer-deps=true',
    '',
    '; Backup host — uncomment this and comment the line above if the primary fails:',
    `; registry=${REGISTRY_URL_ALT}`,
    '',
  ].join('\n');
}

/** Auth lines for one host (registry-scoped + npm-scoped), placeholders only. */
function authLinesForHost(host: string): string[] {
  const base = `//${host}/_packaging/${FEED_NAME}/npm`;
  const email = "npm requires email to be set but doesn't use the value";
  return [
    `${base}/registry/:username=JIO-DSP`,
    `${base}/registry/:_password=${PAT_PLACEHOLDER}`,
    `${base}/registry/:email=${email}`,
    `${base}/:username=JIO-DSP`,
    `${base}/:_password=${PAT_PLACEHOLDER}`,
    `${base}/:email=${email}`,
  ];
}

/**
 * User-level `~/.npmrc` auth-token block — placeholders only, user supplies the PAT.
 * Includes BOTH host forms as a backup: npm only applies the auth matching the
 * active registry host, so listing both is harmless and covers either form.
 */
export function userNpmrcAuthBlock(): string {
  return [
    '; begin auth token',
    `; --- primary host (${FEED_HOST}) ---`,
    ...authLinesForHost(FEED_HOST),
    `; --- backup host (${FEED_HOST_ALT}) ---`,
    ...authLinesForHost(FEED_HOST_ALT),
    '; end auth token',
    '',
  ].join('\n');
}

/** Mac/Linux: base64-encode a PAT safely (no shell history). */
export const PAT_BASE64_NODE_CMD =
  `node -e "require('readline').createInterface({input:process.stdin,output:process.stdout,historySize:0})` +
  `.question('PAT> ',p => { b64=Buffer.from(p.trim()).toString('base64');console.log(b64);process.exit(); })"`;

export type RegistryStatus = 'connected' | 'registry-no-auth' | 'not-configured';

export interface RegistryReport {
  status: RegistryStatus;
  projectNpmrcPath: string;
  userNpmrcPath: string;
  projectNpmrcExists: boolean;
  userNpmrcExists: boolean;
  registryConfigured: boolean;
  authPresent: boolean;
}

function readIfExists(p: string): string {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

/** True if any line points npm at the JDS feed (default or @jds4-scoped registry). */
function hasFeedRegistry(npmrc: string): boolean {
  return npmrc
    .split('\n')
    .some((line) => /^\s*(@jds4:)?registry\s*=/.test(line) && line.includes(FEED_NAME));
}

/** True if a real (non-placeholder, non-empty) auth token is present for the feed. */
function hasFeedAuth(npmrc: string): boolean {
  for (const line of npmrc.split('\n')) {
    if (!line.includes(FEED_NAME)) continue;
    const m = line.match(/:_password\s*=\s*(.*)$/);
    if (!m) continue;
    const value = m[1].trim();
    if (value && !value.includes('[BASE64') && value !== PAT_PLACEHOLDER) return true;
  }
  return false;
}

/**
 * Inspect the project `.npmrc` and user `~/.npmrc` to decide whether the
 * machine is connected to the JDS feed.
 *
 * - `connected`        — feed registry configured AND a real auth token present
 * - `registry-no-auth` — registry pointed at the feed, but token missing/placeholder
 * - `not-configured`   — no feed registry anywhere
 */
export function detectRegistryStatus(projectRoot: string): RegistryReport {
  const projectNpmrcPath = resolve(projectRoot, '.npmrc');
  const userNpmrcPath = resolve(homedir(), '.npmrc');
  const projectSrc = readIfExists(projectNpmrcPath);
  const userSrc = readIfExists(userNpmrcPath);

  const registryConfigured = hasFeedRegistry(projectSrc) || hasFeedRegistry(userSrc);
  const authPresent = hasFeedAuth(projectSrc) || hasFeedAuth(userSrc);

  const status: RegistryStatus = !registryConfigured
    ? 'not-configured'
    : authPresent
      ? 'connected'
      : 'registry-no-auth';

  return {
    status,
    projectNpmrcPath,
    userNpmrcPath,
    projectNpmrcExists: !!projectSrc,
    userNpmrcExists: !!userSrc,
    registryConfigured,
    authPresent,
  };
}

/** Write the project-level `.npmrc` (registry + flags). Refuses to overwrite unless force. */
export function writeProjectNpmrc(
  projectRoot: string,
  force = false,
): { written: boolean; path: string; reason?: string } {
  const path = resolve(projectRoot, '.npmrc');
  if (existsSync(path) && !force) {
    return { written: false, path, reason: 'file exists — pass force=true to overwrite' };
  }
  writeFileSync(path, projectNpmrc(), 'utf8');
  return { written: true, path };
}
