import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTime = forwardRef<SVGSVGElement, IconComponentProps>(function IcTime(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 11a1 1 0 0 1-1 1H9a1 1 0 0 1 0-2h2V9a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcTime.displayName = 'IcTime';
