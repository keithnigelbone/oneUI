import { SvgBarChart } from './charts/SvgBarChart';
import { SvgPieChart } from './charts/SvgPieChart';
import styles from '@/styles/qa-dashboard.module.css';

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '--Negative-Bold',
  Major: '--Warning-Bold',
  High: '--Warning-Bold',
  Medium: '--Informative-Bold',
  Minor: '--Neutral-Bold',
  Low: '--Neutral-Bold',
};

const CHART_PALETTE = [
  '--Negative-Bold',
  '--Warning-Bold',
  '--Informative-Bold',
  '--Neutral-Bold',
  '--Primary-Bold',
] as const;

type SeverityDashboardProps = {
  counts: Record<string, number>;
  activeSeverity: string;
  onSelectSeverity: (severity: string) => void;
};

export function SeverityDashboard({ counts, activeSeverity, onSelectSeverity }: SeverityDashboardProps) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const slices = entries.map(([severity, value], index) => ({
    id: severity,
    label: severity,
    value,
    colorVar: SEVERITY_COLORS[severity] ?? CHART_PALETTE[index % CHART_PALETTE.length],
  }));

  return (
    <div className={styles.dualChartRow}>
      <SvgPieChart
        slices={slices}
        activeId={activeSeverity === 'all' ? null : activeSeverity}
        onSliceClick={(id) => onSelectSeverity(id)}
      />
      <SvgBarChart
        slices={slices}
        height={220}
        activeId={activeSeverity === 'all' ? null : activeSeverity}
        onBarClick={(id) => onSelectSeverity(id)}
      />
    </div>
  );
}
