import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTollStation = forwardRef<SVGSVGElement, IconComponentProps>(function IcTollStation(
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
            d="M21 7h-3a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1h-2a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v11a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2V9h2a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1h2v10a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1M7 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcTollStation.displayName = 'IcTollStation';
