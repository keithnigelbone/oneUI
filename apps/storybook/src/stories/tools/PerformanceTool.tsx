/**
 * PerformanceTool.tsx
 *
 * Production-grade performance measurement harness for OneUI components.
 * Sweeps an instance-count range for one or more selected components and
 * records BOTH mount and update timings in a single run, each with three
 * independent signals (profiler-sum, commit-delta, wall-clock).
 *
 * Mount commits use `flushSync(setProfilerKey)`; update commits use
 * `flushSync(setTick)`. Wall-clock brackets the flushSync call alone, so
 * the reading reflects real React commit cost (no ~16ms rAF floor).
 */

import { Profiler, useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { Select } from '@oneui/ui/components/Select';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { InputField } from '@oneui/ui/components/Input';
import { Surface } from '@oneui/ui/components/Surface';

import {
  useScalability,
  type RunConfig,
  type ComponentResults,
  type StepResult,
  type RunMetadata,
  type PhaseStats,
} from './useScalability';
import {
  getAllTestComponents,
  getComponentById,
  LIBRARY_LABELS,
  PERF_LIBRARY_ORDER,
  registerOptionalPerfComponents,
  groupPerfPickerRows,
  collectEquivalentCandidateIds,
  type LibraryId,
} from './componentRegistry';
import { loadOptionalPerfRegistries } from './optionalPerfRegistries';
import { fitPowerLaw } from './stats';
import { LineChart, type ChartSeries, type OverheadBand } from './LineChart';
import { buildCsv, downloadCsv } from './csvExport';
import styles from './PerformanceTool.module.css';

type Phase = 'mount' | 'update';
type YMetric = 'wall' | 'profiler' | 'commit';

const PHASE_OPTIONS: ReadonlyArray<{ value: Phase; label: string }> = [
  { value: 'mount', label: 'Mount' },
  { value: 'update', label: 'Update' },
];

const Y_METRIC_OPTIONS: ReadonlyArray<{ value: YMetric; label: string }> = [
  { value: 'wall', label: 'Wall clock (most honest)' },
  { value: 'profiler', label: 'Profiler actualDuration sum' },
  { value: 'commit', label: 'commit − start delta' },
];

/**
 * Golden-angle palette producing visually distinct hues for an arbitrary
 * number of series. OkLCH so the colours sit on the same perceptual
 * lightness/chroma plane (consistent in light AND dark mode).
 */
function paletteColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `oklch(60% 0.18 ${hue.toFixed(2)})`;
}

