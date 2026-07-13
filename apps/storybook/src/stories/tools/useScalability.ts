/**
 * useScalability.ts
 *
 * Orchestrates a sweep of (component × instance-count) pairs. Each step
 * measures BOTH mount and update commits in a single iteration, so the user
 * doesn't have to pick a test-type up front.
 *
 * Measurement strategy:
 *   - Wrap the state setter in `flushSync` so React renders + commits
 *     synchronously. After `flushSync` returns, the Profiler `onRender`
 *     callbacks have already fired and the iteration accumulator is fully
 *     populated. The wall-clock bracket `performance.now()` immediately
 *     before/after `flushSync` measures honest commit time (no rAF floor).
 *   - One trailing rAF lets the browser paint and gives the GC room before
 *     the next iteration. We do NOT include that rAF in any measurement.
 *
 * Per iteration we record three independent signals for each phase:
 *   1. profilerMs   — sum of Profiler `actualDuration` (handles React 19
 *                     yielded renders by accumulating slices).
 *   2. commitMs     — `commitTime - startTime` across the iteration's commits.
 *   3. wallClockMs  — `performance.now()` bracket around `flushSync`. Honest.
 */

import { useCallback, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { average, median, percentile, stddev, clampMin, MIN_DURATION_MS } from './stats';

export interface RunConfig {
  componentIds: string[];
  startCount: number;
  endCount: number;
  step: number;
  iterations: number;
  warmupIterations: number;
}

export interface RunMetadata extends RunConfig {
  timestamp: string;
}

export interface PhaseStats {
  wallMs: number;
  profilerMs: number;
  commitMs: number;
  medianMs: number;
  p95Ms: number;
  stddevMs: number;
}

export interface StepResult {
  instanceCount: number;
  mount: PhaseStats;
  update: PhaseStats;
  iterationsKept: number;
}

export interface ComponentResults {
  componentId: string;
  componentLabel: string;
  steps: StepResult[];
}

export interface ProgressState {
  currentStep: number;
  totalSteps: number;
  currentIteration: number;
  totalIterations: number;
  phase: 'idle' | 'warming-up' | 'running' | 'cooling' | 'done' | 'cancelled' | 'error';
  message: string;
}

export interface ScalabilityRunner {
  isRunning: boolean;
  progress: ProgressState;
  results: ComponentResults[];
  currentComponentId: string | null;
  currentInstanceCount: number;
  profilerKey: number;
  tick: number;
  strictModeDetected: boolean;
  start: (config: RunConfig, labels: Record<string, string>) => Promise<void>;
  cancel: () => void;
  reset: () => void;
  onProfilerRender: (
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
  ) => void;
}

/**
 * Per-iteration accumulator. Each commit (or commit-slice) adds to these
 * fields; we read the totals once after the flushSync call returns.
 */
interface IterationAccumulator {
  phase: 'mount' | 'update' | null;
  profilerSum: number;
  commitDelta: number;
  firstStartTime: number;
  lastCommitTime: number;
  hits: number;
}

const initialProgress: ProgressState = {
  currentStep: 0,
  totalSteps: 0,
  currentIteration: 0,
  totalIterations: 0,
  phase: 'idle',
  message: '',
};

function makeAccumulator(): IterationAccumulator {
  return {
    phase: null,
    profilerSum: 0,
    commitDelta: 0,
    firstStartTime: 0,
    lastCommitTime: 0,
    hits: 0,
  };
}

// Single rAF — used between iterations to let the browser paint and GC run.
// Not part of any measurement bracket.
function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function idlePause(ms: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => resolve(), { timeout: ms });
      return;
    }
    window.setTimeout(resolve, ms);
  });
}

