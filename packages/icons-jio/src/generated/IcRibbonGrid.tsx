import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRibbonGrid = forwardRef<SVGSVGElement, IconComponentProps>(function IcRibbonGrid(
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
            d="M9.5 8C8.67 8 8 8.67 8 9.5S8.67 11 9.5 11s1.5-.67 1.5-1.5S10.33 8 9.5 8m0 10c-.83 0-1.5.67-1.5 1.5S8.67 21 9.5 21s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m0-5c-.83 0-1.5.67-1.5 1.5S8.67 16 9.5 16s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m-5-5C3.67 8 3 8.67 3 9.5S3.67 11 4.5 11 6 10.33 6 9.5 5.33 8 4.5 8m0 5c-.83 0-1.5.67-1.5 1.5S3.67 16 4.5 16 6 15.33 6 14.5 5.33 13 4.5 13m15-7c.83 0 1.5-.67 1.5-1.5S20.33 3 19.5 3 18 3.67 18 4.5 18.67 6 19.5 6m-15 12c-.83 0-1.5.67-1.5 1.5S3.67 21 4.5 21 6 20.33 6 19.5 5.33 18 4.5 18m0-15C3.67 3 3 3.67 3 4.5S3.67 6 4.5 6 6 5.33 6 4.5 5.33 3 4.5 3m15 15c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m0-5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m-5-10c-.83 0-1.5.67-1.5 1.5S13.67 6 14.5 6 16 5.33 16 4.5 15.33 3 14.5 3m5 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S20.33 8 19.5 8m-10-5C8.67 3 8 3.67 8 4.5S8.67 6 9.5 6 11 5.33 11 4.5 10.33 3 9.5 3m5 15c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m0-5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m0-5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S15.33 8 14.5 8"
          />
    </svg>
  );
});

IcRibbonGrid.displayName = 'IcRibbonGrid';
