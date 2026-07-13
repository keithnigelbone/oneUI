# OneUI Native — React Native Testing Framework

> **QA Policy:** All test files live under `apps/qa-playground/native/`. QA does not modify source files in `packages/ui-native/` — bug fixes in dev files are raised as separate issues.

---

## Overview

The native testing framework validates the `@oneui/ui-native` React Native component library across two complementary layers:

| Layer | Tool | What it validates |
|---|---|---|
| **Unit / Component (Tier 1–3)** | Vitest + React Native Testing Library (RNTL) | Component rendering, prop behaviour, event wiring, accessibility tree |
| **End-to-End / iOS (Tier 4)** | Maestro | Real simulator: navigation, tap interactions, visual presence on screen |

RNTL runs entirely in Node.js — no simulator needed. Maestro drives a live booted iOS simulator using the Expo dev build.

---

## Repository Structure

```
apps/qa-playground/native/
├── tests/                        ← RNTL unit test files (one folder per component)
│   ├── Avatar/
│   │   └── Avatar.test.tsx
│   ├── Button/
│   │   └── Button.test.tsx
│   ├── Chip/
│   │   └── Chip.test.tsx
│   ├── ChipGroup/
│   │   └── ChipGroup.test.tsx
│   ├── Divider/
│   │   └── Divider.test.tsx
│   ├── Text/
│   │   └── Text.test.tsx
│   ├── Badge/
│   │   └── Badge.test.tsx
│   ├── CounterBadge/
│   │   └── CounterBadge.test.tsx
│   ├── IndicatorBadge/
│   │   └── IndicatorBadge.test.tsx
│   ├── BottomNavigationItem/
│   │   └── BottomNavigationItem.test.tsx
│   └── IconButton/
│       └── IconButton.test.tsx
│
├── utils/
│   └── renderWithTheme.tsx       ← wraps components in OneUINativeThemeProvider
│
├── e2e/
│   └── maestro/
│       ├── _helpers/
│       │   └── _setup.yaml       ← shared setup subflow (called by every flow)
│       ├── button.yaml
│       ├── chip.yaml
│       ├── chip-group.yaml
│       ├── avatar.yaml
│       ├── badge.yaml
│       ├── counter-badge.yaml
│       ├── indicator-badge.yaml
│       ├── divider.yaml
│       ├── text.yaml
│       ├── bottom-navigation-item.yaml
│       └── test-results/
│           ├── results.xml        ← JUnit XML output (Maestro)
│           └── maestro-report.html ← generated HTML report
│
├── test-results/
│   ├── native-all.json            ← Vitest JSON output (auto-generated)
│   ├── native-report.html         ← generated HTML report (unit tests)
│   ├── trees/                     ← component tree dumps on test failure
│   ├── metro.log                  ← Metro bundler log (E2E runs)
│   └── convex.log                 ← Convex local backend log (E2E runs)
│
├── scripts/
│   └── run-maestro-ios.sh         ← full E2E orchestration script
│
├── vitest.config.ts
└── vitest.setup.ts
```

---

## Test Tiers

### Tier 1 — Smoke `[smoke]`

Verifies the component renders without crashing and accepts its core props.

```
[smoke] renders without crashing
[smoke] renders label text
[smoke] disabled prop accepted without crash
```

### Tier 2 — Functional `[fn]`

Verifies prop-to-output mapping, event handler wiring, and state transitions.

```
[fn] fires onPress when tapped
[fn] does not fire onPress when disabled
[fn] selected state reflected in accessibilityState
[fn] single-select: only one chip active at a time
```

### Tier 3 — Accessibility `[a11y]`

Verifies the accessibility tree seen by iOS VoiceOver / Android TalkBack.

```
[a11y] role="button" queryable by getByRole
[a11y] aria-label maps to accessibilityLabel
[a11y] disabled state in accessibilityState
```

### Tier 4 — E2E iOS (Maestro)

Verifies the full app stack — Metro + Convex + navigation + real tap interactions on the iOS simulator.

---

## Prerequisites

### For RNTL unit tests (Tiers 1–3)

- Node.js ≥ 18
- pnpm installed
- Dependencies installed: `pnpm install` from repo root

### For Maestro E2E (Tier 4)

- macOS with Xcode installed
- A booted iOS simulator (open Simulator.app or `xcrun simctl boot <udid>`)
- `com.oneui.nativecomponents` installed on the simulator (run `pnpm dev:native:ios` once)
- Maestro CLI: `curl -Ls https://get.maestro.mobile.dev | bash`
- Java 17: `brew install openjdk@17`

