import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWifiLocked1 = forwardRef<SVGSVGElement, IconComponentProps>(function IcWifiLocked1(
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
            d="M12 13a6 6 0 0 0-3.59 1.19 1 1 0 1 0 1.2 1.6A4 4 0 0 1 12 15zm0-8a14 14 0 0 0-9.34 3.59A1.002 1.002 0 1 0 4 10.08 11.94 11.94 0 0 1 12 7q.961.005 1.91.16a5.05 5.05 0 0 1 1.89-1.63A13.8 13.8 0 0 0 12 5m.14 6a4.1 4.1 0 0 1 .91-1.7v-.24a9.78 9.78 0 0 0-7.54 2.34 1 1 0 0 0 1.3 1.52A8 8 0 0 1 12 11zm0 6H12a1.5 1.5 0 1 0 1.4 2 4 4 0 0 1-1.25-2z"
            opacity={0.2}
          />
          <path
            fill="currentColor"
            d="M12.15 17H12a1.501 1.501 0 1 0 1.4 2 4 4 0 0 1-1.25-2M21 10.28V10a3 3 0 1 0-6 0v.28A2 2 0 0 0 14 12v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-1-1.72M18 15a1 1 0 1 1 0-1.999A1 1 0 0 1 18 15m-1-5a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcWifiLocked1.displayName = 'IcWifiLocked1';
