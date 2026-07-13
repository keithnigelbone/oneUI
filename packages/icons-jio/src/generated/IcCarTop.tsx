import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCarTop = forwardRef<SVGSVGElement, IconComponentProps>(function IcCarTop(
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
            d="M19 8h-1V6a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v2H5a1 1 0 0 0 0 2h1v8a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-8h1a1 1 0 1 0 0-2m-4.5 11h-5A1.5 1.5 0 0 1 8 17.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5 1.5 1.5 0 0 1-1.5 1.5m1-8h-7a.5.5 0 0 1-.5-.5A3.5 3.5 0 0 1 11.5 7h1a3.5 3.5 0 0 1 3.5 3.5.5.5 0 0 1-.5.5"
          />
    </svg>
  );
});

IcCarTop.displayName = 'IcCarTop';
