import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcList = forwardRef<SVGSVGElement, IconComponentProps>(function IcList(
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
            d="M20 17H9a1 1 0 0 0 0 2h11a1 1 0 0 0 0-2m0-6H9a1 1 0 0 0 0 2h11a1 1 0 0 0 0-2M9 7h11a1 1 0 1 0 0-2H9a1 1 0 0 0 0 2M4.5 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </svg>
  );
});

IcList.displayName = 'IcList';
