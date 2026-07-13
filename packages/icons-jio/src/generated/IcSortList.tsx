import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSortList = forwardRef<SVGSVGElement, IconComponentProps>(function IcSortList(
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
            d="M10 17H4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m0-6H4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m8.79 3.29-1.29 1.3V11.5a1 1 0 0 0-2 0v4.09l-1.29-1.3a1.004 1.004 0 1 0-1.42 1.42l3 3a1 1 0 0 0 1.42 0l3-3a1.004 1.004 0 0 0-1.42-1.42M20 5H4a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2"
          />
    </svg>
  );
});

IcSortList.displayName = 'IcSortList';
