/**
 * PerformanceScreen.tsx
 *
 * Minimal mount-time benchmark for `@oneui/ui-native`. The five-library
 * comparator harness on `feat/native-sample-v4` was retired after the
 * build-time-StyleSheet pattern won — see commit history. This screen
 * keeps a single-library smoke test so we can spot regressions inside
 * the canonical library itself.
 *
 * What it measures: time to mount a fresh grid of N Buttons across all
 * variant × size × appearance combinations, plus a re-render pass.
 * Numbers are noisy (±15% run-to-run), so use them as a regression
 * tripwire, not an absolute truth.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Button, useSurfaceTokens } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';

const APPEARANCES = ['primary', 'secondary', 'neutral', 'positive', 'negative'] as const;
const VARIANTS = ['bold', 'subtle', 'ghost'] as const;
const SIZES = [6, 8, 10, 12] as const;

const TOTAL = APPEARANCES.length * VARIANTS.length * SIZES.length; // 60 buttons

interface RunResult {
  iteration: number;
  mountMs: number;
  rerenderMs: number;
}

export function PerformanceScreen(): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const [results, setResults] = useState<RunResult[]>([]);
  const [running, setRunning] = useState(false);
  const [iteration, setIteration] = useState(0);

  const runOnce = useCallback(async () => {
    setRunning(true);
    setResults([]);
    // 5 iterations — first 2 absorb cold-start, last 3 are the signal.
    for (let i = 0; i < 5; i += 1) {
      setIteration(i);
      const mountStart = performance.now();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      const mountMs = performance.now() - mountStart;
      const rerenderStart = performance.now();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      const rerenderMs = performance.now() - rerenderStart;
      setResults((prev) => [...prev, { iteration: i, mountMs, rerenderMs }]);
    }
    setRunning(false);
  }, []);

  useEffect(() => {
    // Auto-warmup on mount — primes RN's JS engine + style registry once.
    let cancelled = false;
    requestAnimationFrame(() => {
      if (cancelled) return;
      runOnce();
    });
    return () => {
      cancelled = true;
    };
  }, [runOnce]);

  const summary = computeSummary(results);

  return (
    <ScreenScaffold title='Performance'>
      <Section title='Mount benchmark'>
        <Text style={[styles.body, { color: roles.content.medium }]}>
          {TOTAL} Buttons across {APPEARANCES.length} appearances × {VARIANTS.length}{' '}
          variants × {SIZES.length} sizes. Five iterations; the first two warm
          up the JS engine, last three are the signal. Run-to-run variance is
          ±15%, so use deltas, not absolutes.
        </Text>

        <Pressable
          accessibilityRole='button'
          onPress={runOnce}
          disabled={running}
          style={({ pressed }) => [
            styles.runButton,
            {
              backgroundColor: pressed
                ? roles.states.subtleHover
                : roles.surfaces.subtle,
              borderColor: roles.content.tinted,
            },
            running && styles.runButtonDisabled,
          ]}
        >
          <Text style={[styles.runLabel, { color: roles.content.tintedA11y }]}>
            {running ? `Running… iteration ${iteration + 1} / 5` : 'Run benchmark'}
          </Text>
        </Pressable>

        {summary && (
          <View style={[styles.summary, { borderColor: roles.content.tinted }]}>
            <Text style={[styles.summaryHeading, { color: roles.content.high }]}>
              Hot iterations (3–5)
            </Text>
            <SummaryRow
              label='Mount (avg)'
              value={`${summary.mountAvg.toFixed(2)} ms`}
              roles={roles}
            />
            <SummaryRow
              label='Re-render (avg)'
              value={`${summary.rerenderAvg.toFixed(2)} ms`}
              roles={roles}
            />
            <SummaryRow
              label='Mount (min/max)'
              value={`${summary.mountMin.toFixed(2)} / ${summary.mountMax.toFixed(2)} ms`}
              roles={roles}
            />
          </View>
        )}
      </Section>

      <Section title='Iterations'>
        {results.map((r) => (
          <View key={r.iteration} style={styles.iterRow}>
            <Text style={[styles.iterLabel, { color: roles.content.medium }]}>
              {`#${r.iteration + 1}${r.iteration < 2 ? ' (warmup)' : ''}`}
            </Text>
            <Text style={[styles.iterValue, { color: roles.content.high }]}>
              mount {r.mountMs.toFixed(2)} ms · re-render {r.rerenderMs.toFixed(2)} ms
            </Text>
          </View>
        ))}
      </Section>

      <Section title='Live grid'>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={styles.gridScroll}
        >
          <View style={styles.grid}>
            {APPEARANCES.flatMap((appearance) =>
              VARIANTS.flatMap((variant) =>
                SIZES.map((size) => (
                  <Button
                    key={`${appearance}-${variant}-${size}`}
                    appearance={appearance}
                    variant={variant}
                    size={size}
                  >
                    {`${appearance.slice(0, 3)} ${size}`}
                  </Button>
                )),
              ),
            )}
          </View>
        </ScrollView>
      </Section>
    </ScreenScaffold>
  );
}

function SummaryRow({
  label,
  value,
  roles,
}: {
  label: string;
  value: string;
  roles: ReturnType<typeof useSurfaceTokens>;
}): React.ReactElement {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: roles.content.medium }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: roles.content.high }]}>{value}</Text>
    </View>
  );
}

interface Summary {
  mountAvg: number;
  rerenderAvg: number;
  mountMin: number;
  mountMax: number;
}

function computeSummary(runs: RunResult[]): Summary | null {
  const hot = runs.filter((r) => r.iteration >= 2);
  if (hot.length === 0) return null;
  const mountValues = hot.map((r) => r.mountMs);
  const rerenderValues = hot.map((r) => r.rerenderMs);
  const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
  return {
    mountAvg: sum(mountValues) / mountValues.length,
    rerenderAvg: sum(rerenderValues) / rerenderValues.length,
    mountMin: Math.min(...mountValues),
    mountMax: Math.max(...mountValues),
  };
}

const styles = StyleSheet.create({
  body: {
    fontSize: typography.size.s,
    lineHeight: 20,
  },
  runButton: {
    alignSelf: 'flex-start',
    paddingVertical: tokens.spacing['3-5'],
    paddingHorizontal: tokens.spacing['4-5'],
    borderRadius: tokens.shape.s,
    borderWidth: tokens.borderWidth.thin,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runLabel: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.high,
  },
  summary: {
    borderWidth: tokens.borderWidth.thin,
    borderRadius: tokens.shape.s,
    padding: tokens.spacing['4'],
    gap: tokens.spacing['3'],
    marginTop: tokens.spacing['3-5'],
  },
  summaryHeading: {
    fontSize: typography.size.m,
    fontWeight: typography.weight.high,
    marginBottom: tokens.spacing['2-5'],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: typography.size.s,
  },
  summaryValue: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
  iterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing['2-5'],
  },
  iterLabel: {
    fontSize: typography.size.s,
  },
  iterValue: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
  gridScroll: {
    gap: tokens.spacing['3-5'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['3'],
    maxWidth: 1200,
  },
});
