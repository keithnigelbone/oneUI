import type { SelectOption } from '@oneui/ui/components/Select';
import { Select } from '@oneui/ui/components/Select';
import { getAllowedStatusTargets } from '@/services/notion/bugStatusWorkflow';
import type { NotionBug } from '@/services/notion/types';
import styles from '@/styles/qa-dashboard.module.css';

type BugStatusSelectProps = {
  bug: NotionBug;
  disabled?: boolean;
  onChange: (status: string) => void;
};

export function BugStatusSelect({ bug, disabled, onChange }: BugStatusSelectProps) {
  const targets = getAllowedStatusTargets(bug.status);
  const options: SelectOption<string>[] = [
    { value: bug.status, label: bug.status },
    ...targets
      .filter((status) => status !== bug.status)
      .map((status) => ({ value: status, label: status })),
  ];

  return (
    <div className={styles.statusSelectWrap}>
      <Select
        value={bug.status}
        options={options}
        onChange={onChange}
        size="sm"
        disabled={disabled || targets.length === 0}
        aria-label={`Update status for ${bug.bugId}`}
        className={styles.statusSelect}
      />
    </div>
  );
}
