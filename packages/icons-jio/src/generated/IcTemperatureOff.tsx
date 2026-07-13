import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTemperatureOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcTemperatureOff(
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
            d="m20.714 19.29-16-16a1.004 1.004 0 1 0-1.42 1.42l4.71 4.7V14a5 5 0 0 0 7.54 6.54 5.05 5.05 0 0 0 1.28-2.3l2.47 2.47a1.002 1.002 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095m-7.3-1.75a1.43 1.43 0 0 1-.56.7 1.52 1.52 0 0 1-1.7 0 1.47 1.47 0 0 1-.61-1.59 1.47 1.47 0 0 1 .46-.76v-3.48l2 2v1.48c.228.2.389.465.46.76.08.294.062.606-.05.89M11.004 6a1 1 0 1 1 2 0v2.76l3 3V6a4 4 0 0 0-6.83-2.83 4 4 0 0 0-.72 1l2.55 2.59z"
          />
    </svg>
  );
});

IcTemperatureOff.displayName = 'IcTemperatureOff';
