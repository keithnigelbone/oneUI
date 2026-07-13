import styles from '../qa-storybook.module.css';

export function QaStorybookIntroductionPage() {
  return (
    <div className={styles.dashboardCard}>
      <h1 className={styles.dashboardTitle}>Introduction</h1>
      <p className={styles.dashboardBody}>
        Browse any component from the sidebar under Atoms or Molecules. Each page exposes
        metadata-driven controls, a live preview, generated JSX/JSON, and an API reference table.
      </p>
    </div>
  );
}
