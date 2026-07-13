import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAnalyticsPieChartTree = forwardRef<SVGSVGElement, IconComponentProps>(function IcAnalyticsPieChartTree(
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
            d="M16.9 11H22a10 10 0 0 0-9-8.95V7.1a5 5 0 0 1 3.9 3.9M13 16.89V22a10 10 0 0 0 9-9h-5.1a5 5 0 0 1-3.9 3.89M2 12a10 10 0 0 0 9 10v-5.1a5 5 0 0 1 0-9.8v-5A10 10 0 0 0 2 12"
          />
    </svg>
  );
});

IcAnalyticsPieChartTree.displayName = 'IcAnalyticsPieChartTree';
