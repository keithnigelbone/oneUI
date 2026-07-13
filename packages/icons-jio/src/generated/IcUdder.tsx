import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcUdder = forwardRef<SVGSVGElement, IconComponentProps>(function IcUdder(
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
            d="M19.15 13A10 10 0 0 0 22 6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1 10 10 0 0 0 2.85 7l-1.41 1.75a2 2 0 0 0 3.12 2.5l1.61-2c.592.239 1.205.423 1.83.55V19a2 2 0 0 0 4 0v-3.2q.94-.196 1.83-.56l1.61 2A2 2 0 0 0 19 18a2 2 0 0 0 1.56-3.25z"
          />
    </svg>
  );
});

IcUdder.displayName = 'IcUdder';