Verify prerequisites:
```bash
maestro --version              # should print ≥ 1.37
java -version                  # should print openjdk 17
xcrun simctl list devices booted  # should show at least one booted simulator
```

---

## Running Tests

### RNTL Unit Tests (Tiers 1–3)

**Run all unit tests (terminal output only):**
```bash
pnpm --filter @oneui/qa-playground qa:native:test
```

**Run all unit tests and generate the JSON report:**
```bash
pnpm --filter @oneui/qa-playground qa:native:report
```

**Run all unit tests and open the HTML report:**
```bash
pnpm --filter @oneui/qa-playground qa:native:report:html
```

This builds the JSON, generates `native-report.html`, and opens it automatically in your browser.

**Run in watch mode with Vitest UI (interactive browser):**
```bash
cd apps/qa-playground/native
node ../../../node_modules/.bin/vitest --ui
```
Then open `http://localhost:51204/__vitest__/` in your browser. Provides live pass/fail indicators and component tree inspection on failure.

---

### Maestro E2E Tests — iOS (Tier 4)

**Run all 10 flows end-to-end:**
```bash
pnpm qa:native:e2e:ios
```

This single command does everything automatically:

1. Starts a local Convex backend on port 3210 (avoids cloud SSL issues in the simulator)
2. Seeds it with brand theme data
3. Patches `.env.local` to point the app at the local Convex
4. Starts Metro bundler with a fresh cache (`--clear`) so the local Convex URL is baked in
5. Launches `com.oneui.nativecomponents` on the booted simulator
6. Waits 90 seconds for the JS bundle download + brand theme load
7. Runs all Maestro flows and writes JUnit XML to `test-results/results.xml`
8. Stops Metro + Convex and restores `.env.local` on exit

**Generate the Maestro HTML report from the last run:**
```bash
pnpm --filter @oneui/qa-playground qa:native:e2e:report:html
```

Opens `apps/qa-playground/native/e2e/maestro/test-results/maestro-report.html` automatically.

> **Note:** Generate the HTML report after `qa:native:e2e:ios` completes. If the XML file does not exist yet the report script will exit with an error.

---

## Viewing Reports

### RNTL HTML Report

**File:** `apps/qa-playground/native/test-results/native-report.html`

Open manually:
```bash
open apps/qa-playground/native/test-results/native-report.html
```

The report shows:
- Pass / fail status per test, grouped by component and tier (`[smoke]` / `[fn]` / `[a11y]`)
- On failure: the full React Native component tree dump (from `screen.debug()`) so you can see exactly which props or elements were missing
- Run timestamp and total counts

### Maestro E2E HTML Report

**File:** `apps/qa-playground/native/e2e/maestro/test-results/maestro-report.html`

Open manually:
```bash
open apps/qa-playground/native/e2e/maestro/test-results/maestro-report.html
```

The report shows:
- Pass / fail per flow with duration
- Flow name maps to component (e.g. `button.yaml` → Button component)
- On failure: the failure message from Maestro (e.g. `"Assertion is false: 'Components' is visible"`)

> **Screenshots on failure:** Maestro automatically captures screenshots at the point of failure. They are saved to `~/.maestro/tests/<run-id>/screenshots/`. The HTML report links to the failure message; screenshots must be retrieved from that path manually.

### Raw JSON Report (for CI / scripting)

**File:** `apps/qa-playground/native/test-results/native-all.json`

Vitest JSON format. Contains every test name, duration, pass/fail status, and error messages. Used by the ingest script to feed the QA playground dashboard.

---

## Quick-Reference Command Table

| Goal | Command |
|---|---|
| Run RNTL unit tests (terminal) | `pnpm --filter @oneui/qa-playground qa:native:test` |
| Run RNTL + generate HTML report | `pnpm --filter @oneui/qa-playground qa:native:report:html` |
| Open RNTL HTML report | `open apps/qa-playground/native/test-results/native-report.html` |
| Run RNTL in interactive UI mode | `cd apps/qa-playground/native && node ../../../node_modules/.bin/vitest --ui` |
| Run Maestro E2E (iOS) | `pnpm qa:native:e2e:ios` |
| Generate Maestro HTML report | `pnpm --filter @oneui/qa-playground qa:native:e2e:report:html` |
| Open Maestro HTML report | `open apps/qa-playground/native/e2e/maestro/test-results/maestro-report.html` |
| Ingest results into QA dashboard | `pnpm --filter @oneui/qa-playground ingest:native` |

