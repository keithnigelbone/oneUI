'use client';

import { useState, useCallback } from 'react';
import type {
  FigmaVariable,
  FigmaVariableCollection,
  ComponentTokenManifest,
  ParityMapping,
  ParityEntry,
  ParitySummary,
  SpacingParityMatrix,
} from '@oneui/shared';
import {
  buildMappingTable,
  checkComponentParity,
  summarizeParity,
  buildSpacingParityMatrix,
} from '@oneui/shared';

export interface ParityCheckResult {
  entries: ParityEntry[];
  summary: ParitySummary;
  spacingMatrix: SpacingParityMatrix;
  mappings: ParityMapping[];
}

export interface UseFigmaParityCheckOptions {
  /** Component token manifest to check against */
  manifest: ComponentTokenManifest;
  /** Resolved token values map: CSS token name -> pixel/color value */
  resolvedValues?: Record<string, string>;
  /** Manual mapping overrides from Convex */
  manualMappings?: Record<string, string>;
}

export interface UseFigmaParityCheckReturn {
  /** Whether we're currently running a check */
  isChecking: boolean;
  /** Latest parity check result */
  result: ParityCheckResult | null;
  /** Error from last check */
  error: string | null;
  /** Run a parity check with provided Figma data */
  runCheck: (
    figmaVars: FigmaVariable[],
    collections: FigmaVariableCollection[],
  ) => void;
  /** Clear current results */
  clearResult: () => void;
}

export function useFigmaParityCheck(
  options: UseFigmaParityCheckOptions
): UseFigmaParityCheckReturn {
  const { manifest, resolvedValues, manualMappings } = options;
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<ParityCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(
    (figmaVars: FigmaVariable[], collections: FigmaVariableCollection[]) => {
      setIsChecking(true);
      setError(null);

      try {
        // Build mapping table from Figma variables
        const mappings = buildMappingTable(figmaVars, collections, manualMappings);

        // Check component parity
        const resolved = resolvedValues ?? {};
        const entries = checkComponentParity(manifest, mappings, resolved);

        // Summarize
        const summary = summarizeParity(entries);

        // Build spacing matrix from spacing entries
        const spacingMatrix = buildSpacingParityMatrix(entries);

        setResult({ entries, summary, spacingMatrix, mappings });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Parity check failed');
        setResult(null);
      } finally {
        setIsChecking(false);
      }
    },
    [manifest, resolvedValues, manualMappings]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { isChecking, result, error, runCheck, clearResult };
}
