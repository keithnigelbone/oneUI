import { Link, useNavigate } from 'react-router-dom';
import { QA_CATALOG_ENTRIES } from '@/catalog/registry';
import { storybookPlaygroundPath } from '../qaStorybookNav';
import { Button } from '@oneui/ui/components/Button';
import styles from '../qa-storybook.module.css';

export function QaStorybookDashboardPage() {
  const navigate = useNavigate();
  const total = QA_CATALOG_ENTRIES.length;

  return (
    <div className={styles.dashboardCard}>
      <h1 className={styles.dashboardTitle}>QA Playground Storybook</h1>
      <p className={styles.dashboardBody}>
        Interactive Storybook-style playgrounds for all {total} registry components — live property
        controls, JSX/JSON output, and API reference tables driven from component metadata.
      </p>
      <Button
        attention="high"
        size={10}
        appearance="primary"
        onClick={() => navigate(storybookPlaygroundPath())}
      >
        Open Button
      </Button>
      <p className={styles.dashboardBody}>
        <Link to="/" className={styles.backLink}>
          Back to component catalog
        </Link>
      </p>
    </div>
  );
}
