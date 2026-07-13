import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlaneDeparture = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlaneDeparture(
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
            d="M21.61 7.82A2.06 2.06 0 0 0 19 7.26l-2.76 1.39-6.89-2.59a1 1 0 0 0-.8.05l-2 1a1 1 0 0 0-.55.83 1 1 0 0 0 .45.89l4 2.69L8 12.78l-2.45-1.61a1 1 0 0 0-1-.06l-2 1a1 1 0 0 0-.505 1.199 1 1 0 0 0 .245.401l2.42 2.41a3 3 0 0 0 2.12.88H7a6.3 6.3 0 0 0 2.79-.66l11.1-5.55a2 2 0 0 0 .72-2.97"
          />
    </svg>
  );
});

IcPlaneDeparture.displayName = 'IcPlaneDeparture';
