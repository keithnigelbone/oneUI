import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWeek = forwardRef<SVGSVGElement, IconComponentProps>(function IcWeek(
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
            d="M8 21h3V3H8zM3 5v14a2 2 0 0 0 2 2h1V3H5a2 2 0 0 0-2 2m10 16h3V3h-3zm6-18h-1v18h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcWeek.displayName = 'IcWeek';
