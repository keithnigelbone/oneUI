import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBodyCare = forwardRef<SVGSVGElement, IconComponentProps>(function IcBodyCare(
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
            d="M7.19 20a2 2 0 0 0 2 2h5.62a2 2 0 0 0 2-2v-1H7.19zM18.51 2.65A1.88 1.88 0 0 0 17.09 2H6.91a1.88 1.88 0 0 0-1.42.65 1.86 1.86 0 0 0-.44 1.5L7 17h10l2-12.85a1.86 1.86 0 0 0-.49-1.5"
          />
    </svg>
  );
});

IcBodyCare.displayName = 'IcBodyCare';
