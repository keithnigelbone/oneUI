import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAceOfSpades = forwardRef<SVGSVGElement, IconComponentProps>(function IcAceOfSpades(
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
            d="m13.84 3-.49-.45a2 2 0 0 0-2.7 0l-.49.45C5.63 7.14 3 10.2 3 13.56A5.36 5.36 0 0 0 8.4 19a5.16 5.16 0 0 0 2.28-.59l-1.07 2.14A1 1 0 0 0 10.5 22h3a1 1 0 0 0 .89-1.45l-1.07-2.14a5.16 5.16 0 0 0 2.28.59 5.36 5.36 0 0 0 5.4-5.44c0-3.37-2.63-6.43-7.16-10.56"
          />
    </svg>
  );
});

IcAceOfSpades.displayName = 'IcAceOfSpades';
