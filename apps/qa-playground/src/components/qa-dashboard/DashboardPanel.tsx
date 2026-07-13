import type { ReactNode } from 'react';
import { Icon } from '@oneui/ui/components/Icon';
import type { SemanticIconName } from '@oneui/shared';

import styles from '@/styles/qa-dashboard.module.css';

export type DashboardIconTone = 'primary' | 'positive' | 'informative' | 'warning' | 'negative';

type DashboardPanelProps = {
  title?: string;
  subtitle?: string;
  icon?: SemanticIconName;
  iconTone?: DashboardIconTone;
  headerEnd?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
};

const TONE_CLASS: Record<DashboardIconTone, string> = {
  primary: styles.sectionIconPrimary,
  positive: styles.sectionIconPositive,
  informative: styles.sectionIconInformative,
  warning: styles.sectionIconWarning,
  negative: styles.sectionIconNegative,
};

export function DashboardPanel({
  title,
  subtitle,
  icon,
  iconTone = 'primary',
  headerEnd,
  children,
  className,
  id,
}: DashboardPanelProps) {
  const showHeader = title || subtitle || icon || headerEnd;

  return (
    <section className={`${styles.overviewPanel} ${className ?? ''}`} id={id}>
      {showHeader ? (
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleBlock}>
            {icon ? (
              <div className={`${styles.sectionIcon} ${TONE_CLASS[iconTone]}`} aria-hidden>
                <Icon icon={icon} size="5" />
              </div>
            ) : null}
            <div>
              {title ? <h2 className={styles.panelTitle}>{title}</h2> : null}
              {subtitle ? <p className={styles.panelSubtitle}>{subtitle}</p> : null}
            </div>
          </div>
          {headerEnd ? <div className={styles.sectionHeaderEnd}>{headerEnd}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
