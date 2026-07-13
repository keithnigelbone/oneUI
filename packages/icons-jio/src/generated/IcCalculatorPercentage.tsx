import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCalculatorPercentage = forwardRef<SVGSVGElement, IconComponentProps>(function IcCalculatorPercentage(
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
            d="M19.12 2.88A3 3 0 0 0 17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-.88-2.12m-3.49 15.75a1.22 1.22 0 0 1-.88.37 1.25 1.25 0 0 1-1.15-.77 1.27 1.27 0 0 1-.08-.72 1.3 1.3 0 0 1 1-1A1.25 1.25 0 0 1 16 17.75a1.22 1.22 0 0 1-.37.88m.08-5.92-6 6a1 1 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l6-6a1.004 1.004 0 1 1 1.42 1.42M8 12.25A1.26 1.26 0 0 1 9.25 11a1.25 1.25 0 0 1 1.15.77c.096.227.124.477.08.72a1.3 1.3 0 0 1-1 1A1.25 1.25 0 0 1 8 12.25M17 7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcCalculatorPercentage.displayName = 'IcCalculatorPercentage';
