import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRadioStation = forwardRef<SVGSVGElement, IconComponentProps>(function IcRadioStation(
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
            d="M9.17 5.76a1 1 0 0 0-1.41 0 6 6 0 0 0 0 8.48 1 1 0 0 0 1.41 0 1 1 0 0 0 0-1.41 4 4 0 0 1 0-5.66 1 1 0 0 0 0-1.41M4 10a8 8 0 0 1 2.34-5.66 1 1 0 1 0-1.41-1.41 10 10 0 0 0 0 14.14 1 1 0 0 0 1.41 0 1 1 0 0 0 0-1.41A8 8 0 0 1 4 10m12.24-4.24a1 1 0 0 0-1.41 1.41 4 4 0 0 1 0 5.66 1 1 0 0 0 0 1.41 1 1 0 0 0 1.41 0 6 6 0 0 0 0-8.48m2.83-2.83a1 1 0 0 0-1.41 1.41 8 8 0 0 1 0 11.32 1 1 0 0 0 0 1.41 1 1 0 0 0 1.41 0 10 10 0 0 0 0-14.14M12 8a2 2 0 0 0-2 2 2 2 0 0 0 1 1.72V21a1 1 0 0 0 2 0v-9.28A2 2 0 0 0 14 10a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcRadioStation.displayName = 'IcRadioStation';