---

## How RNTL Works (No Simulator Needed)

RNTL renders the React Native component tree in Node.js using a mock of the native bridge. The test assertions query the **React element tree** — not pixels — so the following works without a device or simulator:

| What RNTL validates | How |
|---|---|
| Component renders without crash | `expect(() => render(...)).not.toThrow()` |
| Text content present | `screen.getByText('Label')` |
| Accessibility role | `screen.getByRole('button')` |
| Accessibility label | `screen.getByLabelText('Close')` |
| Disabled state | `element.props.accessibilityState.disabled === true` |
| Event handler fires | `fireEvent.press(element); expect(handler).toHaveBeenCalled()` |
| Event blocked when disabled | `fireEvent.press(element); expect(handler).not.toHaveBeenCalled()` |

**What RNTL does NOT validate** (Maestro E2E covers this):
- Visual layout and pixel rendering
- Platform-specific behaviour (iOS haptics, Android ripple)
- Real touch gesture handling (scroll, swipe, long-press)
- Animation timing
- Full navigation stack

---

## How Maestro E2E Works

Maestro drives the real iOS simulator via the accessibility tree. Each YAML flow:

1. Calls `_helpers/_setup.yaml` which handles the Expo dev-client welcome dialog and waits up to 120 seconds for the brand theme to load
2. Navigates to the target component's showcase screen from the Components list
3. Asserts that key UI elements are visible and/or interactive
4. Does NOT use `launchApp` — flows share the already-running app to avoid the cold-start blank-screen problem

The shared setup flow (`_setup.yaml`) handles:
- Dismissing the Expo dev-client "Continue" welcome dialog (first run only)
- Tapping "Reload" to dismiss the dev menu and reload the JS bundle
- Waiting up to 120 seconds for "Components" to be visible (accounts for the brand theme Convex query)
- Navigating back to the Components list if a detail screen is open

---

## Components Under Test

| Component | RNTL (Tiers 1–3) | Maestro E2E | Priority |
|---|---|---|---|
| Button | ✅ | ✅ | P0 |
| Chip | ✅ | ✅ | P0 |
| ChipGroup | ✅ | ✅ | P0 |
| BottomNavigationItem | ✅ | ✅ | P0 |
| Avatar | ✅ | ✅ | P1 |
| Badge | ✅ | ✅ | P1 |
| CounterBadge | ✅ | ✅ | P1 |
| IndicatorBadge | ✅ | ✅ | P1 |
| Divider | ✅ | ✅ | P1 |
| Text | ✅ | ✅ | P1 |
| IconButton | ✅ | — | P1 |
| Icon | — | — | ⚠️ No native implementation |

---

## Known Issues / Open Bugs

| # | Description | Impact |
|---|---|---|
| 1 | `componentTokenOverrides:getAllBrandComponentData` takes ~52 seconds on local Convex | E2E setup requires a 120s wait; flows are slow to start |
| 2 | Cloud Convex WebSocket (WSS) fails in iOS simulator with SSL error -9807 | E2E must use local Convex backend — cloud URL cannot be used |
| 3 | `ComponentsStack` sets `initialRouteName='Detail'` — app opens on Button detail screen, not the list | Every flow must navigate back from Button detail to reach the Components list |
| 4 | `nativeRegistry.ts` marks `Icon` as `hasNativeImpl: true` but no implementation exists in `packages/ui-native/` | Icon cannot be tested until the implementation is shipped |

---

## Adding a New Component Test

### RNTL Test

1. Create `apps/qa-playground/native/tests/<ComponentName>/<ComponentName>.test.tsx`
2. Import the component via the `@ui-native` alias: `import { MyComponent } from '@ui-native/components/MyComponent/MyComponent.native'`
3. Wrap it with the theme helper: `render(wrap(<MyComponent />))`
4. Follow the `[smoke]` / `[fn]` / `[a11y]` tag convention so the HTML report groups tests correctly

### Maestro Flow

1. Create `apps/qa-playground/native/e2e/maestro/<component-name>.yaml`
2. Start with:
   ```yaml
   appId: com.oneui.nativecomponents
   ---
   - runFlow: ./_helpers/_setup.yaml
   - assertVisible: "Components"
   - tapOn: "<Component display name>"
   ```
3. Run `pnpm qa:native:e2e:ios` — the script picks up all YAML files in the `maestro/` directory automatically
