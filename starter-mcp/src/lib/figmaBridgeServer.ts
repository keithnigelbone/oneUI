/**
 * OneUI-owned Figma bridge — server side (Phase 2).
 *
 * A small WebSocket server, hosted INSIDE oneui-mcp, that the OneUI Figma Bridge
 * plugin (`figma-bridge-plugin/`) connects to. It replaces the spawned
 * `figma-console-mcp` child for the one piece of data nothing else can supply:
 * per-node `resolvedVariableModes` + bound dimension-variable names (Plugin-API
 * only). Owning both ends gives us a deterministic port + our own reconnect +
 * zero third-party npx/cloud dependency.
 *
 * Protocol (JSON over WS), mirroring the figma-console EXECUTE_CODE contract so
 * `buildModesSnippet` is unchanged:
 *   server → plugin: { type: 'EXECUTE_CODE', requestId, code, timeout }
 *   plugin → server: { type: 'EXECUTE_CODE_RESULT', requestId, success, result|error, fileInfo }
 *                    { type: 'FILE_INFO', fileInfo: { fileName, fileKey } }
 *                    { type: 'HELLO' } / { type: 'PONG' }
 *
 * Honest constraint (same as figma-console): the plugin must be opened once per
 * Figma session — Figma's sandbox forbids launching an in-Figma plugin from
 * outside. What we gain is a pinned port we own + our own auto-reconnect.
 *
 * Gated behind `ONEUI_FIGMA_BRIDGE_OWN=1`; the figma-console child remains the
 * default and the fallback until this path is proven in the field.
 */
import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { WebSocket, WebSocketServer, type RawData } from 'ws';

/** Cap on a single WS frame from the plugin (extraction payloads are ~100s of KB). */
const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024;

const LOOPBACK_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

/**
 * Accept only connections that can plausibly be the Figma plugin iframe.
 * The server binds 127.0.0.1, but WebSockets are exempt from browser
 * same-origin blocking — ANY web page the user visits can open
 * ws://127.0.0.1:<port> and (with last-write-wins socket adoption) feed the
 * pipeline forged extraction results. The plugin iframe connects with a
 * missing/null Origin (it is a data: iframe), never an http(s) page origin —
 * so an http(s) Origin that is not figma.com is definitively a browser page.
 * Kept deliberately permissive otherwise (a malicious LOCAL process can still
 * connect — the auth-token design for that is tracked in the audit backlog).
 */
export function isAllowedConnection(req: Pick<IncomingMessage, 'socket' | 'headers'>): { ok: boolean; reason?: string } {
  const addr = req.socket.remoteAddress ?? '';
  if (!LOOPBACK_ADDRESSES.has(addr)) {
    return { ok: false, reason: `non-loopback remote address ${addr}` };
  }
  const origin = req.headers.origin;
  if (origin && /^https?:\/\//i.test(origin)) {
    let host = '';
    try {
      host = new URL(origin).hostname;
    } catch {
      return { ok: false, reason: `unparseable Origin "${origin}"` };
    }
    if (host !== 'figma.com' && !host.endsWith('.figma.com')) {
      return { ok: false, reason: `browser page Origin "${origin}"` };
    }
  }
  return { ok: true };
}

/** Port range the server tries to bind and the plugin scans (multi-instance). */
const PORT_START = Number(process.env.ONEUI_FIGMA_BRIDGE_PORT_START ?? 9333);
const PORT_END = Number(process.env.ONEUI_FIGMA_BRIDGE_PORT_END ?? 9342);
/** Explicit single-port pin (overrides the range scan when set). */
const PORT_PIN = process.env.ONEUI_FIGMA_BRIDGE_PORT ? Number(process.env.ONEUI_FIGMA_BRIDGE_PORT) : null;

function log(msg: string): void {
  process.stderr.write(`[oneui-mcp:bridge] ${msg}\n`);
}

interface FileInfo {
  fileName: string | null;
  fileKey: string | null;
}

/** Result of an EXECUTE_CODE round-trip into the plugin. */
export interface OwnExecuteResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

