import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSleet = forwardRef<SVGSVGElement, IconComponentProps>(function IcSleet(
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
            d="M8.71 15.29a.996.996 0 0 0-1.41 0l-.29.29-.29-.29a.996.996 0 1 0-1.41 1.41l.29.29-.29.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l.29-.29.29.29c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-.29-.29.29-.29a.996.996 0 0 0 0-1.41zm10.73-6.91c.03-.21.06-.42.06-.63C19.5 5.13 17.37 3 14.75 3c-1.64 0-3.08.83-3.93 2.09A3.7 3.7 0 0 0 10 5a3.98 3.98 0 0 0-3.86 3.01C6.09 8.01 6.05 8 6 8c-1.66 0-3 1.34-3 3s1.34 3 3 3h12c1.66 0 3-1.34 3-3 0-1.13-.64-2.11-1.56-2.62M12 17c-.5 0-1.5 1.67-1.5 2.5S11.17 21 12 21s1.5-.67 1.5-1.5-1-2.5-1.5-2.5m5-2c-.5 0-1.5 1.67-1.5 2.5S16.17 19 17 19s1.5-.67 1.5-1.5-1-2.5-1.5-2.5"
          />
    </svg>
  );
});

IcSleet.displayName = 'IcSleet';
