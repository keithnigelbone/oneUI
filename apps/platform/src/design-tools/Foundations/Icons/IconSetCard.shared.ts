/**
 * IconSetCard Types
 */

import type { IconSetId, IconSetMetadata } from '@oneui/shared';

export interface IconSetCardProps {
  /** Icon set metadata */
  iconSet: IconSetMetadata;
  /** Whether this icon set is currently selected */
  isSelected: boolean;
  /** Callback when this icon set is selected */
  onSelect: (setId: IconSetId) => void;
  /** Whether selection is disabled */
  disabled?: boolean;
}
