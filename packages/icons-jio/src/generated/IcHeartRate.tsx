import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHeartRate = forwardRef<SVGSVGElement, IconComponentProps>(function IcHeartRate(
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
            d="M15.6 4A5.6 5.6 0 0 0 12 5.46 5.6 5.6 0 0 0 8.4 4 5.36 5.36 0 0 0 3 9.44c.002.526.07 1.05.2 1.56h2.26l1.71-2.55A1 1 0 0 1 8.06 8a1 1 0 0 1 .83.55L11.12 13l1.05-1.56A1 1 0 0 1 13 11h2a1 1 0 0 1 0 2h-1.46l-1.71 2.55A1 1 0 0 1 11 16h-.06a1 1 0 0 1-.83-.55L7.88 11l-1 1.56A1 1 0 0 1 6 13H4c1.15 2.14 3.27 4.35 6.18 7l.49.45a2 2 0 0 0 2.7 0l.49-.44C18.37 15.86 21 12.8 21 9.44A5.36 5.36 0 0 0 15.6 4"
          />
    </svg>
  );
});

IcHeartRate.displayName = 'IcHeartRate';
