/**
 * PerformanceTool.tsx
 *
 * Duplicated from apps/storybook/src/stories/tools/PerformanceTool.tsx for the
 * qa-playground Performance page. Keep in sync with the Storybook original.
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
import { buildHtmlReport, downloadHtml, type ReportSummaryRow } from './htmlExport';
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

const ONEUI_TO_BASEUI_FLOOR: ReadonlyArray<{ oneui: string; baseui: string }> = [
  { oneui: 'button', baseui: 'baseui:button' },
  { oneui: 'checkbox', baseui: 'baseui:checkbox' },
  { oneui: 'switch', baseui: 'baseui:switch' },
  { oneui: 'slider', baseui: 'baseui:slider' },
  { oneui: 'toggle', baseui: 'baseui:toggle' },
  { oneui: 'divider', baseui: 'baseui:separator' },
  { oneui: 'avatar', baseui: 'baseui:avatar' },
  { oneui: 'input', baseui: 'baseui:input' },
];

/** Component-render performance budget (wall-clock ms, averaged across all instance steps). */
const PERF_THRESHOLDS = {
  mount: { excellent: 8, good: 16, review: 32 },
  update: { excellent: 4, good: 8, review: 16 },
} as const;

type PerfStatus = 'excellent' | 'good' | 'review' | 'slow';

const STATUS_LABEL: Record<PerfStatus, string> = {
  excellent: 'Excellent',
  good: 'Good',
  review: 'Needs review',
  slow: 'Slow',
};

const STATUS_APPEARANCE: Record<PerfStatus, 'positive' | 'informative' | 'warning' | 'negative'> = {
  excellent: 'positive',
  good: 'informative',
  review: 'warning',
  slow: 'negative',
};

function classifyPhase(avgMs: number, kind: 'mount' | 'update'): PerfStatus {
  const t = PERF_THRESHOLDS[kind];
  if (avgMs < t.excellent) return 'excellent';
  if (avgMs < t.good) return 'good';
  if (avgMs < t.review) return 'review';
  return 'slow';
}

function combineStatus(a: PerfStatus, b: PerfStatus): PerfStatus {
  const rank: Record<PerfStatus, number> = { excellent: 0, good: 1, review: 2, slow: 3 };
  return rank[a] >= rank[b] ? a : b;
}

function avgPhase(steps: StepResult[], phase: Phase): number {
  if (steps.length === 0) return 0;
  let sum = 0;
  for (const s of steps) sum += pickPhase(s, phase).wallMs;
  return sum / steps.length;
}

interface SummaryRow {
  componentId: string;
  componentLabel: string;
  library: LibraryId;
  avgMountMs: number;
  avgUpdateMs: number;
  overheadPct: number | null;
  status: PerfStatus;
  suggestion: string;
}

function buildOneuiSuggestion(
  mountStatus: PerfStatus,
  updateStatus: PerfStatus,
  overheadPct: number | null,
): string {
  const overall = combineStatus(mountStatus, updateStatus);
  const overheadStr =
    overheadPct !== null && Number.isFinite(overheadPct)
      ? ` Overhead vs Base UI floor: ${overheadPct >= 0 ? '+' : ''}${overheadPct.toFixed(0)}%.`
      : '';
  if (overall === 'excellent')
    return `Healthy — within budget on both mount and update.${overheadStr}`;
  if (overall === 'good')
    return `Acceptable. Monitor in production builds (StrictMode inflates ~2×).${overheadStr}`;
  if (overall === 'review') {
    if (updateStatus === 'review' || updateStatus === 'slow')
      return `Updates are heavier than expected. Likely candidates: missing React.memo on children, props recreated on every render, deep state subscriptions.${overheadStr}`;
    return `Mount cost is elevated. Likely candidates: unnecessary mount-time effects, token resolution per instance, deep prop spreading.${overheadStr}`;
  }
  if (updateStatus === 'slow')
    return `Updates significantly exceed budget — profile commit phase for wasted re-renders, memoize children, audit useEffect dependencies.${overheadStr}`;
  return `Mount significantly exceeds budget — audit render path, defer non-critical work, memoize derived values, inspect token CSS injection cost.${overheadStr}`;
}

