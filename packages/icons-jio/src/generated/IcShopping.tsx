import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcShopping = forwardRef<SVGSVGElement, IconComponentProps>(function IcShopping(
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
            d="M19.48 7.65A2 2 0 0 0 18 7h-2V6a4 4 0 1 0-8 0v1H6a2 2 0 0 0-2 2.18l1 11a2 2 0 0 0 .65 1.3A2 2 0 0 0 7 22h10a2 2 0 0 0 1.35-.52 2 2 0 0 0 .65-1.3l1-11a2.001 2.001 0 0 0-.52-1.53M14 7h-4V6a2 2 0 1 1 4 0z"
          />
    </svg>
  );
});

IcShopping.displayName = 'IcShopping';
