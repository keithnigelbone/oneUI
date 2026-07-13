/**
 * generate.mts — derive the visual-test plan from the component screens and
 * emit one Maestro flow per screen + a manifest the uploader consumes.
 *
 * Source of truth: each screen in `src/screens/components/*.tsx` carries a
 * `screen-<Name>` testID and ordered `section-*` testIDs (the same convention
 * the CombinationsRules files describe). We scan those, in source/render
 * order, so adding a section to a screen automatically adds an Applitools
 * checkpoint — no hand-maintained map.
 *
 * Outputs (all git-ignored, regenerated on demand):
 *   - visual/manifest.json          → [{ route, screenTestId, navTestId, sections[] }]
 *   - visual/flows/<route>.yaml      → Maestro flow: navigate → scroll each
 *                                      section into view → screenshot → back
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENS_DIR = resolve(__dirname, '../src/screens/components');
const FLOWS_DIR = resolve(__dirname, 'flows');
const MANIFEST = resolve(__dirname, 'manifest.json');

// Expo Go on Android. (iOS Expo Go shares the same launch model if you retarget.)
const APP_ID = 'host.exp.exponent';

// Scratch / non-section screens to skip.
const SKIP_SCREENS = new Set(['ButtonSingle']);

interface SectionEntry {
  /** testID on the section container, e.g. "section-attentions". */
  id: string;
  /** Applitools checkpoint name (stable across runs). */
  tag: string;
  /** Flat screenshot filename written by Maestro and read by the uploader. */
  file: string;
}
interface ScreenEntry {
  route: string;
  screenTestId: string;
  navTestId: string;
  sections: SectionEntry[];
}

function firstScreenName(src: string): string | null {
  const m = src.match(/screen-([A-Za-z0-9]+)/);
  return m ? m[1] : null;
}

/** Ordered, de-duplicated `section-*` ids in source (= render) order. */
function orderedSectionIds(src: string): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  const re = /'(section-[a-zA-Z0-9-]+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      ids.push(m[1]);
    }
  }
  return ids;
}

const screens: ScreenEntry[] = [];

for (const file of readdirSync(SCREENS_DIR).sort()) {
  if (!file.endsWith('Screen.tsx')) continue;
  const src = readFileSync(join(SCREENS_DIR, file), 'utf8');
  const name = firstScreenName(src);
  if (!name || SKIP_SCREENS.has(name)) continue;
  const ids = orderedSectionIds(src);
  if (ids.length === 0) continue; // placeholder / no-section screens

  screens.push({
    route: name,
    screenTestId: `screen-${name}`,
    navTestId: `nav-${name}`,
    sections: ids.map((id) => ({
      id,
      tag: id,
      file: `${name}__${id.replace(/^section-/, '')}.png`,
    })),
  });
}

// ─── Write manifest ──────────────────────────────────────────────────────────
writeFileSync(MANIFEST, JSON.stringify(screens, null, 2) + '\n');

// ─── (Re)write Maestro flows ─────────────────────────────────────────────────
rmSync(FLOWS_DIR, { recursive: true, force: true });
mkdirSync(FLOWS_DIR, { recursive: true });

/**
 * Navigation-only flow: reset to Home, open the screen, and scroll back to the
 * top so capture-crop.mts starts from a known position. It deliberately takes
 * NO screenshots — `capture-crop.mts` owns capture so it can read each
 * section's pixel bounds (via `maestro hierarchy`) and crop to it.
 *
 * iOS 26 notes:
 *   - `back` gesture is broken on iOS 26 NativeStack — must use tapOn id:BackButton.
 *   - accessibilityLabel on FlatList Pressables causes text='' — must use id: selectors.
 *   - scrollUntilVisible works on iOS when disableAnimations:true is set in Maestro config.
 *   - Modal screen auto-opens an overlay (defaultOpen:true) that blocks the accessibility
 *     tree; accessibility-based taps don't reach onPress inside a RN Modal portal UIWindow
 *     even with disableAnimations:true — use coordinate tap at Cancel button position.
 */
