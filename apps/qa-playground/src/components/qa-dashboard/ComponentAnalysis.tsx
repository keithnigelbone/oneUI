import type { ComponentRow } from '@/services/notion/bugAnalytics';
import styles from '@/styles/qa-dashboard.module.css';

type ComponentAnalysisProps = {
  rows: ComponentRow[];
  onSelectComponent: (component: string) => void;
};

export function ComponentAnalysis({ rows, onSelectComponent }: ComponentAnalysisProps) {
  return (
    <div className={styles.tableScroll}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Total</th>
              <th scope="col">Open</th>
              <th scope="col">Fixed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.component}>
                <th scope="row">
                  <button type="button" className={styles.tableLink} onClick={() => onSelectComponent(row.component)}>
                    {row.component}
                  </button>
                </th>
                <td>{row.total}</td>
                <td>{row.open}</td>
                <td>{row.fixed}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}
