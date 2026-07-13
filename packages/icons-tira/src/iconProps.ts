import type { ComponentType, SVGProps } from 'react';

export type IconComponentProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

export type IconComponent = ComponentType<IconComponentProps>;
