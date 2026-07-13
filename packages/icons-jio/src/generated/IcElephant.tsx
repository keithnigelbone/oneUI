import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcElephant = forwardRef<SVGSVGElement, IconComponentProps>(function IcElephant(
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
            d="M17 3h-4a4 4 0 0 0-4 4c.001.338.048.675.14 1q.087.353.25.68.067.167.16.32a3 3 0 0 0 .29.44c.06.07.11.15.18.22q.274.311.6.57a1 1 0 0 1 .21 1.4 1 1 0 0 1-1.4.2A6 6 0 0 1 7.09 8H6a3 3 0 0 0-3 3v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h4v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-7a1 1 0 0 1 2 0v3a2 2 0 0 0 4 0V7a4 4 0 0 0-4-4m-1 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcElephant.displayName = 'IcElephant';
