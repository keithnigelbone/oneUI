import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTextbook = forwardRef<SVGSVGElement, IconComponentProps>(function IcTextbook(
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
            d="M3.5 5v14a3 3 0 0 0 3 3V2a3 3 0 0 0-3 3m14-3h-9v20h9a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M16 10h-3a2 2 0 0 1 0-4h3a2 2 0 0 1 0 4"
          />
    </svg>
  );
});

IcTextbook.displayName = 'IcTextbook';
