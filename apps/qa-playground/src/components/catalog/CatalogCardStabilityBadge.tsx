import { Badge } from '@oneui/ui/components/Badge';
import type { ComponentTestStability } from '@/lib/qa/componentTestStability';
import styles from '@/styles/catalog.module.css';

const CARD_STABILITY_LABEL: Record<ComponentTestStability, string> = {
  stable: 'Stable',
  unstable: 'Unstable',
  'under-development': 'Not Ready',
};

const CARD_STABILITY_APPEARANCE: Record<
  ComponentTestStability,
  'positive' | 'negative' | 'neutral'
> = {
  stable: 'positive',
  unstable: 'negative',
  'under-development': 'neutral',
};

const CARD_STABILITY_ARIA: Record<ComponentTestStability, string> = {
  stable: 'Stable — Playwright tests passing',
  unstable: 'Unstable — has failed Playwright tests',
  'under-development': 'Not Ready — Playwright tests not implemented yet',
};

export function CatalogCardStabilityBadge({ stability }: { stability: ComponentTestStability }) {
  return (
    <span className={styles.cardBadgeAnchor}>
      <Badge
        size="xs"
        attention="medium"
        appearance={CARD_STABILITY_APPEARANCE[stability]}
        aria-label={CARD_STABILITY_ARIA[stability]}
      >
        {CARD_STABILITY_LABEL[stability]}
      </Badge>
    </span>
  );
}