interface NumericFieldProps {
  label: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

function NumericField({ label, value, min, onChange, disabled }: NumericFieldProps) {
  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>{label}</span>
      <InputField
        value={String(value)}
        onChange={(v) => {
          const parsed = parseInt(v, 10);
          if (!isNaN(parsed) && parsed >= min) onChange(parsed);
          else if (v === '') onChange(min);
        }}
        size={8}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}

function pickPhase(r: StepResult, phase: Phase): PhaseStats {
  return phase === 'mount' ? r.mount : r.update;
}

function pickStepValue(r: StepResult, phase: Phase, metric: YMetric): number {
  const ph = pickPhase(r, phase);
  if (metric === 'wall') return ph.wallMs;
  if (metric === 'commit') return ph.commitMs;
  return ph.profilerMs;
}

const Passthrough: FC<{ children: React.ReactNode }> = ({ children }) => children;

// OneUI components that directly wrap a Base UI primitive. The Base UI
// counterpart's render cost is the structural FLOOR for OneUI's equivalent
// (OneUI = Base UI + styling + surface/brand context). The chart draws a
// translucent band between each pair so the visual gap reads as "what the
// OneUI layer is adding on top of the bare primitive".
//
// Pairs NOT in this map (Badge, Avatar, Text, Chip, Icon, etc.) are
// excluded because OneUI builds them without a Base UI primitive — no
// fair floor reference exists.
const ONEUI_TO_BASEUI_FLOOR: ReadonlyArray<{ oneui: string; baseui: string }> = [
  { oneui: 'button', baseui: 'baseui:button' },
  { oneui: 'checkbox', baseui: 'baseui:checkbox' },
  { oneui: 'switch', baseui: 'baseui:switch' },
  { oneui: 'slider', baseui: 'baseui:slider' },
  { oneui: 'progress', baseui: 'baseui:progress' },
  { oneui: 'toggle', baseui: 'baseui:toggle' },
  { oneui: 'divider', baseui: 'baseui:separator' },
];

export function PerformanceTool() {
  const [registryEpoch, setRegistryEpoch] = useState(0);
  const [MantineRoot, setMantineRoot] = useState<FC<{ children: React.ReactNode }>>(() => Passthrough);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(['button']);
  const [libraryFilter, setLibraryFilter] = useState<Set<LibraryId>>(
    () => new Set(['oneui']),
  );
  const [startCount, setStartCount] = useState(1);
  const [endCount, setEndCount] = useState(100);
  const [step, setStep] = useState(5);
  const [iterations, setIterations] = useState(30);
  const [warmup, setWarmup] = useState(3);
  const [logX, setLogX] = useState(false);
  const [logY, setLogY] = useState(false);
  const [phase, setPhase] = useState<Phase>('mount');
  const [yMetric, setYMetric] = useState<YMetric>('wall');
  const [lastMeta, setLastMeta] = useState<RunMetadata | null>(null);
  const [chartFullscreen, setChartFullscreen] = useState(false);
  const [chartHiddenSeriesIds, setChartHiddenSeriesIds] = useState<Set<string>>(() => new Set());

  const runner = useScalability();

  useEffect(() => {
    void (async () => {
      try {
        const mc = await import('@mantine/core');
        await import('@mantine/core/styles.css');
        function MantineWrap({ children }: { children: React.ReactNode }) {
          return <mc.MantineProvider>{children}</mc.MantineProvider>;
        }
        setMantineRoot(() => MantineWrap);
      } catch {
        /* @mantine/core missing — optional Mantine perf entries stay unloaded */
      }
      try {
        const optional = await loadOptionalPerfRegistries();
        registerOptionalPerfComponents(optional);
        setLibraryFilter((prev) => {
          const next = new Set(prev);
          for (const e of optional) next.add(e.library);
          return next;
        });
        setRegistryEpoch((n) => n + 1);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const libraryOptions = useMemo(() => {
    const present = new Set<LibraryId>();
    for (const c of getAllTestComponents()) present.add(c.library);
    return PERF_LIBRARY_ORDER.filter((id) => present.has(id));
  }, [registryEpoch]);

  const toggleComponent = useCallback((id: string) => {
    setSelectedComponentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleLibrary = useCallback((lib: LibraryId) => {
    setLibraryFilter((prev) => {
      const next = new Set(prev);
      if (next.has(lib)) next.delete(lib);
      else next.add(lib);
      return next;
    });
  }, []);

  const visibleComponents = useMemo(
    () => getAllTestComponents().filter((c) => libraryFilter.has(c.library)),
    [libraryFilter, registryEpoch],
  );

  const pickerRows = useMemo(() => groupPerfPickerRows(visibleComponents), [visibleComponents]);

  const equivalentCandidates = useMemo(
    () => collectEquivalentCandidateIds(selectedComponentIds, libraryFilter),
    [selectedComponentIds, libraryFilter, registryEpoch],
  );

  const addAllEquivalents = useCallback(() => {
    setSelectedComponentIds((prev) => [...new Set([...prev, ...equivalentCandidates])]);
  }, [equivalentCandidates]);

  const addSingleEquivalent = useCallback((id: string) => {
    setSelectedComponentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const clearComponentSelection = useCallback(() => {
    setSelectedComponentIds([]);
  }, []);

  const selectEntireRow = useCallback((row: { items: { id: string }[] }) => {
    setSelectedComponentIds((prev) => {
      const next = new Set(prev);
      for (const c of row.items) next.add(c.id);
      return [...next];
    });
  }, []);

  const canRun = selectedComponentIds.length > 0 && !runner.isRunning;

  const handleRun = useCallback(async () => {
    if (selectedComponentIds.length === 0) return;
    const cfg: RunConfig = {
      componentIds: selectedComponentIds,
      startCount: Math.max(1, startCount),
      endCount: Math.max(startCount, endCount),
      step: Math.max(1, step),
      iterations: Math.max(1, iterations),
      warmupIterations: Math.max(0, warmup),
    };
    const labels: Record<string, string> = {};
    for (const id of selectedComponentIds) {
      labels[id] = getComponentById(id).label;
    }
    setLastMeta({ ...cfg, timestamp: new Date().toISOString() });
    await runner.start(cfg, labels);
  }, [selectedComponentIds, startCount, endCount, step, iterations, warmup, runner]);

  const handleExport = useCallback(() => {
    if (!lastMeta || runner.results.length === 0) return;
    const csv = buildCsv(lastMeta, runner.results);
    const ts = lastMeta.timestamp.replace(/[:.]/g, '-');
    const slug =
      lastMeta.componentIds.length === 1
        ? lastMeta.componentIds[0]
        : `multi-${lastMeta.componentIds.length}`;
    downloadCsv(`oneui-perf-${slug}-${ts}.csv`, csv);
  }, [lastMeta, runner.results]);

  // The component to render inside the Profiler subtree — whichever the
  // runner is currently sweeping. While idle we render the first selected
  // component as a preview.
  const liveComponentId =
    runner.currentComponentId ??
    selectedComponentIds[0] ??
    getAllTestComponents()[0]?.id ??
    'button';
  const liveEntry = useMemo(() => getComponentById(liveComponentId), [liveComponentId]);

  // ---- Profiler subtree render ----
  const instances = useMemo(() => {
    const n = runner.currentInstanceCount;
    if (n <= 0) return null;
    const list: React.ReactNode[] = [];
    for (let i = 0; i < n; i++) {
      list.push(liveEntry.renderInstance(i, runner.tick));
    }
    return <>{list}</>;
  }, [liveEntry, runner.currentInstanceCount, runner.tick]);

  const profiledSubtree = (
    // MantineProvider (when @mantine/core loads) stays OUTSIDE the Profiler so
    // context cost is mounted once. MUI uses no provider.
    <MantineRoot>
      <Profiler key={runner.profilerKey} id="oneui-perf" onRender={runner.onProfilerRender}>
        <div
          className={styles.previewInner}
          data-instance-count={runner.currentInstanceCount}
        >
          {instances}
        </div>
      </Profiler>
    </MantineRoot>
  );

  // ---- Derived chart series ----
  // Colour assignment pairs each OneUI component with its Base UI floor on
  // the SAME hue. Base UI series get `dashed: true` so the visual reads
  // "solid line is the wrapper, dashed line is the bare primitive floor".
  // Standalone components (no Base UI pair) just take the next palette slot.
  const chartSeries = useMemo<ChartSeries[]>(() => {
    if (runner.results.length === 0) return [];

    // Map every paired component (either side) to a shared group key. Group
    // keys then get one palette index per unique key in first-seen order.
    const baseuiToOneui = new Map<string, string>();
    const oneuiToBaseui = new Map<string, string>();
    for (const pair of ONEUI_TO_BASEUI_FLOOR) {
      baseuiToOneui.set(pair.baseui, pair.oneui);
      oneuiToBaseui.set(pair.oneui, pair.baseui);
    }
    const familyGroup = (id: string): string => getComponentById(id).familyKey ?? id;

    const groupIndex = new Map<string, number>();
    let nextIndex = 0;
    for (const cr of runner.results) {
      const key = familyGroup(cr.componentId);
      if (!groupIndex.has(key)) groupIndex.set(key, nextIndex++);
    }

    return runner.results.map((cr) => {
      const key = familyGroup(cr.componentId);
      const isBaseuiFloor = baseuiToOneui.has(cr.componentId);
      return {
        id: cr.componentId,
        label: cr.componentLabel,
        colorVar: paletteColor(groupIndex.get(key)!),
        dashed: isBaseuiFloor,
        points: cr.steps.map((s) => ({
          x: s.instanceCount,
          y: pickStepValue(s, phase, yMetric),
        })),
      };
    });
  }, [runner.results, phase, yMetric]);

  // ---- OneUI-overhead bands (OneUI line ↔ Base UI floor line) ----
  // Emit a band only when BOTH the OneUI component and its Base UI floor
  // were measured in this run, so the SVG fill is grounded in real data.
  // Band tint matches the shared group hue used by both lines.
  const overheadBands = useMemo<OverheadBand[]>(() => {
    if (runner.results.length === 0) return [];
    const seriesById = new Map(chartSeries.map((s) => [s.id, s]));
    return ONEUI_TO_BASEUI_FLOOR.filter(
      (pair) => seriesById.has(pair.oneui) && seriesById.has(pair.baseui),
    ).map((pair) => ({
      id: `overhead-${pair.oneui}`,
      upperId: pair.oneui,
      lowerId: pair.baseui,
      label: `OneUI overhead — ${pair.oneui}`,
      colorVar: seriesById.get(pair.oneui)!.colorVar,
    }));
  }, [chartSeries]);

  // Power-law fit across the first selected component's series.
  const fit = useMemo(() => {
    const first = runner.results[0];
    if (!first) return null;
    return fitPowerLaw(
      first.steps.map((s) => ({
        n: s.instanceCount,
        t: pickStepValue(s, phase, yMetric),
      })),
    );
  }, [runner.results, phase, yMetric]);

  useEffect(() => {
    setChartHiddenSeriesIds(new Set());
  }, [runner.results]);

  const handleChartSeriesVisibility = useCallback((seriesId: string, visible: boolean) => {
    setChartHiddenSeriesIds((prev) => {
      const next = new Set(prev);
      if (visible) next.delete(seriesId);
      else next.add(seriesId);
      return next;
    });
  }, []);

  const showAllChartSeries = useCallback(() => {
    setChartHiddenSeriesIds(new Set());
  }, []);

  const hideAllChartSeries = useCallback(() => {
    setChartHiddenSeriesIds(new Set(chartSeries.map((s) => s.id)));
  }, [chartSeries]);

  useEffect(() => {
    if (!chartFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChartFullscreen(false);
    };
    // Body scroll lock — without this, wheel events behind the fixed overlay
    // still scroll the underlying page.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [chartFullscreen]);

  return (
    <Surface mode="default">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Performance</h1>
          <p className={styles.description}>
            Measures both mount AND update timings for OneUI components across a sweep of instance
            counts in a single run. Three independent signals per phase — React Profiler
            `actualDuration` sum, commit-time delta, and a `performance.now()` wall-clock bracket
            around `flushSync`. The wall-clock reading reflects real commit work (no ~16ms rAF
            floor). Select multiple components to compare them as separate chart series. For each
            OneUI component that wraps a Base UI primitive, the chart pairs them on the same hue
            (solid = wrapper, dashed = bare primitive floor) with a translucent band showing
            OneUI&apos;s overhead.
          </p>
          <p className={styles.description}>
            <strong>Trust the asymptote, not the tail.</strong> Readings below ~5ms (typically
            instance counts under 10) are dominated by `flushSync`+Profiler+V8-warmup overhead
            rather than component cost — that&apos;s why you&apos;ll occasionally see a wrapper
            line dip below its primitive floor at N=1 even though it&apos;s structurally
            impossible. The ordering becomes reliable once each iteration is doing real
            millisecond-scale work. For honest numbers run a production build of Storybook and
            avoid React.StrictMode.
          </p>
        </header>

        {runner.strictModeDetected && (
          <Surface mode="subtle" className={styles.warningBanner}>
            <strong>Warning:</strong> React.StrictMode double-renders are inflating measurements.
            Run a production build for accurate numbers.
          </Surface>
        )}

        {/* ---- Controls ---- */}
        <Surface mode="subtle" className={styles.controlsPanel}>
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Libraries</span>
            <div className={styles.componentGrid}>
              {libraryOptions.map((lib) => (
                <Checkbox
                  key={lib}
                  checked={libraryFilter.has(lib)}
                  onCheckedChange={() => toggleLibrary(lib)}
                  disabled={runner.isRunning}
                >
                  {LIBRARY_LABELS[lib]}
                </Checkbox>
              ))}
            </div>
          </div>

          <div className={styles.pickerLayout}>
            <div className={styles.pickerMain}>
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Components (grouped by role)</span>
                <p className={styles.hintText}>
                  Rows group the same role across vendors (family keys). Use the selection column to add
                  every counterpart for the components you already checked, or &quot;Select row&quot; to
                  tick every implementation in that row. Radix entries use the same headless primitives
                  as shadcn/ui (plus a minimal token shell where needed).
                </p>
                <div className={styles.familyList}>
                  {pickerRows.map((row) => (
                    <Surface key={row.rowKey} mode="ghost" className={styles.familyCard}>
                      <div className={styles.familyTitleRow}>
                        <span className={styles.familyTitle}>{row.title}</span>
                        {row.items.length > 1 && (
                          <Button
                            type="button"
                            appearance="neutral"
                            variant="ghost"
                            size={8}
                            condensed
                            disabled={runner.isRunning}
                            onClick={() => selectEntireRow(row)}
                          >
                            Select row
                          </Button>
                        )}
                      </div>
                      <div className={styles.familyCheckboxRow}>
                        {row.items.map((c) => (
                          <Checkbox
                            key={c.id}
                            checked={selectedComponentIds.includes(c.id)}
                            onCheckedChange={() => toggleComponent(c.id)}
                            disabled={runner.isRunning}
                          >
                            {`${c.library} — ${c.label}`}
                          </Checkbox>
                        ))}
                      </div>
                    </Surface>
                  ))}
                </div>
              </div>
            </div>
            <aside className={styles.selectionAside} aria-label="Selection assistant">
              <span className={styles.asideTitle}>Selection</span>
              <Button
                type="button"
                appearance="neutral"
                variant="ghost"
                size={8}
                condensed
                disabled={runner.isRunning || selectedComponentIds.length === 0}
                onClick={clearComponentSelection}
              >
                Clear all components
              </Button>
              <div className={styles.asideSection}>
                <span className={styles.asideLabel}>Selected ({selectedComponentIds.length})</span>
                <ul className={styles.selectedList}>
                  {selectedComponentIds.map((id) => (
                    <li key={id}>{getComponentById(id).label}</li>
                  ))}
                </ul>
              </div>
              {equivalentCandidates.length > 0 && (
                <div className={styles.asideSection}>
                  <span className={styles.asideLabel}>Counterparts in enabled libraries</span>
                  <Button
                    type="button"
                    appearance="primary"
                    variant="subtle"
                    size={8}
                    condensed
                    disabled={runner.isRunning}
                    onClick={addAllEquivalents}
                  >
                    {`Add all (${equivalentCandidates.length})`}
                  </Button>
                  <div className={styles.candidateList}>
                    {equivalentCandidates.map((id) => (
                      <Button
                        key={id}
                        type="button"
                        appearance="neutral"
                        variant="ghost"
                        size={8}
                        condensed
                        disabled={runner.isRunning}
                        onClick={() => addSingleEquivalent(id)}
                      >
                        {`+ ${getComponentById(id).label}`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          <div className={styles.controlsRow}>
            <NumericField label="Start" value={startCount} min={1} onChange={setStartCount} disabled={runner.isRunning} />
            <NumericField label="End" value={endCount} min={1} onChange={setEndCount} disabled={runner.isRunning} />
            <NumericField label="Step" value={step} min={1} onChange={setStep} disabled={runner.isRunning} />
            <NumericField label="Iterations" value={iterations} min={1} onChange={setIterations} disabled={runner.isRunning} />
            <NumericField label="Warmup" value={warmup} min={0} onChange={setWarmup} disabled={runner.isRunning} />
          </div>

          <div className={styles.controlsRow}>
            <Button
              appearance="primary"
              variant="bold"
              onClick={handleRun}
              disabled={!canRun}
            >
              {runner.isRunning ? 'Running…' : 'Run'}
            </Button>
            <Button
              appearance="neutral"
              variant="subtle"
              onClick={runner.cancel}
              disabled={!runner.isRunning}
            >
              Cancel
            </Button>
            <Button
              appearance="neutral"
              variant="ghost"
              onClick={handleExport}
              disabled={runner.results.length === 0}
            >
              Export CSV
            </Button>
            <Button
              appearance="neutral"
              variant="ghost"
              onClick={runner.reset}
              disabled={runner.isRunning}
            >
              Reset
            </Button>
            {selectedComponentIds.length === 0 && (
              <span className={styles.sectionMeta}>Select at least one component to run.</span>
            )}
            {runner.progress.phase !== 'idle' && (
              <Badge appearance={runner.progress.phase === 'error' ? 'negative' : 'neutral'}>
                {runner.progress.message}
                {runner.progress.totalSteps > 0 && runner.isRunning
                  ? ` (${runner.progress.currentStep}/${runner.progress.totalSteps})`
                  : ''}
              </Badge>
            )}
          </div>
        </Surface>

        {/* ---- Live preview ---- */}
        <section className={styles.previewSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Preview</h2>
            <span className={styles.sectionMeta}>
              {liveEntry.label}{' · '}
              {runner.currentInstanceCount} instance{runner.currentInstanceCount === 1 ? '' : 's'}
              {' · '}tick {runner.tick}
            </span>
          </div>
          <div className={styles.previewContainer}>{profiledSubtree}</div>
        </section>

        {/* ---- Results ---- */}
        {runner.results.length > 0 && (
          <>
            <section
              className={
                chartFullscreen
                  ? `${styles.chartSection} ${styles.chartSectionFullscreen}`
                  : styles.chartSection
              }
            >
              <div className={styles.chartHeadRow}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Chart</h2>
                  {fit && (
                    <span className={styles.sectionMeta}>
                      Fit ({runner.results[0]?.componentLabel}, {phase}/{yMetric}): t ≈ {fit.coefficient.toFixed(4)} · n^{fit.exponent.toFixed(3)}
                      {' · '}R² {fit.rSquared.toFixed(3)}
                      {' · '}<strong>{fit.classification}</strong>
                    </span>
                  )}
                </div>
                <div className={styles.chartHeadActions}>
                  <Button
                    type="button"
                    appearance="neutral"
                    variant={chartFullscreen ? 'subtle' : 'ghost'}
                    size={8}
                    condensed
                    onClick={() => setChartFullscreen((v) => !v)}
                  >
                    {chartFullscreen ? 'Exit fullscreen' : 'Fullscreen chart'}
                  </Button>
                  <Button
                    type="button"
                    appearance="neutral"
                    variant="ghost"
                    size={8}
                    condensed
                    disabled={chartHiddenSeriesIds.size === 0}
                    onClick={showAllChartSeries}
                  >
                    Show all plots
                  </Button>
                  <Button
                    type="button"
                    appearance="neutral"
                    variant="ghost"
                    size={8}
                    condensed
                    disabled={
                      chartSeries.length === 0 || chartHiddenSeriesIds.size === chartSeries.length
                    }
                    onClick={hideAllChartSeries}
                  >
                    Hide all plots
                  </Button>
                </div>
              </div>
              <div className={styles.chartToolbar}>
                <div className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Phase</span>
                  <Select
                    value={phase}
                    onChange={(v) => setPhase(v as Phase)}
                    options={PHASE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    size="sm"
                    aria-label="Phase"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Y axis</span>
                  <Select
                    value={yMetric}
                    onChange={(v) => setYMetric(v as YMetric)}
                    options={Y_METRIC_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    size="sm"
                    aria-label="Y axis metric"
                  />
                </div>
                <Checkbox checked={logX} onCheckedChange={setLogX}>Log X</Checkbox>
                <Checkbox checked={logY} onCheckedChange={setLogY}>Log Y</Checkbox>
              </div>
              <div className={styles.chartMeasure}>
                <LineChart
                  series={chartSeries}
                  overheadBands={overheadBands}
                  xLabel="Instance count"
                  yLabel="Time (ms)"
                  logX={logX}
                  logY={logY}
                  width="auto"
                  height="auto"
                  legendPosition={chartFullscreen ? 'right' : 'bottom'}
                  hiddenSeriesIds={chartHiddenSeriesIds}
                  onSeriesVisibilityChange={handleChartSeriesVisibility}
                />
              </div>
            </section>

            <section className={styles.tableSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Per-step results</h2>
                <span className={styles.sectionMeta}>
                  Mount and update phases side-by-side. Wall/Profiler/Commit columns let you spot a
                  divergent signal at a glance.
                </span>
              </div>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th rowSpan={2}>Component</th>
                      <th rowSpan={2}>N</th>
                      <th colSpan={4}>Mount</th>
                      <th colSpan={4}>Update</th>
                    </tr>
                    <tr>
                      <th>wall</th>
                      <th>profiler</th>
                      <th>commit</th>
                      <th>p95</th>
                      <th>wall</th>
                      <th>profiler</th>
                      <th>commit</th>
                      <th>p95</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runner.results.flatMap((cr: ComponentResults) =>
                      cr.steps.map((r) => (
                        <tr key={`${cr.componentId}-${r.instanceCount}`}>
                          <td>{cr.componentLabel}</td>
                          <td>{r.instanceCount}</td>
                          <td>{r.mount.wallMs.toFixed(3)}</td>
                          <td>{r.mount.profilerMs.toFixed(3)}</td>
                          <td>{r.mount.commitMs.toFixed(3)}</td>
                          <td>{r.mount.p95Ms.toFixed(3)}</td>
                          <td>{r.update.wallMs.toFixed(3)}</td>
                          <td>{r.update.profilerMs.toFixed(3)}</td>
                          <td>{r.update.commitMs.toFixed(3)}</td>
                          <td>{r.update.p95Ms.toFixed(3)}</td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </Surface>
  );
}
