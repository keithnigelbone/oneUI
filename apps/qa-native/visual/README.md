# qa-native · Applitools visual tests (per-section)

Captures **one Applitools checkpoint per section** of every component screen in
`src/screens/components/`, cropped tightly to that section (heading included),
and uploads to Applitools. Driver: **Maestro** (navigation + scroll on Expo Go)
→ **adb** screencaps → **sharp** crops → **Applitools Eyes Images SDK** upload.

Each screen is uploaded **as soon as its capture finishes**, so results appear
on the dashboard progressively, and the run prints live execution status.

---

## Setup (once per shell)

```bash
cd apps/qa-native
export APPLITOOLS_API_KEY=<your-applitools-key>
```

Prerequisites:
- Metro running with the app loaded in **Expo Go** on a booted Android emulator
  (`pnpm --filter @oneui/qa-native dev`).
- **Maestro CLI** + a JDK, and Android **adb** (the `capture.sh` wrapper adds
  these to `PATH`).
- `APPLITOOLS_API_KEY` exported (uploads target `jioeyes.applitools.com` by
  default; override with `APPLITOOLS_SERVER_URL`).

---

## Commands

### Most common

| Goal | Command |
| --- | --- |
| **Everything** — all 22 screens, capture + upload (interleaved, with logs) | `pnpm visual` |
| **One screen** — capture + upload, appears on the dashboard as it finishes | `pnpm visual:run Button` |
| **A few screens** | `pnpm visual:run Button Input Text` |

### Individual stages

| Stage | Command | What it does |
| --- | --- | --- |
| Generate | `pnpm visual:gen` | Rebuild Maestro flows + `manifest.json` from the screens (run once, or after editing screens). |
| Capture only (no upload) | `pnpm visual:capture` | All screens → cropped PNGs in `visual/screenshots/`. |
| Capture only, one screen | `pnpm visual:capture Button` | |
| Capture + upload (interleaved) | `pnpm visual:run` | All screens; uploads each as it finishes. |
| Upload only (from saved PNGs) | `pnpm visual:upload` | Re-upload everything already captured. |
| Upload only, one screen | `pnpm visual:upload Button` | |

### Typical flows

```bash
# Full run (first time / clean run):
pnpm visual

# Iterate on one component:
pnpm visual:run Button

# Re-capture locally without touching Applitools, inspect, then upload:
pnpm visual:capture Button      # check visual/screenshots/
pnpm visual:upload  Button
```

---

## Notes

- `pnpm visual` = `visual:gen` then `visual:run` (capture + per-screen upload).
- `visual:run` and `visual:upload` require `APPLITOOLS_API_KEY`; `visual:capture`
  does not.
- Each screen takes ~60–90s (navigate → scroll → crop → upload). The logs print
  per-screen progress, each section's size and full/partial status, the upload
  status + dashboard URL, per-screen timing, and a final summary.
- Results land in the Applitools batch **"OneUI qa-native — RN component
  sections"**. The first run of a screen creates new baselines (`Passed`); a
  screen with existing baselines shows `Unresolved` until you accept the new
  images.
- Section lists are derived from the screens (the `screen-<Name>` /
  `section-*` testIDs) — adding a section auto-adds a checkpoint. The
  `CombinationsRules/*` files describe the same sections for reference.

### Known limitation — tall sections

A handful of sections are **taller than the phone viewport** and are captured
with the heading + visible top (bottom clipped); the logs mark these `partial`
(`taller than viewport`). Currently: `CheckboxField/appearances`,
`Image/aspect-ratios`, `Image/interactive`, `Input/slots`, `Text/sizes`. Full
capture of these needs vertical **stitching** (scroll the section in slices and
join them) — not yet implemented.

---

## Files

| File | Role |
| --- | --- |
| `generate.mts` | Scans screens → `manifest.json` + navigation-only Maestro `flows/<route>.yaml`. |
| `capture.sh` | Wrapper: sets `PATH` (Maestro/JDK/adb) and runs `capture-crop.mts`. Forwards args (`--upload`, screen names). |
| `capture-crop.mts` | Navigates (Maestro), scrolls (adb), reads section bounds (`maestro hierarchy`), crops (sharp), and—with `--upload`—uploads each screen (Eyes Images SDK). |
| `upload.mts` | Standalone uploader for already-captured PNGs. |
| `manifest.json`, `flows/`, `screenshots/` | Generated artifacts (git-ignored). |
