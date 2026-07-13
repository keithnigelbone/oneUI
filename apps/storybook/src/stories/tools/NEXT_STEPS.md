# Performance tool — next steps

Living doc for the `Tools/Performance` Storybook page. Update as items land.

## Known good

- Multi-component checkbox grid, 18 registered components.
- Sweep loop: start / end / step / iterations / warmup with cancel support.
- Three timing signals per iteration: wall-clock around `flushSync`, summed Profiler `actualDuration`, summed `commitTime − startTime`.
- Both mount and update phases measured per iteration (mount via Profiler-boundary remount; update via `tick` prop change).
- Stats: avg / median / p95 / stddev, dropped warmup, GC pause between steps.
- Power-law fit + complexity classification per component.
- Inline SVG line chart (no external chart dep). Phase selector, Y-metric selector, Log X / Log Y.
- CSV export with paired mount + update columns and run metadata header.

## Open items

### 1. Validate the Profiler-key fix end-to-end

The Profiler's `key` is now on the `Profiler` boundary, not the child `div`. This makes React report `phase='mount'` for each remount. **Re-run Button 1→1000 step 50 and confirm mount numbers grow with N.** If still flat at the clamp floor (0.05–0.5ms), the next thing to check is whether `flushSync` is genuinely committing inside the Profiler subtree — instrument by logging every `onRender` call's phase, count, and duration to the console for one step.

### 2. IconButton appears slower than Button + Icon individually

Observed: IconButton ~10ms where Button alone ~4-5ms and Icon alone ~4-5ms at similar N. Worth investigating whether this is real overhead or a measurement artifact:

- **Likely real:** IconButton renders Button base + Icon child, so it should be ~ Button + Icon. 10ms ≈ 5 + 5 = additive. Not a regression, just a composition cost.
- **Possible Storybook side effect:** the `@oneui/ui/icons/Icon` resolver hits an icon-data JSON; first paint per icon name can incur a synchronous map lookup. If we always render the same icon name across N instances, the cost should amortize, but cold lookups on the first iteration could inflate the sample. Check whether `iconsByName` caches across mounts.
- **Verify with the SingleTextButton entry** (no icon) — if it tracks Button closely, the icon-side composition is the cost, not a Button regression.

Action: add `useICountdown` or just a small console.timeline marker around IconButton's render to see where the 10ms goes.

### 3. StrictMode double-mount

The warning banner detects React StrictMode (two mount commits within 50ms). Storybook 10's default preview wraps stories in StrictMode in dev, which doubles every mount commit and inflates measurements by ~2×. Options:

- Tell users to read the warning banner and divide mount results by 2 mentally — easiest.
- Add a story-level `parameters: { strictMode: false }` if Storybook 10 supports that — would mean accurate mount numbers in the live preview.
- Build a "Production build profile" option that runs the test under a non-StrictMode subtree using a `<NoStrictMode>` workaround. React doesn't expose a real way to opt out mid-tree, so this is a rabbit hole.

Lowest effort: just document the 2× inflation in the description text and trust the user to read it.

### 4. Per-component default props

Some entries in `componentRegistry.tsx` are minimal. The numbers are only as honest as the props we pass. Worth a pass to use "realistic" defaults — e.g., Button with `appearance="primary" variant="bold" size={10} + children` is fine; Slider with one thumb is light; Slider with three thumbs + ticks + labels is the heavier real-world case. Consider adding **prop presets** (`Button minimal` vs `Button realistic`) per component so we can measure baseline vs production-realistic cost.

### 5. Surface-context cost as a separate test

We removed the Surface-mode picker for the raw-component pass. The original question that motivated this tool — "does nested Surface context add a tax?" — is still unanswered. Build a separate test page (`Tools/Surface depth`) that measures the cost of rendering N components at Surface nesting depths 0 / 1 / 2 / 4 / 8. Different controls, different chart shape. Don't fold it back into the main perf page.

### 6. Brand CSS recompute perf

Orthogonal to component rendering but in the same family of concerns. Measure:
- Cold `useBrandCSS` pipeline (no memo) — should be <10ms per CLAUDE.md.
- Brand switch round-trip — should be <5ms.

Belongs as a third tool entry (`Tools/Brand CSS perf`) with a different harness (no Profiler — direct `performance.now()` brackets around `precomputeBrandCSSNew`). Reuses the same chart + CSV infrastructure.

### 7. Regression gate

Eventually this tool should produce numbers that can be saved as baselines and compared on PRs. Two ways:

- **Manual:** export CSV from main, save as `bench/perf-baseline.csv`, manual diff on PR.
- **CI:** automate via `pnpm bench:components` running headless Storybook with Playwright, dumping JSON, comparing vs baseline with a tolerance. Belongs after the tool stabilises.

### 8. Tooltip / Popover / Dialog / Select / Tabs / Radio in the registry

Skipped in the current pass — they need portals, composite children, or wrapper groups that distort the N semantics. Worth adding once we have a "per-component config" mechanism that knows how to render each correctly.

### 9. Profile `iterations` cost itself

At 50 iterations × 30 steps × 5 components = 7,500 commits per run. The tool itself takes meaningful time. Worth a `Run estimated time: ~Xs` indicator before the user clicks Run.

## Operational

- **Branch:** `performance-tool-addition`.
- **Files:** `apps/storybook/src/stories/tools/` — Performance.stories.tsx, PerformanceTool.tsx, PerformanceTool.module.css, useScalability.ts, componentRegistry.tsx, stats.ts, csvExport.ts, LineChart.tsx.
- **Local run:** `pnpm storybook` then open `Tools/Performance`.
- **Typecheck:** clean for these files. Pre-existing errors in `packages/ui` are unrelated.
