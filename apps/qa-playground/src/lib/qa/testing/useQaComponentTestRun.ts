import { useCallback, useEffect, useRef, useState } from 'react';

export type QaComponentTestRunPhase = 'idle' | 'starting' | 'running' | 'success' | 'failed';

export type UseQaComponentTestRunResult = {
  phase: QaComponentTestRunPhase;
  logs: string;
  exitCode: number | null;
  error: string | null;
  isRunning: boolean;
  isComplete: boolean;
  showCompleteModal: boolean;
  dismissCompleteModal: () => void;
  runTests: (slug: string) => Promise<void>;
  reset: () => void;
};

type DoneEvent = {
  ok: boolean;
  exitCode: number;
};

export function useQaComponentTestRun(): UseQaComponentTestRunResult {
  const [phase, setPhase] = useState<QaComponentTestRunPhase>('idle');
  const [logs, setLogs] = useState('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cleanupStream = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  useEffect(() => cleanupStream, [cleanupStream]);

  const reset = useCallback(() => {
    cleanupStream();
    setPhase('idle');
    setLogs('');
    setExitCode(null);
    setError(null);
    setShowCompleteModal(false);
  }, [cleanupStream]);

  const dismissCompleteModal = useCallback(() => {
    setShowCompleteModal(false);
  }, []);

  const runTests = useCallback(
    async (slug: string) => {
      if (!import.meta.env.DEV) {
        setError('Component test runs are only available in the QA playground dev server.');
        setPhase('failed');
        return;
      }

      cleanupStream();
      setPhase('starting');
      setLogs('');
      setExitCode(null);
      setError(null);
      setShowCompleteModal(false);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/qa/component-run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
          signal: controller.signal,
        });

        const payload = (await response.json()) as { runId?: string; error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? `HTTP ${response.status}`);
        }

        if (!payload.runId) {
          throw new Error('Missing run id from server.');
        }

        setPhase('running');

        await new Promise<void>((resolve, reject) => {
          const source = new EventSource(`/api/qa/component-run/${payload.runId}/stream`);
          eventSourceRef.current = source;

          source.addEventListener('log', (event) => {
            try {
              const parsed = JSON.parse((event as MessageEvent).data) as { line?: string };
              if (typeof parsed.line === 'string') {
                setLogs((prev) => prev + parsed.line);
              }
            } catch {
              /* ignore malformed chunks */
            }
          });

          source.addEventListener('done', (event) => {
            source.close();
            eventSourceRef.current = null;

            try {
              const parsed = JSON.parse((event as MessageEvent).data) as DoneEvent;
              setExitCode(parsed.exitCode);
              if (parsed.ok) {
                setPhase('success');
              } else {
                setPhase('failed');
                setError(`Tests finished with exit code ${parsed.exitCode}.`);
              }
              setShowCompleteModal(true);
              resolve();
            } catch (streamError) {
              reject(streamError);
            }
          });

          source.onerror = () => {
            source.close();
            eventSourceRef.current = null;
            reject(new Error('Lost connection to test run stream.'));
          };
        });
      } catch (runError) {
        if (controller.signal.aborted) return;
        cleanupStream();
        setPhase('failed');
        setError(runError instanceof Error ? runError.message : String(runError));
        setShowCompleteModal(true);
      }
    },
    [cleanupStream],
  );

  return {
    phase,
    logs,
    exitCode,
    error,
    isRunning: phase === 'starting' || phase === 'running',
    isComplete: phase === 'success' || phase === 'failed',
    showCompleteModal,
    dismissCompleteModal,
    runTests,
    reset,
  };
}
