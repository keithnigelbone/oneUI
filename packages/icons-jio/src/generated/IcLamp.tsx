import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLamp = forwardRef<SVGSVGElement, IconComponentProps>(function IcLamp(
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
            d="m19.94 11.51-2-8A2 2 0 0 0 16 2H8a2 2 0 0 0-1.94 1.51l-2 8A2 2 0 0 0 6 14h5v6H8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-6h5a2 2 0 0 0 1.94-2.49"
          />
    </svg>
  );
});

IcLamp.displayName = 'IcLamp';
