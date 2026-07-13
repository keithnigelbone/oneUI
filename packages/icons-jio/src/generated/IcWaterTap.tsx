import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWaterTap = forwardRef<SVGSVGElement, IconComponentProps>(function IcWaterTap(
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
            d="M9 7h1V5.73a1 1 0 0 1 .86-1L16.14 4a1.006 1.006 0 1 0-.23-2l-9.18.84A3 3 0 0 0 4 5.83V7zm9 2H4v11a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-7a1 1 0 0 1 1-1h6v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2a2 2 0 0 0-2-2m.93 7.25a.45.45 0 0 0-.18-.18.5.5 0 0 0-.68.17l-.89 1.5c-.15.29-.21.617-.17.94.048.323.195.623.42.86.142.139.308.25.49.33a1.46 1.46 0 0 0 1.16 0 1.5 1.5 0 0 0 .49-.33 1.6 1.6 0 0 0 .42-.87 1.57 1.57 0 0 0-.18-.95z"
          />
    </svg>
  );
});

IcWaterTap.displayName = 'IcWaterTap';
