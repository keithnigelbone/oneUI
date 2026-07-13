import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMenuCard = forwardRef<SVGSVGElement, IconComponentProps>(function IcMenuCard(
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
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-3 16h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m1-6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1a2 2 0 1 1 0-4h.18a3 3 0 0 1 5.64 0H15a2 2 0 0 1 0 4"
          />
    </svg>
  );
});

IcMenuCard.displayName = 'IcMenuCard';
