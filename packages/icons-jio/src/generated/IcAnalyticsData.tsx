import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAnalyticsData = forwardRef<SVGSVGElement, IconComponentProps>(function IcAnalyticsData(
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
            d="M12 11.5a1 1 0 0 0 0-2 2.5 2.5 0 0 0 0 5 1 1 0 0 0 0-2 .5.5 0 0 1 0-1m-4.24 3.33a1 1 0 0 0 0 1.41A5.93 5.93 0 0 0 12 18a6 6 0 1 0 0-12 5.93 5.93 0 0 0-4.24 1.76 1 1 0 0 0 1.41 1.41 4 4 0 1 1 0 5.66 1 1 0 0 0-1.41 0M12 2a1 1 0 1 0 0 2 8 8 0 1 1-8 8 1 1 0 1 0-2 0A10 10 0 1 0 12 2"
          />
    </svg>
  );
});

IcAnalyticsData.displayName = 'IcAnalyticsData';
