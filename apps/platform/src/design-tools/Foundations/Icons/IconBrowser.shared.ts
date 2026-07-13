/**
 * IconBrowser Types
 */

import type { IconSetId } from '@oneui/shared';

export interface IconBrowserProps {
  /** Current icon set to browse */
  iconSetId: IconSetId;
  /** Callback when an icon is clicked */
  onIconClick?: (iconName: string, importSnippet: string) => void;
  /** Maximum height for the browser */
  maxHeight?: number | string;
}

export interface IconGridItemProps {
  /** Icon name */
  name: string;
  /** Icon set ID */
  iconSetId: IconSetId;
  /** Click handler */
  onClick: (name: string) => void;
}
