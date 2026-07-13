import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPreviousTitle = forwardRef<SVGSVGElement, IconComponentProps>(function IcPreviousTitle(
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
            d="M6 4a1 1 0 0 0-1 1v14a1 1 0 1 0 2 0V5a1 1 0 0 0-1-1m11.89.21a2 2 0 0 0-2.09.19l-8 6a2 2 0 0 0 0 3.2l8 6A2 2 0 0 0 19 18V6a2 2 0 0 0-1.11-1.79"
          />
    </svg>
  );
});

IcPreviousTitle.displayName = 'IcPreviousTitle';
