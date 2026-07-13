import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWaterPump = forwardRef<SVGSVGElement, IconComponentProps>(function IcWaterPump(
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
            d="M18.71 15.29a1 1 0 0 0-1.42 0l-.59.6a1.8 1.8 0 0 0-.53 1.28 1.82 1.82 0 0 0 3.12 1.29 1.81 1.81 0 0 0 0-2.55zM13 19h-1v-5H8v5H7a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m2-12h-1.18A3 3 0 0 0 12 5.18V5a2 2 0 1 0-4 0v.18A3 3 0 0 0 6.18 7H6a2 2 0 1 0 0 4h.18A3 3 0 0 0 9 13h2a3 3 0 0 0 2.82-2H15a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1a5 5 0 0 0-5-5"
          />
    </svg>
  );
});

IcWaterPump.displayName = 'IcWaterPump';
