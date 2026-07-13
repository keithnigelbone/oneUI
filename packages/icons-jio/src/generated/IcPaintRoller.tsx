import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPaintRoller = forwardRef<SVGSVGElement, IconComponentProps>(function IcPaintRoller(
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
            d="M18 4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2 1 1 0 0 0 0 2 2 2 0 0 0 2 2h10a2 2 0 0 0 2-2 1 1 0 0 1 1 1v2.23a1 1 0 0 1-.88 1l-5.37.67a2 2 0 0 0-1.75 2V14h-1a1 1 0 0 0-1 1v4a3 3 0 0 0 6 0v-4a1 1 0 0 0-1-1h-1v-1.12l5.37-.67a3 3 0 0 0 2.63-3V7a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcPaintRoller.displayName = 'IcPaintRoller';
