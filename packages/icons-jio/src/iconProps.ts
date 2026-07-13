import type { ComponentType, SVGProps } from 'react';

/**
 * Local copy of IconComponentProps to avoid an external dependency on @oneui/shared
 * in the published @jds4/oneui-icons-jio package.
 */
export type IconComponentProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

export type IconComponent = ComponentType<IconComponentProps>;
