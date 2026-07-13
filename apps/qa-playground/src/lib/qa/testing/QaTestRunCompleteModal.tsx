import { useCallback, useEffect, useState } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/components/Icon';
import { Modal } from '@oneui/ui/components/Modal';
import { copyExecutionLog } from '@/lib/qa/testing/copyExecutionLog';
import styles from '@/styles/qa.module.css';

export type QaTestRunCompleteModalProps = {
  open: boolean;
  ok: boolean;
  componentName: string;
  exitCode: number | null;
  logs: string;
  onClose: () => void;
  onLoadReport?: () => void;
};

export function QaTestRunCompleteModal({
  open,
  ok,
  componentName,
  exitCode,
  logs,
  onClose,
  onLoadReport,
}: QaTestRunCompleteModalProps) {
  const [copyOk, setCopyOk] = useState(false);

  useEffect(() => {
    if (!open) setCopyOk(false);
  }, [open]);

  const handleCopyLogs = useCallback(async () => {
    const copied = await copyExecutionLog(logs);
    if (!copied) return;
    setCopyOk(true);
    window.setTimeout(() => setCopyOk(false), 2000);
  }, [logs]);

  const handleViewLog = useCallback(() => {
    onClose();
    window.requestAnimationFrame(() => {
      document.getElementById('qa-test-run-log')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, [onClose]);

  const title = ok ? 'Tests completed' : 'Tests failed';
  const exitSuffix = exitCode != null ? ` (exit code ${exitCode})` : '';
  const hasLogs = logs.trim().length > 0;

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      size="M"
      title={title}
      showDescription={false}
      footer
      footerStart={
        hasLogs ? (
          <span className={styles.testRunCompleteFooterStart}>
            <Button attention="low" onPress={() => void handleCopyLogs()}>
              {copyOk ? 'Copied' : 'Copy logs'}
            </Button>
            {!ok ? (
              <Button attention="low" onPress={handleViewLog}>
                View log
              </Button>
            ) : null}
          </span>
        ) : null
      }
      footerEnd={
        <>
          {onLoadReport ? (
            <Button
              attention="medium"
              onPress={() => {
                onLoadReport();
                onClose();
              }}
            >
              Load report
            </Button>
          ) : null}
          <Button attention="high" onPress={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className={styles.testRunCompleteBody}>
        <Icon
          icon={ok ? 'checkCircle' : 'error'}
          size="8"
          appearance={ok ? 'positive' : 'negative'}
          emphasis="high"
          aria-hidden
        />
        {ok ? (
          <p className={styles.testRunCompleteMessage}>
            Test execution completed successfully for <strong>{componentName}</strong>.
          </p>
        ) : (
          <p className={styles.testRunCompleteMessage}>
            Test execution failed for <strong>{componentName}</strong>
            {exitSuffix}. Review the execution log below for details.
          </p>
        )}
      </div>
    </Modal>
  );
}
