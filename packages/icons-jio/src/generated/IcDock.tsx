import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDock = forwardRef<SVGSVGElement, IconComponentProps>(function IcDock(
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
            d="M19.14 4H8.86C7.83 4 7 4.83 7 5.86v7.28C7 14.17 7.83 15 8.86 15h10.28c1.03 0 1.86-.83 1.86-1.86V5.86C21 4.83 20.17 4 19.14 4M19 13H9V6h10zm-4 4H6c-.55 0-1-.45-1-1V9c0-.55-.45-1-1-1s-1 .45-1 1v7c0 1.65 1.35 3 3 3h9c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </svg>
  );
});

IcDock.displayName = 'IcDock';
