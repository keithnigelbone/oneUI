import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBloodTest = forwardRef<SVGSVGElement, IconComponentProps>(function IcBloodTest(
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
            d="M11 14.52a5.43 5.43 0 0 1 1.62-3.89L14 9.26V5h.5a1.5 1.5 0 0 0 0-3h-9a1.5 1.5 0 0 0 0 3H6v13a4 4 0 0 0 7.78 1.26A5.37 5.37 0 0 1 11 14.52M8 9V5h4v4zm11 3.05-1.76-1.76a1 1 0 0 0-1.42 0L14 12.05A3.48 3.48 0 0 0 14 17a3.51 3.51 0 0 0 5 0 3.4 3.4 0 0 0 1-2.46 3.46 3.46 0 0 0-1-2.49"
          />
    </svg>
  );
});

IcBloodTest.displayName = 'IcBloodTest';