interface Pending {
  resolve: (r: OwnExecuteResult) => void;
  timer: ReturnType<typeof setTimeout>;
}

/** Snapshot of the own-bridge connection (parallels figma-console's BridgeStatus). */
export interface OwnBridgeStatus {
  connected: boolean;
  file: string | null;
  port: number | null;
}

class OwnBridgeServer {
  private wss: WebSocketServer | null = null;
  private port: number | null = null;
  /** Most-recently connected plugin socket (last write wins). */
  private plugin: WebSocket | null = null;
  private file: string | null = null;
  private pending = new Map<string, Pending>();
  private startPromise: Promise<void> | null = null;
  private cleanupRegistered = false;

  /** Idempotently bind the WS server (first free port in the range, or the pin). */
  async start(): Promise<void> {
    if (this.wss) return;
    if (!this.startPromise) this.startPromise = this.bind();
    return this.startPromise;
  }

  private bind(): Promise<void> {
    const candidates = PORT_PIN != null ? [PORT_PIN] : range(PORT_START, PORT_END);
    return new Promise<void>((resolve, reject) => {
      const tryNext = (i: number): void => {
        if (i >= candidates.length) {
          this.startPromise = null; // allow a later retry
          reject(new Error(`No free port in ${PORT_START}-${PORT_END} for the OneUI bridge server`));
          return;
        }
        const port = candidates[i];
        const wss = new WebSocketServer({ host: '127.0.0.1', port, maxPayload: MAX_PAYLOAD_BYTES });
        const onError = (err: NodeJS.ErrnoException) => {
          try {
            wss.close();
          } catch {
            /* ignore */
          }
          if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
            tryNext(i + 1);
          } else {
            this.startPromise = null;
            reject(err);
          }
        };
        wss.once('error', onError);
        wss.once('listening', () => {
          wss.removeListener('error', onError);
          wss.on('error', (e) => log(`server error: ${e instanceof Error ? e.message : String(e)}`));
          this.wss = wss;
          this.port = port;
          this.wire(wss);
          this.registerCleanup();
          log(`own bridge listening on ws://127.0.0.1:${port}`);
          resolve();
        });
      };
      tryNext(0);
    });
  }

  private wire(wss: WebSocketServer): void {
    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const allowed = isAllowedConnection(req);
      if (!allowed.ok) {
        log(`rejected connection: ${allowed.reason}`);
        ws.close(1008, 'origin not allowed');
        return;
      }
      this.plugin = ws;
      log('Figma plugin connected');
      ws.on('message', (data: RawData) => this.onMessage(ws, data));
      ws.on('close', () => {
        if (this.plugin === ws) {
          this.plugin = null;
          this.file = null;
          log('Figma plugin disconnected');
        }
      });
      ws.on('error', (err) => log(`plugin socket error: ${err instanceof Error ? err.message : String(err)}`));
    });
  }

  private onMessage(ws: WebSocket, data: RawData): void {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(data.toString()) as Record<string, unknown>;
    } catch {
      return;
    }
    const type = msg.type;
    if (typeof type !== 'string') return;
    if (type === 'FILE_INFO') {
      const info = msg.fileInfo as FileInfo | undefined;
      const name = info?.fileName;
      // Shape + length validation — this string is echoed into tool output.
      this.file = typeof name === 'string' ? name.slice(0, 256) : null;
      return;
    }
    if (type === 'EXECUTE_CODE_RESULT') {
      const requestId = String(msg.requestId ?? '');
      const p = this.pending.get(requestId);
      if (!p) return;
      this.pending.delete(requestId);
      clearTimeout(p.timer);
      const info = msg.fileInfo as FileInfo | undefined;
      if (typeof info?.fileName === 'string') this.file = info.fileName.slice(0, 256);
      p.resolve({
        success: msg.success === true,
        result: msg.result,
        error: typeof msg.error === 'string' ? msg.error : msg.error != null ? JSON.stringify(msg.error) : undefined,
      });
      return;
    }
    // HELLO / PONG — connection liveness only.
  }

  /** Is a plugin currently connected? */
  isConnected(): boolean {
    return !!this.plugin && this.plugin.readyState === WebSocket.OPEN;
  }

  getStatus(): OwnBridgeStatus {
    return { connected: this.isConnected(), file: this.file, port: this.port };
  }

  /**
   * Run `code` inside the connected plugin and resolve with its result. Rejects
   * if no plugin is connected (caller should preflight via ensureOwnBridge).
   */
  executeCode(code: string, timeoutMs: number): Promise<OwnExecuteResult> {
    const ws = this.plugin;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('OneUI Figma Bridge plugin is not connected'));
    }
    const requestId = randomUUID();
    return new Promise<OwnExecuteResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error(`Figma bridge EXECUTE_CODE timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pending.set(requestId, { resolve, timer });
      try {
        // Give the plugin's own eval a slightly shorter budget so a plugin-side
        // hang surfaces as our cleaner timeout rather than a silent stall.
        const pluginTimeout = Math.max(1000, timeoutMs - 1000);
        ws.send(JSON.stringify({ type: 'EXECUTE_CODE', requestId, code, timeout: pluginTimeout }));
      } catch (err) {
        clearTimeout(timer);
        this.pending.delete(requestId);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  private registerCleanup(): void {
    if (this.cleanupRegistered) return;
    this.cleanupRegistered = true;
    const close = () => {
      try {
        this.wss?.close();
      } catch {
        /* ignore */
      }
    };
    process.once('exit', close);
    for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
      process.once(sig, () => {
        close();
        process.exit(0);
      });
    }
  }
}

function range(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let p = lo; p <= hi; p++) out.push(p);
  return out;
}

let instance: OwnBridgeServer | null = null;
/** Lazily-created singleton bridge server. */
export function getOwnBridgeServer(): OwnBridgeServer {
  if (!instance) instance = new OwnBridgeServer();
  return instance;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** The manual steps that bring the OneUI bridge online (no port reclaim needed). */
const OWN_BRIDGE_RECOVERY_STEPS: readonly string[] = [
  'Open the target file in the Figma **Desktop** app (the bridge plugin can only run there, not in the browser).',
  'Run the **OneUI Figma Bridge** plugin (Plugins → Development → OneUI Figma Bridge; import it once via "Import plugin from manifest…" → `figma-bridge-plugin/manifest.json`).',
  'Wait ~3s for the plugin UI to show "connected", then retry.',
];

/** Structured outcome — same shape as figma-console's EnsureBridgeResult. */
export interface EnsureOwnBridgeResult {
  connected: boolean;
  file: string | null;
  competitors: { pid: number; port: number }[];
  message: string;
  recovery: string[];
  port: number | null;
}

/**
 * Ensure the OneUI bridge server is up and a plugin is connected. Starts the
 * server (idempotent), then polls up to `timeoutMs` for the plugin to connect.
 * No port reclaim: we own a dedicated range, so there are no competitors.
 */
export async function ensureOwnBridge(
  opts: { timeoutMs?: number } = {},
): Promise<EnsureOwnBridgeResult> {
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const server = getOwnBridgeServer();

  try {
    await server.start();
  } catch (err) {
    return {
      connected: false,
      file: null,
      competitors: [],
      port: null,
      message: `Could not start the OneUI bridge server: ${err instanceof Error ? err.message : String(err)}`,
      recovery: [...OWN_BRIDGE_RECOVERY_STEPS],
    };
  }

  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const s = server.getStatus();
    if (s.connected) {
      return {
        connected: true,
        file: s.file,
        competitors: [],
        port: s.port,
        message: `OneUI bridge connected${s.file ? ` to "${s.file}"` : ''} on port ${s.port}.`,
        recovery: [],
      };
    }
    if (Date.now() + 750 >= deadline) break;
    await sleep(750);
  }

  const s = server.getStatus();
  return {
    connected: false,
    file: null,
    competitors: [],
    port: s.port,
    message:
      `OneUI bridge server is listening on port ${s.port ?? '?'}, but no plugin has connected. ` +
      `Complete the steps below, then retry.`,
    recovery: [...OWN_BRIDGE_RECOVERY_STEPS],
  };
}
