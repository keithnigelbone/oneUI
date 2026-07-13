import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMedicineMortar = forwardRef<SVGSVGElement, IconComponentProps>(function IcMedicineMortar(
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
            d="M20.63 6.16a2 2 0 0 0-3.26-2.32L14.4 8h4.92zM20 10H4a1 1 0 0 0-1 1 9 9 0 0 0 5 8.05V20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-.95a9 9 0 0 0 5-8A1 1 0 0 0 20 10m-6 6h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcMedicineMortar.displayName = 'IcMedicineMortar';
