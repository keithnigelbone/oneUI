import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAnalyticsPieChartTwo = forwardRef<SVGSVGElement, IconComponentProps>(function IcAnalyticsPieChartTwo(
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
            d="m19.72 5.66-3.57 3.57a5 5 0 1 1-8.35 0L4.23 5.66a10 10 0 1 0 15.49 0m-5 2.16 3.58-3.57a10 10 0 0 0-12.65 0l3.57 3.57a5 5 0 0 1 5.51 0z"
          />
    </svg>
  );
});

IcAnalyticsPieChartTwo.displayName = 'IcAnalyticsPieChartTwo';
