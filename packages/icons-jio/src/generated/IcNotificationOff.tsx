import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNotificationOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcNotificationOff(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path
                d='M12 2a8 8 0 00-8 8v5.76L16.42 3.34A7.89 7.89 0 0012 2zm9 14h-1v-6a8.001 8.001 0 00-.89-3.66L20.49 5a1.055 1.055 0 00-.745-1.799A1.053 1.053 0 0019 3.51L3.51 19A1.055 1.055 0 005 20.49L7.44 18H21a1 1 0 100-2zm-9 6a3 3 0 003-3H9a3 3 0 003 3z'
                fill='currentColor'
              />
    </svg>
  );
});

IcNotificationOff.displayName = 'IcNotificationOff';
