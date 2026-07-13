import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDoorSensor = forwardRef<SVGSVGElement, IconComponentProps>(function IcDoorSensor(
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
            d="M15.23 2.42a2 2 0 0 0-1.72-.36l-8 2A2 2 0 0 0 4 6v12a2 2 0 0 0 1.51 1.94l8 2q.241.06.49.06a2 2 0 0 0 1.798-1.12c.133-.275.202-.575.202-.88V4a2 2 0 0 0-.77-1.58M13 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2m6-9a1 1 0 0 0-1 1v14a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcDoorSensor.displayName = 'IcDoorSensor';
