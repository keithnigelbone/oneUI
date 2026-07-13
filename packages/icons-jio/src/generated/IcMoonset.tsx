import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoonset = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoonset(
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
            d="M18 14H6c-.27 0-.52.11-.71.29S5 14.73 5 15s.11.52.29.71.44.29.71.29h12c.27 0 .52-.11.71-.29s.29-.44.29-.71-.11-.52-.29-.71A.97.97 0 0 0 18 14m-2 4H8c-.27 0-.52.11-.71.29S7 18.73 7 19s.11.52.29.71.44.29.71.29h8c.27 0 .52-.11.71-.29s.29-.44.29-.71-.11-.52-.29-.71A.97.97 0 0 0 16 18m4-8h-2.28q.105-.33.18-.69c.56-2.86-.7-5.63-2.95-7.15-.74-.5-1.66.21-1.49 1.08.18.93.14 1.93-.17 2.92-.56 1.79-1.96 3.2-3.69 3.83H4c-.55 0-1 .45-1 1s.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1z"
          />
    </svg>
  );
});

IcMoonset.displayName = 'IcMoonset';
