import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGroup = forwardRef<SVGSVGElement, IconComponentProps>(function IcGroup(
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
            d="M10 11a4.5 4.5 0 1 0-4.5-4.5A4.51 4.51 0 0 0 10 11m8 1a3 3 0 1 0 0-5.999A3 3 0 0 0 18 12m0 1a4 4 0 0 0-2.67 1A8 8 0 0 0 2 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-.07-1H20a2 2 0 0 0 2-2 4 4 0 0 0-4-4"
          />
    </svg>
  );
});

IcGroup.displayName = 'IcGroup';
