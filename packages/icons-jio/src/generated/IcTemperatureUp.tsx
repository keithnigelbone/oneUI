import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTemperatureUp = forwardRef<SVGSVGElement, IconComponentProps>(function IcTemperatureUp(
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
            d="m20.71 6.29-2-2a1 1 0 0 0-1.42 0l-2 2a1.004 1.004 0 1 0 1.42 1.42l.29-.3V19a1 1 0 0 0 2 0V7.41l.29.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42M12 7a4 4 0 1 0-8 0v6a4.94 4.94 0 0 0-1 3 5 5 0 1 0 10 0 4.94 4.94 0 0 0-1-3zM8 18a2 2 0 0 1-2-2 2 2 0 0 1 1-1.72V8a1 1 0 0 1 2 0v6.28A2 2 0 0 1 10 16a2 2 0 0 1-2 2"
          />
    </svg>
  );
});

IcTemperatureUp.displayName = 'IcTemperatureUp';
