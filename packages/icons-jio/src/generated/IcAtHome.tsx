import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAtHome = forwardRef<SVGSVGElement, IconComponentProps>(function IcAtHome(
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
            d="M22 10.07a1.53 1.53 0 0 0-.48-.76L13.85 2.7a2.79 2.79 0 0 0-3.7 0L2.53 9.31A1.53 1.53 0 0 0 2.08 11c.098.29.283.54.53.72.242.187.535.295.84.31H4v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V12h.55a1.5 1.5 0 0 0 .84-.31c.247-.18.432-.43.53-.72a1.54 1.54 0 0 0 .08-.9M12 10a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m2 8h-4a1 1 0 0 1-1-1 3 3 0 1 1 6 0 1 1 0 0 1-1 1"
          />
    </svg>
  );
});

IcAtHome.displayName = 'IcAtHome';
