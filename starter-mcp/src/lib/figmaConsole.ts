/**
 * figma-console child MCP client.
 *
 * The `figma_to_code` feature reuses `figma-console-mcp`'s battle-tested Figma
 * extraction (Component Information via the Dev-mode tree, plus variable Modes)
 * instead of re-implementing the Figma REST + Desktop Bridge protocols here.
 *
 * We do this by acting as an MCP *client*: oneui-mcp spawns
 * `npx -y figma-console-mcp@latest` as a child stdio process, connects (lazily,
 * on first use), and proxies tool calls to it. The Figma Desktop Bridge plugin
 * scans ports 9223–9232 and connects to whichever figma-console-mcp process is
 * running — so it attaches to our spawned child exactly the same way it would a
 * standalone install.
 *
 * RESILIENCE: the connected child is cached and reused across calls, but the
 * cache is INVALIDATED the moment the child's transport closes or errors (e.g.
 * the child crashes or is killed). Without this, a single dead child handle
 * would be reused forever and no new child would ever spawn — symptom: tool
 * calls hang and no bridge listener/discovery file ever appears. `callFigmaConsole`
 * additionally retries once on a transport failure, respawning a fresh child.
 *
 * IMPORTANT: when this proxy is in use, the user should NOT also run a
 * standalone `figma-console` MCP — two servers would compete for the bridge
 * port. Configure the Figma token on oneui-mcp instead (FIGMA_ACCESS_TOKEN).
 */
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport, getDefaultEnvironment } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// Identity reported to the figma-console child on connect. Kept local (not
// imported from ../server) to avoid a server → figma → figmaConsole cycle.
const CLIENT_NAME = 'oneui-mcp-figma-bridge';
const CLIENT_VERSION = '0.1.0';

/** First spawn may `npx`-download the package — allow a generous handshake window. */
const CONNECT_TIMEOUT_MS = Number(process.env.ONEUI_FIGMA_CONSOLE_CONNECT_TIMEOUT_MS ?? 120_000);
/** Per tool-call request timeout (deep extraction / figma_execute can be slow). */
const CALL_TIMEOUT_MS = Number(process.env.ONEUI_FIGMA_CONSOLE_CALL_TIMEOUT_MS ?? 180_000);

/** Raised when the figma-console child cannot be spawned or connected. */
export class FigmaConsoleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FigmaConsoleError';
  }
}

/**
 * Default child-MCP package — PINNED. Every cold start `npx`-fetches and executes
 * this third-party package, so an unpinned `@latest` was an untrusted-code-drift
 * path (a new upstream release runs on the next launch with no review). Pin to a
 * known-good version; bump deliberately after review. Override via
 * `ONEUI_FIGMA_CONSOLE_PACKAGE` for local dev or an ad-hoc upgrade.
 */
const FIGMA_CONSOLE_PACKAGE = process.env.ONEUI_FIGMA_CONSOLE_PACKAGE ?? 'figma-console-mcp@1.34.0';

/**
 * The WS port our spawned child requests (figma-console honors `FIGMA_WS_PORT`
 * — see its `dist/local.js`). Pinned to 9223, the port the Figma Desktop Bridge
 * plugin scans FIRST (it sweeps 9223–9232). Pinning + reclaiming this one port is
 * enough: once our child owns 9223, the plugin's first-scan hit is ours, so the
 * plugin attaches to the child we talk to over stdio (not a stray competitor).
 */
const FIGMA_WS_PORT = process.env.ONEUI_FIGMA_WS_PORT ?? '9223';
/** The full range the bridge plugin scans — used only to detect competitors. */
const BRIDGE_PORT_RANGE = { lo: 9223, hi: 9232 } as const;
/** Reclaim stray figma-console listeners on the pinned port before spawning (default on). */
const RECLAIM_ENABLED = (process.env.ONEUI_FIGMA_BRIDGE_RECLAIM ?? '1') !== '0';

let clientPromise: Promise<Client> | null = null;
/** Bumped on every spawn; lets stale close/error handlers no-op after a respawn. */
let generation = 0;
/** Current child transport — tracked so we can hard-kill it on parent exit. */
let currentTransport: StdioClientTransport | null = null;
let cleanupRegistered = false;

function log(msg: string): void {
  // stderr is safe — stdout is the MCP channel.
  process.stderr.write(`[oneui-mcp:figma] ${msg}\n`);
}

