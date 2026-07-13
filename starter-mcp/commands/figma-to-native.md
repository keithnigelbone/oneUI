---
name: figma-to-native
description: Turn a Figma frame into a @oneui/ui-native React Native screen, certify it, then visually verify it. Runs figma_to_code(codegen=true) (extract → refine → download assets → codegen .native.tsx), then validate_oneui_code self-healing until clean, then builds/screenshots the screen and hand-authors fixes for any mismatch against the Figma frame. Manual-only because it spawns the figma-console child MCP and requires Figma Desktop + the Bridge plugin connected and FIGMA_ACCESS_TOKEN set.
disable-model-invocation: true
---

# /oneui:figma-to-native

Figma frame → `@oneui/ui-native` screen, written to disk, validated, and visually verified
against the Figma frame. Full mapping semantics, self-heal rules, and the build/screenshot/
hand-fix loop live in the `figma-to-native` skill — invoke it for this command; this file is
just the entry point and step order.

## Prerequisites (state them if missing)
- **Figma Desktop** open with the target file, and the **Console/Bridge plugin connected**.
- **`FIGMA_ACCESS_TOKEN`** set in the MCP environment (needed to download image assets).
- Only ONE figma-console MCP running — `figma_to_code` spawns its own child; a standalone one competes for the bridge port (9223–9232).
- A React Native (Expo) project with `@oneui/ui-native` installed and an `oneui.brands.json`.
- A running emulator/simulator (or one you can launch) for the build/screenshot step.

## Flow
1. **`figma_to_code`** (server `oneui`) with:
   - `figmaUrl` (must include `?node-id=...`), `platform: "reactnative"`, `brand`, `subBrand`,
   - `codegen: true` (always — this is the default; `codegen: false` extract-only/hand-author
     is a distinct path, only when the user explicitly asks for manual authoring),
   - `outDir` (default `src/screens`), `route: true` to also emit the expo-router route, and
     `setIndex: true` so the app boots straight into the new screen for screenshotting.
   - This extracts the design (component props + resolved appearance/surface Modes + text + token layout), downloads image assets into `assetsDir`, and writes `<ScreenName>.native.tsx`.
2. **Read the codegen warnings** in the result and the refined tree — fix anything flagged (unknown props, skipped surface modes, blank images).
3. **`validate_oneui_code(<file contents>, platform: "reactnative")`** — the lint gate.
4. **Self-heal** — fix `unknown-prop`, `literal-color`, forbidden-primitive, banned-icon issues; re-validate until "All clear".
5. Confirm the app wraps the tree in `<OneUIBrandProvider brand="..." theme="<subBrand>">`.
6. **Build, screenshot, compare, hand-fix (mandatory).** A clean validate result only means
   the code won't crash — it says nothing about whether the screen matches the design. Build
   the app, screenshot the running screen, fetch the Figma reference for the same node-id,
   enumerate concrete visual mismatches (surface/appearance, colour roles, clipped content,
   missing scrims, spacing, icons/images, typography), and hand-author fixes directly in the
   generated `.native.tsx` — re-validating after each edit. Repeat build → screenshot →
   compare → fix until the rendered screen and the Figma frame agree. **Completion contract:**
   cap at 5 iterations; if not converged, report `NEEDS_HUMAN_INPUT` with the specific
   blockers instead of silently declaring the task done. See the `figma-to-native` skill's
   "Build, screenshot & hand-fix loop" (step 7, "Completion contract") for the full procedure
   and the list of legitimate vs forbidden blockers. If the same mismatch shows up across
   multiple screens, fix it in the pipeline (`starter-mcp/src/lib/figmaCodegen.ts`) instead of
   patching every screen individually.

## Inputs the user gives inline
- The Figma URL (required).
- `brand` / `subBrand` (required) — e.g. `jio` / `jiomart`. `subBrand` is the `theme` prop.
- Screen name (optional — defaults to the Figma node name).

## Returns
Path(s) written (`.native.tsx` + route), components used, the validation result, and the
outcome of the build/screenshot/compare pass (matched, or what was hand-fixed and why).

## Known limits (see CODEGEN-GAP-REPORT.md)
Images need an authorized `FIGMA_ACCESS_TOKEN`; typography hierarchy and corner radius are
partially extracted. Do not skip step 6 — a clean `validate_oneui_code` result is not a
substitute for looking at the rendered screen next to the Figma frame.

## Related
- `/oneui:validate` — re-run the lint gate only (not the visual check).
- `figma_to_code` MCP tool (this command's engine).
- `figma-to-native` skill — full mapping semantics + the build/screenshot/hand-fix loop.
