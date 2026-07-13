/**
 * capture-crop.mts — capture one tightly-cropped image per section.
 *
 * For each screen:
 *   1. Navigate to it with Maestro (flows/<route>.yaml — navigation only).
 *   2. Scroll top→bottom with `adb input swipe`, and at each step read every
 *      visible section's pixel bounds from `maestro --device … hierarchy`
 *      (RN testIDs surface there as resource-id with `bounds`; plain
 *      uiautomator does not expose them) and grab an `adb screencap`.
 *   3. For each section, crop the frame where it is fully on-screen to its
 *      exact bounds with `sharp`. Sections taller than the viewport are
 *      stitched from the overlapping frames they span.
 *
 * Output: screenshots/<route>__<section>.png — one isolated section per file,
 * consumed unchanged by upload.mts.
 *
 * Usage: tsx visual/capture-crop.mts [Route ...]   (default: all in manifest)
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { Eyes, Target, BatchInfo } from '@applitools/eyes-images';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, '..');
const MANIFEST = resolve(__dirname, 'manifest.json');
const SHOTS = resolve(__dirname, 'screenshots');

// ── Platform: prefer iOS simulator when IOS_UDID is set (or adb unavailable) ──
const IS_IOS = Boolean(process.env.IOS_UDID);
const IOS_UDID = process.env.IOS_UDID ?? 'booted';
const DEVICE = IS_IOS ? IOS_UDID : (process.env.ANDROID_SERIAL || 'emulator-5554');
const ADB = process.env.ADB || 'adb';
const MAESTRO = process.env.MAESTRO || 'maestro';
const MAX_SCROLL_STEPS = 80;

// Pre-write reusable Maestro YAML flows for iOS scroll gestures (written once,
// reused for every swipe so we avoid per-call YAML creation overhead).
const IOS_SWIPE_UP_YAML = '/tmp/qa-native-swipe-up.yaml';
const IOS_SWIPE_DOWN_YAML = '/tmp/qa-native-swipe-down.yaml';
// disableAnimations:true fixes iOS 26 touch injection: without it, onPress handlers
// inside UIScrollView descendants are cancelled by the scroll gesture recognizer,
// so taps "complete" in Maestro but don't fire React Native's onPress callbacks.
const IOS_MAESTRO_CONFIG = '/tmp/qa-native-maestro-config.yaml';
if (IS_IOS) {
  const appId = 'host.exp.exponent'; // Expo Go bundle ID (iOS + Android)
  writeFileSync(IOS_SWIPE_UP_YAML, `appId: ${appId}\n---\n- swipe:\n    direction: UP\n    duration: 600\n`);
  writeFileSync(IOS_SWIPE_DOWN_YAML, `appId: ${appId}\n---\n- swipe:\n    direction: DOWN\n    duration: 600\n`);
  writeFileSync(IOS_MAESTRO_CONFIG, 'disableAnimations: true\n');
}

// Applitools (per-screen upload — results appear as each screen finishes).
const APP_NAME = 'OneUI qa-native';
const BATCH_NAME = 'OneUI qa-native — RN component sections';
const SERVER_URL = process.env.APPLITOOLS_SERVER_URL ?? 'https://jioeyes.applitools.com';

interface Section { id: string; tag: string; file: string }
interface Screen { route: string; sections: Section[] }
type Bounds = { x1: number; y1: number; x2: number; y2: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function adb(args: string[], opts: { binary?: boolean } = {}): Buffer {
  return execFileSync(ADB, ['-s', DEVICE, ...args], {
    maxBuffer: 128 * 1024 * 1024,
    encoding: opts.binary ? (null as unknown as BufferEncoding) : undefined,
  }) as unknown as Buffer;
}

function screencap(): Buffer {
  if (IS_IOS) {
    // xcrun simctl writes a PNG file; we read it back as a Buffer.
    const tmp = '/tmp/qa-native-cap.png';
    execFileSync('xcrun', ['simctl', 'io', IOS_UDID, 'screenshot', '--type=png', tmp]);
    return readFileSync(tmp);
  }
  return adb(['exec-out', 'screencap', '-p'], { binary: true });
}

function swipeUp(distPx: number): void {
  if (IS_IOS) {
    // Maestro handles iOS touch gestures natively; the distPx param is ignored
    // since Maestro uses a fixed swipe arc (sufficient for 10–15% scroll steps).
    try { execFileSync(MAESTRO, ['--device', IOS_UDID, 'test', '--config', IOS_MAESTRO_CONFIG, IOS_SWIPE_UP_YAML], { stdio: 'ignore' }); } catch {}
    return;
  }
  // Scroll content up by ~distPx using a slow gesture (long duration) so the
  // ScrollView doesn't fling past the requested distance — keeps section-top
  // sampling fine enough to anchor each heading near the target line.
  const x = 672;
  const startY = 2300;
  const endY = Math.max(300, startY - distPx);
  adb(['shell', 'input', 'swipe', String(x), String(startY), String(x), String(endY), '800']);
}

function swipeDown(distPx: number): void {
  if (IS_IOS) {
    try { execFileSync(MAESTRO, ['--device', IOS_UDID, 'test', '--config', IOS_MAESTRO_CONFIG, IOS_SWIPE_DOWN_YAML], { stdio: 'ignore' }); } catch {}
    return;
  }
  const x = 672;
  const startY = 700;
  const endY = Math.min(2600, startY + distPx);
  adb(['shell', 'input', 'swipe', String(x), String(startY), String(x), String(endY), '800']);
}

// ─── Stitching helpers (for sections taller than the viewport) ───────────────

interface Grey { data: Buffer; w: number; h: number }

/** Down-sampled greyscale of a screencap region, used to align consecutive frames. */
async function greyStrip(cap: Buffer, left: number, width: number, top: number, height: number): Promise<Grey> {
  const o = await sharp(cap)
    .extract({ left, top, width, height })
    .greyscale()
    .resize(64, null)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: o.data as Buffer, w: o.info.width, h: o.info.height };
}

