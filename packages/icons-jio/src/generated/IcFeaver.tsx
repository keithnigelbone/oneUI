import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFeaver = forwardRef<SVGSVGElement, IconComponentProps>(function IcFeaver(
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
            d="M20 9.28V5a1 1 0 0 0-2 0v4.28A2 2 0 0 0 17 11a2 2 0 0 0 4 0 2 2 0 0 0-1-1.72M11 11a4.5 4.5 0 1 0-4.5-4.5A4.51 4.51 0 0 0 11 11m-1-4h2a1 1 0 1 1 0 2h-2a1 1 0 0 1 0-2m1 5a8 8 0 0 0-8 8 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-8-8"
          />
    </svg>
  );
});

IcFeaver.displayName = 'IcFeaver';
