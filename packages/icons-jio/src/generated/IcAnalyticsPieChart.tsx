import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAnalyticsPieChart = forwardRef<SVGSVGElement, IconComponentProps>(function IcAnalyticsPieChart(
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
            d="M12 17a5 5 0 0 1-2-9.57V2.2A10 10 0 1 0 21.8 14h-5.23A5 5 0 0 1 12 17m2-5h8A10 10 0 0 0 12 2v8a2 2 0 0 0 2 2"
          />
    </svg>
  );
});

IcAnalyticsPieChart.displayName = 'IcAnalyticsPieChart';
