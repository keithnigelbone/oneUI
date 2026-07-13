import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcReplay = forwardRef<SVGSVGElement, IconComponentProps>(function IcReplay(
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
            d="M11 15c.196-.002.387-.06.55-.17l3-2a1 1 0 0 0 0-1.66l-3-2a1 1 0 0 0-1-.05A1 1 0 0 0 10 10v4a1 1 0 0 0 .53.88c.145.078.306.12.47.12m1-13A10 10 0 0 0 2 12a8 8 0 0 0 .07 1.12 1.007 1.007 0 1 0 2-.24A9 9 0 0 1 4 12a8 8 0 1 1 2.73 6h.77a1 1 0 0 0 0-2h-3a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-.43A10 10 0 1 0 12 2"
          />
    </svg>
  );
});

IcReplay.displayName = 'IcReplay';
