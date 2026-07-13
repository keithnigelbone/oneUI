import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSpade = forwardRef<SVGSVGElement, IconComponentProps>(function IcSpade(
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
            d="M16 11h-3V9h.13a1 1 0 0 0 1-.86L14.58 5a2.61 2.61 0 1 0-5.16 0l.46 3.17a1 1 0 0 0 1 .86H11v2H8a2 2 0 0 0-2 2v4.38a3 3 0 0 0 1.66 2.69l3.45 1.72a2 2 0 0 0 1.78 0l3.45-1.72A3 3 0 0 0 18 17.38V13a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcSpade.displayName = 'IcSpade';
