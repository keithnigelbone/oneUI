import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDistribution = forwardRef<SVGSVGElement, IconComponentProps>(function IcDistribution(
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
            d="M19 10a2 2 0 1 0-2-2 1.4 1.4 0 0 0 0 .19l-3.3 2.35a3 3 0 0 0-.72-.36V5.72A2 2 0 0 0 14 4a2 2 0 1 0-4 0 2 2 0 0 0 1 1.72v4.46A3 3 0 0 0 9.18 12H6.72A2 2 0 0 0 5 11a2 2 0 1 0 0 4 2 2 0 0 0 1.72-1h2.46a3.1 3.1 0 0 0 1.08 1.44l-.75 2.63A2 2 0 1 0 12 20a2 2 0 0 0-.56-1.39l.75-2.61a2.9 2.9 0 0 0 1.33-.41L16 17.66V18a2 2 0 1 0 2-2 1.9 1.9 0 0 0-.68.13L14.81 14c.115-.321.18-.659.19-1a2.8 2.8 0 0 0-.13-.82l3.31-2.36A2 2 0 0 0 19 10"
          />
    </svg>
  );
});

IcDistribution.displayName = 'IcDistribution';
