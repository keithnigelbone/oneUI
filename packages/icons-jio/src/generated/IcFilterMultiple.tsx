import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFilterMultiple = forwardRef<SVGSVGElement, IconComponentProps>(function IcFilterMultiple(
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
            d="M4 7h9.18a3 3 0 0 0 5.64 0H20a1 1 0 1 0 0-2h-1.18a3 3 0 0 0-5.64 0H4a1 1 0 0 0 0 2m12-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2m4 12h-1.18a3 3 0 0 0-5.64 0H4a1 1 0 0 0 0 2h9.18a3 3 0 0 0 5.64 0H20a1 1 0 1 0 0-2m-4 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4-8h-9.18a3 3 0 0 0-5.64 0H4a1 1 0 0 0 0 2h1.18a3 3 0 0 0 5.64 0H20a1 1 0 1 0 0-2M8 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcFilterMultiple.displayName = 'IcFilterMultiple';
