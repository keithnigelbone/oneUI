import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcInformationSensor = forwardRef<SVGSVGElement, IconComponentProps>(function IcInformationSensor(
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
            d="M8.82 14.39a4 4 0 0 1 0-4.78 1.002 1.002 0 1 0-1.59-1.22 6 6 0 0 0 0 7.22 1.002 1.002 0 0 0 1.59-1.22M4 12a8 8 0 0 1 2.05-5.33A1 1 0 0 0 6.3 6a1 1 0 0 0-.3-.74 1 1 0 0 0-1.41.07 10 10 0 0 0 0 13.34 1.002 1.002 0 0 0 1.49-1.34A8 8 0 0 1 4 12m7.43-3.11c.272.111.572.139.86.08a1.49 1.49 0 0 0 1.18-1.18c.059-.288.03-.588-.08-.86a1.55 1.55 0 0 0-.56-.68 1.5 1.5 0 1 0-1.4 2.64m8-3.56A1 1 0 0 0 18 6.67a8 8 0 0 1 0 10.66 1 1 0 0 0-.25.67 1 1 0 0 0 1.74.67 10 10 0 0 0 0-13.34zm-2.66 3.06a1.002 1.002 0 0 0-1.59 1.22 4 4 0 0 1 0 4.78 1.002 1.002 0 1 0 1.59 1.22 6 6 0 0 0 0-7.22M14 16h-1v-4a1 1 0 0 0-1-1h-1a1 1 0 1 0 0 2v3h-1a1 1 0 1 0 0 2h4a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcInformationSensor.displayName = 'IcInformationSensor';
