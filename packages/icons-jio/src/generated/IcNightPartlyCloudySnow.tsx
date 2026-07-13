import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNightPartlyCloudySnow = forwardRef<SVGSVGElement, IconComponentProps>(function IcNightPartlyCloudySnow(
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
            d="M20.19 11.8C19.85 10.2 18.47 9 16.8 9c-1.3 0-2.42.74-3.01 1.82-.15-.03-.3-.05-.46-.05-1.44 0-2.6 1.19-2.6 2.67-.96 0-1.73.8-1.73 1.78S9.78 17 10.73 17h8.67c1.44 0 2.6-1.19 2.6-2.67 0-1.19-.77-2.19-1.81-2.53m-6.48 6.49a.996.996 0 0 0-1.41 0l-.29.29-.29-.29a.996.996 0 1 0-1.41 1.41l.29.29-.29.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l.29-.29.29.29c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-.29-.29.29-.29a.996.996 0 0 0 0-1.41zm6 0a.996.996 0 0 0-1.41 0l-.29.29-.29-.29a.996.996 0 1 0-1.41 1.41l.29.29-.29.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l.29-.29.29.29c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-.29-.29.29-.29a.996.996 0 0 0 0-1.41zm-6.93-9.48c.34-.38.73-.7 1.15-.96.15-2.31-.9-4.38-2.58-5.65-.74-.56-1.83.17-1.55 1.06.38 1.23.31 2.65-.38 4.09-.43.89-1.16 1.62-2.05 2.05-1.44.7-2.86.76-4.09.38-.89-.27-1.63.81-1.06 1.55a6.49 6.49 0 0 0 5.04 2.59c.32-.89.95-1.62 1.77-2.06.58-1.64 2.03-2.85 3.78-3.07z"
          />
    </svg>
  );
});

IcNightPartlyCloudySnow.displayName = 'IcNightPartlyCloudySnow';