/**
 * Best-effort: ensure the figma-console child is killed when oneui-mcp exits, so
 * it doesn't orphan and keep holding a bridge port (9223–9232) for the next run.
 */
function registerCleanup(): void {
  if (cleanupRegistered) return;
  cleanupRegistered = true;
  const killChild = () => {
    const pid = currentTransport?.pid;
    if (pid) {
      try {
        process.kill(pid);
      } catch {
        /* already gone */
      }
    }
  };
  process.once('exit', killChild);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
    process.once(sig, () => {
      killChild();
      process.exit(0);
    });
  }
}

/** Public npm registry — figma-console-mcp is a PUBLIC package. */
const PUBLIC_NPM_REGISTRY = process.env.ONEUI_FIGMA_CONSOLE_REGISTRY ?? 'https://registry.npmjs.org/';

/**
 * Build the env passed to the child process. `StdioClientTransport` uses ONLY
 * the env we provide (it does not inherit), so we start from the SDK's curated
 * default (PATH, HOME, etc. — needed for `npx` to resolve) and layer on:
 *  - the Figma vars,
 *  - `npm_config_registry` pinned to the PUBLIC registry. This is critical: a
 *    consuming project's `.npmrc` often makes a PRIVATE feed (e.g. the JIO Azure
 *    DevOps feed) the default registry, which 401s when `npx` tries to fetch the
 *    public `figma-console-mcp` — so the child never starts and never binds a
 *    bridge port. Env config overrides project `.npmrc` registry defaults.
 */
