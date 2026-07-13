import type { PlatformRow } from '@/services/notion/bugAnalytics';
import styles from '@/styles/qa-dashboard.module.css';

type PlatformMetricsTableProps = {
  rows: PlatformRow[];
  onFilter: (platform: string) => void;
};

export function PlatformMetricsTable({ rows, onFilter }: PlatformMetricsTableProps) {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th scope="col">Platform</th>
            <th scope="col">Total</th>
            <th scope="col">Active</th>
            <th scope="col">Closed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.platform}>
              <th scope="row">{row.platform}</th>
              <td>
                <button type="button" className={styles.tableLink} onClick={() => onFilter(row.platform)}>
                  {row.total}
                </button>
              </td>
              <td>{row.open}</td>
              <td>{row.closed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
