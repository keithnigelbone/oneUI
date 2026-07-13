import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNatureOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcNatureOff(
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
            fill="currentColor"
            d="M16.12 3.64A6 6 0 0 0 6 8q.001.561.11 1.11a4 4 0 0 0-2.05 6.59zm1.77 5.47q.108-.549.11-1.11.015-.264 0-.53L20.49 5A1.053 1.053 0 0 0 19 3.51L3.51 19A1.055 1.055 0 0 0 5 20.49L8.44 17H11v3H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-2v-3h4a4 4 0 0 0 .89-7.89"
          />
    </svg>
  );
});

IcNatureOff.displayName = 'IcNatureOff';
