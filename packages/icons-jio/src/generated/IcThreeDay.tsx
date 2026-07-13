import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcThreeDay = forwardRef<SVGSVGElement, IconComponentProps>(function IcThreeDay(
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
            d="M3 5v14a2 2 0 0 0 2 2h2.67V3H5a2 2 0 0 0-2 2m6.67 16h4.66V3H9.67zM19 3h-2.67v18H19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcThreeDay.displayName = 'IcThreeDay';
