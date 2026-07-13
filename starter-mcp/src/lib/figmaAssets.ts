/**
 * figma_to_code — step 3: download image assets.
 *
 * Renders image-bearing nodes via Figma's REST `/v1/images` endpoint (token-only,
 * NO Desktop Bridge required) and writes the PNGs into an assets folder. Returns a
 * map of figma node id → relative asset path for backfilling `src` into the tree.
 *
 * ICONS ARE NEVER DOWNLOADED — they come from the icon library. Only photographic
 * / raster image content (Image, Avatar content=image, IMAGE fills) is rendered
 * here; the caller (figmaRefine) already excludes icon components from the list.
 */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import type { ImageAsset } from './figmaRefine.js';

export interface DownloadedImage {
  id: string;
  file: string; // absolute path written
  relPath: string; // path to reference from generated code (relative to projectRoot)
  url: string; // figma render URL (expires ~30 days)
}

export interface DownloadImagesResult {
  downloaded: DownloadedImage[];
  /** Pre-existing files in assetsDir matched by name when the render/download
   *  failed or skipped a node (`url` is '' for these — nothing was fetched). */
  reused: DownloadedImage[];
  errors: string[];
  /** node id → relative asset path, for applyImageSources(). Includes reused. */
  byId: Map<string, string>;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/**
 * Stable short hash of the FULL node id. Using `slice(-6)` of the id collides
 * across screens: a OneUI Image instance's id ends in the shared component-
 * internal fill-node id (e.g. `…;2775:10380`), so every screen's image would
 * map to the same `<alt>-510380.png` and overwrite the others. Hashing the
 * whole id (which includes the unique instance path) makes the suffix unique
 * per node, so different screens' assets no longer clobber each other.
 */
function shortHash(s: string): string {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36).padStart(7, '0').slice(0, 7);
}

/** Build a unique, readable file name per asset (from alt text / component + a stable id hash). */
function fileNameFor(asset: ImageAsset, used: Set<string>, format: string): string {
  const base = slugify(asset.alt || asset.component || 'image') || 'image';
  const suffix = shortHash(asset.id);
  let name = `${base}-${suffix}.${format}`;
  let i = 2;
  while (used.has(name)) name = `${base}-${suffix}-${i++}.${format}`;
  used.add(name);
  return name;
}

/**
 * Match un-downloaded assets against files ALREADY on disk in the assets dir
 * (pre-downloaded by an earlier run, or placed by hand per the tool's guidance).
 * Pure function over a file list so it is unit-testable without fs.
 *
 * Two passes: exact `<slug>-<idHash>.<format>` names first (a previous run of
 * this pipeline), then any unclaimed `<slug>-*.<format>` prefix match (hand-
 * placed or re-exported assets). Each file is claimed at most once.
 * Returns node id → file name.
 */
export function matchExistingAssets(
  images: ImageAsset[],
  existingFiles: string[],
  format = 'png',
): Map<string, string> {
  const out = new Map<string, string>();
  const available = new Set(existingFiles);
  const baseFor = (a: ImageAsset) => slugify(a.alt || a.component || 'image') || 'image';

  for (const asset of images) {
    const exact = `${baseFor(asset)}-${shortHash(asset.id)}.${format}`;
    if (available.has(exact)) {
      out.set(asset.id, exact);
      available.delete(exact);
    }
  }
  for (const asset of images) {
    if (out.has(asset.id)) continue;
    const prefix = `${baseFor(asset)}-`;
    const candidate = [...available]
      .filter((f) => f.startsWith(prefix) && f.endsWith(`.${format}`))
      .sort()[0];
    if (candidate) {
      out.set(asset.id, candidate);
      available.delete(candidate);
    }
  }
  return out;
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [500, 1500];

/**
 * fetch with small retry/backoff on transient failures (network throw, 429,
 * 5xx). Permanent client errors (403/404 — bad token / no file access) fail
 * fast so the caller reports them immediately.
 */
async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt - 1]));
    try {
      const res = await fetch(url, init);
      if (res.ok || !RETRYABLE_STATUS.has(res.status)) return res;
      lastErr = new Error(`${res.status} ${res.statusText}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/**
 * Render + download all `images` for `fileKey` into `assetsDir`.
 * @param projectRoot used to compute the relative path referenced from code.
 */
export async function downloadImages(opts: {
  fileKey: string;
  token: string;
  images: ImageAsset[];
  assetsDir: string;
  projectRoot: string;
  scale?: number;
  format?: 'png' | 'jpg' | 'svg';
}): Promise<DownloadImagesResult> {
  const { fileKey, token, images, assetsDir, projectRoot } = opts;
  const scale = opts.scale ?? 2;
  const format = opts.format ?? 'png';
  const result: DownloadImagesResult = { downloaded: [], reused: [], errors: [], byId: new Map() };
  if (images.length === 0) return result;

  const outDir = isAbsolute(assetsDir) ? assetsDir : resolve(projectRoot, assetsDir);

  // Fallback for every exit path: any node still without a downloaded file is
  // matched against pre-existing files in the assets dir (earlier run / hand-
  // placed), so a failed render call no longer means blank images when usable
  // assets are already on disk.
  const finish = (): DownloadImagesResult => {
    const missing = images.filter((i) => !result.byId.has(i.id));
    if (missing.length === 0) return result;
    let existing: string[] = [];
    try {
      existing = readdirSync(outDir);
    } catch {
      return result; // assets dir doesn't exist — nothing to reuse
    }
    for (const [id, name] of matchExistingAssets(missing, existing, format)) {
      const file = resolve(outDir, name);
      const relPath = relative(projectRoot, file) || name;
      result.reused.push({ id, file, relPath, url: '' });
      result.byId.set(id, relPath);
    }
    return result;
  };

  // 1) Ask Figma to render the nodes → { images: { id: url } }.
  const ids = [...new Set(images.map((i) => i.id))];
  const renderUrl = `https://api.figma.com/v1/images/${encodeURIComponent(fileKey)}?ids=${encodeURIComponent(
    ids.join(','),
  )}&format=${format}&scale=${scale}`;
  let urlMap: Record<string, string | null> = {};
  try {
    const res = await fetchWithRetry(renderUrl, { headers: { 'X-Figma-Token': token } });
    if (!res.ok) {
      result.errors.push(`Figma /v1/images failed: ${res.status} ${res.statusText}`);
      return finish();
    }
    const body = (await res.json()) as { images?: Record<string, string | null>; err?: string };
    if (body.err) {
      result.errors.push(`Figma /v1/images error: ${body.err}`);
      return finish();
    }
    urlMap = body.images ?? {};
  } catch (err) {
    result.errors.push(`Figma /v1/images request threw: ${err instanceof Error ? err.message : String(err)}`);
    return finish();
  }

  mkdirSync(outDir, { recursive: true });
  const used = new Set<string>();

  // 2) Download each rendered URL to disk.
  for (const asset of images) {
    const url = urlMap[asset.id];
    if (!url) {
      result.errors.push(`No render URL for node ${asset.id} (${asset.component})`);
      continue;
    }
    try {
      const res = await fetchWithRetry(url);
      if (!res.ok) {
        result.errors.push(`Download failed for ${asset.id}: ${res.status} ${res.statusText}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const name = fileNameFor(asset, used, format);
      const file = resolve(outDir, name);
      writeFileSync(file, buf);
      const relPath = relative(projectRoot, file) || name;
      result.downloaded.push({ id: asset.id, file, relPath, url });
      result.byId.set(asset.id, relPath);
    } catch (err) {
      result.errors.push(`Download threw for ${asset.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return finish();
}
