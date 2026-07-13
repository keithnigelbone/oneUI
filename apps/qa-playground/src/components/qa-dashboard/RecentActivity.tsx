import { Button } from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/components/Icon';

import type { NotionBug } from '@/services/notion/types';
import styles from '@/styles/qa-dashboard.module.css';

type ActivityColumn = {
  title: string;
  bugs: NotionBug[];
};

type RecentActivityProps = {
  columns: ActivityColumn[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RecentActivity({ columns }: RecentActivityProps) {
  return (
    <div className={styles.activityGrid}>
      {columns.map((col) => (
        <div key={col.title} className={styles.activityCard}>
          <h3 className={styles.activityTitle}>{col.title}</h3>
          <ul className={styles.activityList}>
            {col.bugs.length === 0 ? (
              <li className={styles.activityEmpty}>No recent items</li>
            ) : (
              col.bugs.map((bug) => (
                <li key={bug.id} className={styles.activityItem}>
                  <div className={styles.activityMeta}>
                    <span className={styles.activityBugId}>{bug.bugId}</span>
                    <span className={styles.activityDate}>{formatDate(bug.updatedAt)}</span>
                  </div>
                  <p className={styles.activityBugTitle}>{bug.title}</p>
                  <Button
                    variant="ghost"
                    size={8}
                    appearance="primary"
                    end={<Icon icon="externalLink" size="3" aria-hidden />}
                    onClick={() => window.open(bug.notionUrl, '_blank', 'noopener,noreferrer')}
                  >
                    View in Notion
                  </Button>
                </li>
              ))
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
