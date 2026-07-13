import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWifiStrength2 = forwardRef<SVGSVGElement, IconComponentProps>(function IcWifiStrength2(
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
            d="M21.34 8.59a13.94 13.94 0 0 0-18.68 0A1.002 1.002 0 0 0 4 10.08a11.93 11.93 0 0 1 16 0 1 1 0 0 0 .67.25 1 1 0 0 0 .67-1.74M12 17a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-3.59-2.79a1 1 0 1 0 1.2 1.6 4 4 0 0 1 4.78 0 1 1 0 0 0 1.2-1.6 6 6 0 0 0-7.18 0M12 9a10 10 0 0 0-6.49 2.4 1 1 0 0 0 1.3 1.52 8 8 0 0 1 10.38 0 1 1 0 1 0 1.3-1.52A10 10 0 0 0 12 9"
            opacity={0.2}
          />
          <path
            fill="currentColor"
            d="M15.58 14.21a6 6 0 0 0-7.18 0 1 1 0 1 0 1.2 1.6 4 4 0 0 1 4.78 0 1 1 0 0 0 1.2-1.6M11.99 17a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </svg>
  );
});

IcWifiStrength2.displayName = 'IcWifiStrength2';
