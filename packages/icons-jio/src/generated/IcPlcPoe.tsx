import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlcPoe = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlcPoe(
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
            d="M18 3h-6a3 3 0 0 0-3 3H7a1 1 0 0 0-1 1v1H4a1 1 0 0 0 0 2h2v2H4a1 1 0 0 0 0 2h2v1a1 1 0 0 0 1 1h2v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-.2 9.6-3 4a.999.999 0 1 1-1.6-1.2L15 13h-2a1 1 0 0 1-.89-.55 1 1 0 0 1 .09-1l3-4a1 1 0 1 1 1.6 1.2L15 11h2a1 1 0 0 1 .8 1.6"
          />
    </svg>
  );
});

IcPlcPoe.displayName = 'IcPlcPoe';