function buildChildEnv(): Record<string, string> {
  const env: Record<string, string> = { ...getDefaultEnvironment() };
  const token = process.env.FIGMA_ACCESS_TOKEN;
  if (token) env.FIGMA_ACCESS_TOKEN = token;
  // Mirror the figma-console recommended default; harmless if the child ignores it.
  env.ENABLE_MCP_APPS = process.env.ENABLE_MCP_APPS ?? 'true';
  // Force the public registry for the npx fetch (avoids private-feed E401).
  env.npm_config_registry = PUBLIC_NPM_REGISTRY;
  env.NPM_CONFIG_REGISTRY = PUBLIC_NPM_REGISTRY;
  // Pin the WS port so our child deterministically requests 9223 (the port the
  // bridge plugin scans first), instead of coin-flipping across 9223–9232.
  env.FIGMA_WS_PORT = FIGMA_WS_PORT;
  return env;
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/** A process listening on a bridge port (9223–9232). */
interface BridgeListener {
  pid: number;
  port: number;
  command: string;
}

/**
 * Find processes LISTENing on the bridge port range (9223–9232) via `lsof`, and
 * annotate each with its command line so callers can tell figma-console
 * competitors apart from unrelated services. Best-effort: returns [] if `lsof`
 * is unavailable or finds nothing (it exits non-zero when there are no matches).
 */
function listBridgeListeners(): BridgeListener[] {
  const ports = Array.from(
    { length: BRIDGE_PORT_RANGE.hi - BRIDGE_PORT_RANGE.lo + 1 },
    (_, i) => `-i:${BRIDGE_PORT_RANGE.lo + i}`,
  );
  let out = '';
  try {
    out = execFileSync('lsof', ['-nP', '-sTCP:LISTEN', ...ports], { encoding: 'utf8' });
  } catch (err) {
    // lsof exits 1 when nothing matches — not an error worth surfacing.
    const e = err as { stdout?: string };
    out = typeof e?.stdout === 'string' ? e.stdout : '';
  }
  const byPid = new Map<number, BridgeListener>();
  for (const line of out.split('\n')) {
    // Columns: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME(addr:PORT) [(LISTEN)]
    // The NAME column (e.g. `[::1]:9223` or `*:9223`) is NOT necessarily last —
    // `-sTCP:LISTEN` appends a `(LISTEN)` state column — so scan for `addr:PORT`.
    if (!line || line.startsWith('COMMAND')) continue;
    const cols = line.trim().split(/\s+/);
    const pid = Number(cols[1]);
    if (!Number.isInteger(pid)) continue;
    const addr = cols.find((c) => /:(\d+)$/.test(c));
    const port = addr ? Number(addr.match(/:(\d+)$/)![1]) : NaN;
    if (!Number.isInteger(port) || port < BRIDGE_PORT_RANGE.lo || port > BRIDGE_PORT_RANGE.hi) continue;
    if (!byPid.has(pid)) byPid.set(pid, { pid, port, command: processCommand(pid) });
  }
  return [...byPid.values()];
}

/** Full command line for a pid (`ps -p`), or '' if it can't be read. */
function processCommand(pid: number): string {
  try {
    return execFileSync('ps', ['-p', String(pid), '-o', 'command='], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

/** Heuristic: is this listener a figma-console server (vs an unrelated service)? */
function isFigmaConsoleProcess(cmd: string): boolean {
  return /figma-console/i.test(cmd);
}

/**
 * Free the pinned WS port so our about-to-spawn child can bind it and become the
 * ONLY server the bridge plugin can reach on its first-scan port. Kills *stray
 * figma-console* listeners on the pinned port that aren't our current child;
 * never touches our own child or non-figma-console processes. Every PID killed
 * is logged to stderr. Returns the competitors it found (whether or not killed).
 */
function reclaimBridgePort(): BridgeListener[] {
  const ourPid = currentTransport?.pid;
  const listeners = listBridgeListeners();
  const competitors = listeners.filter((l) => l.pid !== ourPid && isFigmaConsoleProcess(l.command));
  if (!RECLAIM_ENABLED) {
    if (competitors.length) {
      log(
        `reclaim disabled (ONEUI_FIGMA_BRIDGE_RECLAIM=0); ${competitors.length} stray figma-console listener(s) left running: ` +
          competitors.map((c) => `pid ${c.pid}@${c.port}`).join(', '),
      );
    }
    return competitors;
  }
  // Only the pinned port needs to be ours; reaping it is sufficient (and safest).
  const onPinned = competitors.filter((c) => String(c.port) === FIGMA_WS_PORT);
  for (const c of onPinned) {
    try {
      process.kill(c.pid);
      log(`reclaimed pinned port ${c.port}: killed stray figma-console pid ${c.pid} (${c.command || 'unknown cmd'})`);
    } catch (err) {
      log(`failed to kill stray figma-console pid ${c.pid}@${c.port}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return competitors;
}

async function connect(myGen: number): Promise<Client> {
  // Reclaim the pinned WS port before spawning so our child can bind it and the
  // bridge plugin's first-scan hit is ours (not a stray competitor's).
  reclaimBridgePort();

  // Allow overriding the launch command for local-git installs of figma-console.
  const command = process.env.ONEUI_FIGMA_CONSOLE_COMMAND ?? 'npx';
  const args = process.env.ONEUI_FIGMA_CONSOLE_COMMAND
    ? (process.env.ONEUI_FIGMA_CONSOLE_ARGS?.split(' ').filter(Boolean) ?? [])
    : ['-y', FIGMA_CONSOLE_PACKAGE];

  const transport = new StdioClientTransport({
    command,
    args,
    env: buildChildEnv(),
    // Run from a neutral dir so the CONSUMING project's ./.npmrc (which may pin a
    // private default registry needing auth) is NOT picked up by the npx fetch.
    cwd: process.env.ONEUI_FIGMA_CONSOLE_CWD ?? tmpdir(),
    // Inherit child stderr so its diagnostics (bridge port, discovery file, errors)
    // surface in the oneui-mcp log. stderr is NOT the MCP channel (stdout is).
    stderr: 'inherit',
  });

  const client = new Client({ name: CLIENT_NAME, version: CLIENT_VERSION });
  registerCleanup();

  // Invalidate the cache when THIS child dies, so the next call respawns a fresh
  // one. Guard with the generation so a stale handler can't clobber a newer child.
  const invalidate = (why: string) => {
    if (generation === myGen && clientPromise) {
      log(`child connection ${why}; clearing cache so the next call respawns`);
      clientPromise = null;
      if (currentTransport === transport) currentTransport = null;
    }
  };
  transport.onclose = () => invalidate('closed');
  transport.onerror = (err) => invalidate(`errored (${err instanceof Error ? err.message : String(err)})`);
  client.onclose = () => invalidate('client closed');

  try {
    await withTimeout(client.connect(transport, { timeout: CONNECT_TIMEOUT_MS }), CONNECT_TIMEOUT_MS, 'figma-console connect');
  } catch (err) {
    // Make sure a half-started child is torn down before we surface the error.
    try {
      await transport.close();
    } catch {
      /* ignore */
    }
    throw new FigmaConsoleError(
      `Could not start the figma-console MCP child (${command} ${args.join(' ')}). ` +
        `Ensure Node/npx is available and you have network access on first run. ` +
        `Underlying error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  currentTransport = transport;
  log(`figma-console child connected (pid ${transport.pid ?? '?'}, gen ${myGen}, registry ${PUBLIC_NPM_REGISTRY})`);
  return client;
}

/** Lazily spawn + connect the figma-console child, reusing it across calls. */
export function getFigmaConsoleClient(): Promise<Client> {
  if (!clientPromise) {
    const myGen = ++generation;
    clientPromise = connect(myGen).catch((err) => {
      // Reset so a later call can retry a fresh spawn.
      if (generation === myGen) clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}

/** Drop the cached child (and best-effort close it) so the next call respawns. */
export function resetFigmaConsole(): void {
  const p = clientPromise;
  clientPromise = null;
  currentTransport = null;
  generation++; // stale close/error handlers from the old child now no-op
  if (p) {
    p.then((c) => c.close())
      .catch(() => {
        /* ignore */
      });
  }
}

/** Heuristic: does this error mean the transport/connection is dead (vs a tool error)? */
function isConnectionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /clos|connect|not connected|terminated|EPIPE|ECONNRESET|timed out|transport/i.test(msg);
}

/**
 * Call a tool on the figma-console child, returning its raw MCP result.
 * Retries once on a transport failure, respawning a fresh child first.
 */
export async function callFigmaConsole(
  name: string,
  args: Record<string, unknown>,
  opts: { timeoutMs?: number; retry?: boolean } = {},
): Promise<CallToolResult> {
  const timeout = opts.timeoutMs ?? CALL_TIMEOUT_MS;
  const retry = opts.retry ?? true;
  const maxAttempts = retry ? 2 : 1;
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let client: Client;
    try {
      client = await getFigmaConsoleClient();
    } catch (err) {
      // Spawn/connect failed — already reset by getFigmaConsoleClient; retry once.
      lastErr = err;
      if (attempt + 1 < maxAttempts) continue;
      throw err;
    }
    try {
      return (await client.callTool({ name, arguments: args }, undefined, { timeout })) as CallToolResult;
    } catch (err) {
      lastErr = err;
      if (attempt + 1 < maxAttempts && isConnectionError(err)) {
        log(`tool "${name}" failed on a dead connection; respawning and retrying once`);
        resetFigmaConsole();
        continue;
      }
      throw err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new FigmaConsoleError(String(lastErr));
}

/** Snapshot of the bridge as seen through `figma_get_status` (probe round-trip). */
export interface BridgeStatus {
  /** Plugin is connected to OUR child and answered a live probe. */
  connected: boolean;
  /** The Figma file the plugin is attached to, if reported. */
  file: string | null;
  /** WS transport (our child's server) is up, even if no plugin attached yet. */
  transportActive: boolean;
  /** Parsed status payload (or the raw text if it didn't parse). */
  raw: unknown;
}

/**
 * Probe the bridge via figma-console's `figma_get_status` with `probe:true`,
 * which forces a round-trip into the plugin. `connected` is authoritative: it
 * means the plugin answered (not merely that our WS server is up). Uses a SHORT
 * timeout + no retry so a down bridge surfaces fast (not the 180s call timeout).
 */
export async function getBridgeStatus(timeoutMs = 6_000): Promise<BridgeStatus> {
  const res = await callFigmaConsole('figma_get_status', { probe: true }, { timeoutMs, retry: false });
  const raw = resultToText(res);
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    /* keep raw */
  }
  const transport = (parsed?.transport ?? null) as { active?: boolean } | null;
  const setup = (parsed?.setup ?? null) as { probeResult?: { success?: boolean; currentFileName?: string } } | null;
  const transportActive = transport?.active === true;
  const probeOk = setup?.probeResult?.success === true;
  const file =
    (parsed?.currentFileName as string | undefined) ?? setup?.probeResult?.currentFileName ?? null;
  return { connected: probeOk, file, transportActive, raw: parsed ?? raw };
}

/** Structured outcome of a bridge-readiness attempt — drives the preflight tool + fail-fast. */
export interface EnsureBridgeResult {
  connected: boolean;
  /** The Figma file the plugin is attached to, if connected. */
  file: string | null;
  /** Stray figma-console listeners found on 9223–9232 (port-contention culprits). */
  competitors: { pid: number; port: number }[];
  message: string;
  /** Exact manual steps to recover when still down (empty when connected). */
  recovery: string[];
}

/** The three manual steps that get a disconnected bridge back online. */
const BRIDGE_RECOVERY_STEPS: readonly string[] = [
  'Open the target file in the Figma **Desktop** app (the bridge plugin can only run there, not in the browser).',
  'Run the **Figma Desktop Bridge** plugin from that file (Plugins → Development, or your installed figma-console bridge).',
  'Wait ~3s for it to auto-connect to this server, then retry.',
];

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Ensure the Figma Desktop Bridge is connected to OUR child before we rely on it.
 *  1. Probe (short timeout). If connected → return immediately.
 *  2. Otherwise reclaim the pinned WS port (kill stray figma-console competitors)
 *     and respawn our child so it owns 9223 — the plugin's first-scan port.
 *  3. Poll up to ~`timeoutMs` for the plugin's auto-rescan to reconnect to us.
 * Returns a structured result; when still down it carries the competitor list and
 * the exact recovery steps instead of hanging.
 */
export async function ensureBridgeConnected(
  opts: { reclaim?: boolean; timeoutMs?: number; probeTimeoutMs?: number } = {},
): Promise<EnsureBridgeResult> {
  const reclaim = opts.reclaim ?? true;
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const probeTimeoutMs = opts.probeTimeoutMs ?? 6_000;

  // 1. Fast probe — already connected?
  try {
    const first = await getBridgeStatus(probeTimeoutMs);
    if (first.connected) {
      return {
        connected: true,
        file: first.file,
        competitors: [],
        message: `Bridge connected${first.file ? ` to "${first.file}"` : ''}.`,
        recovery: [],
      };
    }
  } catch (err) {
    log(`initial bridge probe failed (${err instanceof Error ? err.message : String(err)}); will reclaim + retry`);
  }

  // 2. Reclaim the pinned port + respawn our child so it binds 9223.
  let competitors: { pid: number; port: number }[] = [];
  if (reclaim) {
    competitors = reclaimBridgePort().map((c) => ({ pid: c.pid, port: c.port }));
    // Drop the cached child so the next call respawns and binds the freed port.
    resetFigmaConsole();
  }

  // 3. Poll for the plugin's auto-rescan to reconnect to our (re)spawned server.
  const deadline = Date.now() + timeoutMs;
  let last: BridgeStatus | null = null;
  while (Date.now() < deadline) {
    try {
      last = await getBridgeStatus(probeTimeoutMs);
      if (last.connected) {
        const reclaimed = competitors.length
          ? ` (found ${competitors.length} competing figma-console instance${competitors.length === 1 ? '' : 's'}, reclaimed the pinned port ${FIGMA_WS_PORT})`
          : '';
        return {
          connected: true,
          file: last.file,
          competitors,
          message: `Bridge connected${last.file ? ` to "${last.file}"` : ''}${reclaimed}.`,
          recovery: [],
        };
      }
    } catch (err) {
      log(`bridge probe during wait failed (${err instanceof Error ? err.message : String(err)})`);
    }
    if (Date.now() + 1_500 < deadline) await sleep(1_500);
    else break;
  }

  // Still down — report competitors + the exact recovery steps.
  const reclaimedNote = competitors.length
    ? `Found ${competitors.length} competing figma-console instance${competitors.length === 1 ? '' : 's'} ` +
      `(${competitors.map((c) => `pid ${c.pid}@${c.port}`).join(', ')}) on the bridge ports and reclaimed the pinned port ${FIGMA_WS_PORT}, but the plugin did not reconnect in time. `
    : '';
  const transportNote = last?.transportActive
    ? 'Our bridge server is up, but no plugin has attached. '
    : '';
  return {
    connected: false,
    file: null,
    competitors,
    message:
      `Figma Desktop Bridge is not connected. ${reclaimedNote}${transportNote}` +
      `Complete the steps below, then retry.`,
    recovery: [...BRIDGE_RECOVERY_STEPS],
  };
}

/** Flatten a CallToolResult's content into a single text string. */
export function resultToText(result: CallToolResult): string {
  if (!result?.content?.length) return '';
  return result.content
    .map((c) => {
      if (c.type === 'text') return c.text;
      if (c.type === 'resource_link') return `[resource: ${c.uri}]`;
      return `[${c.type} content omitted]`;
    })
    .join('\n');
}
