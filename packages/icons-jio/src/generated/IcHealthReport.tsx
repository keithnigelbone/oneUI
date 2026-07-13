import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHealthReport = forwardRef<SVGSVGElement, IconComponentProps>(function IcHealthReport(
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
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M7 7h1V6a1 1 0 0 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0V9H7a1 1 0 0 1 0-2m10 12H7a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2m0-4H7a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2m0-4h-3a1 1 0 0 1 0-2h3a1 1 0 1 1 0 2m0-4h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcHealthReport.displayName = 'IcHealthReport';
