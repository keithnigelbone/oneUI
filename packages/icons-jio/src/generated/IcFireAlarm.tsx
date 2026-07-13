import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFireAlarm = forwardRef<SVGSVGElement, IconComponentProps>(function IcFireAlarm(
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
            d="M9.5 16A6.5 6.5 0 1 0 3 9.5 6.51 6.51 0 0 0 9.5 16m0-8.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4M19 7a2 2 0 0 0 0 4v3a4 4 0 0 1-4 4h-.5v-1.64a8.44 8.44 0 0 1-10 0V19a2 2 0 0 0 2 2h6a2 2 0 0 0 1.72-1H15a6 6 0 0 0 6-6V9a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcFireAlarm.displayName = 'IcFireAlarm';
