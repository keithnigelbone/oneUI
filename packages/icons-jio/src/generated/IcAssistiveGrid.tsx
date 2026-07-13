import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAssistiveGrid = forwardRef<SVGSVGElement, IconComponentProps>(function IcAssistiveGrid(
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
            d="M3 14.33h4.67V9.67H3zM9.67 21h4.66v-4.67H9.67zM19 3h-2.67v4.67H21V5a2 2 0 0 0-2-2M3 19a2 2 0 0 0 2 2h2.67v-4.67H3zM3 5v2.67h4.67V3H5a2 2 0 0 0-2 2m13.33 16H19a2 2 0 0 0 2-2v-2.67h-4.67zm0-6.67H21V9.67h-4.67zM9.67 7.67h4.66V3H9.67zm0 6.66h4.66V9.67H9.67z"
          />
    </svg>
  );
});

IcAssistiveGrid.displayName = 'IcAssistiveGrid';