function now(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

interface PhaseSamples {
  profiler: number[];
  commit: number[];
  wall: number[];
}

interface SampleBuckets {
  mounts: PhaseSamples;
  updates: PhaseSamples;
}

function emptyBuckets(): SampleBuckets {
  return {
    mounts: { profiler: [], commit: [], wall: [] },
    updates: { profiler: [], commit: [], wall: [] },
  };
}

function computePhaseStats(
  wall: number[],
  profiler: number[],
  commit: number[],
): PhaseStats {
  if (wall.length === 0) {
    return {
      wallMs: MIN_DURATION_MS,
      profilerMs: MIN_DURATION_MS,
      commitMs: MIN_DURATION_MS,
      medianMs: MIN_DURATION_MS,
      p95Ms: MIN_DURATION_MS,
      stddevMs: 0,
    };
  }
  return {
    wallMs: average(wall),
    profilerMs: average(profiler),
    commitMs: average(commit),
    medianMs: median(wall),
    p95Ms: percentile(wall, 95),
    stddevMs: stddev(wall),
  };
}

export function useScalability(): ScalabilityRunner {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [results, setResults] = useState<ComponentResults[]>([]);
  const [currentComponentId, setCurrentComponentId] = useState<string | null>(null);
  const [currentInstanceCount, setCurrentInstanceCount] = useState(0);
  const [profilerKey, setProfilerKey] = useState(0);
  const [tick, setTick] = useState(0);
  const [strictModeDetected, setStrictModeDetected] = useState(false);

  const abortedRef = useRef(false);
  const bucketsRef = useRef<SampleBuckets>(emptyBuckets());
  const accumRef = useRef<IterationAccumulator>(makeAccumulator());
  const lastKeyAtRef = useRef<number>(0);
  const mountCommitsSinceKeyRef = useRef<number>(0);

  const onProfilerRender = useCallback(
    (
      _id: string,
      phase: 'mount' | 'update' | 'nested-update',
      actualDuration: number,
      _baseDuration: number,
      startTime: number,
      commitTime: number,
    ) => {
      const acc = accumRef.current;
      // Map nested-update to update; we only differentiate mount vs not-mount.
      const p: 'mount' | 'update' = phase === 'mount' ? 'mount' : 'update';
      if (acc.hits === 0) {
        acc.phase = p;
        acc.firstStartTime = startTime;
      }
      acc.profilerSum += actualDuration;
      acc.lastCommitTime = commitTime;
      acc.commitDelta = commitTime - acc.firstStartTime;
      acc.hits += 1;

      // StrictMode detection: two mount commits within 50ms after a key bump.
      if (p === 'mount') {
        const t = now();
        if (t - lastKeyAtRef.current < 50) {
          mountCommitsSinceKeyRef.current += 1;
          if (mountCommitsSinceKeyRef.current >= 2) {
            setStrictModeDetected(true);
          }
        }
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResults([]);
    setProgress(initialProgress);
    setCurrentComponentId(null);
    setCurrentInstanceCount(0);
    setProfilerKey(0);
    setTick(0);
    setStrictModeDetected(false);
  }, []);

  const cancel = useCallback(() => {
    abortedRef.current = true;
  }, []);

  const start = useCallback(
    async (config: RunConfig, labels: Record<string, string>) => {
      abortedRef.current = false;
      setIsRunning(true);
      setResults([]);
      setStrictModeDetected(false);
      setProgress({
        currentStep: 0,
        totalSteps: 0,
        currentIteration: 0,
        totalIterations: 0,
        phase: 'warming-up',
        message: 'Warming up V8…',
      });

      const counts: number[] = [];
      for (let n = config.startCount; n <= config.endCount; n += config.step) {
        counts.push(n);
      }
      if (counts.length === 0) counts.push(config.startCount);

      const totalSteps = counts.length * config.componentIds.length;
      const totalIterations = config.iterations + config.warmupIterations;

      const componentResults: ComponentResults[] = [];

      let globalStep = 0;

      outer: for (const componentId of config.componentIds) {
        if (abortedRef.current) break;
        setCurrentComponentId(componentId);

        // JIT warm-up: 2 silent mount cycles at the first count for this component
        try {
          setCurrentInstanceCount(counts[0]);
          for (let w = 0; w < 2; w++) {
            if (abortedRef.current) break;
            accumRef.current = makeAccumulator();
            lastKeyAtRef.current = now();
            mountCommitsSinceKeyRef.current = 0;
            flushSync(() => {
              setProfilerKey((k) => k + 1);
            });
            await nextFrame();
          }
        } catch {
          // ignore — warmup failure should not block the real run
        }

        const stepsCollected: StepResult[] = [];

        for (let s = 0; s < counts.length; s++) {
          if (abortedRef.current) break outer;
          const n = counts[s];
          globalStep += 1;
          setCurrentInstanceCount(n);
          setProgress({
            currentStep: globalStep,
            totalSteps,
            currentIteration: 0,
            totalIterations,
            phase: 'running',
            message: `${labels[componentId] ?? componentId} — ${n} instances (${globalStep}/${totalSteps})`,
          });

          bucketsRef.current = emptyBuckets();

          // Each iteration: a flushSync(setProfilerKey) for mount, then a
          // flushSync(setTick) for update. Both phases sampled per iteration.
          for (let i = 0; i < totalIterations; i++) {
            if (abortedRef.current) break outer;

            // --- Mount phase ---
            accumRef.current = makeAccumulator();
            lastKeyAtRef.current = now();
            mountCommitsSinceKeyRef.current = 0;
            {
              const wallStart = now();
              flushSync(() => {
                setProfilerKey((k) => k + 1);
              });
              const wallEnd = now();

              const acc = accumRef.current;
              if (acc.hits > 0 && acc.phase === 'mount') {
                bucketsRef.current.mounts.profiler.push(clampMin(acc.profilerSum));
                bucketsRef.current.mounts.commit.push(clampMin(acc.commitDelta));
                bucketsRef.current.mounts.wall.push(clampMin(wallEnd - wallStart));
              }
            }

            // --- Update phase (immediately after; same mounted tree) ---
            accumRef.current = makeAccumulator();
            {
              const wallStart = now();
              flushSync(() => {
                setTick((t) => t + 1);
              });
              const wallEnd = now();

              const acc = accumRef.current;
              if (acc.hits > 0 && acc.phase === 'update') {
                bucketsRef.current.updates.profiler.push(clampMin(acc.profilerSum));
                bucketsRef.current.updates.commit.push(clampMin(acc.commitDelta));
                bucketsRef.current.updates.wall.push(clampMin(wallEnd - wallStart));
              }
            }

            // One rAF between iterations — lets the browser paint, gives GC
            // room. NOT part of any measurement bracket.
            await nextFrame();

            setProgress((p) => ({ ...p, currentIteration: i + 1 }));
          }

          if (abortedRef.current) break outer;

          // Drop warmup iterations from the front.
          const drop = config.warmupIterations;
          const mountsP = bucketsRef.current.mounts.profiler.slice(drop);
          const mountsC = bucketsRef.current.mounts.commit.slice(drop);
          const mountsW = bucketsRef.current.mounts.wall.slice(drop);
          const updatesP = bucketsRef.current.updates.profiler.slice(drop);
          const updatesC = bucketsRef.current.updates.commit.slice(drop);
          const updatesW = bucketsRef.current.updates.wall.slice(drop);

          // Fallback to full samples if warmup dropped everything (e.g. user
          // set warmup >= iterations).
          const mW = mountsW.length ? mountsW : bucketsRef.current.mounts.wall;
          const mP = mountsP.length ? mountsP : bucketsRef.current.mounts.profiler;
          const mC = mountsC.length ? mountsC : bucketsRef.current.mounts.commit;
          const uW = updatesW.length ? updatesW : bucketsRef.current.updates.wall;
          const uP = updatesP.length ? updatesP : bucketsRef.current.updates.profiler;
          const uC = updatesC.length ? updatesC : bucketsRef.current.updates.commit;

          const stepResult: StepResult = {
            instanceCount: n,
            mount: computePhaseStats(mW, mP, mC),
            update: computePhaseStats(uW, uP, uC),
            iterationsKept: Math.max(mW.length, uW.length),
          };
          stepsCollected.push(stepResult);

          // Live-update results so the chart fills in incrementally.
          const snapshot: ComponentResults[] = [
            ...componentResults,
            {
              componentId,
              componentLabel: labels[componentId] ?? componentId,
              steps: [...stepsCollected],
            },
          ];
          setResults(snapshot);

          setProgress((p) => ({ ...p, phase: 'cooling', message: 'Cooling…' }));
          await idlePause(200);
        }

        componentResults.push({
          componentId,
          componentLabel: labels[componentId] ?? componentId,
          steps: stepsCollected,
        });
        setResults([...componentResults]);
      }

      if (abortedRef.current) {
        setProgress((p) => ({ ...p, phase: 'cancelled', message: 'Cancelled.' }));
      } else {
        setProgress((p) => ({ ...p, phase: 'done', message: 'Run complete.' }));
      }
      setIsRunning(false);
    },
    [],
  );

  return {
    isRunning,
    progress,
    results,
    currentComponentId,
    currentInstanceCount,
    profilerKey,
    tick,
    strictModeDetected,
    start,
    cancel,
    reset,
    onProfilerRender,
  };
}
