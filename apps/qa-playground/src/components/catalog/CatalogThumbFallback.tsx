import type { ComponentMeta } from '@oneui/shared';
import { Icon } from '@oneui/ui/components/Icon';
import { CATALOG_CATEGORY_ICON } from '@/lib/qa/catalogCategoryMeta';
import styles from '@/styles/catalog.module.css';

/** Shown when a catalog card cannot render a live component preview. */
export function CatalogThumbFallback({ meta }: { meta: ComponentMeta }) {
  const icon = CATALOG_CATEGORY_ICON[meta.category] ?? 'grid';

  return (
    <div className={styles.thumbFallback} aria-hidden>
      <span className={styles.thumbFallbackIcon}>
        <Icon icon={icon} size="8" emphasis="low" />
      </span>
      <span className={styles.thumbFallbackName}>{meta.displayName}</span>
    </div>
  );
}
