import { Icon } from '@oneui/ui/components/Icon';

import { SvgDonutChart } from './charts/SvgDonutChart';
import type { ComponentRow } from '@/services/notion/bugAnalytics';
import styles from '@/styles/qa-dashboard.module.css';

const CHART_PALETTE = [
  '--Primary-Bold',
  '--Negative-Bold',
  '--Informative-Bold',
  '--Positive-Bold',
  '--Warning-Bold',
  '--Secondary-Bold',
  '--Sparkle-Bold',
  '--Neutral-Bold',
] as const;

type ComponentBreakdownProps = {
  rows: ComponentRow[];
  activeComponent: string;
  onSelectComponent: (component: string) => void;
};

function pct(part: number, total: number): string {
  if (!total) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

export function ComponentBreakdown({ rows, activeComponent, onSelectComponent }: ComponentBreakdownProps) {
  const totalBugs = rows.reduce((sum, row) => sum + row.total, 0);
  const topRows = rows.slice(0, 3);
  const slices = rows.slice(0, 8).map((row, index) => ({
    id: row.component,
    label: row.component,
    value: row.total,
    colorVar: CHART_PALETTE[index % CHART_PALETTE.length],
  }));

  return (
    <div className={styles.componentsSplit}>
      <div className={styles.componentsChartWrap}>
        <SvgDonutChart
          slices={slices}
          size={200}
          hideLegend
          centerLabel={String(rows.length)}
          centerSublabel="Components"
          activeId={activeComponent === 'all' ? null : activeComponent}
          onSliceClick={(id) => onSelectComponent(id)}
        />
      </div>

      <div className={styles.componentStatList}>
        <button
          type="button"
          className={`${styles.componentStatCard} ${styles.componentStatTotal}${activeComponent === 'all' ? ` ${styles.componentStatActive}` : ''}`}
          onClick={() => onSelectComponent('all')}
        >
          <div className={`${styles.componentStatIcon} ${styles.componentStatIconTotal}`} aria-hidden>
            <Icon icon="grid" size="5" />
          </div>
          <div className={styles.componentStatBody}>
            <div className={styles.componentStatTitle}>All components</div>
            <div className={styles.componentStatDesc}>Total bugs across OneUI v5</div>
          </div>
          <div className={styles.componentStatMetrics}>
            <span className={styles.componentStatValue}>{totalBugs}</span>
            <span className={styles.componentStatPill}>100%</span>
          </div>
        </button>

        {topRows.map((row, index) => {
          const tone = index === 0 ? styles.componentStatOpen : styles.componentStatModerate;
          const iconTone =
            index === 0 ? styles.componentStatIconOpen : styles.componentStatIconModerate;
          const selected = activeComponent === row.component;
          return (
            <button
              key={row.component}
              type="button"
              className={`${styles.componentStatCard} ${tone}${selected ? ` ${styles.componentStatActive}` : ''}`}
              onClick={() => onSelectComponent(row.component)}
            >
              <div className={`${styles.componentStatIcon} ${iconTone}`} aria-hidden>
                <Icon icon="components" size="5" />
              </div>
              <div className={styles.componentStatBody}>
                <div className={styles.componentStatTitle}>{row.component}</div>
                <div className={styles.componentStatDesc}>
                  {row.open} active · {row.fixed} closed
                </div>
              </div>
              <div className={styles.componentStatMetrics}>
                <span className={styles.componentStatValue}>{row.total}</span>
                <span className={styles.componentStatPill}>{pct(row.total, totalBugs)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
