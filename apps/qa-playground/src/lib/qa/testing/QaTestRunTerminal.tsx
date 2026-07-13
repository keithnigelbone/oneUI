import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@oneui/ui/components/Badge';
import { IconButton } from '@oneui/ui/components/IconButton';
import { copyExecutionLog } from '@/lib/qa/testing/copyExecutionLog';
import type { QaComponentTestRunPhase } from '@/lib/qa/testing/useQaComponentTestRun';
import styles from '@/styles/qa.module.css';

export type QaTestRunTerminalProps = {
  phase: QaComponentTestRunPhase;
  logs: string;
  exitCode: number | null;
  error: string | null;
};

function phaseLabel(phase: QaComponentTestRunPhase): string {
  switch (phase) {
    case 'starting':
      return 'Starting…';
    case 'running':
      return 'Running';
    case 'success':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return 'Idle';
  }
}

function phaseAppearance(
  phase: QaComponentTestRunPhase,
): 'neutral' | 'informative' | 'positive' | 'negative' {
  switch (phase) {
    case 'running':
    case 'starting':
      return 'informative';
    case 'success':
      return 'positive';
    case 'failed':
      return 'negative';
    default:
      return 'neutral';
  }
}

export function QaTestRunTerminal({ phase, logs, exitCode, error }: QaTestRunTerminalProps) {
  const outputRef = useRef<HTMLPreElement>(null);
  const [copyOk, setCopyOk] = useState(false);
  const isComplete = phase === 'success' || phase === 'failed';

  useEffect(() => {
    const node = outputRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (phase === 'starting' || phase === 'running') {
      setCopyOk(false);
    }
  }, [phase]);

  const handleCopyLogs = useCallback(async () => {
    const copied = await copyExecutionLog(logs);
    if (!copied) return;
    setCopyOk(true);
    window.setTimeout(() => setCopyOk(false), 2000);
  }, [logs]);

  if (phase === 'idle' && !logs) return null;

  return (
    <section
      id="qa-test-run-log"
      className={styles.testRunTerminal}
      aria-label="Test execution output"
    >
      <div className={styles.testRunTerminalHeader}>
        <h2 className={styles.testRunTerminalTitle}>Test execution log</h2>
        <div className={styles.testRunTerminalActions}>
          {isComplete && logs.trim() ? (
            <IconButton
              attention="low"
              size={8}
              appearance="secondary"
              icon={copyOk ? 'check' : 'copy'}
              aria-label={copyOk ? 'Logs copied' : 'Copy execution log'}
              onClick={() => void handleCopyLogs()}
            />
          ) : null}
          <Badge size="s" attention="medium" appearance={phaseAppearance(phase)}>
            {phaseLabel(phase)}
            {exitCode != null ? ` · exit ${exitCode}` : ''}
          </Badge>
        </div>
      </div>

      {error ? (
        <p className={styles.testRunTerminalError} role="alert">
          {error}
        </p>
      ) : null}

      <pre ref={outputRef} className={styles.testRunTerminalOutput} aria-live="polite">
        {logs || (phase === 'starting' ? 'Starting test run…\n' : '')}
      </pre>
    </section>
  );
}
