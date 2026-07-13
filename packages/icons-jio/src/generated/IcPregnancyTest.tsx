import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPregnancyTest = forwardRef<SVGSVGElement, IconComponentProps>(function IcPregnancyTest(
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
            d="M20.41 3.59a2 2 0 0 0-2.3-.38L12.45 6 18 11.55l2.83-5.66a2 2 0 0 0-.42-2.3M4.17 14.17a4.002 4.002 0 0 0 5.66 5.66L16.62 13 11 7.38zm7.54-2.88 1 1a1 1 0 0 1 0 1.42 1 1 0 0 1-1.42 0l-1-1a1.004 1.004 0 0 1 1.42-1.42"
          />
    </svg>
  );
});

IcPregnancyTest.displayName = 'IcPregnancyTest';
