import { SvgBarChart } from './charts/SvgBarChart';
import type { ComponentRow } from '@/services/notion/bugAnalytics';
import styles from '@/styles/qa-dashboard.module.css';

const CHART_PALETTE = [
  '--Primary-Bold',
  '--Secondary-Bold',
  '--Sparkle-Bold',
  '--Informative-Bold',
  '--Positive-Bold',
  '--Warning-Bold',
  '--Negative-Bold',
  '--Neutral-Bold',
] as const;

type ComponentVolumeProps = {
  rows: ComponentRow[];
  activeComponent: string;
  onSelectComponent: (component: string) => void;
};

export function ComponentVolume({ rows, activeComponent, onSelectComponent }: ComponentVolumeProps) {
  const slices = rows.slice(0, 12).map((row, index) => ({
    id: row.component,
    label: row.component,
    value: row.total,
    colorVar: CHART_PALETTE[index % CHART_PALETTE.length],
  }));

  return (
    <div className={styles.volumeBody}>
      <SvgBarChart
        slices={slices}
        height={240}
        activeId={activeComponent === 'all' ? null : activeComponent}
        onBarClick={(id) => onSelectComponent(id)}
      />
      {rows.length > 12 ? (
        <p className={styles.volumeFooterNote}>
          Showing top 12 of {rows.length} components. Use Bug explorer to filter all.
        </p>
      ) : null}
    </div>
  );
}
