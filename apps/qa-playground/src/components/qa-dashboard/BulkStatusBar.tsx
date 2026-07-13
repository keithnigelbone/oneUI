import { useMemo, useState } from 'react';
import type { SelectOption } from '@oneui/ui/components/Select';
import { Select } from '@oneui/ui/components/Select';
import { Button } from '@oneui/ui/components/Button';
import { Modal } from '@oneui/ui/components/Modal';
import { BULK_STATUS_TARGETS } from '@/services/notion/bugStatusWorkflow';
import styles from '@/styles/qa-dashboard.module.css';

type BulkStatusBarProps = {
  selectedCount: number;
  disabled?: boolean;
  onApply: (status: string) => Promise<void>;
  onClear: () => void;
};

export function BulkStatusBar({ selectedCount, disabled, onApply, onClear }: BulkStatusBarProps) {
  const [targetStatus, setTargetStatus] = useState<string>(BULK_STATUS_TARGETS[0]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const options: SelectOption<string>[] = useMemo(
    () => BULK_STATUS_TARGETS.map((status) => ({ value: status, label: status })),
    [],
  );

  if (selectedCount === 0) return null;

  const handleConfirm = async () => {
    setApplying(true);
    try {
      await onApply(targetStatus);
      setConfirmOpen(false);
      onClear();
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <div className={styles.bulkBar} role="region" aria-label="Bulk bug actions">
        <span className={styles.bulkBarCount}>
          {selectedCount} bug{selectedCount === 1 ? '' : 's'} selected
        </span>
        <label className={styles.bulkBarField}>
          <span className={styles.bulkBarLabel}>Set status to</span>
          <Select
            value={targetStatus}
            options={options}
            onChange={setTargetStatus}
            size="sm"
            disabled={disabled || applying}
            aria-label="Bulk status target"
          />
        </label>
        <Button
          variant="bold"
          size={8}
          appearance="primary"
          disabled={disabled || applying}
          onClick={() => setConfirmOpen(true)}
        >
          Apply to selected
        </Button>
        <Button variant="ghost" size={8} appearance="neutral" onClick={onClear} disabled={applying}>
          Clear selection
        </Button>
      </div>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        size="S"
        title="Confirm bulk status update"
        description={`Update ${selectedCount} bug${selectedCount === 1 ? '' : 's'} to "${targetStatus}" in Notion?`}
        footerEnd={
          <>
            <Button variant="ghost" size={8} appearance="neutral" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="bold"
              size={8}
              appearance="primary"
              disabled={applying}
              onClick={() => void handleConfirm()}
            >
              {applying ? 'Updating…' : 'Confirm'}
            </Button>
          </>
        }
      >
        <span />
      </Modal>
    </>
  );
}
