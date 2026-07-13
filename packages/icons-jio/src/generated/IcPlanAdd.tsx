import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlanAdd = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlanAdd(
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
            d="M16.17 8A1 1 0 0 1 16 8h-4a1 1 0 1 1 0-2h2.17a3 3 0 0 1 2-3.87.5.5 0 0 1 .01-.13H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V9.83A3 3 0 0 1 16.17 8M8 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m8 9.5h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m0-5h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m5-9h-1V3a1 1 0 0 0-1-1 1 1 0 0 0-.92.62A.9.9 0 0 0 18 3v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 0 0 2 0V6h1a1 1 0 1 0 0-2"
          />
    </svg>
  );
});

IcPlanAdd.displayName = 'IcPlanAdd';
