import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTower = forwardRef<SVGSVGElement, IconComponentProps>(function IcTower(
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
            d="M18 2h-.5a1 1 0 0 0-1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 0-1-1H6a2 2 0 0 0-2 2v3a2 2 0 0 0 1.92 2h12.16A2 2 0 0 0 20 7V4a2 2 0 0 0-2-2m-1.23 9H7.19a1 1 0 0 0-1 .92l-1.1 7.93a2 2 0 0 0 2 2.15H9a1 1 0 0 0 1-1v-2.85A2.11 2.11 0 0 1 11.71 16 2 2 0 0 1 14 18v3a1 1 0 0 0 1 1h1.92a2 2 0 0 0 2-2.15L17.81 12a1 1 0 0 0-1.04-1"
          />
    </svg>
  );
});

IcTower.displayName = 'IcTower';
