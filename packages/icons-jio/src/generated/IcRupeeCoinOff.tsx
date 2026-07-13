import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRupeeCoinOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcRupeeCoinOff(
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
            d="m19.74 5.68 1-1a1.005 1.005 0 0 0-.71-1.714 1 1 0 0 0-.71.294l-16 16a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l1-1c.1.08.19.18.3.26H6a9.9 9.9 0 0 0 6 2 10.001 10.001 0 0 0 7.74-16.26M16 12h-1.14a4 4 0 0 1-2.61 2.78l2.26 1.36a1 1 0 0 1-1.02 1.72l-3.71-2.23L15.41 10H16a1 1 0 1 1 0 2m-8.2 0a1.006 1.006 0 0 1 .2-2h1.76l1-1H8a1 1 0 0 1 0-2h4.76l3.86-3.86A10 10 0 0 0 3.14 16.62z"
          />
    </svg>
  );
});

IcRupeeCoinOff.displayName = 'IcRupeeCoinOff';
