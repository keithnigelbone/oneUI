import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVisibleOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcVisibleOff(
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
            d="M21.69 10.74A10.54 10.54 0 0 0 18.41 7l-3.7 3.69a3 3 0 0 1-4 4L20.49 5a1.052 1.052 0 0 0-.342-1.719A1.05 1.05 0 0 0 19 3.51L3.51 19a1.052 1.052 0 0 0 1.148 1.718q.193-.08.342-.228L7.42 18c1.439.652 3 .993 4.58 1a10.87 10.87 0 0 0 9.69-5.74 2.74 2.74 0 0 0 0-2.52m-7.23-5.45A11 11 0 0 0 12 5a10.87 10.87 0 0 0-9.69 5.74 2.74 2.74 0 0 0 0 2.52c.469.889 1.061 1.707 1.76 2.43z"
          />
    </svg>
  );
});

IcVisibleOff.displayName = 'IcVisibleOff';
