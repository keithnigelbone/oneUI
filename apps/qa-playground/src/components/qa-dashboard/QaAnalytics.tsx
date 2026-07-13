import { Surface } from '@oneui/ui/components/Surface';

import { SvgBarChart } from './charts/SvgBarChart';
import { SvgPieChart } from './charts/SvgPieChart';
import { sortedStatusEntries, type StatusCounts } from '@/services/notion/bugAnalytics';
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

type QaAnalyticsProps = {
  statusCounts: StatusCounts;
  severityCounts: Record<string, number>;
  platformCounts: Array<{ label: string; value: number }>;
  componentCounts: Array<{ label: string; value: number }>;
  assigneeCounts: Array<{ assignee: string; count: number }>;
  reportedByCounts: Array<{ reportedBy: string; count: number }>;
  categoryCounts: Array<{ category: string; count: number }>;
  releaseCounts: Array<{ release: string; count: number }>;
};

function toSlices(items: Array<{ label: string; value: number }>) {
  return items.map((item, index) => ({
    id: item.label,
    label: item.label,
    value: item.value,
    colorVar: CHART_PALETTE[index % CHART_PALETTE.length],
  }));
}

export function QaAnalytics({
  statusCounts,
  severityCounts,
  platformCounts,
  componentCounts,
  assigneeCounts,
  reportedByCounts,
  categoryCounts,
  releaseCounts,
}: QaAnalyticsProps) {
  const statusSlices = sortedStatusEntries(statusCounts).map(([status, value], index) => ({
    id: status,
    label: status,
    value,
    colorVar: CHART_PALETTE[index % CHART_PALETTE.length],
  }));

  const severitySlices = Object.entries(severityCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([severity, value], index) => ({
      id: severity,
      label: severity,
      value,
      colorVar: CHART_PALETTE[index % CHART_PALETTE.length],
    }));

  const platformSlices = toSlices(platformCounts);
  const componentSlices = toSlices(componentCounts);
  const assigneeSlices = toSlices(assigneeCounts.map((a) => ({ label: a.assignee, value: a.count })));
  const reportedBySlices = toSlices(reportedByCounts.map((r) => ({ label: r.reportedBy, value: r.count })));
  const categorySlices = toSlices(categoryCounts.map((c) => ({ label: c.category, value: c.count })));
  const releaseSlices = toSlices(releaseCounts.map((r) => ({ label: r.release, value: r.count })));

  return (
    <div className={styles.analyticsGrid}>
      <Surface mode="ghost" className={styles.analyticsCard}>
        <h3 className={styles.analyticsCardTitle}>Bugs by status</h3>
        <SvgPieChart slices={statusSlices} />
      </Surface>
      <Surface mode="ghost" className={styles.analyticsCard}>
        <h3 className={styles.analyticsCardTitle}>Bugs by severity</h3>
        <SvgBarChart slices={severitySlices} />
      </Surface>
      <Surface mode="ghost" className={styles.analyticsCard}>
        <h3 className={styles.analyticsCardTitle}>Bugs by platform</h3>
        <SvgBarChart slices={platformSlices} />
      </Surface>
      <Surface mode="ghost" className={styles.analyticsCard}>
        <h3 className={styles.analyticsCardTitle}>Bugs by component</h3>
        <SvgBarChart slices={componentSlices} />
      </Surface>
      <Surface mode="ghost" className={styles.analyticsCard}>
        <h3 className={styles.analyticsCardTitle}>Bugs by assignee</h3>
        <SvgBarChart slices={assigneeSlices} />
      </Surface>
      <Surface mode="ghost" className={styles.analyticsCard}>
        <h3 className={styles.analyticsCardTitle}>Bugs by reported by</h3>
        <SvgBarChart slices={reportedBySlices} />
      </Surface>
      <Surface mode="ghost" className={styles.analyticsCard}>
        <h3 className={styles.analyticsCardTitle}>Bugs by category</h3>
        <SvgBarChart slices={categorySlices} />
      </Surface>
      <Surface mode="ghost" className={styles.analyticsCard}>
        <h3 className={styles.analyticsCardTitle}>Bugs by release</h3>
        <SvgBarChart slices={releaseSlices} />
      </Surface>
    </div>
  );
}