function buildSummaryRows(results: ComponentResults[]): SummaryRow[] {
  const baseFloorByOneui = new Map<string, string>();
  for (const pair of ONEUI_TO_BASEUI_FLOOR) baseFloorByOneui.set(pair.oneui, pair.baseui);

  const byId = new Map<string, { avgMount: number; avgUpdate: number }>();
  for (const cr of results) {
    byId.set(cr.componentId, {
      avgMount: avgPhase(cr.steps, 'mount'),
      avgUpdate: avgPhase(cr.steps, 'update'),
    });
  }

  const rows: SummaryRow[] = [];
  for (const cr of results) {
    const entry = getComponentById(cr.componentId);
    if (entry.library !== 'oneui') continue;
    const avgs = byId.get(cr.componentId)!;
    const mountStatus = classifyPhase(avgs.avgMount, 'mount');
    const updateStatus = classifyPhase(avgs.avgUpdate, 'update');
    const status = combineStatus(mountStatus, updateStatus);

    let overheadPct: number | null = null;
    const baseId = baseFloorByOneui.get(cr.componentId);
    const baseAvg = baseId ? byId.get(baseId) : undefined;
    if (baseAvg && baseAvg.avgMount + baseAvg.avgUpdate > 0) {
      const oneuiTotal = avgs.avgMount + avgs.avgUpdate;
      const baseTotal = baseAvg.avgMount + baseAvg.avgUpdate;
      overheadPct = ((oneuiTotal - baseTotal) / baseTotal) * 100;
    }

    rows.push({
      componentId: cr.componentId,
      componentLabel: cr.componentLabel,
      library: entry.library,
      avgMountMs: avgs.avgMount,
      avgUpdateMs: avgs.avgUpdate,
      overheadPct,
      status,
      suggestion: buildOneuiSuggestion(mountStatus, updateStatus, overheadPct),
    });
  }
  return rows;
}

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

  const liveComponentId =
    runner.currentComponentId ??
    selectedComponentIds[0] ??
    getAllTestComponents()[0]?.id ??
    'button';
  const liveEntry = useMemo(() => getComponentById(liveComponentId), [liveComponentId]);

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

  const chartSeries = useMemo<ChartSeries[]>(() => {
    if (runner.results.length === 0) return [];

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

  const summaryRows = useMemo(() => buildSummaryRows(runner.results), [runner.results]);

  const summaryHealthCounts = useMemo(() => {
    const counts: Record<PerfStatus, number> = {
      excellent: 0,
      good: 0,
      review: 0,
      slow: 0,
    };
    for (const row of summaryRows) counts[row.status]++;
    return counts;
  }, [summaryRows]);

  const handleExportHtml = useCallback(() => {
    if (!lastMeta || runner.results.length === 0) return;
    const reportRows: ReportSummaryRow[] = summaryRows.map((row) => ({
      componentId: row.componentId,
      componentLabel: row.componentLabel,
      avgMountMs: row.avgMountMs,
      avgUpdateMs: row.avgUpdateMs,
      overheadPct: row.overheadPct,
      status: row.status,
      statusLabel: STATUS_LABEL[row.status],
      suggestion: row.suggestion,
    }));
    const html = buildHtmlReport({
      meta: lastMeta,
      results: runner.results,
      oneuiSummary: reportRows,
      mountBudgetMs: PERF_THRESHOLDS.mount.good,
      updateBudgetMs: PERF_THRESHOLDS.update.good,
    });
    const ts = lastMeta.timestamp.replace(/[:.]/g, '-');
    const slug =
      lastMeta.componentIds.length === 1
        ? lastMeta.componentIds[0]
        : `multi-${lastMeta.componentIds.length}`;
    downloadHtml(`oneui-perf-${slug}-${ts}.html`, html);
  }, [lastMeta, runner.results, summaryRows]);

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
            millisecond-scale work. For honest numbers run a production build and avoid
            React.StrictMode.
          </p>
        </header>

        {runner.strictModeDetected && (
          <Surface mode="subtle" className={styles.warningBanner}>
            <strong>Warning:</strong> React.StrictMode double-renders are inflating measurements.
            Run a production build for accurate numbers.
          </Surface>
        )}

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
                  label={LIBRARY_LABELS[lib]}
                />
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
                  {pickerRows.map((row) => {
                    const isOneuiOnly =
                      row.items.length > 0 && row.items.every((c) => c.library === 'oneui');
                    return (
                      <Surface key={row.rowKey} mode="ghost" className={styles.familyCard}>
                        <div className={styles.familyTitleRow}>
                          <span className={styles.familyTitleGroup}>
                            <span className={styles.familyTitle}>{row.title}</span>
                            {isOneuiOnly && (
                              <span
                                className={styles.familyOneuiOnlyTag}
                                title="No peer primitive exists in supported vendor libraries"
                              >
                                OneUI-only
                              </span>
                            )}
                          </span>
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
                              label={`${c.library} — ${c.label}`}
                            />
                          ))}
                        </div>
                      </Surface>
                    );
                  })}
                </div>
              </div>
            </div>
            <aside className={styles.selectionAside} aria-label="Selection assistant">
              <div className={styles.asideHeaderRow}>
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
                  Clear all
                </Button>
              </div>
              <div className={styles.asideSection}>
                <span className={styles.asideLabel}>
                  Selected ({selectedComponentIds.length})
                </span>
                {selectedComponentIds.length > 0 ? (
                  <ul className={styles.selectedList}>
                    {selectedComponentIds.map((id) => (
                      <li key={id}>{getComponentById(id).label}</li>
                    ))}
                  </ul>
                ) : (
                  <span className={styles.selectedListEmpty}>No components selected yet.</span>
                )}
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

          <div className={styles.actionsRow}>
            <div className={styles.actionsGroupPrimary}>
              <Button
                appearance="primary"
                variant="bold"
                onClick={handleRun}
                disabled={!canRun}
              >
                {runner.isRunning ? 'Running…' : 'Run sweep'}
              </Button>
              <Button
                appearance="neutral"
                variant="subtle"
                onClick={runner.cancel}
                disabled={!runner.isRunning}
              >
                Cancel
              </Button>
              {selectedComponentIds.length === 0 && (
                <span className={styles.sectionMeta}>Select at least one component to run.</span>
              )}
              {runner.progress.phase !== 'idle' && (
                <Badge
                  appearance={
                    runner.progress.phase === 'error'
                      ? 'negative'
                      : runner.progress.phase === 'done'
                        ? 'positive'
                        : 'informative'
                  }
                >
                  {runner.progress.message}
                  {runner.progress.totalSteps > 0 && runner.isRunning
                    ? ` (${runner.progress.currentStep}/${runner.progress.totalSteps})`
                    : ''}
                </Badge>
              )}
            </div>
            <div className={styles.actionsGroupUtility}>
              <Button
                appearance="neutral"
                variant="ghost"
                onClick={handleExport}
                disabled={runner.results.length === 0}
              >
                Export CSV
              </Button>
              <Button
                appearance="primary"
                variant="subtle"
                onClick={handleExportHtml}
                disabled={runner.results.length === 0}
              >
                Export HTML report
              </Button>
              <Button
                appearance="neutral"
                variant="ghost"
                onClick={runner.reset}
                disabled={runner.isRunning}
              >
                Reset
              </Button>
            </div>
          </div>
        </Surface>

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
                <div className={styles.chartTitleStack}>
                  <h2 className={styles.sectionTitle}>Chart</h2>
                  {fit && (
                    <div className={styles.chartStatsRow}>
                      <span className={styles.chartStatPill}>
                        <span className={styles.chartStatPillKey}>Series</span>
                        <span className={styles.chartStatPillValue}>
                          {runner.results[0]?.componentLabel} · {phase}/{yMetric}
                        </span>
                      </span>
                      <span className={styles.chartStatPill}>
                        <span className={styles.chartStatPillKey}>t ≈</span>
                        <span className={styles.chartStatPillValue}>
                          {fit.coefficient.toFixed(3)} · n^{fit.exponent.toFixed(3)}
                        </span>
                      </span>
                      <span className={styles.chartStatPill}>
                        <span className={styles.chartStatPillKey}>R²</span>
                        <span className={styles.chartStatPillValue}>
                          {fit.rSquared.toFixed(3)}
                        </span>
                      </span>
                      <span
                        className={`${styles.chartStatPill} ${styles.chartStatPillClassification}`}
                      >
                        <span className={styles.chartStatPillKey}>Growth</span>
                        <span className={styles.chartStatPillValue}>{fit.classification}</span>
                      </span>
                    </div>
                  )}
                </div>
                <div className={styles.chartHeadActions}>
                  <Button
                    type="button"
                    appearance="neutral"
                    variant="ghost"
                    size={8}
                    condensed
                    disabled={chartHiddenSeriesIds.size === 0}
                    onClick={showAllChartSeries}
                  >
                    Show all
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
                    Hide all
                  </Button>
                  <Button
                    type="button"
                    appearance="primary"
                    variant={chartFullscreen ? 'subtle' : 'ghost'}
                    size={8}
                    condensed
                    onClick={() => setChartFullscreen((v) => !v)}
                  >
                    {chartFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  </Button>
                </div>
              </div>
              <div className={styles.chartToolbar}>
                <div className={styles.chartToolbarGroup}>
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
                </div>
                <div className={styles.chartToolbarToggles}>
                  <Checkbox checked={logX} onCheckedChange={setLogX} label="Log X" />
                  <Checkbox checked={logY} onCheckedChange={setLogY} label="Log Y" />
                </div>
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

            <section className={styles.summarySection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Summary</h2>
                  <p className={styles.summaryLead}>
                    Average wall-clock per commit, mean across every instance-count step.
                    Status compares OneUI components against an internal budget
                    (Mount &lt; {PERF_THRESHOLDS.mount.good}ms, Update &lt;{' '}
                    {PERF_THRESHOLDS.update.good}ms). Vendor rows are reference baselines.
                  </p>
                </div>
                <div className={styles.summaryHealthRow}>
                  {summaryHealthCounts.excellent > 0 && (
                    <Badge appearance="positive">
                      {summaryHealthCounts.excellent} excellent
                    </Badge>
                  )}
                  {summaryHealthCounts.good > 0 && (
                    <Badge appearance="informative">{summaryHealthCounts.good} good</Badge>
                  )}
                  {summaryHealthCounts.review > 0 && (
                    <Badge appearance="warning">
                      {summaryHealthCounts.review} needs review
                    </Badge>
                  )}
                  {summaryHealthCounts.slow > 0 && (
                    <Badge appearance="negative">{summaryHealthCounts.slow} slow</Badge>
                  )}
                </div>
              </div>
              {summaryRows.length === 0 ? (
                <p className={styles.summaryEmpty}>
                  No OneUI components in this run. Add at least one OneUI component to the
                  selection to see budget evaluation here.
                </p>
              ) : (
                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th className={styles.tableNumCol}>Avg mount (ms)</th>
                        <th className={styles.tableNumCol}>Avg update (ms)</th>
                        <th className={styles.tableNumCol}>Overhead vs Base UI</th>
                        <th>Status</th>
                        <th>Suggestion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryRows.map((row) => (
                        <tr key={row.componentId} data-status={row.status}>
                          <td className={styles.tableCellPrimary}>{row.componentLabel}</td>
                          <td className={styles.tableNumCol}>{row.avgMountMs.toFixed(2)}</td>
                          <td className={styles.tableNumCol}>{row.avgUpdateMs.toFixed(2)}</td>
                          <td className={styles.tableNumCol}>
                            {row.overheadPct === null
                              ? '—'
                              : `${row.overheadPct >= 0 ? '+' : ''}${row.overheadPct.toFixed(0)}%`}
                          </td>
                          <td>
                            <Badge appearance={STATUS_APPEARANCE[row.status]}>
                              {STATUS_LABEL[row.status]}
                            </Badge>
                          </td>
                          <td className={styles.tableCellSuggestion}>{row.suggestion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
