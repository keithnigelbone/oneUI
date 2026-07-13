import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDay = forwardRef<SVGSVGElement, IconComponentProps>(function IcDay(
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
            d="M20 19H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2M4 5h16a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m15 2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcDay.displayName = 'IcDay';