/**
 * How many down-sampled rows the content moved UP between two consecutive
 * frames of the same window (cur ≈ prev shifted up by D). Found by minimising
 * pixel difference — robust to imprecise/flinged scrolling.
 */
function verticalShiftRows(prev: Grey, cur: Grey): number {
  const W = cur.w;
  const maxD = Math.min(cur.h - 2, Math.floor(cur.h * 0.95));
  let bestD = 1;
  let bestErr = Infinity;
  for (let D = 1; D < maxD; D++) {
    let err = 0;
    let cnt = 0;
    const rows = Math.min(prev.h - D, cur.h);
    for (let r = 0; r < rows; r += 2) {
      for (let x = 0; x < W; x += 2) {
        const d = prev.data[(r + D) * W + x] - cur.data[r * W + x];
        err += d * d;
        cnt++;
      }
    }
    if (cnt > 0) {
      err /= cnt;
      if (err < bestErr) {
        bestErr = err;
        bestD = D;
      }
    }
  }
  return bestD;
}

/** Vertically concatenate two PNG buffers (same width). */
async function vstack(topPng: Buffer, bottomPng: Buffer): Promise<Buffer> {
  const a = await sharp(topPng).metadata();
  const b = await sharp(bottomPng).metadata();
  const width = Math.max(a.width ?? 0, b.width ?? 0);
  const height = (a.height ?? 0) + (b.height ?? 0);
  return sharp({ create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([
      { input: topPng, top: 0, left: 0 },
      { input: bottomPng, top: a.height ?? 0, left: 0 },
    ])
    .png()
    .toBuffer();
}

async function scrollToTop(): Promise<void> {
  let lastFp: Buffer | null = null;
  for (let i = 0; i < 30; i++) {
    const cap = screencap();
    const fp = await sharp(cap).extract({ left: 0, top: 240, width: 1344, height: 2000 }).greyscale().resize(48, 96, { fit: 'fill' }).raw().toBuffer();
    if (lastFp && fp.equals(lastFp)) break;
    lastFp = fp;
    swipeDown(1400);
    await sleep(500);
  }
}

/**
 * Capture a section taller than the viewport in full by scrolling through it in
 * overlapping slices and stitching them (alignment via image matching, so it
 * tolerates imprecise scrolling). Returns a full-section PNG, or null if it
 * couldn't be located.
 */
async function stitchTallSection(
  secId: string,
  geom: { H: number; W: number; HEADER_BOTTOM: number; BOTTOM: number; TARGET_TOP: number },
): Promise<Buffer | null> {
  const { H, HEADER_BOTTOM, BOTTOM, TARGET_TOP } = geom;
  const winTop = HEADER_BOTTOM;
  const winH = BOTTOM - winTop;

  await scrollToTop();

  // Phase 1: scroll down until the section heading is at/near the top.
  let b: Bounds | undefined;
  for (let i = 0; i < 60; i++) {
    b = sectionBounds()[secId];
    if (b && b.y1 <= TARGET_TOP + 80) break;
    swipeUp(Math.round(H * 0.1));
    await sleep(500);
  }
  if (!b) return null;

  // Phase 2: slice down through the section, stitching as we go.
  let acc: Buffer | null = null;
  let prevGrey: Grey | null = null;
  const x1 = Math.max(0, b.x1);
  const w = Math.min(b.x2, geom.W) - x1;

  for (let i = 0; i < 60; i++) {
    const cap = screencap();
    const bb = sectionBounds()[secId];
    if (!bb) break;
    const sTop = Math.max(bb.y1, winTop);
    const sBot = Math.min(bb.y2, BOTTOM);
    if (acc === null) {
      acc = await sharp(cap).extract({ left: x1, top: sTop, width: w, height: Math.max(1, sBot - sTop) }).png().toBuffer();
      prevGrey = await greyStrip(cap, x1, w, winTop, winH);
    } else {
      const curGrey = await greyStrip(cap, x1, w, winTop, winH);
      const dsShift = verticalShiftRows(prevGrey as Grey, curGrey);
      const fullShift = Math.round((dsShift * winH) / curGrey.h);
      const appendTop = Math.max(winTop, BOTTOM - fullShift);
      const appendBot = Math.min(bb.y2, BOTTOM);
      if (appendBot > appendTop + 2) {
        const piece = await sharp(cap).extract({ left: x1, top: appendTop, width: w, height: appendBot - appendTop }).png().toBuffer();
        acc = await vstack(acc, piece);
      }
      prevGrey = curGrey;
    }
    if (bb.y2 <= BOTTOM) break; // section bottom reached
    swipeUp(Math.round(winH * 0.85));
    await sleep(550);
  }
  return acc;
}

/** Section bounds visible in the current frame, via Maestro's RN-aware hierarchy. */
function sectionBounds(): Record<string, Bounds> {
  const out = execFileSync(MAESTRO, ['--device', DEVICE, 'hierarchy'], {
    maxBuffer: 64 * 1024 * 1024,
    encoding: 'utf8',
  });
  const tree = JSON.parse(out);
  const map: Record<string, Bounds> = {};
  (function walk(n: any): void {
    if (!n || typeof n !== 'object') return;
    const a = n.attributes ?? {};
    const id: string | undefined = a['resource-id'];
    if (id && id.startsWith('section-') && typeof a.bounds === 'string') {
      const m = a.bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
      if (m) map[id] = { x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] };
    }
    (n.children ?? []).forEach(walk);
  })(tree);
  return map;
}

function runMaestro(flow: string): void {
  const configArgs = IS_IOS ? ['--config', IOS_MAESTRO_CONFIG] : [];
  try {
    execFileSync(MAESTRO, ['--device', DEVICE, 'test', ...configArgs, flow], {
      cwd: APP_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer };
    const out = `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`;
    const reason = out
      .split('\n')
      .filter((l) => /FAILED|Error|not found|Element|Assertion/i.test(l))
      .slice(-4)
      .join(' | ')
      .trim();
    throw new Error(`navigation failed${reason ? ` — ${reason}` : ''}`);
  }
}

async function captureScreen(
  screen: Screen,
  screenH: { v: number },
): Promise<{ tag: string; path: string }[]> {
  const written: { tag: string; path: string }[] = [];
  process.stdout.write(`   • navigating to ${screen.route}…`);
  runMaestro(resolve(__dirname, 'flows', `${screen.route}.yaml`));
  process.stdout.write(' ok\n');
  await sleep(800);

  // Probe screen size from a first screencap.
  const probe = screencap();
  const probeMeta = await sharp(probe).metadata();
  if (!screenH.v) screenH.v = probeMeta.height ?? 2992;
  const H = screenH.v || 2992;
  const W = probeMeta.width ?? 1344;
  // The fixed nav header + status bar occupy the top ~11% of screen height on
  // both Android and iOS. Derive proportionally so the same formula works for
  // all device pixel densities (330/2992 ≈ 0.11 on the reference Android device).
  const HEADER_BOTTOM = Math.round(H * 0.11);
  const TARGET_TOP = HEADER_BOTTOM + Math.round(H * 0.023); // ~70px on ref device
  const BOTTOM = H - Math.round(H * 0.005);
  const STEP = Math.round(H * 0.12); // fine steps → good heading alignment

  // best[id]     = frame whose un-clamped section-top is nearest TARGET_TOP
  //                (heading guaranteed in-frame — used when the section fits).
  // fallback[id] = frame showing the most of the section, used when the heading
  //                can never be anchored (section taller than the viewport, or
  //                the last section that can't scroll high enough).
  const best: Record<string, { cap: Buffer; b: Bounds; score: number }> = {};
  const fallback: Record<string, { cap: Buffer; b: Bounds; visH: number }> = {};

  // A content fingerprint (excludes the status-bar clock + bottom gesture area)
  // tells us whether the last swipe actually scrolled. Section *bounds* can't
  // be used — they stay clamped/constant while scrolling through a section
  // taller than the viewport, which made the loop stop early and miss the
  // sections below it.
  const fingerprint = async (cap: Buffer): Promise<Buffer> =>
    sharp(cap)
      .extract({ left: 0, top: 240, width: W, height: Math.max(1, H - 240 - 120) })
      .greyscale()
      .resize(48, 96, { fit: 'fill' })
      .raw()
      .toBuffer();

  let lastFp: Buffer | null = null;
  for (let step = 0; step < MAX_SCROLL_STEPS; step++) {
    const bounds = sectionBounds();
    const cap = screencap();
    for (const sec of screen.sections) {
      const b = bounds[sec.id];
      if (!b) continue;
      const visH = Math.min(b.y2, BOTTOM) - Math.max(b.y1, HEADER_BOTTOM);
      if (!fallback[sec.id] || visH > fallback[sec.id].visH) fallback[sec.id] = { cap, b, visH };
      // Skip frames where the heading is clamped under the header (its real top
      // is scrolled above the viewport) — those would crop out the heading.
      if (b.y1 < HEADER_BOTTOM + 24) continue;
      const score = Math.abs(b.y1 - TARGET_TOP);
      if (!best[sec.id] || score < best[sec.id].score) best[sec.id] = { cap, b, score };
    }
    const fp = await fingerprint(cap);
    if (lastFp && fp.equals(lastFp)) break; // screen didn't move after last swipe → at bottom
    lastFp = fp;
    swipeUp(STEP);
    await sleep(650);
  }
  process.stdout.write(`   • scrolled & located sections; cropping…\n`);

  let full = 0;
  let partial = 0;
  const tall: { id: string; file: string; tag: string }[] = [];
  for (const sec of screen.sections) {
    const anchored = best[sec.id];
    const pick = anchored ?? fallback[sec.id];
    if (!pick) {
      console.log(`       ✗ ${sec.id} — never visible (skipped)`);
      continue;
    }
    const left = Math.max(0, pick.b.x1);
    const top = Math.max(HEADER_BOTTOM, pick.b.y1);
    const width = Math.min(pick.b.x2, 1344) - left;
    const height = Math.min(pick.b.y2, BOTTOM) - top;
    const outPath = resolve(SHOTS, sec.file);
    await sharp(pick.cap).extract({ left, top, width, height }).toFile(outPath);
    written.push({ tag: sec.tag, path: outPath });
    const clipped = !anchored || pick.b.y2 > BOTTOM;
    if (clipped) {
      partial++;
      tall.push({ id: sec.id, file: sec.file, tag: sec.tag });
      console.log(`       ⚠ ${sec.id}  ${width}×${height}  (taller than viewport — will stitch)`);
    } else {
      full++;
      console.log(`       ✓ ${sec.id}  ${width}×${height}  (full)`);
    }
  }

  // Re-capture any taller-than-viewport sections in full via slice-and-stitch.
  for (const t of tall) {
    process.stdout.write(`   • stitching ${t.id}…`);
    try {
      const stitched = await stitchTallSection(t.id, { H, W, HEADER_BOTTOM, BOTTOM, TARGET_TOP });
      if (stitched) {
        const meta = await sharp(stitched).metadata();
        await sharp(stitched).toFile(resolve(SHOTS, t.file));
        partial--;
        full++;
        process.stdout.write(` ok (${meta.width}×${meta.height})\n`);
      } else {
        process.stdout.write(` could not locate — kept partial crop\n`);
      }
    } catch (err) {
      process.stdout.write(` failed (${(err as Error).message}) — kept partial crop\n`);
    }
  }

  console.log(`   ✓ ${screen.route}: ${written.length}/${screen.sections.length} cropped (${full} full, ${partial} partial)`);
  return written;
}

/** Upload one screen's cropped sections as a single Eyes test (one batch). */
async function uploadScreen(
  batch: BatchInfo,
  apiKey: string,
  route: string,
  shots: { tag: string; path: string }[],
): Promise<void> {
  const eyes = new Eyes();
  eyes.setApiKey(apiKey);
  eyes.setServerUrl(SERVER_URL);
  eyes.setBatch(batch);
  try {
    await eyes.open(APP_NAME, route);
    for (const s of shots) {
      await eyes.check(s.tag, Target.image(readFileSync(s.path)));
    }
    const results = await eyes.close(false);
    const status = typeof results?.getStatus === 'function' ? results.getStatus() : 'Unknown';
    const url = typeof results?.getUrl === 'function' ? results.getUrl() : '';
    console.log(`  ↑ uploaded ${route} (${shots.length}) · status=${status}${url ? `\n     ${url}` : ''}`);
  } catch (err) {
    console.error(`  ✗ upload ${route}: ${(err as Error).message}`);
    await eyes.abort();
  }
}

// ─── main ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const uploadEnabled = args.includes('--upload') || process.env.VISUAL_UPLOAD === '1';
const filter = args.filter((a) => !a.startsWith('--'));

const manifest: Screen[] = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const screens = filter.length ? manifest.filter((s) => filter.includes(s.route)) : manifest;
if (screens.length === 0) {
  console.error(`✗ No screens matched ${JSON.stringify(filter)}.`);
  process.exit(1);
}
mkdirSync(SHOTS, { recursive: true });

const apiKey = process.env.APPLITOOLS_API_KEY;
if (uploadEnabled && !apiKey) {
  console.error('✗ --upload requested but APPLITOOLS_API_KEY is not set.');
  process.exit(1);
}
// One shared batch so every screen lands in the same dashboard batch, but each
// is opened/closed individually → it appears on the dashboard the moment its
// capture finishes.
const batch = uploadEnabled ? new BatchInfo(BATCH_NAME) : null;

console.log('─'.repeat(64));
console.log(`OneUI qa-native visual run · ${screens.length} screen(s) · device ${DEVICE}`);
console.log(`mode: ${uploadEnabled ? `capture + upload → ${SERVER_URL}` : 'capture only'}`);
console.log('─'.repeat(64));

const t0 = Date.now();
let okScreens = 0;
let failScreens = 0;
let totalSections = 0;
const screenH = { v: 0 };

for (let i = 0; i < screens.length; i++) {
  const screen = screens[i];
  const tag = `[${i + 1}/${screens.length}] ${screen.route}`;
  const start = Date.now();
  console.log(`\n▶ ${tag}`);
  try {
    const shots = await captureScreen(screen, screenH);
    totalSections += shots.length;
    if (batch && apiKey && shots.length) {
      await uploadScreen(batch, apiKey, screen.route, shots);
    }
    okScreens++;
    console.log(`   ⏱  ${tag} done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  } catch (err) {
    failScreens++;
    console.error(`   ✗ ${tag}: ${(err as Error).message}`);
  }
}

console.log('\n' + '─'.repeat(64));
console.log(
  `Summary: ${okScreens} ok, ${failScreens} failed · ${totalSections} section checkpoints · ` +
    `${((Date.now() - t0) / 1000).toFixed(0)}s`,
);
console.log(
  uploadEnabled
    ? 'Each screen was uploaded as it finished — view the batch in Applitools.'
    : 'Capture complete. Screenshots in visual/screenshots/.',
);
console.log('─'.repeat(64));
