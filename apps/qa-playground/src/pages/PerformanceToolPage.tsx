import { Link } from 'react-router-dom';
import { PerformanceTool } from '@/tools/performance/PerformanceTool';
import styles from '@/styles/qa.module.css';

/**
 * Performance page — hosts the duplicated OneUI performance harness in the
 * QA Playground so the testing team can run sweeps and export reports
 * without leaving the playground.
 */
export function PerformanceToolPage() {
  return (
    <div className={`${styles.wrap} ${styles.wrapFullBleed}`}>
      <nav className={styles.catalogNav} aria-label="Breadcrumb">
        <Link to="/" className={styles.catalogBackLink}>
          ← Catalog
        </Link>
      </nav>
      <PerformanceTool />
    </div>
  );
}