function flowYaml(s: ScreenEntry): string {
  const isModal = s.route === 'Modal';

  // Modal needs a coord-tap fallback because ModalScreen auto-opens an overlay that
  // blocks BackButton in the accessibility tree. For other screens BackButton alone works.
  const resetLines = isModal
    ? [
        `# Reset: try BackButton first; if ModalScreen overlay is blocking it, close it first`,
        `- tapOn:`,
        `    id: "BackButton"`,
        `    optional: true`,
        `- waitForAnimationToEnd`,
        `- runFlow:`,
        `    when:`,
        `      notVisible:`,
        `        id: "screen-Home"`,
        `    commands:`,
        `      # Cancel bounds on iPhone 17 Pro: [162,477][255,517] → centre (208,497) → 53%,58%`,
        `      - tapOn:`,
        `          point: "53%, 58%"`,
        `      - waitForAnimationToEnd`,
        `      - tapOn:`,
        `          id: "BackButton"`,
        `          optional: true`,
        `      - waitForAnimationToEnd`,
      ]
    : [
        `# Reset to the Components list from wherever the app currently is.`,
        `- repeat:`,
        `    while:`,
        `      notVisible:`,
        `        id: "screen-Home"`,
        `    commands:`,
        `      - tapOn:`,
        `          id: "BackButton"`,
        `          optional: true`,
        `      - waitForAnimationToEnd`,
      ];

  // Modal auto-opens modal-open-default (defaultOpen:true) on mount. The overlay
  // blocks the accessibility tree (screen-Modal unreachable) until dismissed.
  // Label-based tap doesn't reach onPress in RN Modal portal UIWindows on iOS 26
  // even with disableAnimations:true — coordinate tap is required.
  const postNavigateLines = isModal
    ? [
        `# ModalScreen auto-opens modal-open-default overlay on mount;`,
        `# dismiss it with a coord tap before asserting screen-Modal.`,
        `- waitForAnimationToEnd`,
        `- tapOn:`,
        `    point: "53%, 58%"`,
        `- waitForAnimationToEnd`,
      ]
    : [];

  const lines: string[] = [
    `# Auto-generated by visual/generate.mts — navigation only (capture is done`,
    `# by capture-crop.mts, which crops each section from the screencap).`,
    `appId: ${APP_ID}`,
    `---`,
    ...resetLines,
    `- extendedWaitUntil:`,
    `    visible:`,
    `      id: "screen-Home"`,
    `    timeout: 20000`,
    `# The Components list is a FlatList; lower items are virtualised/off-screen.`,
    `# Reset it to the top, then scroll the target nav item into view before tapping.`,
    `# Note: accessibilityLabel on Pressable items makes text='' on iOS — use id: selectors.`,
    `- scrollUntilVisible:`,
    `    element:`,
    `      id: "nav-Avatar"`,
    `    direction: UP`,
    `    timeout: 8000`,
    `    optional: true`,
    `- scrollUntilVisible:`,
    `    element:`,
    `      id: "nav-${s.route}"`,
    `    direction: DOWN`,
    `    timeout: 45000`,
    `- tapOn:`,
    `    id: "nav-${s.route}"`,
    ...postNavigateLines,
    `- extendedWaitUntil:`,
    `    visible:`,
    `      id: "${s.screenTestId}"`,
    `    timeout: 20000`,
    `# Make sure we start at the very top of the screen.`,
    `- scrollUntilVisible:`,
    `    element:`,
    `      id: "${s.sections[0].id}"`,
    `    direction: UP`,
    `    timeout: 8000`,
    `    optional: true`,
  ];
  return lines.join('\n') + '\n';
}

for (const s of screens) {
  writeFileSync(join(FLOWS_DIR, `${s.route}.yaml`), flowYaml(s));
}

const totalSections = screens.reduce((n, s) => n + s.sections.length, 0);
console.log(
  `Generated ${screens.length} flows (${totalSections} section checkpoints):\n` +
    screens.map((s) => `  • ${s.route} — ${s.sections.length} sections`).join('\n'),
);
