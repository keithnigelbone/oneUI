import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoonrise = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoonrise(
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
            d="M15 18H9c-.27 0-.52.11-.71.29A1 1 0 0 0 8 19c0 .27.11.52.29.71.19.19.44.29.71.29h6c.27 0 .52-.11.71-.29s.29-.44.29-.71-.11-.52-.29-.71A.97.97 0 0 0 15 18m3-4h-2.17a6.94 6.94 0 0 0 2.07-3.69c.56-2.86-.7-5.63-2.95-7.15-.74-.5-1.66.21-1.49 1.08.18.93.14 1.93-.17 2.92-.73 2.36-2.94 4.07-5.41 4.19-.59.03-1.15-.03-1.68-.15-.88-.21-1.51.82-1.02 1.58.29.44.63.85 1.01 1.21h-.18c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z"
          />
    </svg>
  );
});

IcMoonrise.displayName = 'IcMoonrise';
